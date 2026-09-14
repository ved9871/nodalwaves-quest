import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { NWQLogo } from "@/components/NWQIcon";
import { ArrowLeft, Award, Lock, Star, Zap, Gift, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function RewardChestModal({ onClose }: { onClose: () => void }) {
  const [opened, setOpened] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const handleTap = () => {
    if (opened) return;
    const newCount = tapCount + 1;
    setTapCount(newCount);
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
    if (newCount >= 5) {
      setOpened(true);
      toast.success("🎁 Chest Opened! +50 XP Bonus!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="card-nw p-8 text-center max-w-sm w-full mx-4 border-glow-gold">
        <h2 className="font-display font-black text-2xl text-gradient-gold mb-2">Reward Chest</h2>
        <p className="text-muted-foreground text-sm mb-6">
          {opened ? "You opened the chest!" : `Tap ${5 - tapCount} more times to open!`}
        </p>

        <button
          onClick={handleTap}
          disabled={opened}
          className={`text-8xl block mx-auto mb-6 transition-transform cursor-pointer select-none ${
            shaking ? "animate-chest-shake" : ""
          } ${opened ? "cursor-default" : "hover:scale-110 active:scale-95"}`}
        >
          {opened ? "🎉" : "🎁"}
        </button>

        {!opened && (
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${i < tapCount ? "bg-secondary" : "bg-muted"}`}
              />
            ))}
          </div>
        )}

        {opened && (
          <div className="animate-fade-in-up mb-6">
            <div className="font-display font-black text-4xl text-gradient-gold mb-2">+50 XP</div>
            <p className="text-muted-foreground text-sm">Bonus XP added to your profile!</p>
          </div>
        )}

        <Button
          onClick={onClose}
          className={`w-full font-display font-bold ${opened ? "btn-gold-glow bg-secondary text-secondary-foreground" : "border-border text-muted-foreground"}`}
          variant={opened ? "default" : "outline"}
        >
          {opened ? "Claim & Close" : "Close"}
        </Button>
      </div>
    </div>
  );
}

export default function BadgesPage() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showChest, setShowChest] = useState(false);

  const { data: allBadges } = trpc.badges.all.useQuery();
  const { data: myBadges } = trpc.badges.mine.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) { window.location.href = "/login"; return null; }

  const earnedIds = new Set(myBadges?.map(b => b.badgeId) ?? []);

  const BADGE_EMOJIS: Record<string, string> = {
    "first-quest": "🎯", "streak-3": "🔥", "streak-7": "🔥", "streak-30": "💎",
    "level-5": "⭐", "level-10": "🌟", "level-25": "👑", "level-50": "🏆",
    "xp-1000": "⚡", "xp-5000": "💫", "quiz-master": "🧠", "perfect-quiz": "💯",
    "welcome": "🎉", "referral-first": "🤝",
  };

  // Human-readable unlock hint based on badge criteria
  function getUnlockHint(criteria: { type: string; value: number | string } | null): string {
    if (!criteria) return "Complete specific activities to unlock.";
    switch (criteria.type) {
      case "level": return `Reach Level ${criteria.value}.`;
      case "streak": return `Maintain a ${criteria.value}-day daily check-in streak.`;
      case "xp": return `Earn ${Number(criteria.value).toLocaleString()} total XP.`;
      case "lesson": return `Complete ${criteria.value} lesson${Number(criteria.value) > 1 ? "s" : ""} in any zone.`;
      case "zone": return `Complete all lessons in Zone ${criteria.value}.`;
      case "quiz_perfect": return "Score 100% on any quiz (answer all questions correctly).";
      case "mini_game": {
        const gameNames: Record<string, string> = {
          node_charge: "Node Charge",
          scam_detector: "Scam Detector",
          quiz_battle: "Timed Quiz Battle",
        };
        return `Play the ${gameNames[criteria.value as string] ?? criteria.value} mini-game.`;
      }
      case "referral": return `Refer ${criteria.value} friend${Number(criteria.value) > 1 ? "s" : ""} to NodeWaves Quest.`;
      default: return "Complete specific activities to unlock.";
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showChest && <RewardChestModal onClose={() => setShowChest(false)} />}

      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <NWQLogo compact iconSize={26} responsive />
        </div>
      </nav>

      <div className="container py-8">
        {/* Header stats */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-black text-3xl text-gradient-red mb-1">Your Badges</h1>
            <p className="text-muted-foreground">
              {myBadges?.length ?? 0} of {allBadges?.length ?? 0} badges earned
            </p>
          </div>
          <Button
            onClick={() => setShowChest(true)}
            className="btn-gold-glow bg-secondary text-secondary-foreground font-display font-bold"
          >
            <Gift className="w-4 h-4 mr-2" />
            Open Reward Chest
          </Button>
        </div>

        {/* Progress bar */}
        <div className="card-nw p-4 mb-8">
          <div className="flex justify-between text-xs font-display text-muted-foreground mb-2">
            <span>Badge Progress</span>
            <span>{myBadges?.length ?? 0} / {allBadges?.length ?? 0}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full xp-bar-fill rounded-full"
              style={{ width: `${allBadges?.length ? Math.round(((myBadges?.length ?? 0) / allBadges.length) * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Earned badges */}
        {myBadges && myBadges.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Earned Badges ({myBadges.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {myBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="card-nw p-4 text-center animate-badge-unlock"
                  style={{ borderColor: `${badge.color ?? "#D69E2E"}40` }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl"
                    style={{ backgroundColor: `${badge.color ?? "#D69E2E"}20`, border: `2px solid ${badge.color ?? "#D69E2E"}40` }}
                  >
                    {BADGE_EMOJIS[badge.slug ?? ""] ?? "🏅"}
                  </div>
                  <div className="font-display font-bold text-xs text-foreground mb-1">{badge.name}</div>
                  <div className="text-xs text-muted-foreground leading-tight">{badge.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked badges */}
        {allBadges && allBadges.filter(b => !earnedIds.has(b.id)).length > 0 && (
          <div>
            <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              Locked Badges ({allBadges.filter(b => !earnedIds.has(b.id)).length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {allBadges.filter(b => !earnedIds.has(b.id)).map((badge) => (
                <div key={badge.id} className="card-nw p-4 text-center opacity-60 hover:opacity-80 transition-opacity">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-muted/30 border border-border">
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="font-display font-bold text-xs text-muted-foreground mb-1">{badge.name}</div>
                  <div className="text-xs text-muted-foreground leading-tight mb-2">{badge.description}</div>
                  {/* How to unlock hint */}
                  <div className="mt-2 rounded-lg bg-muted/20 border border-border/50 px-2 py-1.5">
                    <div className="text-[10px] font-display font-bold text-primary/70 uppercase tracking-wide mb-0.5">How to Unlock</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">
                      {getUnlockHint(badge.criteria as { type: string; value: number | string } | null)}
                    </div>
                  </div>
                  {badge.xpBonus > 0 && (
                    <div className="mt-2 text-xs font-display font-bold text-secondary">+{badge.xpBonus} XP bonus</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(!allBadges || allBadges.length === 0) && (
          <div className="text-center py-16">
            <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl text-foreground mb-2">No Badges Yet</h3>
            <p className="text-muted-foreground mb-6">Complete quests and daily check-ins to earn badges!</p>
            <Button onClick={() => navigate("/quests")} className="btn-glow bg-primary text-primary-foreground font-display">
              Start Questing
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
