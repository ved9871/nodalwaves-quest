import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const utils = trpc.useUtils();
  const localLogin = trpc.auth.localLogin.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/admin");
    },
    onError: (err) => {
      setError(err.message || "Invalid email or password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    localLogin.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md bg-zinc-900/90 border border-zinc-700 shadow-2xl relative">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center">
              <Shield className="w-7 h-7 text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Admin Access</CardTitle>
          <CardDescription className="text-zinc-400 text-sm mt-1">
            NodalWaves Quest — Beta Review Portal
          </CardDescription>
          <div className="mt-3 px-3 py-2 bg-amber-900/20 border border-amber-700/40 rounded-lg">
            <p className="text-amber-400 text-xs text-center">
              🔒 Restricted access. Authorised reviewers only.
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-zinc-300 text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin-demo@nodewavesquest.com"
                required
                className="bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500 focus:border-red-500 focus:ring-red-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-zinc-300 text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500 focus:border-red-500 focus:ring-red-500/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700/40 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={localLogin.isPending}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-semibold py-2.5 transition-all"
            >
              {localLogin.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In to Admin Panel"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-700">
            <p className="text-zinc-500 text-xs text-center leading-relaxed">
              This login is for authorised beta reviewers only. Regular users should sign in via the{" "}
              <a href="/" className="text-red-400 hover:text-red-300 underline">main portal</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
