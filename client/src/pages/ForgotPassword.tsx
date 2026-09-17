import { useState } from "react";
import { Link, useLocation } from "wouter";
import { NWQIcon } from "@/components/NWQIcon";
import { Mail, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Step = "request" | "reset" | "done";

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestMut = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => { setError(null); setStep("reset"); },
    onError: () => { setError(null); setStep("reset"); }, // never reveal whether the email exists
  });

  const resetMut = trpc.auth.resetPassword.useMutation({
    onSuccess: () => { setError(null); setStep("done"); },
    onError: (err) => {
      const msg = err.message;
      if (msg === "INVALID_CODE") setError("That code is wrong or has expired. Request a new one and try again.");
      else if (msg === "PASSWORD_TOO_SHORT") setError("Your new password must be at least 8 characters.");
      else setError("Something went wrong. Please try again.");
    },
  });

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
    setError(null);
    requestMut.mutate({ email: email.trim().toLowerCase() });
  };

  const submitReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) { setError("Enter the 6-digit code from your email."); return; }
    if (newPassword.length < 8) { setError("Your new password must be at least 8 characters."); return; }
    setError(null);
    resetMut.mutate({ email: email.trim().toLowerCase(), code, newPassword });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <NWQIcon size={40} />
              <span className="text-white font-bold text-lg tracking-wide group-hover:text-red-400 transition-colors">
                NodalQuest
              </span>
            </div>
          </Link>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="flex items-start gap-2 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2.5 mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300 leading-relaxed">{error}</p>
            </div>
          )}

          {step === "request" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">Reset your password</h1>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 text-center">
                Enter your account email and we&apos;ll send you a 6-digit reset code.
              </p>
              <form onSubmit={submitRequest} noValidate className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" autoComplete="email"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                  />
                </div>
                <button type="submit" disabled={requestMut.isPending}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors disabled:opacity-60">
                  {requestMut.isPending ? "Sending…" : "Send reset code"}
                </button>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">Enter your code</h1>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 text-center">
                If an account exists for <span className="text-gray-200">{email}</span>, a 6-digit code is on its way.
                It expires in 15 minutes.
              </p>
              <form onSubmit={submitReset} noValidate className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">6-digit code</label>
                  <input
                    inputMode="numeric" maxLength={6} value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-center text-lg tracking-[0.5em] text-white placeholder:text-gray-600 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-red-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">New password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={resetMut.isPending}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors disabled:opacity-60">
                  {resetMut.isPending ? "Resetting…" : "Reset password"}
                </button>
                <button type="button" onClick={() => { setStep("request"); setCode(""); setError(null); }}
                  className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  Use a different email
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Password updated</h1>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                You can now sign in with your new password.
              </p>
              <button onClick={() => navigate("/login")}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors">
                Go to sign in
              </button>
            </div>
          )}

          {step !== "done" && (
            <Link href="/login">
              <button className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-medium">
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </button>
            </Link>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6 leading-relaxed">
          NodalQuest is an educational platform. XP, badges, and ranks are not financial instruments.
        </p>
      </div>
    </div>
  );
}
