export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // ── Phase 2: Email / SMTP (not yet active — set these env vars when ready) ──
  // Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL, SMTP_FROM_NAME
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: parseInt(process.env.SMTP_PORT ?? "587", 10),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpFromEmail: process.env.SMTP_FROM_EMAIL ?? "noreply@nodewaveshub.com",
  smtpFromName: process.env.SMTP_FROM_NAME ?? "NodalWaves Quest",
  // ── Temporary beta review page token (disable before public launch) ──
  adminReviewToken: process.env.ADMIN_REVIEW_TOKEN ?? "",
  // ── Admin review page expiry date (YYYY-MM-DD). If set and today > expiry, page returns Access Denied ──
  adminReviewExpires: process.env.ADMIN_REVIEW_EXPIRES ?? "",
};
