import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { NWQLogo } from "@/components/NWQIcon";
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Signup() {
  const [, navigate] = useLocation();
  const { data: me, isLoading: authLoading } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!authLoading && me) {
      navigate("/setup");
    }
  }, [me, authLoading, navigate]);

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setSuccess(true);
      setTimeout(() => navigate("/setup"), 800);
    },
    onError: (err) => {
      const msg = err.message;
      if (msg === "EMAIL_TAKEN") {
        setServerError(
          "An account with this email already exists. Please sign in or use a different email."
        );
      } else if (msg === "SOCIAL_LOGIN_ONLY") {
        setServerError(
          "This account was created with social login. Please use the original login method or contact support to set a password."
        );
      } else if (msg === "Passwords do not match") {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      } else {
        setServerError(msg || "Something went wrong. Please try again.");
      }
    },
  });

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!displayName.trim() || displayName.trim().length < 2) {
      errors.displayName = "Display name must be at least 2 characters.";
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    if (!agreed) {
      errors.agreed = "You must agree to the terms before creating an account.";
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

    signupMutation.mutate({
      displayName: displayName.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
    });
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
      {/* Background glow effects */}
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

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-4 relative z-10"
        style={{ paddingTop: "max(3rem, env(safe-area-inset-top, 0px) + 2rem)", paddingBottom: "max(3rem, env(safe-area-inset-bottom, 0px) + 1.5rem)" }}>
        <div className="w-full max-w-sm">

          {/* Logo + headline */}
          <div className="text-center mb-7">
            <div className="flex justify-center mb-5">
              <NWQLogo iconSize={52} compact />
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-foreground leading-tight">
              Create Your{" "}
              <span className="text-gradient-gold">Quest</span>{" "}
              Account
            </h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs mx-auto">
              Join the quest. Learn Web3. Earn XP and climb the ranks.
            </p>
          </div>

          {/* Card */}
          <div className="card-nw p-6 sm:p-8 border-glow-red">

            {success ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="font-display font-bold text-lg text-foreground">Account created!</p>
                <p className="text-sm text-muted-foreground">Setting up your profile…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">

                {/* Server error */}
                {serverError && (
                  <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive leading-relaxed">{serverError}</p>
                  </div>
                )}

                {/* Display Name */}
                <div>
                  <label className="block text-xs font-display font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. CryptoLearner99"
                    autoComplete="name"
                    className={`w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                      fieldErrors.displayName ? "border-destructive/60" : "border-border"
                    }`}
                  />
                  {fieldErrors.displayName && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.displayName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-display font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`w-full bg-muted/30 border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                      fieldErrors.email ? "border-destructive/60" : "border-border"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-display font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      className={`w-full bg-muted/30 border rounded-xl px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                        fieldErrors.password ? "border-destructive/60" : "border-border"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-display font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className={`w-full bg-muted/30 border rounded-xl px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                        fieldErrors.confirmPassword ? "border-destructive/60" : "border-border"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Compliance checkbox */}
                <div className={`rounded-xl border p-3.5 ${fieldErrors.agreed ? "border-destructive/60 bg-destructive/5" : "border-border bg-muted/20"}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I understand that NodalWaves Quest is an{" "}
                      <strong className="text-foreground">educational platform</strong> and{" "}
                      <strong className="text-foreground">not a guaranteed earning app</strong>.
                      XP, badges, and ranks are not financial instruments. I have read the{" "}
                      <a
                        href="/campaign-rules"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:opacity-80"
                      >
                        Campaign Rules
                      </a>{" "}
                      and{" "}
                      <a
                        href="/disclaimer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:opacity-80"
                      >
                        Disclaimer
                      </a>
                      .
                    </span>
                  </label>
                  {fieldErrors.agreed && (
                    <p className="text-xs text-destructive mt-2 ml-7">{fieldErrors.agreed}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full btn-red-glow bg-primary text-primary-foreground font-display font-bold text-base py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {signupMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                      Creating Account…
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                {/* Sign in link */}
                <p className="text-center text-xs text-muted-foreground pt-1">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-primary font-semibold hover:underline"
                    onClick={(e) => { e.preventDefault(); navigate("/login"); }}
                  >
                    Sign in
                  </a>
                </p>

              </form>
            )}

            {/* Safety disclaimer */}
            <div className="border-t border-border/50 pt-4 mt-4 space-y-2">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                <Shield className="w-3 h-3 inline mr-1 text-primary align-middle" />
                NodalWaves Quest is an educational platform. XP, badges, and ranks are not financial instruments.
              </p>
              <p className="text-xs text-muted-foreground/60 text-center leading-relaxed">
                No guaranteed income. No guaranteed token rewards. Learn responsibly.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-5 space-y-1">
            <a
              href="/"
              className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors inline-block"
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
