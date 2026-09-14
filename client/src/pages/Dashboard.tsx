import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { NWQLogo } from "@/components/NWQIcon";
import { MobileNav } from "@/components/MobileNav";
import { FeedbackButton } from "@/components/FeedbackButton";
import {
  Zap, Flame, Trophy, BookOpen, Target, Shield, Coins, Lock, Cpu,
  Building2, Vault, Landmark, Users, Rocket, Crown, Star, CheckCircle2,
  ChevronRight, Play, Award, TrendingUp, Calendar, Gift, X, Info, AlertTriangle, Megaphone
} from "lucide-react";
import { toast } from "sonner";

const ZONE_ICONS: Record<string, React.ElementType> = {
  Coins, Lock, Cpu, Building2, Vault, Landmark, Shield, Users, Rocket,
};

const AVATARS: Record<string, string> = {
  avatar1: "🧑‍💻", avatar2: "🦊", avatar3: "🤖", avatar4: "🐉",
  avatar5: "⚡", avatar6: "🔮", avatar7: "🚀", avatar8: "🛡️",
  avatar9: "💎", avatar10: "🌊", avatar11: "🔥", avatar12: "⭐",
};

function XpFloater({ amount, onDone }: { amount: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed top-20 right-6 z-50 animate-float-up pointer-events-none">
      <div className="bg-secondary text-secondary-foreground font-display font-black text-xl px-4 py-2 rounded-xl shadow-lg">
        +{amount} XP ⚡
      </div>
    </div>
  );
}

