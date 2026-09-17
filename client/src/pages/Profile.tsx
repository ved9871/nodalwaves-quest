import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { NWQLogo } from "@/components/NWQIcon";
import {
  ArrowLeft, Zap, Award, Flame, Trophy, Edit, LogOut, Shield, Star,
  TrendingUp, BookOpen, Target, Calendar
} from "lucide-react";
import { toast } from "sonner";

const AVATARS: Record<string, string> = {
  avatar1: "🧑‍💻", avatar2: "🦊", avatar3: "🤖", avatar4: "🐉",
  avatar5: "⚡", avatar6: "🔮", avatar7: "🚀", avatar8: "🛡️",
  avatar9: "💎", avatar10: "🌊", avatar11: "🔥", avatar12: "⭐",
};

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const utils = trpc.useUtils();
  const { data: xpInfo } = trpc.profile.xpInfo.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myBadges } = trpc.badges.mine.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myRank } = trpc.leaderboard.myRank.useQuery(undefined, { enabled: isAuthenticated });
  const { data: checkInStatus } = trpc.checkin.status.useQuery(undefined, { enabled: isAuthenticated });
  const { data: referralCode } = trpc.referral.myCode.useQuery(undefined, { enabled: isAuthenticated });
  const { data: xpLogs } = trpc.profile.xpLogs.useQuery(undefined, { enabled: isAuthenticated });
  const { data: quizHistory } = trpc.quizzes.history.useQuery(undefined, { enabled: isAuthenticated });

  const updateUsernameMut = trpc.profile.updateUsername.useMutation({
    onSuccess: () => {
      toast.success("Username updated!");
      setEditingUsername(false);
      utils.profile.xpInfo.invalidate();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  if (!isAuthenticated) { window.location.href = "/login"; return null; }

  const BADGE_EMOJIS: Record<string, string> = {
    "first-quest": "🎯", "streak-3": "🔥", "streak-7": "🔥", "streak-30": "💎",
    "level-5": "⭐", "level-10": "🌟", "level-25": "👑", "level-50": "🏆",
    "xp-1000": "⚡", "xp-5000": "💫", "quiz-master": "🧠", "perfect-quiz": "💯",
    "welcome": "🎉", "referral-first": "🤝",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <NWQLogo compact iconSize={26} responsive />
          <div className="ml-auto">
            <Button
              onClick={() => { logout(); navigate("/"); }}
              variant="outline"
              size="sm"
              className="border-border text-muted-foreground hover:text-foreground font-display text-xs"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container py-8 max-w-3xl mx-auto space-y-6">
        {/* Profile card */}
        <div className="card-nw p-6 border-glow-red">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-muted/30 border-2 border-primary/40 flex items-center justify-center text-5xl">
                {AVATARS[xpInfo?.avatarId ?? "avatar1"] ?? "🧑‍💻"}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="font-display font-black text-xs text-white">{xpInfo?.level ?? 1}</span>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              {editingUsername ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder={xpInfo?.username ?? ""}
                    className="px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-sm text-foreground font-display focus:outline-none focus:border-primary"
                    maxLength={30}
                  />
                  <Button
                    size="sm"
                    onClick={() => updateUsernameMut.mutate({ username: newUsername })}
                    disabled={!newUsername || updateUsernameMut.isPending}
                    className="bg-primary text-primary-foreground font-display text-xs"
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingUsername(false)} className="border-border font-display text-xs">
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                  <h1 className="font-display font-black text-2xl text-foreground">{xpInfo?.username ?? user?.name}</h1>
                  <button onClick={() => { setNewUsername(xpInfo?.username ?? ""); setEditingUsername(true); }} className="text-muted-foreground hover:text-foreground transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-3">{user?.email ?? "NodalQuester"}</p>
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <Badge className="bg-primary/20 text-primary border-primary/40 font-display text-xs">
                  Level {xpInfo?.level ?? 1}
                </Badge>
                {myRank?.rank && (
                  <Badge className="bg-secondary/20 text-secondary border-secondary/40 font-display text-xs">
                    #{myRank.rank} Global
                  </Badge>
                )}
                <Badge className="bg-muted text-muted-foreground border-border font-display text-xs">
                  {(xpInfo?.xp ?? 0).toLocaleString()} XP
                </Badge>
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs font-display text-muted-foreground">
              <span>Level {xpInfo?.level ?? 1}</span>
              <span>{xpInfo?.progressXp ?? 0} / {xpInfo?.neededXp ?? 100} XP</span>
              <span>Level {(xpInfo?.level ?? 1) + 1}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full xp-bar-fill rounded-full" style={{ width: `${xpInfo?.progressPercent ?? 0}%` }} />
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total XP", value: (xpInfo?.xp ?? 0).toLocaleString(), icon: Zap, color: "#D69E2E" },
            { label: "Current Streak", value: `${checkInStatus?.streak ?? 0}d`, icon: Flame, color: "#FF6B35" },
            { label: "Badges Earned", value: myBadges?.length ?? 0, icon: Award, color: "#805AD5" },
            { label: "Global Rank", value: myRank?.rank ? `#${myRank.rank}` : "—", icon: Trophy, color: "#38A169" },
          ].map((stat) => (
            <div key={stat.label} className="card-nw p-4 text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div className="font-display font-black text-xl text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Referral code */}
        {referralCode?.code && (
          <div className="card-nw p-5">
            <h3 className="font-display font-bold text-base text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Your Referral Code
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-2 rounded-xl bg-muted/30 border border-border font-mono text-sm text-secondary font-bold tracking-widest">
                {referralCode.code}
              </div>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/?ref=${referralCode.code}`);
                  toast.success("Referral link copied!");
                }}
                className="bg-primary text-primary-foreground font-display"
              >
                Copy Link
              </Button>
            </div>
          </div>
        )}

        {/* Recent XP activity */}
        {xpLogs && xpLogs.length > 0 && (
          <div className="card-nw p-5">
            <h3 className="font-display font-bold text-base text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" />
              Recent XP Activity
            </h3>
            <div className="space-y-2">
              {xpLogs.slice(0, 10).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <div className="font-display font-semibold text-sm text-foreground">{log.reason}</div>
                    <div className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="font-display font-black text-sm text-gradient-gold">+{log.amount} XP</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz History */}
        {quizHistory && quizHistory.length > 0 && (
          <div className="card-nw p-5">
            <h3 className="font-display font-bold text-base text-foreground mb-4 flex items-center gap-2">
              <span className="text-primary">🧠</span>
              Quiz History ({quizHistory.length})
            </h3>
            <div className="space-y-2">
              {quizHistory.slice(0, 8).map((attempt: any) => (
                <div key={attempt.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <div className="font-display font-semibold text-sm text-foreground">Quiz #{attempt.quizId}</div>
                    <div className="text-xs text-muted-foreground">{new Date(attempt.completedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-display font-black text-sm ${attempt.passed ? 'text-green-400' : 'text-primary'}`}>
                      {attempt.score}%
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-display ${
                      attempt.passed ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'
                    }`}>
                      {attempt.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Badges */}
        {myBadges && myBadges.length > 0 && (
          <div className="card-nw p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-secondary" />
                My Badges ({myBadges.length})
              </h3>
              <button onClick={() => navigate("/badges")} className="text-xs text-primary hover:underline font-display">View All</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {myBadges.slice(0, 8).map((badge) => (
                <div key={badge.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border">
                  <span>{BADGE_EMOJIS[badge.slug ?? ""] ?? "🏅"}</span>
                  <span className="text-xs font-display font-semibold text-foreground">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer link */}
        <div className="text-center">
          <button onClick={() => navigate("/disclaimer")} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline font-display">
            View Risk & Disclaimer
          </button>
        </div>
      </div>
    </div>
  );
}
