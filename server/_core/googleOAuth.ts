import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { randomUUID } from "crypto";
import * as db from "../db";
import { parse as parseCookieHeader } from "cookie";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

/**
 * Direct Google OAuth 2.0 (Authorization Code flow), self-hosted — no third-party
 * broker. Active only when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.
 *
 * Flow:
 *   GET /api/oauth/google/start     -> redirect to Google consent
 *   GET /api/oauth/google/callback  -> exchange code, upsert user, mint session
 *
 * The redirect URI is derived from the incoming request origin, so it works on
 * any domain as long as that exact URI is added to the Google Cloud client's
 * "Authorized redirect URIs".
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const STATE_COOKIE = "nwq_g_state";

export function isGoogleOAuthEnabled(): boolean {
  return Boolean(ENV.googleClientId && ENV.googleClientSecret);
}

function originOf(req: Request): string {
  const configured = ENV.appBaseUrl?.replace(/\/$/, "");
  if (configured) return configured;
  const proto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0] || req.protocol;
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host;
  return `${proto}://${host}`;
}

function redirectUri(req: Request): string {
  return `${originOf(req)}/api/oauth/google/callback`;
}

export function registerGoogleOAuthRoutes(app: Express) {
  app.get("/api/oauth/google/start", (req: Request, res: Response) => {
    if (!isGoogleOAuthEnabled()) {
      res.status(503).json({ error: "Google login is not configured" });
      return;
    }
    const state = randomUUID();
    // Short-lived, http-only state cookie for CSRF protection.
    res.cookie(STATE_COOKIE, state, {
      ...getSessionCookieOptions(req),
      maxAge: 10 * 60 * 1000,
    });
    const returnTo = typeof req.query.returnTo === "string" ? req.query.returnTo : "";
    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.set("client_id", ENV.googleClientId);
    url.searchParams.set("redirect_uri", redirectUri(req));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", returnTo ? `${state}|${encodeURIComponent(returnTo)}` : state);
    url.searchParams.set("access_type", "online");
    url.searchParams.set("prompt", "select_account");
    res.redirect(302, url.toString());
  });

  app.get("/api/oauth/google/callback", async (req: Request, res: Response) => {
    if (!isGoogleOAuthEnabled()) {
      res.status(503).json({ error: "Google login is not configured" });
      return;
    }
    const code = typeof req.query.code === "string" ? req.query.code : "";
    const stateParam = typeof req.query.state === "string" ? req.query.state : "";
    const [state, encodedReturn] = stateParam.split("|");
    const expectedState = parseCookieHeader(req.headers.cookie ?? "")[STATE_COOKIE];

    // Clear the state cookie regardless of outcome.
    res.clearCookie(STATE_COOKIE, { ...getSessionCookieOptions(req), maxAge: -1 });

    if (!code || !state || !expectedState || state !== expectedState) {
      res.redirect(302, "/login?error=google_state");
      return;
    }

    try {
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          redirect_uri: redirectUri(req),
          grant_type: "authorization_code",
        }),
      });
      if (!tokenRes.ok) throw new Error(`token exchange failed: ${tokenRes.status}`);
      const tokens = (await tokenRes.json()) as { access_token?: string };
      if (!tokens.access_token) throw new Error("no access_token from Google");

      const infoRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!infoRes.ok) throw new Error(`userinfo failed: ${infoRes.status}`);
      const info = (await infoRes.json()) as {
        sub?: string; email?: string; name?: string; email_verified?: boolean;
      };
      if (!info.sub) throw new Error("no sub from Google");

      const openId = `google_${info.sub}`;
      await db.upsertUser({
        openId,
        name: info.name || info.email || null,
        email: info.email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByOpenId(openId);
      const sessionToken = await sdk.createSessionToken(openId, {
        name: user?.name || info.name || info.email || "User",
        expiresInMs: ONE_YEAR_MS,
      });
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });

      // New Google users still need profile setup; existing ones go to dashboard.
      const returnTo = encodedReturn ? decodeURIComponent(encodedReturn) : "";
      const safeReturn = returnTo.startsWith("/") ? returnTo : "";
      res.redirect(302, safeReturn || "/setup");
    } catch (error) {
      console.error("[GoogleOAuth] Callback failed:", error);
      res.redirect(302, "/login?error=google_failed");
    }
  });
}
