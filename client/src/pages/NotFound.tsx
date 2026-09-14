import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { NWQLogo } from "@/components/NWQIcon";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => setLocation("/")} className="flex items-center">
            <NWQLogo compact iconSize={28} responsive />
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {/* Animated icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-900/30 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-red-900/20 border border-red-700/50 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-display font-black text-foreground mb-2">404</h1>
          <h2 className="text-xl font-display font-bold text-muted-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            This page doesn't exist in the NodalWaves Quest world.
            <br />
            It may have been moved or deleted.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setLocation("/")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-sm rounded-lg transition-all shadow-lg shadow-primary/20"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
            <button
              onClick={() => setLocation("/dashboard")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-foreground font-display font-bold text-sm rounded-lg transition-all border border-zinc-700"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground">
          © 2026 NodalWaves Quest. Educational platform only.
        </p>
      </div>
    </div>
  );
}
