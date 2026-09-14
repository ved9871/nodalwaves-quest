import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { NWQLogo } from "@/components/NWQIcon";
import {
  ArrowLeft, Trophy, Crown, Medal, Star, Zap, Users, Share2, Copy,
  Flame, TrendingUp, Gift, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const AVATARS: Record<string, string> = {
  avatar1: "🧑‍💻", avatar2: "🦊", avatar3: "🤖", avatar4: "🐉",
  avatar5: "⚡", avatar6: "🔮", avatar7: "🚀", avatar8: "🛡️",
  avatar9: "💎", avatar10: "🌊", avatar11: "🔥", avatar12: "⭐",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" style={{ filter: "drop-shadow(0 0 6px #F6E05E)" }} />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="font-display font-black text-sm text-muted-foreground w-5 text-center">#{rank}</span>;
}

export default function LeaderboardPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: '/login?returnTo=/leaderboard',
  });
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"global" | "referrals">("global");
  const [copied, setCopied] = useState(false);

  const { data: leaderboard, isLoading } = trpc.leaderboard.top.useQuery({ limit: 50 });
  const { data: myRank } = trpc.leaderboard.myRank.useQuery(undefined, { enabled: isAuthenticated });
  const { data: referralCode } = trpc.referral.myCode.useQuery(undefined, { enabled: isAuthenticated });
  const { data: xpInfo } = trpc.profile.xpInfo.useQuery(undefined, { enabled: isAuthenticated });

  // Show loading spinner while auth resolves — prevents redirect for logged-in users on direct URL
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const referralLink = referralCode?.code
    ? `${window.location.origin}/?ref=${referralCode.code}`
    : "";

  const copyReferralLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <NWQLogo compact iconSize={26} responsive />
        </div>
      </nav>

      <div className="container py-8">
        {/* My Rank Banner */}
        {myRank && (
          <div className="card-nw p-5 mb-6 border-glow-gold flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-secondary/20 border border-secondary/40 flex items-center justify-center text-3xl">
              {AVATARS[xpInfo?.avatarId ?? "avatar1"] ?? "🧑‍💻"}
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-lg text-foreground">{xpInfo?.username ?? user?.name}</div>
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-1">
                <Badge className="bg-secondary/20 text-secondary border-secondary/40 font-display text-xs">
                  #{myRank.rank} Global
                </Badge>
                <Badge className="bg-primary/20 text-primary border-primary/40 font-display text-xs">
                  Level {xpInfo?.level ?? 1}
                </Badge>
                <span className="text-xs text-muted-foreground font-display">{((myRank as any).xp ?? 0).toLocaleString()} XP points</span>
              </div>
            </div>
            <div className="text-center">
              <div className="font-display font-black text-4xl text-gradient-gold">#{myRank.rank}</div>
              <div className="text-xs text-muted-foreground">Your Rank</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "global", label: "Global Rankings", icon: Trophy },
            { key: "referrals", label: "Referral Program", icon: Users },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display font-semibold text-sm transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Rankings */}
        {activeTab === "global" && (
          <div>
            {/* Top 3 podium */}
            {leaderboard && leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, podiumIdx) => {
                  if (!entry) return null;
                  const actualRank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
                  const heights = ["h-24", "h-32", "h-20"];
                  const colors = ["#9CA3AF", "#F6E05E", "#CD7F32"];
                  return (
                    <div key={entry.userId} className="text-center">
                      <div className="text-3xl mb-1">{AVATARS[entry.avatarId ?? "avatar1"] ?? "🧑‍💻"}</div>
                      <div className="font-display font-bold text-xs text-foreground truncate mb-1">{entry.username}</div>
                      <div className="text-xs font-display" style={{ color: colors[podiumIdx] }}>
                        {(entry.xp ?? 0).toLocaleString()} XP points
                      </div>
                      <div
                        className={`${heights[podiumIdx]} rounded-t-xl mt-2 flex items-center justify-center`}
                        style={{ backgroundColor: `${colors[podiumIdx]}20`, border: `2px solid ${colors[podiumIdx]}40` }}
                      >
                        <span className="font-display font-black text-2xl" style={{ color: colors[podiumIdx] }}>
                          {actualRank}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard?.map((entry: { userId: number; username: string | null; avatarId: string | null; xp: number; level: number; currentStreak: number }, i: number) => {
                      const rank = i + 1;
                      const isMe = entry.userId === (user as any)?.id;
                  return (
                      <div
                      key={entry.userId}
                      className={`card-nw p-4 flex items-center gap-4 ${isMe ? "border-secondary/50 bg-secondary/5" : ""}`}
                    >
                      <div className="w-8 flex items-center justify-center flex-shrink-0">
                        <RankBadge rank={rank} />
                      </div>
                      <div className="text-2xl flex-shrink-0">{AVATARS[entry.avatarId ?? "avatar1"] ?? "🧑‍💻"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-foreground truncate">{entry.username}</span>
                          {isMe && <Badge className="bg-secondary/20 text-secondary border-secondary/40 font-display text-xs">You</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground font-display">Level {entry.level}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground font-display">{entry.currentStreak ?? 0}d streak</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-display font-black text-sm text-gradient-gold">{(entry.xp ?? 0).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">XP points</div>
                      </div>
                    </div>
                  );
                })}
                {(!leaderboard || leaderboard.length === 0) && (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No rankings yet. Be the first!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Referral Program */}
        {activeTab === "referrals" && (
          <div className="space-y-6">
            {/* Referral stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card-nw p-5 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="font-display font-black text-3xl text-foreground">0</div>
                <div className="text-xs text-muted-foreground">Friends Referred</div>
              </div>
              <div className="card-nw p-5 text-center">
                <Zap className="w-8 h-8 text-secondary mx-auto mb-2" />
                <div className="font-display font-black text-3xl text-gradient-gold">0</div>
                <div className="text-xs text-muted-foreground">XP from Referrals</div>
              </div>
              <div className="card-nw p-5 text-center">
                <Gift className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="font-display font-black text-3xl text-green-400">+100</div>
                <div className="text-xs text-muted-foreground">XP per Referral</div>
              </div>
            </div>

            {/* Referral link */}
            <div className="card-nw p-6">
              <h3 className="font-display font-bold text-lg text-foreground mb-2 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Your Referral Link
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share your unique link. When a friend signs up and completes their first quest, you both earn +100 XP!
              </p>
              {referralLink ? (
                <div className="flex gap-2">
                  <div className="flex-1 p-3 rounded-xl bg-muted/30 border border-border font-mono text-xs text-muted-foreground truncate">
                    {referralLink}
                  </div>
                  <Button onClick={copyReferralLink} className="bg-primary text-primary-foreground font-display flex-shrink-0" size="sm">
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-muted/30 border border-border text-sm text-muted-foreground">
                  Complete profile setup to get your referral link.
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="card-nw p-6">
              <h3 className="font-display font-bold text-lg text-foreground mb-4">How Referrals Work</h3>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Share your unique referral link with friends", icon: Share2 },
                  { step: "2", text: "Friend signs up using your link", icon: Users },
                  { step: "3", text: "Friend completes their first quest", icon: Trophy },
                  { step: "4", text: "Both of you earn +100 XP bonus!", icon: Zap },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                      <span className="font-display font-black text-xs text-primary">{item.step}</span>
                    </div>
                    <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community CTA */}
            <div className="card-nw p-6 border-glow-red text-center">
              <div className="text-4xl mb-3">🌊</div>
              <h3 className="font-display font-bold text-xl text-gradient-red mb-2">Join the NodeWaves Quest Community</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Connect with beta testers, ask questions, share your Quest progress, report bugs, and get official NodeWaves Quest updates.
              </p>
              <a
                href="https://chat.whatsapp.com/HK3Cilk04AI2a0h6NqvkQ8?mode=gi_t"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="btn-glow bg-primary text-primary-foreground font-display font-bold w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Join Official Community
                </Button>
              </a>
            </div>

            {/* Event CTA */}
            <div className="card-nw p-6 border-glow-gold text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-display font-bold text-xl text-gradient-gold mb-2">Upcoming Challenges & Events</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Join skill-based learning challenges, Web3 knowledge leagues, and community events as they go live during the NodeWaves Quest beta.
              </p>
              <Button
                disabled
                onClick={() => toast.info("Events and challenges will be announced soon.")}
                className="btn-gold-glow bg-secondary text-secondary-foreground font-display font-bold w-full opacity-60 cursor-not-allowed"
              >
                Coming Soon
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Need CheckCircle2 import
