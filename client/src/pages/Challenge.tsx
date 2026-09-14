import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { MobileNav } from "@/components/MobileNav";
import { trpc } from "@/lib/trpc";
import { NWQLogo } from "@/components/NWQIcon";
import {
  Zap, Trophy, BookOpen, Shield, Target, CheckCircle2, XCircle,
  Calendar, Star, Users, Flame, Award, ArrowRight, Play,
  Coins, Lock, Cpu, Building2, Vault, Landmark, Crown, ChevronRight, LayoutDashboard
} from "lucide-react";

const CURRICULUM = [
  {
    day: 1,
    topic: "What is NWS?",
    desc: "Understand the NWS token — its purpose, utility, and role as the foundation of the NodeWaves ecosystem.",
    icon: Coins,
    color: "#E53E3E",
    zone: "NWS Hub",
  },
  {
    day: 2,
    topic: "What is Staking?",
    desc: "Learn how General Staking works in NodeWaves, how it supports the ecosystem, and what responsible staking looks like.",
    icon: Lock,
    color: "#D69E2E",
    zone: "Staking Vault",
  },
  {
    day: 3,
    topic: "What is Lite Node?",
    desc: "Explore Lite Node operations — what they do, how they participate in the ecosystem, and how they differ from Founder Nodes.",
    icon: Cpu,
    color: "#38A169",
    zone: "Lite Node Station",
  },
  {
    day: 4,
    topic: "What is Founder Node?",
    desc: "Understand the Founder Node role, its position in the ecosystem hierarchy, and its relationship to treasury alignment.",
    icon: Building2,
    color: "#3182CE",
    zone: "Founder Tower",
  },
  {
    day: 5,
    topic: "What is Node Vault?",
    desc: "Deep-dive into Node Vault mechanics — how it works, what Node-Linked Vault means, and the risks involved.",
    icon: Vault,
    color: "#805AD5",
    zone: "Node Vault Chamber",
  },
  {
    day: 6,
    topic: "What is Treasury Alignment?",
    desc: "Discover how the NodeWaves treasury works, why treasury alignment matters, and how community activity supports long-term growth.",
    icon: Landmark,
    color: "#DD6B20",
    zone: "Treasury Hall",
  },
  {
    day: 7,
    topic: "Wallet Safety + Final Quiz",
    desc: "Master wallet safety, scam protection, and red flags in Web3. Complete the Final Quiz to earn your NodeWaves Learner Badge.",
    icon: Shield,
    color: "#E53E3E",
    zone: "Security Lab",
    isFinal: true,
  },
];

const HOW_IT_WORKS = [
  { icon: Calendar, title: "Complete Daily Quests", desc: "Each day unlocks one focused quest covering a core NodeWaves ecosystem topic.", color: "#E53E3E" },
  { icon: BookOpen, title: "Learn One Topic Per Day", desc: "Structured lessons guide you from NWS basics to treasury mechanics and wallet safety.", color: "#D69E2E" },
  { icon: Target, title: "Pass Daily Quiz Battles", desc: "Each day ends with a timed quiz. Pass to earn XP and keep your streak alive.", color: "#38A169" },
  { icon: Flame, title: "Build Your XP Streak", desc: "Consecutive daily completions multiply your XP and boost your challenge leaderboard rank.", color: "#3182CE" },
  { icon: Award, title: "Unlock the Learner Badge", desc: "Complete all 7 days to earn the exclusive NodeWaves Learner Badge — a permanent achievement.", color: "#805AD5" },
  { icon: Trophy, title: "Compete on the Leaderboard", desc: "Your XP, quiz accuracy, and streak are tracked on the challenge leaderboard throughout the 7 days.", color: "#D69E2E" },
];

const LEADERBOARD_CATEGORIES = [
  { icon: Zap, title: "Top XP", desc: "Highest total XP earned across all 7 days of quests and quizzes.", color: "#E53E3E", badge: "XP Champion" },
  { icon: Target, title: "Best Quiz Accuracy", desc: "Highest average quiz score across all 7 daily quiz battles.", color: "#D69E2E", badge: "Quiz Master" },
  { icon: Flame, title: "Longest Streak", desc: "7 consecutive days completed without missing a single daily quest.", color: "#38A169", badge: "Streak Legend" },
  { icon: Users, title: "Community Educator", desc: "Most referrals who also completed at least Day 1 of the challenge.", color: "#3182CE", badge: "Educator" },
];

