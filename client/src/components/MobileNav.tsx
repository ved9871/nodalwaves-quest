import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { NWQLogo } from "@/components/NWQIcon";
import {
  Menu, X, Home, Trophy, Shield, FileText, Play,
  LayoutDashboard, ChevronRight
} from "lucide-react";

interface MobileNavProps {
  /** Current page context — controls which items are highlighted */
  activePage?: "home" | "challenge" | "campaign-rules" | "disclaimer" | "other";
}

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "7-Day Challenge", href: "/challenge", icon: Trophy, accent: true },
  { label: "Campaign Rules", href: "/campaign-rules", icon: FileText },
  { label: "Disclaimer", href: "/disclaimer", icon: Shield },
];

export function MobileNav({ activePage = "other" }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [activePage]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleNav = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  const handleStart = () => {
    setOpen(false);
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-down panel */}
      <div
        className={`fixed top-16 left-0 right-0 z-50 md:hidden transition-all duration-300 ease-out ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div
          className="mx-3 rounded-2xl border border-border overflow-hidden"
          style={{
            background: "oklch(0.10 0.005 260 / 0.98)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 40px oklch(0.55 0.22 25 / 0.15), 0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {/* Panel header with logo */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-border/50">
            <NWQLogo compact iconSize={30} />
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Nav items */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
                  item.accent
                    ? "text-secondary hover:bg-secondary/10 hover:border-secondary/30 border border-transparent"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <item.icon
                  className="w-4 h-4 flex-shrink-0"
                  style={item.accent ? { color: "oklch(0.82 0.012 250)" } : undefined}
                />
                <span>{item.label}</span>
                {item.accent && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-display font-bold">
                    NEW
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Divider */}
          <div className="mx-4 border-t border-border" />

          {/* CTA section */}
          <div className="p-3">
            {isAuthenticated ? (
              <Button
                onClick={() => handleNav("/dashboard")}
                className="w-full btn-glow bg-primary text-primary-foreground font-display font-bold text-sm py-3 rounded-xl"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Go to Dashboard
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={handleStart}
                  className="w-full btn-glow bg-primary text-primary-foreground font-display font-bold text-sm py-3 rounded-xl"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Free Quest
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setOpen(false); window.location.href = '/login'; }}
                  className="w-full text-muted-foreground hover:text-foreground font-display text-sm py-2"
                >
                  Login to existing account
                </Button>
              </div>
            )}
          </div>

          {/* Bottom disclaimer */}
          <div className="px-4 pb-4">
            <p className="text-xs text-muted-foreground/50 text-center leading-relaxed">
              NodeWaves Quest is an educational platform. XP and badges are not financial instruments.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
