import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { NWQLogo } from "@/components/NWQIcon";
import {
  Zap, Shield, CheckCircle2, Trophy, Play, ArrowRight,
  AlertTriangle, BookOpen, Users, Star
} from "lucide-react";

const CONFIRMATIONS = [
  {
    id: "rules",
    icon: BookOpen,
    color: "#E53E3E",
    label: "I have read the Campaign Rules",
    detail: "I understand that rewards, if any, are subject to official campaign rules and are not guaranteed.",
    link: { text: "Read Campaign Rules", href: "/campaign-rules" },
  },
  {
    id: "notIncome",
    icon: AlertTriangle,
    color: "#D69E2E",
    label: "I understand NodeWaves Quest is not a guaranteed income app",
    detail: "This is a learning and community participation platform. It does not guarantee income, financial return, or investment value.",
    link: null,
  },
  {
    id: "notTokens",
    icon: Shield,
    color: "#3182CE",
    label: "I understand XP, badges, ranks, and quest points do not represent guaranteed token rewards or financial return",
    detail: "XP and badges are educational achievements only. No NWS tokens or cryptocurrency rewards are promised.",
    link: null,
  },
  {
    id: "oneAccount",
    icon: Users,
    color: "#38A169",
    label: "I agree to one account per user and understand that fraud or duplicate accounts can be disqualified",
    detail: "Automated bots, scripts, or multiple accounts are not permitted and will result in disqualification.",
    link: null,
  },
];

export default function ChallengeJoin() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [enrolled, setEnrolled] = useState(false);

  const enrollMutation = trpc.challenge.enroll.useMutation({
    onSuccess: (data) => {
      if (data.alreadyEnrolled) {
        toast.info("You are already enrolled in this challenge!");
      }
      setEnrolled(true);
    },
    onError: (err) => {
      toast.error("Enrollment failed. Please try again.");
    },
  });

  const allChecked = CONFIRMATIONS.every((c) => checked[c.id]);

  const handleToggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEnroll = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (!allChecked) {
      toast.warning("Please confirm all items before enrolling.");
      return;
    }
    enrollMutation.mutate();
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (enrolled) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
          <div className="container flex items-center justify-between h-16">
            <button onClick={() => navigate("/")} className="flex items-center gap-2">
              <NWQLogo compact iconSize={26} responsive />
            </button>
          </div>
        </nav>

        {/* Success */}
        <div className="flex-1 flex items-center justify-center pt-16 px-4">
          <div className="max-w-md w-full text-center">
            {/* Animated checkmark */}
            <div className="relative mx-auto w-24 h-24 mb-8">
              <div
                className="absolute inset-0 rounded-full animate-pulse-glow"
                style={{ background: "radial-gradient(circle, oklch(0.55 0.22 25 / 0.3), transparent)" }}
              />
              <div className="relative w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
            </div>

            <h1 className="font-display font-black text-3xl md:text-4xl mb-4">
              <span className="text-gradient-red">You're Enrolled!</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-3 leading-relaxed">
              You're enrolled in the{" "}
              <span className="text-foreground font-semibold">7-Day NodeWaves Web3 Learning Challenge.</span>
            </p>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Head to your Dashboard to start Day 1. Complete one quest per day, pass the daily quiz,
              and build your streak to climb the challenge leaderboard.
            </p>

            {/* Day 1 reminder */}
            <div className="card-nw p-5 mb-6 text-left">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-foreground mb-1">Day 1 — What is NWS?</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your first quest is ready. Learn the NWS token fundamentals, complete the lesson,
                    and pass the timed quiz to earn your first challenge XP.
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance reminder */}
            <div className="p-4 rounded-xl bg-muted/20 border border-border mb-6">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <Shield className="w-3 h-3 inline mr-1 text-primary" />
                Rewards, if any, are not guaranteed and are subject to official campaign rules.{" "}
                <a href="/campaign-rules" className="text-primary hover:underline">View rules →</a>
              </p>
            </div>

            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
              className="btn-glow bg-primary text-primary-foreground font-display font-bold text-lg px-10 py-6 rounded-xl w-full"
            >
              <Play className="w-5 h-5 mr-2" />
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Enrollment form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <NWQLogo compact iconSize={26} responsive />
          </button>
          <button
            onClick={() => navigate("/challenge")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Challenge
          </button>
        </div>
      </nav>

      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="max-w-lg w-full py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-secondary/20 border border-secondary/40 flex items-center justify-center mx-auto mb-5">
              <Trophy className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="font-display font-black text-3xl md:text-4xl mb-3">
              <span className="text-gradient-gold">Join the Challenge</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Before you begin the 7-Day NodeWaves Web3 Learning Challenge,
              please confirm the following statements.
            </p>
          </div>

          {/* Confirmation checkboxes */}
          <div className="space-y-3 mb-8">
            {CONFIRMATIONS.map((item, i) => {
              const isChecked = !!checked[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${
                    isChecked
                      ? "border-primary/50 bg-primary/10"
                      : "border-border bg-card/50 hover:border-border/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Custom checkbox */}
                    <div
                      className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all ${
                        isChecked
                          ? "bg-primary border-primary"
                          : "border-border bg-transparent"
                      }`}
                    >
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: item.color }} />
                        <p className="font-display font-semibold text-sm text-foreground leading-snug">
                          {item.label}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                      {item.link && (
                        <a
                          href={item.link.href}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-1 inline-block"
                        >
                          {item.link.text} →
                        </a>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(Object.values(checked).filter(Boolean).length / CONFIRMATIONS.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-display font-bold">
              {Object.values(checked).filter(Boolean).length}/{CONFIRMATIONS.length}
            </span>
          </div>

          {/* Enroll button */}
          {!isAuthenticated && !authLoading ? (
            <div className="space-y-3">
              <Button
                onClick={() => { window.location.href = "/login"; }}
                size="lg"
                className="btn-glow bg-primary text-primary-foreground font-display font-bold text-base px-8 py-5 rounded-xl w-full"
              >
                <Zap className="w-5 h-5 mr-2" />
                Login to Enroll
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                You need a free NodeWaves Quest account to join the challenge.
              </p>
            </div>
          ) : (
            <Button
              onClick={handleEnroll}
              disabled={!allChecked || enrollMutation.isPending}
              size="lg"
              className={`w-full font-display font-bold text-base px-8 py-5 rounded-xl transition-all ${
                allChecked
                  ? "btn-glow bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {enrollMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Enrolling...
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  {allChecked ? "Confirm & Join the Challenge" : "Confirm all items above to continue"}
                </>
              )}
            </Button>
          )}

          {/* Bottom disclaimer */}
          <div className="mt-6 p-4 rounded-xl bg-muted/20 border border-border">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              <Shield className="w-3 h-3 inline mr-1" />
              NodeWaves Quest is an educational platform. XP, badges, and quest points are not financial instruments.
              Rewards, if any, are not guaranteed.{" "}
              <a href="/disclaimer" className="text-primary hover:underline">Full Disclaimer</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