function LevelUpModal({ level, onClose }: { level: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="card-nw p-8 text-center max-w-sm w-full mx-4 border-glow-gold animate-level-up">
        <div className="text-6xl mb-4">🎉</div>
        <div className="font-display font-black text-4xl text-gradient-gold mb-2">LEVEL UP!</div>
        <div className="font-display font-bold text-6xl text-foreground mb-4">
          {level}
        </div>
        <p className="text-muted-foreground mb-6">You've reached a new level! Keep questing!</p>
        <Button onClick={onClose} className="btn-gold-glow bg-secondary text-secondary-foreground font-display font-bold w-full">
          Continue Quest
        </Button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [xpFloater, setXpFloater] = useState<number | null>(null);
  const [levelUpModal, setLevelUpModal] = useState<number | null>(null);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  const utils = trpc.useUtils();
  const { data: xpInfo, isLoading: xpLoading } = trpc.profile.xpInfo.useQuery(undefined, { enabled: isAuthenticated });
  const { data: checkInStatus } = trpc.checkin.status.useQuery(undefined, { enabled: isAuthenticated });
  const { data: zones } = trpc.zones.list.useQuery();
  const { data: userUnlocks } = trpc.zones.userUnlocks.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myBadges } = trpc.badges.mine.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myRank } = trpc.leaderboard.myRank.useQuery(undefined, { enabled: isAuthenticated });
  const { data: announcements } = trpc.announcements.active.useQuery();
  const { data: challengeEnrollment } = trpc.challenge.getEnrollment.useQuery(undefined, { enabled: isAuthenticated });
  const { data: completedDays } = trpc.challenge.getDayCompletions.useQuery(undefined, { enabled: isAuthenticated && !!challengeEnrollment });
  const { data: lessonProgress } = trpc.lessons.userProgress.useQuery(undefined, { enabled: isAuthenticated });

  const checkInMutation = trpc.checkin.perform.useMutation({
    onSuccess: (data) => {
      setXpFloater(data.xpEarned);
      if (data.leveledUp) setLevelUpModal(data.newLevel ?? 0);
      if (data.newBadges && data.newBadges.length > 0) {
        data.newBadges.forEach((b: { name: string }) => toast.success(`🏆 Badge Unlocked: ${b.name}!`));
      }
      toast.success(`Daily check-in! +${data.xpEarned} XP`, {
        description: `🔥 ${data.newStreak}-day streak!`,
      });
      utils.profile.xpInfo.invalidate();
      utils.checkin.status.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  if (xpInfo && !xpInfo.profileSetupDone) {
    navigate("/setup");
    return null;
  }

  const unlockedZoneIds = new Set(userUnlocks?.map(u => u.zoneId) ?? []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center">
            <NWQLogo compact iconSize={28} responsive />
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <button onClick={() => navigate("/quests")} className="text-muted-foreground hover:text-foreground transition-colors font-display">Quests</button>
            <button onClick={() => navigate("/mini-games")} className="text-muted-foreground hover:text-foreground transition-colors font-display">Mini-Games</button>
            <button onClick={() => navigate("/leaderboard")} className="text-muted-foreground hover:text-foreground transition-colors font-display">Leaderboard</button>
            <button onClick={() => navigate("/badges")} className="text-muted-foreground hover:text-foreground transition-colors font-display">Badges</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/profile")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-xl">{AVATARS[xpInfo?.avatarId ?? "avatar1"] ?? "🧑‍💻"}</span>
              <div className="hidden sm:block text-right">
                <div className="text-xs font-display font-bold text-foreground">{xpInfo?.username ?? user?.name}</div>
                <div className="text-xs text-muted-foreground">Level {xpInfo?.level ?? 1}</div>
              </div>
            </button>
            {/* Mobile hamburger */}
            <MobileNav activePage="other" />
          </div>
        </div>
      </nav>

      {xpFloater !== null && <XpFloater amount={xpFloater} onDone={() => setXpFloater(null)} />}
      {levelUpModal !== null && <LevelUpModal level={levelUpModal} onClose={() => setLevelUpModal(null)} />}

      <div className="container py-6 space-y-6">
        {/* Announcement banners */}
        {announcements && announcements
          .filter((a: { id: number }) => !dismissedIds.includes(a.id))
          .map((a: { id: number; title: string; content: string; type: string; ctaText?: string | null; ctaLink?: string | null }) => {
            const cfg = {
              event:    { Icon: Trophy,        border: "border-l-secondary",  bg: "bg-secondary/10",  text: "text-secondary",  label: "EVENT" },
              campaign: { Icon: Megaphone,     border: "border-l-primary",    bg: "bg-primary/10",    text: "text-primary",    label: "CAMPAIGN" },
              warning:  { Icon: AlertTriangle, border: "border-l-yellow-500", bg: "bg-yellow-500/10", text: "text-yellow-400", label: "NOTICE" },
              info:     { Icon: Info,          border: "border-l-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-400",   label: "INFO" },
            }[a.type as "event" | "campaign" | "warning" | "info"] ?? { Icon: Info, border: "border-l-blue-500", bg: "bg-blue-500/10", text: "text-blue-400", label: "INFO" };
            return (
              <div key={a.id} className={`card-nw p-4 border-l-4 ${cfg.border} ${cfg.bg} flex items-start gap-3`}>
                <cfg.Icon className={`w-5 h-5 ${cfg.text} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-display text-xs font-bold tracking-widest ${cfg.text}`}>{cfg.label}</span>
                    <span className="font-display font-bold text-sm text-foreground">{a.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a.content}</p>
                  {a.ctaText && a.ctaLink && (
                    <a
                      href={a.ctaLink}
                      className={`inline-block mt-2 text-xs font-display font-bold px-3 py-1.5 rounded border ${cfg.border} ${cfg.text} hover:opacity-80 transition-opacity`}
                    >
                      {a.ctaText} →
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setDismissedIds(prev => [...prev, a.id])}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
                  aria-label="Dismiss announcement"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })
        }

        {/* Hero stats row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* XP & Level Card */}
          <div className="lg:col-span-2 card-nw p-6 border-glow-red">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{AVATARS[xpInfo?.avatarId ?? "avatar1"] ?? "🧑‍💻"}</span>
                <div>
                  <h2 className="font-display font-black text-xl text-foreground">
                    {xpInfo?.username ?? user?.name ?? "Quester"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-primary/20 text-primary border-primary/40 font-display text-xs">
                      Level {xpInfo?.level ?? 1}
                    </Badge>
                    {myRank?.rank && (
                      <Badge className="bg-secondary/20 text-secondary border-secondary/40 font-display text-xs">
                        #{myRank.rank} Global
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display font-black text-2xl text-gradient-gold">{(xpInfo?.xp ?? 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground font-display">Total XP</div>
              </div>
            </div>

            {/* XP Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-display text-muted-foreground">
                <span>Level {xpInfo?.level ?? 1}</span>
                <span>{xpInfo?.progressXp ?? 0} / {xpInfo?.neededXp ?? 100} XP</span>
                <span>Level {(xpInfo?.level ?? 1) + 1}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full xp-bar-fill rounded-full"
                  style={{ width: `${xpInfo?.progressPercent ?? 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {(xpInfo?.neededXp ?? 100) - (xpInfo?.progressXp ?? 0)} XP to Level {(xpInfo?.level ?? 1) + 1}
              </p>
            </div>
          </div>

          {/* Streak & Check-in Card */}
          <div className="card-nw p-6 flex flex-col items-center justify-center text-center">
            <div className="relative mb-3">
              <Flame
                className="w-14 h-14 text-orange-400 animate-streak-flame"
                style={{ filter: "drop-shadow(0 0 12px rgba(251, 146, 60, 0.6))" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-black text-lg text-white">
                  {checkInStatus?.streak ?? 0}
                </span>
              </div>
            </div>
            <div className="font-display font-bold text-base text-foreground mb-1">
              {checkInStatus?.streak ?? 0}-Day Streak
            </div>
            <div className="text-xs text-muted-foreground mb-4">
              {checkInStatus?.canCheckIn ? "Ready to check in!" : "Come back tomorrow"}
            </div>
            <Button
              onClick={() => checkInMutation.mutate()}
              disabled={!checkInStatus?.canCheckIn || checkInMutation.isPending}
              className={`w-full font-display font-bold text-sm ${
                checkInStatus?.canCheckIn
                  ? "btn-glow bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {checkInMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Checking in...
                </span>
              ) : checkInStatus?.canCheckIn ? (
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Daily Check-in (+25 XP)
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Checked In Today
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Badges Earned", value: myBadges?.length ?? 0, icon: Award, color: "#D69E2E" },
            { label: "Current Streak", value: `${checkInStatus?.streak ?? 0}d`, icon: Flame, color: "#FF6B35" },
            { label: "Global Rank", value: myRank?.rank ? `#${myRank.rank}` : "—", icon: Trophy, color: "#805AD5" },
            { label: "Current Level", value: xpInfo?.level ?? 1, icon: TrendingUp, color: "#38A169" },
          ].map((stat) => (
            <div key={stat.label} className="card-nw p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <div className="font-display font-black text-xl text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* World Map Zones */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              World Map
            </h3>
            <button onClick={() => navigate("/quests")} className="text-xs text-primary hover:underline font-display flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {zones?.map((zone, i) => {
              const IconComp = ZONE_ICONS[zone.icon ?? "Coins"] ?? Coins;
              const isUnlocked = unlockedZoneIds.has(zone.id) || zone.requiredLevel <= (xpInfo?.level ?? 1);
              return (
                <button
                  key={zone.id}
                  onClick={() => isUnlocked ? navigate(`/zone/${zone.id}`) : toast.error(`Reach Level ${zone.requiredLevel} to unlock ${zone.name}`)}
                  className={`card-nw p-4 text-left group transition-all ${isUnlocked ? "hover:border-primary/50 cursor-pointer" : "opacity-60 cursor-not-allowed"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${zone.color}20`, border: `1px solid ${zone.color}40` }}>
                      <IconComp className="w-5 h-5" style={{ color: zone.color ?? "#E53E3E" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-foreground truncate">{zone.name}</span>
                        {!isUnlocked && <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                        {isUnlocked && <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">{zone.description}</div>
                    </div>
                    <div className="text-xs font-display font-bold px-2 py-0.5 rounded flex-shrink-0"
                      style={{ backgroundColor: `${zone.color}20`, color: zone.color ?? "#E53E3E" }}>
                      Lv{zone.requiredLevel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Badges & Mini-Games row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Badges */}
          <div className="card-nw p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-secondary" />
                Recent Badges
              </h3>
              <button onClick={() => navigate("/badges")} className="text-xs text-primary hover:underline font-display">
                View All
              </button>
            </div>
            {myBadges && myBadges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {myBadges.slice(0, 6).map((b) => (
                  <div key={b.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border">
                    <Star className="w-3 h-3" style={{ color: b.color ?? "#FFD700" }} />
                    <span className="text-xs font-display font-semibold text-foreground">{b.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Award className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Complete quests to earn badges!</p>
                <Button onClick={() => navigate("/quests")} className="mt-3 text-xs bg-primary/20 text-primary border border-primary/40 font-display" variant="outline" size="sm">
                  Start a Quest
                </Button>
              </div>
            )}
          </div>

          {/* Mini-Games */}
          <div className="card-nw p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                <Play className="w-4 h-4 text-primary" />
                Mini-Games
              </h3>
              <button onClick={() => navigate("/mini-games")} className="text-xs text-primary hover:underline font-display">
                Play All
              </button>
            </div>
            <div className="space-y-2">
              {[
                { name: "Node Charge", xp: "+75 XP", icon: Zap, color: "#38A169", path: "/mini-games/node-charge" },
                { name: "Timed Quiz Battle", xp: "+100 XP", icon: Target, color: "#3182CE", path: "/mini-games/quiz-battle" },
                { name: "Scam Detector", xp: "+75 XP", icon: Shield, color: "#E53E3E", path: "/mini-games/scam-detector" },
              ].map((game) => (
                <button
                  key={game.name}
                  onClick={() => navigate(game.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/40 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${game.color}20`, border: `1px solid ${game.color}40` }}>
                    <game.icon className="w-4 h-4" style={{ color: game.color }} />
                  </div>
                  <span className="font-display font-semibold text-sm text-foreground flex-1 text-left">{game.name}</span>
                  <span className="text-xs font-display font-bold" style={{ color: game.color }}>{game.xp}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* My Challenge Progress */}
        {challengeEnrollment ? (
          <div className="card-nw p-5 border-glow-red">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                My 7-Day Challenge Progress
              </h3>
              <button onClick={() => navigate("/challenge")} className="text-xs text-primary hover:underline font-display flex items-center gap-1">
                View Challenge <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {/* Progress bar */}
            {(() => {
              const realDays = completedDays ? completedDays.length : challengeEnrollment.daysCompleted;
              return (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span className="font-display">Day {Math.min(realDays + 1, 7)} of 7</span>
                    <span className="font-display text-secondary font-bold">{Math.round((realDays / 7) * 100)}% Complete</span>
                  </div>
                  <Progress value={(realDays / 7) * 100} className="h-2" />
                </div>
              );
            })()}
            {/* Day checklist */}
            <div className="grid grid-cols-7 gap-1.5 mb-4">
              {Array.from({ length: 7 }, (_, i) => {
                const dayNum = i + 1;
                const isDone = completedDays ? completedDays.includes(dayNum) : dayNum <= challengeEnrollment.daysCompleted;
                const daysCount = completedDays ? completedDays.length : challengeEnrollment.daysCompleted;
                const isActive = dayNum === daysCount + 1 && daysCount < 7;
                return (
                  <div
                    key={dayNum}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all ${
                      isDone
                        ? "bg-secondary/20 border-secondary/50"
                        : isActive
                        ? "bg-primary/20 border-primary/50 ring-1 ring-primary/40"
                        : "bg-muted/20 border-border opacity-50"
                    }`}
                  >
                    <span className="text-xs font-display font-bold" style={{ color: isDone ? "#C6CDD6" : isActive ? "#C81038" : "#666" }}>
                      D{dayNum}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                    ) : isActive ? (
                      <Zap className="w-4 h-4 text-primary" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
            {/* CTA / Final Quiz state */}
            {(() => {
              const daysCount = completedDays ? completedDays.length : challengeEnrollment.daysCompleted;
              const finalUnlocked = daysCount >= 7;
              if (finalUnlocked) {
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-secondary/10 border border-secondary/50 rounded-lg p-3">
                      <div>
                        <p className="text-xs font-display font-bold text-secondary">🏆 CHALLENGE COMPLETE!</p>
                        <p className="text-sm text-foreground mt-0.5">All 7 days finished. Your final quiz is now unlocked.</p>
                      </div>
                      <Button onClick={() => navigate("/challenge")} size="sm" className="btn-gold-glow bg-secondary text-secondary-foreground font-display text-xs flex-shrink-0 ml-3">
                        View Results
                      </Button>
                    </div>
                    <div className="flex items-center justify-between bg-secondary/5 border border-secondary/30 rounded-lg p-3">
                      <div>
                        <p className="text-xs font-display font-bold text-secondary">FINAL QUIZ UNLOCKED</p>
                        <p className="text-sm text-muted-foreground mt-0.5">Completing the final quiz may qualify you for XP rewards, badge eligibility, and campaign-based recognition under official rules.</p>
                      </div>
                      <Button onClick={() => navigate("/challenge")} size="sm" className="btn-gold-glow bg-secondary text-secondary-foreground font-display text-xs flex-shrink-0 ml-3">
                        Take Final Quiz
                      </Button>
                    </div>
                  </div>
                );
              }
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg p-3">
                    <div>
                      <p className="text-xs font-display font-bold text-primary">TODAY'S MISSION</p>
                      <p className="text-sm text-foreground mt-0.5">Complete a quest or lesson to advance Day {daysCount + 1}</p>
                    </div>
                    <Button onClick={() => navigate("/quests")} size="sm" className="btn-glow bg-primary text-primary-foreground font-display text-xs flex-shrink-0 ml-3">
                      Go to Quests
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 bg-muted/20 border border-border rounded-lg p-3 opacity-60">
                    <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-display font-bold text-muted-foreground">FINAL QUIZ LOCKED</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Complete all 7 challenge days to unlock the final quiz.</p>
                    </div>
                    <span className="text-xs font-display text-muted-foreground">{daysCount}/7</span>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="card-nw p-5 border border-primary/20 bg-primary/5">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-4xl">⚡</div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-display font-bold text-base text-foreground mb-1">7-Day NodeWaves Challenge</h3>
                <p className="text-sm text-muted-foreground">Learn Web3 in 7 days. Complete quests, earn XP, and rise through the ranks.</p>
              </div>
              <Button onClick={() => navigate("/challenge/join")} className="btn-glow bg-primary text-primary-foreground font-display font-bold flex-shrink-0">
                <Zap className="w-4 h-4 mr-2" />
                Join Challenge
              </Button>
            </div>
          </div>
        )}

        {/* Reward Chest CTA */}
        {(() => {
          const CHEST_REQUIRED = 3;
          const completedCount = Math.min(lessonProgress?.length ?? 0, CHEST_REQUIRED);
          const isChestUnlocked = completedCount >= CHEST_REQUIRED;
          const remaining = CHEST_REQUIRED - completedCount;
          return (
            <div className="card-nw p-6 border-glow-gold flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className="text-5xl">🎁</div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg text-gradient-gold mb-1">
                  {isChestUnlocked ? "Reward Chest Available!" : "Reward Chest"}
                </h3>
                {isChestUnlocked ? (
                  <p className="text-sm text-muted-foreground">You've unlocked your reward chest! Open it to earn bonus XP.</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">
                      {completedCount}/{CHEST_REQUIRED} Quests Complete
                      {remaining === 1
                        ? " — 1 more to unlock your chest"
                        : ` — ${remaining} more to unlock your chest`}
                    </p>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden max-w-xs">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(completedCount / CHEST_REQUIRED) * 100}%`, backgroundColor: "#D4AF37" }}
                      />
                    </div>
                  </>
                )}
              </div>
              <Button
                onClick={() => {
                  if (!isChestUnlocked) {
                    toast.info(`Complete ${remaining} more quest${remaining === 1 ? "" : "s"} to unlock this reward chest.`);
                  } else {
                    navigate("/quests");
                  }
                }}
                className={isChestUnlocked
                  ? "btn-gold-glow bg-secondary text-secondary-foreground font-display font-bold flex-shrink-0"
                  : "font-display font-bold flex-shrink-0 border-border bg-muted/30 text-muted-foreground"
                }
                variant={isChestUnlocked ? "default" : "outline"}
              >
                <Gift className="w-4 h-4 mr-2" />
                {isChestUnlocked ? "Open Chest" : "Locked"}
              </Button>
            </div>
          );
        })()}
      </div>
      <FeedbackButton />
    </div>
  );
}