export default function Challenge() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  // Check enrollment status
  const { data: enrollment } = trpc.challenge.getEnrollment.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Get completed day numbers for Final Quiz lock/unlock
  const { data: completedDays } = trpc.challenge.getDayCompletions.useQuery(undefined, {
    enabled: isAuthenticated && !!enrollment,
  });
  const daysCount = completedDays ? completedDays.length : (enrollment?.daysCompleted ?? 0);
  const finalQuizUnlocked = daysCount >= 7;

  // Live challenge leaderboard
  const { data: challengeLeaderboard } = trpc.challenge.leaderboard.useQuery();

  const handleStart = () => {
    if (isAuthenticated) {
      if (enrollment) {
        navigate("/dashboard");
      } else {
        navigate("/challenge/join");
      }
    } else {
      navigate("/challenge/join");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="flex items-center">
            <NWQLogo compact iconSize={28} responsive />
          </button>
          <div className="flex items-center gap-3">
            <a href="/campaign-rules" className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden md:block">
              Campaign Rules
            </a>
              <div className="hidden md:block">
              <Button onClick={handleStart} className="btn-glow bg-primary text-primary-foreground font-display text-sm">
                {enrollment ? "Go to Dashboard" : isAuthenticated ? "Join Challenge" : "Start Free Quest"}
              </Button>
            </div>
            {/* Mobile hamburger */}
            <MobileNav activePage="challenge" />
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 60% 40%, oklch(0.55 0.22 25 / 0.12) 0%, transparent 65%)" }}
        />
        {/* Floating orbs */}
        <div className="absolute top-24 right-16 w-72 h-72 rounded-full opacity-5 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.75 0.18 85), transparent)" }} />
        <div className="absolute bottom-24 left-16 w-56 h-56 rounded-full opacity-5 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.55 0.22 25), transparent)" }} />

        <div className="container relative z-10 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-secondary/20 text-secondary border-secondary/40 font-display text-xs tracking-widest px-5 py-1.5 animate-pulse-glow">
              🏆 PUBLIC BETA CAMPAIGN · FREE TO JOIN
            </Badge>
            <h1 className="font-display font-black text-5xl md:text-7xl leading-none mb-6">
              <span className="text-gradient-red">7-Day</span>
              <br />
              <span className="text-foreground">NodeWaves</span>
              <br />
              <span className="text-gradient-gold">Web3 Challenge</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              A beginner-friendly challenge where you complete 7 days of quests, learn the NodeWaves ecosystem,
              earn XP, unlock a learner badge, and compete for campaign-based community rewards under official rules.
            </p>

            {/* Enrolled state banner */}
            {enrollment && (
              <div className="mb-8 p-4 rounded-2xl border border-primary/40 bg-primary/10 flex items-center gap-3 max-w-md mx-auto">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-display font-bold text-sm text-foreground">You're enrolled!</p>
                  <p className="text-xs text-muted-foreground">Head to your Dashboard to continue the challenge.</p>
                </div>
                <Button
                  onClick={() => navigate("/dashboard")}
                  size="sm"
                  className="btn-glow bg-primary text-primary-foreground font-display font-bold text-xs px-4 flex-shrink-0"
                >
                  Dashboard
                </Button>
              </div>
            )}
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                onClick={handleStart}
                size="lg"
                className="btn-glow bg-primary hover:bg-primary/90 text-primary-foreground font-display font-black text-lg px-10 py-6 rounded-xl tracking-wider w-full sm:w-auto"
              >
                {enrollment ? (
                  <><LayoutDashboard className="w-5 h-5 mr-2" />Go to Dashboard</>
                ) : (
                  <><Play className="w-5 h-5 mr-2" />Start the Challenge</>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/campaign-rules")}
                className="border-border text-muted-foreground hover:text-foreground font-display text-sm px-8 py-6 rounded-xl w-full sm:w-auto"
              >
                <Shield className="w-4 h-4 mr-2" />
                View Campaign Rules
              </Button>
            </div>

            {/* Safety line */}
            <p className="text-xs text-muted-foreground max-w-lg mx-auto">
              Rewards, if any, are not guaranteed and are subject to official campaign rules.{" "}
              <a href="/campaign-rules" className="text-primary hover:underline">Read full rules →</a>
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-sm mx-auto">
              {[
                { label: "Days", value: "7" },
                { label: "Topics", value: "7" },
                { label: "Free", value: "100%" },
              ].map((stat) => (
                <div key={stat.label} className="card-nw p-4 text-center">
                  <p className="font-display font-black text-2xl text-gradient-red">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-display">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-grid opacity-15" />
        <div className="container relative z-10">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 font-display text-xs tracking-widest px-4 py-1">
              ⚡ HOW IT WORKS
            </Badge>
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="text-foreground">Six Steps to</span>{" "}
              <span className="text-gradient-gold">Completion</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The challenge is structured to be achievable in 15–20 minutes per day. No prior Web3 knowledge required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="card-nw p-6 group animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${step.color}20`, border: `1px solid ${step.color}40` }}
                  >
                    <step.icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-black text-xs text-muted-foreground">STEP {i + 1}</span>
                    </div>
                    <h3 className="font-display font-bold text-sm text-foreground mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7-Day Curriculum ────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/40 font-display text-xs tracking-widest px-4 py-1">
              📚 7-DAY CURRICULUM
            </Badge>
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="text-gradient-gold">One Topic.</span>{" "}
              <span className="text-foreground">One Day.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Each day covers one NodeWaves ecosystem pillar — from NWS token fundamentals to treasury alignment and wallet security.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {CURRICULUM.map((item, i) => (
              <div
                key={item.day}
                className={`card-nw p-5 group animate-fade-in-up ${item.isFinal ? "border-glow-gold" : ""}`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="flex items-center gap-4">
                  {/* Day badge */}
                  <div
                    className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-display font-black transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}40` }}
                  >
                    <span className="text-xs" style={{ color: item.color }}>DAY</span>
                    <span className="text-lg leading-none" style={{ color: item.color }}>{item.day}</span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-display font-bold text-sm text-foreground">{item.topic}</h3>
                      {item.isFinal && (
                        <Badge className="bg-secondary/20 text-secondary border-secondary/40 text-xs px-2 py-0">
                          🏆 Final
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Zone: <span className="font-semibold" style={{ color: item.color }}>{item.zone}</span>
                    </p>
                  </div>
                  {/* Icon */}
                  <item.icon className="w-5 h-5 flex-shrink-0 opacity-40 group-hover:opacity-80 transition-opacity" style={{ color: item.color }} />
                </div>
              </div>
            ))}

            {/* Final Quiz locked/unlocked card — only shown to enrolled users */}
            {isAuthenticated && enrollment && (
              <div className={`card-nw p-5 mt-4 animate-fade-in-up ${finalQuizUnlocked ? "border-glow-gold" : "border border-border opacity-70"}`}>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-display font-black"
                    style={finalQuizUnlocked
                      ? { backgroundColor: "oklch(0.75 0.18 85 / 0.2)", border: "1px solid oklch(0.75 0.18 85 / 0.5)" }
                      : { backgroundColor: "oklch(0.3 0 0 / 0.3)", border: "1px solid oklch(0.4 0 0 / 0.3)" }
                    }
                  >
                    {finalQuizUnlocked
                      ? <Trophy className="w-6 h-6" style={{ color: "#D69E2E" }} />
                      : <Lock className="w-6 h-6 text-muted-foreground" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-display font-bold text-sm" style={{ color: finalQuizUnlocked ? "#D69E2E" : undefined }}>
                        {finalQuizUnlocked ? "Final Quiz Unlocked" : "Final Quiz Locked"}
                      </h3>
                      <Badge className={finalQuizUnlocked
                        ? "bg-secondary/20 text-secondary border-secondary/40 text-xs px-2 py-0"
                        : "bg-muted/30 text-muted-foreground border-border text-xs px-2 py-0"
                      }>
                        {finalQuizUnlocked ? "🏆 Available" : `${daysCount}/7 Days`}
                      </Badge>
                    </div>
                    {finalQuizUnlocked ? (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Congratulations! You've completed all 7 challenge days. Taking the final quiz may qualify you for XP rewards, badge eligibility, and campaign-based recognition under official rules.
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Complete all 7 challenge days to unlock the final quiz. {7 - daysCount} day{7 - daysCount !== 1 ? "s" : ""} remaining.
                      </p>
                    )}
                  </div>
                  {finalQuizUnlocked ? (
                    <Button
                      onClick={() => navigate("/dashboard")}
                      size="sm"
                      className="btn-gold-glow bg-secondary text-secondary-foreground font-display text-xs flex-shrink-0"
                    >
                      Take Quiz
                    </Button>
                  ) : (
                    <div className="text-xs font-display text-muted-foreground flex-shrink-0">
                      Locked
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Entry Requirements ──────────────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-grid opacity-15" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 font-display text-xs tracking-widest px-4 py-1">
                📋 ENTRY REQUIREMENTS
              </Badge>
              <h2 className="font-display font-bold text-4xl mb-4">
                <span className="text-foreground">Who Can</span>{" "}
                <span className="text-gradient-red">Join?</span>
              </h2>
              <p className="text-muted-foreground">Anyone can join — no prior Web3 knowledge required. Just follow these steps.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: CheckCircle2, color: "#38A169", text: "Create a free NodeWaves Quest profile" },
                { icon: CheckCircle2, color: "#38A169", text: "Complete avatar and username setup" },
                { icon: CheckCircle2, color: "#38A169", text: "Agree to the Risk Disclaimer and Campaign Rules" },
                { icon: CheckCircle2, color: "#38A169", text: "One account per user — no duplicate registrations" },
                { icon: XCircle, color: "#E53E3E", text: "Automated bots or scripts are not permitted" },
                { icon: XCircle, color: "#E53E3E", text: "Fraud or duplicate accounts will be disqualified" },
              ].map((req, i) => (
                <div key={i} className="card-nw p-4 flex items-start gap-3">
                  <req.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: req.color }} />
                  <p className="text-sm text-muted-foreground leading-relaxed">{req.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-xl bg-secondary/10 border border-secondary/30 text-center">
              <p className="text-xs text-muted-foreground">
                By joining the challenge, you confirm you have read and agreed to the{" "}
                <a href="/disclaimer" className="text-primary hover:underline">Risk Disclaimer</a>{" "}
                and{" "}
                <a href="/campaign-rules" className="text-primary hover:underline">Campaign Rules</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Challenge Rewards ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/40 font-display text-xs tracking-widest px-4 py-1">
                🎁 CHALLENGE REWARDS
              </Badge>
              <h2 className="font-display font-bold text-4xl mb-4">
                <span className="text-gradient-gold">What You Can Earn</span>
              </h2>
            </div>

            {/* Reward cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { icon: Zap, color: "#E53E3E", title: "XP & Level Progress", desc: "Earn XP for every lesson, quiz pass, and daily streak. Level up your profile throughout the challenge." },
                { icon: Award, color: "#D69E2E", title: "NodeWaves Learner Badge", desc: "Complete all 7 days to permanently unlock the exclusive NodeWaves Learner Badge on your profile." },
                { icon: Star, color: "#38A169", title: "Certificate Eligibility", desc: "Participants who complete all 7 days become eligible for a NodeWaves Learning Certificate under official campaign rules." },
                { icon: Crown, color: "#3182CE", title: "Community Recognition", desc: "Top performers on the challenge leaderboard earn community recognition and featured placement." },
                { icon: Users, color: "#805AD5", title: "Event Access", desc: "Challenge completers may receive priority access to NodeWaves community events and future platform features." },
                { icon: Trophy, color: "#DD6B20", title: "Campaign-Based Rewards", desc: "Selected participants may become eligible for campaign-based community rewards under official published rules." },
              ].map((reward) => (
                <div key={reward.title} className="card-nw p-5 group">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${reward.color}20`, border: `1px solid ${reward.color}40` }}
                    >
                      <reward.icon className="w-4 h-4" style={{ color: reward.color }} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-foreground mb-1">{reward.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{reward.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Safety disclaimer */}
            <div className="p-5 rounded-xl bg-primary/10 border border-primary/30">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-bold text-sm text-foreground mb-1">Important Notice</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Participants can earn XP, badges, rank progress, certificate eligibility, community recognition,
                    and may become eligible for selected campaign-based rewards under official rules.
                    <strong className="text-foreground"> Rewards, if any, are not guaranteed and are subject to official campaign rules.</strong>{" "}
                    This is not a guaranteed income app. No NWS tokens or cryptocurrency rewards are promised.{" "}
                    <a href="/campaign-rules" className="text-primary hover:underline">Read full campaign rules →</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Challenge Leaderboard Preview ───────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-grid opacity-15" />
        <div className="container relative z-10">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/40 font-display text-xs tracking-widest px-4 py-1">
              🏆 CHALLENGE LEADERBOARD
            </Badge>
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="text-foreground">Four Ways to</span>{" "}
              <span className="text-gradient-gold">Rank</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The challenge leaderboard tracks four independent categories. You can compete in one or all four.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {LEADERBOARD_CATEGORIES.map((cat) => (
              <div key={cat.title} className="card-nw p-6 group">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
                  >
                    <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-base text-foreground mb-1">{cat.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{cat.desc}</p>
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-bold"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40` }}
                    >
                      <Award className="w-3 h-3" />
                      {cat.badge}
                    </div>
                  </div>
                </div>
                {/* Live rank preview — all 4 categories */}
                <div className="mt-4 space-y-1.5">
                  {(() => {
                    if (!challengeLeaderboard) return null;
                    const lb = challengeLeaderboard as {
                      topXp: Array<{ userId: number; username: string | null; xp: number }>;
                      bestAccuracy: Array<{ userId: number; username: string | null; avgScore: number }>;
                      longestStreak: Array<{ userId: number; username: string | null; longestStreak: number }>;
                      communityEducator: Array<{ userId: number; username: string | null; totalReferrals: number }>;
                    };
                    const catKey = cat.title === "Top XP" ? "topXp"
                      : cat.title === "Best Quiz Accuracy" ? "bestAccuracy"
                      : cat.title === "Longest Streak" ? "longestStreak"
                      : "communityEducator";
                    const entries = lb[catKey] ?? [];
                    if (entries.length === 0) {
                      return [1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted/30">
                          <span className="font-display font-bold text-xs text-muted-foreground w-4">#{i}</span>
                          <div className="flex-1 h-2 rounded bg-muted/50" />
                          <span className="text-xs text-muted-foreground font-display">—</span>
                        </div>
                      ));
                    }
                    return (entries as Array<Record<string, unknown>>).slice(0, 3).map((entry, i) => {
                      const name = (entry.username as string | null) ?? "Quester";
                      const stat = catKey === "topXp" ? `${entry.xp as number} XP`
                        : catKey === "bestAccuracy" ? `${entry.avgScore as number}% avg`
                        : catKey === "longestStreak" ? `${entry.longestStreak as number} days`
                        : `${entry.totalReferrals as number} refs`;
                      return (
                        <div key={entry.userId as number} className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted/30">
                          <span className="font-display font-bold text-xs text-muted-foreground w-4">#{i + 1}</span>
                          <span className="flex-1 text-xs text-foreground truncate">{name}</span>
                          <span className="text-xs font-display font-bold" style={{ color: cat.color }}>{stat}</span>
                        </div>
                      );
                    });
                  })()}
                  <p className="text-center text-xs text-muted-foreground pt-1">
                    {challengeLeaderboard
                      ? "Live challenge leaderboard — enrolled participants only."
                      : "Live challenge leaderboard activates during beta campaign."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, oklch(0.55 0.22 25 / 0.1) 0%, transparent 70%)" }}
        />
        <div className="container relative z-10 text-center">
          <Badge className="mb-6 bg-secondary/20 text-secondary border-secondary/40 font-display text-xs tracking-widest px-5 py-1.5">
            🚀 START TODAY
          </Badge>
          <h2 className="font-display font-black text-4xl md:text-6xl mb-6">
            <span className="text-gradient-red">Start the</span>
            <br />
            <span className="text-foreground">7-Day Challenge</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Free to join. 15–20 minutes per day. No prior Web3 knowledge required.
            Learn the NodeWaves ecosystem from the ground up.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              onClick={handleStart}
              size="lg"
              className="btn-glow bg-primary hover:bg-primary/90 text-primary-foreground font-display font-black text-xl px-14 py-7 rounded-xl tracking-wider"
            >
              <Play className="w-6 h-6 mr-3" />
              Start the 7-Day Challenge
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <a href="/disclaimer" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Shield className="w-3 h-3" /> Risk Disclaimer
            </a>
            <span>·</span>
            <a href="/campaign-rules" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ChevronRight className="w-3 h-3" /> Campaign Rules
            </a>
            <span>·</span>
            <span>Rewards, if any, are not guaranteed.</span>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="flex items-center">
            <NWQLogo compact iconSize={26} />
          </button>
          <p className="text-xs text-muted-foreground text-center">
            © 2026 NodeWaves Quest. Educational platform only. XP and badges are not financial instruments.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</a>
            <a href="/campaign-rules" className="hover:text-foreground transition-colors">Campaign Rules</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
