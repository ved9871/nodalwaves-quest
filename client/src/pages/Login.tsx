import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { NWQIcon } from "@/components/NWQIcon";
import { Shield, Eye, EyeOff, AlertCircle, Mail, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

type View = "provider-select" | "email-form";

export default function Login() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { data: me, isLoading: authLoading } = trpc.auth.me.useQuery();
  const { data: authConfig } = trpc.auth.config.useQuery();
  const googleEnabled = authConfig?.googleEnabled ?? false;
  const utils = trpc.useUtils();

  // Parse optional ?returnTo= query param
  const params = new URLSearchParams(search);
  const returnTo = params.get("returnTo") || "/dashboard";

  const [view, setView] = useState<View>("provider-select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // If already logged in, redirect to intended destination
  useEffect(() => {
    if (!authLoading && me) {
      navigate(returnTo);
    }
  }, [me, authLoading, navigate, returnTo]);

  const loginMutation = trpc.auth.localLogin.useMutation({
    onSuccess: async (data) => {
      await utils.auth.me.invalidate();
      if (data.role === "admin" || data.role === "demo_admin") {
        navigate("/admin");
      } else {
        navigate(returnTo);
      }
    },
    onError: (err) => {
      const msg = err.message;
      if (msg === "SOCIAL_LOGIN_ONLY") {
        setServerError(
          "This account was created with social login. Please use the original login method or contact support to set a password."
        );
      } else if (msg === "Invalid email or password") {
        setServerError("Incorrect email or password. Please try again.");
      } else {
        setServerError(msg || "Login failed. Please try again.");
      }
    },
  });

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!password) {
      errors.password = "Please enter your password.";
    }
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    loginMutation.mutate({ email: email.trim().toLowerCase(), password });
  };


  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.55 0.22 25 / 0.12), transparent)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.82 0.012 250 / 0.08), transparent)" }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 relative z-10"
        style={{ paddingTop: "max(3rem, env(safe-area-inset-top, 0px) + 2rem)", paddingBottom: "max(3rem, env(safe-area-inset-bottom, 0px) + 1.5rem)" }}>
        <div className="w-full max-w-sm">

          {/* ── Logo + headline ────────────────────────────────────────────── */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: "oklch(0.12 0.008 260)",
                  border: "1.5px solid oklch(0.55 0.22 25 / 0.35)",
                  boxShadow: "0 0 24px oklch(0.55 0.22 25 / 0.18), 0 4px 16px rgba(0,0,0,0.5)",
                }}
              >
                <NWQIcon size={52} />
              </div>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-foreground leading-tight">
              Continue to{" "}
              <span style={{ color: "#ffffff" }}>Nodal</span>
              <span style={{ color: "#FFB000" }}>Quest</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs mx-auto">
              Sign in securely to save your XP, badges, quests, and challenge progress.
            </p>
          </div>

          {/* ── Card ──────────────────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: "oklch(0.10 0.005 260 / 0.95)",
              border: "1px solid oklch(0.55 0.22 25 / 0.25)",
              boxShadow: "0 0 40px oklch(0.55 0.22 25 / 0.08), 0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            {view === "provider-select" ? (
              /* ── Provider selection view ─────────────────────────────── */
              <div className="space-y-3">

                {/* Continue with Google */}
                <button
                  type="button"
                  disabled={!googleEnabled}
                  onClick={() => { if (googleEnabled) window.location.href = "/api/oauth/google/start"; }}
                  title={googleEnabled ? "Continue with Google" : "Google login coming soon"}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border font-display font-semibold text-sm transition-all ${googleEnabled ? "hover:opacity-90 active:scale-[0.98]" : "cursor-not-allowed opacity-40"}`}
                  style={{
                    background: googleEnabled ? "#ffffff" : "oklch(0.15 0.005 260)",
                    borderColor: googleEnabled ? "#ffffff" : "oklch(0.30 0.005 260)",
                    color: googleEnabled ? "#1f1f1f" : "oklch(0.70 0.01 260)",
                  }}
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                  {!googleEnabled && <span className="ml-auto text-xs font-normal opacity-60">Coming Soon</span>}
                                </button>

                {/* Continue with Email */}
                <button
                  type="button"
                  onClick={() => setView("email-form")}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border font-display font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "oklch(0.55 0.22 25)",
                    borderColor: "oklch(0.55 0.22 25)",
                    color: "#ffffff",
                    boxShadow: "0 0 16px oklch(0.55 0.22 25 / 0.30)",
                  }}
                >
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  Continue with Email
                </button>


                {/* Create account link */}
                <p className="text-center text-xs pt-1" style={{ color: "oklch(0.50 0.01 260)" }}>
                  New here?{" "}
                  <a
                    href="/signup"
                    className="font-semibold hover:underline"
                    style={{ color: "oklch(0.82 0.012 250)" }}
                    onClick={(e) => { e.preventDefault(); navigate("/signup"); }}
                  >
                    Create a free account
                  </a>
                </p>

              </div>
            ) : (
              /* ── Email / password form view ──────────────────────────── */
              <div>
                {/* Back to provider select */}
                <button
                  type="button"
                  onClick={() => { setView("provider-select"); setServerError(null); setFieldErrors({}); }}
                  className="flex items-center gap-1.5 text-xs font-display font-medium mb-5 transition-colors hover:opacity-80"
                  style={{ color: "oklch(0.55 0.01 260)" }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">

                  {/* Server error */}
                  {serverError && (
                    <div className="flex items-start gap-2 rounded-lg px-3 py-2.5" style={{ background: "oklch(0.55 0.22 25 / 0.12)", border: "1px solid oklch(0.55 0.22 25 / 0.30)" }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.65 0.22 25)" }} />
                      <p className="text-xs leading-relaxed" style={{ color: "oklch(0.75 0.15 25)" }}>{serverError}</p>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-display font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "oklch(0.55 0.01 260)" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: "oklch(0.14 0.005 260)",
                        border: `1px solid ${fieldErrors.email ? "oklch(0.55 0.22 25 / 0.70)" : "oklch(0.25 0.005 260)"}`,
                        color: "oklch(0.92 0.005 260)",
                        caretColor: "oklch(0.65 0.22 25)",
                      }}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs mt-1" style={{ color: "oklch(0.65 0.22 25)" }}>{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-display font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "oklch(0.55 0.01 260)" }}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        autoComplete="current-password"
                        className="w-full rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{
                          background: "oklch(0.14 0.005 260)",
                          border: `1px solid ${fieldErrors.password ? "oklch(0.55 0.22 25 / 0.70)" : "oklch(0.25 0.005 260)"}`,
                          color: "oklch(0.92 0.005 260)",
                          caretColor: "oklch(0.65 0.22 25)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: "oklch(0.45 0.01 260)" }}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-xs mt-1" style={{ color: "oklch(0.65 0.22 25)" }}>{fieldErrors.password}</p>
                    )}
                  </div>

                  {/* Sign In button */}
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full font-display font-bold text-base py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: "oklch(0.55 0.22 25)",
                      color: "#ffffff",
                      boxShadow: loginMutation.isPending ? "none" : "0 0 20px oklch(0.55 0.22 25 / 0.35)",
                    }}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Signing In…
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  {/* Forgot password link */}
                  <p className="text-center text-xs" style={{ color: "oklch(0.50 0.01 260)" }}>
                    <a
                      href="/forgot-password"
                      className="hover:underline transition-colors"
                      style={{ color: "oklch(0.50 0.01 260)" }}
                      onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }}
                    >
                      Forgot password?
                    </a>
                  </p>

                  {/* Create account link */}
                  <p className="text-center text-xs" style={{ color: "oklch(0.50 0.01 260)" }}>
                    Don't have an account?{" "}
                    <a
                      href="/signup"
                      className="font-semibold hover:underline"
                      style={{ color: "oklch(0.82 0.012 250)" }}
                      onClick={(e) => { e.preventDefault(); navigate("/signup"); }}
                    >
                      Create an account
                    </a>
                  </p>

                </form>
              </div>
            )}

            {/* Safety line — always visible */}
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid oklch(0.20 0.005 260)" }}>
              <p className="text-xs text-center leading-relaxed" style={{ color: "oklch(0.45 0.01 260)" }}>
                <Shield className="w-3 h-3 inline mr-1 align-middle" style={{ color: "oklch(0.55 0.22 25)" }} />
                NodalQuest is an educational platform. XP, badges, and ranks are not financial instruments.
              </p>
            </div>
          </div>

          {/* Back to homepage */}
          <div className="text-center mt-5">
            <a
              href="/"
              className="text-xs hover:opacity-80 transition-opacity inline-block"
              style={{ color: "oklch(0.38 0.01 260)" }}
              onClick={(e) => { e.preventDefault(); navigate("/"); }}
            >
              ← Back to homepage
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
