import { useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { NWQLogo } from "@/components/NWQIcon";
import {
  Users, BookOpen, Zap, Award, Trophy, Gamepad2, Brain,
  Activity, AlertTriangle, Shield, CheckCircle2, XCircle, Clock,
  BarChart3, Lock, RefreshCw, Copy, ExternalLink, Flame, TrendingDown
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────
type FunnelStep = {
  label: string;
  count: number | null;
  pctOfRegistered: number | null;
  dropOffFromPrev: number | null;
};

type ActivityTotals = {
  totalLessonsCompleted: number | null;
  totalQuizAttempts: number | null;
  totalMiniGamePlays: number | null;
  totalBadgesAwarded: number | null;
  totalXpEarned: number | null;
};

type SupportingMetric = { label: string; value: number | null; ok: boolean };

type ReviewUser = {
  displayName: string;
  maskedEmail: string;
  createdAt: string | null;
  xp: number;
  level: number;
  challengeEnrolled: boolean;
};

// ─── Skeleton card ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card-nw p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-muted/40" />
        <div className="h-3 w-24 rounded bg-muted/40" />
      </div>
      <div className="h-8 w-16 rounded bg-muted/40" />
    </div>
  );
}

// ─── Metric card ─────────────────────────────────────────────────────────────
function MetricCard({
  label, value, ok, icon: Icon, color,
}: {
  label: string; value: number | null; ok: boolean;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="card-nw p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-xs text-muted-foreground font-display leading-tight">{label}</span>
      </div>
      {ok ? (
        <div className="font-display font-black text-3xl text-foreground">{(value ?? 0).toLocaleString()}</div>
      ) : (
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="w-4 h-4" />
          <span className="text-sm font-display">Unable to load</span>
        </div>
      )}
    </div>
  );
}

// ─── User table skeleton ──────────────────────────────────────────────────────
function UserTableSkeleton() {
  return (
    <div className="card-nw overflow-hidden animate-pulse">
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-4 rounded bg-muted/40" />
            <div className="h-4 flex-1 rounded bg-muted/40" />
            <div className="h-4 w-32 rounded bg-muted/40" />
            <div className="h-4 w-20 rounded bg-muted/40" />
            <div className="h-4 w-12 rounded bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminReview() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";

  const { data, isLoading, error, refetch, isFetching } = trpc.review.data.useQuery(
    { token },
    {
      enabled: !!token,
      retry: false,
      staleTime: 60_000,
    }
  );

  // ── Access denied ──────────────────────────────────────────────────────────
  if (!token || (error && (error as any).data?.code === "NOT_FOUND")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card-nw p-10 text-center max-w-sm w-full">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display font-black text-2xl text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm">This page requires a valid review token. Please check your URL.</p>
        </div>
      </div>
    );
  }

  // ── Other errors ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card-nw p-10 text-center max-w-sm w-full">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="font-display font-black text-2xl text-foreground mb-2">Error Loading Data</h1>
          <p className="text-muted-foreground text-sm mb-4">{(error as any).message ?? "An unexpected error occurred."}</p>
          <button onClick={() => refetch()} className="text-primary text-sm font-display underline">Try again</button>
        </div>
      </div>
    );
  }

  const funnel = (data?.funnel ?? []) as FunnelStep[];
  const activityTotals = data?.activityTotals as ActivityTotals | undefined;
  const supporting = (data?.supporting ?? []) as SupportingMetric[];
  const recentUsers = (data?.recentUsers ?? []) as ReviewUser[];
  const generatedAt = data?.generatedAt;

  const jsonEndpointUrl = `${window.location.origin}/api/admin-review-summary?token=${encodeURIComponent(token)}`;

  const copyJsonUrl = () => {
    navigator.clipboard.writeText(jsonEndpointUrl).then(() =>
      toast.success("JSON endpoint URL copied to clipboard")
    );
  };

  const FUNNEL_COLORS = ["#3182CE","#38A169","#F6AD55","#805AD5","#D69E2E","#E53E3E","#9F7AEA","#48BB78"];

  const ACTIVITY_META: { key: keyof ActivityTotals; label: string; icon: React.ElementType; color: string }[] = [
    { key: "totalLessonsCompleted", label: "Lesson Completions", icon: BookOpen, color: "#805AD5" },
    { key: "totalQuizAttempts",     label: "Quiz Attempts",      icon: Brain,    color: "#D69E2E" },
    { key: "totalMiniGamePlays",    label: "Mini-Game Plays",    icon: Gamepad2, color: "#9F7AEA" },
    { key: "totalBadgesAwarded",    label: "Badges Awarded",     icon: Award,    color: "#F6AD55" },
    { key: "totalXpEarned",         label: "Total XP Earned",    icon: Zap,      color: "#38A169" },
  ];

  const SUPPORTING_META: { icon: React.ElementType; color: string }[] = [
    { icon: Users,         color: "#3182CE" }, // Total Registered Users
    { icon: Zap,           color: "#38A169" }, // Registered Today
    { icon: Users,         color: "#63B3ED" }, // Normal Users
    { icon: Shield,        color: "#FC8181" }, // Admin Users
    { icon: Shield,        color: "#F6AD55" }, // Demo Admin Users
    { icon: Zap,           color: "#F6AD55" }, // XP Earned Today
    { icon: Flame,         color: "#F6AD55" }, // Users with Streak ≥3 Days
    { icon: AlertTriangle, color: "#FC8181" }, // Users with 0 XP
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top nav ── */}
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <NWQLogo className="w-8 h-8" />
            <div>
              <div className="font-display font-black text-sm text-foreground">NodeWaves Quest</div>
              <div className="text-xs text-muted-foreground">Beta Review Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {generatedAt && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated: {new Date(generatedAt).toLocaleTimeString()}</span>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="animate-spin w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full" />
                <span>Loading…</span>
              </div>
            )}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 text-xs text-primary font-display hover:underline disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-8 max-w-5xl mx-auto space-y-8">

        {/* ── Beta warning banner ── */}
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-display font-bold text-sm text-yellow-300">Temporary Read-Only Beta Review Page</p>
            <p className="text-xs text-yellow-200/70 mt-0.5">
              For authorised external reviewers only. Shows aggregate analytics and masked user data only.
              No private information, edit controls, or administrative actions are available.
              <strong className="text-yellow-300"> Disable before public launch.</strong>
              {data?.expiresOn && (
                <span className="block mt-1 text-yellow-400 font-semibold">Access expires: {data.expiresOn}</span>
              )}
            </p>
          </div>
        </div>

        {/* ── Header + JSON endpoint link ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h1 className="font-display font-black text-2xl text-gradient-red">Beta Analytics Overview</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-display">JSON endpoint:</span>
            <button
              onClick={copyJsonUrl}
              className="flex items-center gap-1.5 text-xs text-primary font-display border border-primary/30 rounded px-2 py-1 hover:bg-primary/10 transition-colors"
            >
              <Copy className="w-3 h-3" />
              Copy URL
            </button>
            <a
              href={jsonEndpointUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground font-display border border-border rounded px-2 py-1 hover:bg-muted/20 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Open
            </a>
          </div>
        </div>

        {/* ── Section 1: Conversion Funnel — Unique Users ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs text-muted-foreground font-display uppercase tracking-widest">Conversion Funnel</p>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-display font-bold">Unique Users</span>
          </div>
          {isLoading ? (
            <div className="card-nw p-6 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex justify-between mb-1">
                    <div className="h-3 w-40 rounded bg-muted/40" />
                    <div className="h-3 w-24 rounded bg-muted/40" />
                  </div>
                  <div className="h-2 rounded-full bg-muted/40" />
                </div>
              ))}
            </div>
          ) : (
            <div className="card-nw p-6">
              <div className="space-y-4">
                {funnel.map((step, i) => {
                  const color = FUNNEL_COLORS[i % FUNNEL_COLORS.length];
                  return (
                    <div key={step.label}>
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-display w-4">{i + 1}</span>
                          <span className="text-sm font-display font-bold text-foreground">{step.label}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {step.count === null ? (
                            <span className="text-xs text-red-400 font-display flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Unable to load
                            </span>
                          ) : (
                            <>
                              <span className="text-xs text-muted-foreground">{step.count.toLocaleString()} users</span>
                              {step.pctOfRegistered !== null && (
                                <span className="text-xs font-display font-black" style={{ color }}>
                                  {step.pctOfRegistered}% of registered
                                </span>
                              )}
                              {step.dropOffFromPrev !== null && i > 0 && (
                                <span className="text-xs text-red-400 font-display flex items-center gap-0.5">
                                  <TrendingDown className="w-3 h-3" />
                                  {step.dropOffFromPrev}% drop-off
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${step.pctOfRegistered ?? 0}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
                {funnel.length === 0 && !isLoading && (
                  <div className="text-sm text-muted-foreground text-center py-4">No funnel data available.</div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                All counts are <strong>distinct users</strong>. Percentages are relative to total registered users.
                Drop-off is relative to the previous step.
              </p>
            </div>
          )}
        </div>

        {/* ── Section 2: Activity Totals — Total Events ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs text-muted-foreground font-display uppercase tracking-widest">Activity Totals</p>
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-display font-bold">Total Events</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              : ACTIVITY_META.map((m) => {
                  const value = activityTotals?.[m.key] ?? null;
                  return (
                    <MetricCard
                      key={m.label}
                      label={m.label}
                      value={value}
                      ok={value !== null}
                      icon={m.icon}
                      color={m.color}
                    />
                  );
                })
            }
          </div>
        </div>

        {/* ── Section 3: Supporting Counts ── */}
        <div>
          <p className="text-xs text-muted-foreground font-display mb-3 uppercase tracking-widest">Supporting Counts</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : supporting.map((m, i) => {
                  const meta = SUPPORTING_META[i] ?? { icon: Activity, color: "#38A169" };
                  return (
                    <MetricCard
                      key={m.label}
                      label={m.label}
                      value={m.value}
                      ok={m.ok}
                      icon={meta.icon}
                      color={meta.color}
                    />
                  );
                })
            }
          </div>
        </div>

        {/* ── Data source verification ── */}
        {!isLoading && (funnel.length > 0 || supporting.length > 0) && (
          <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="font-display font-bold text-sm text-foreground">Data Source Verification</span>
              <span className="text-xs text-muted-foreground">— each metric is a live database query</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[...funnel.map(s => ({ label: s.label, ok: s.count !== null })),
                ...supporting.map(s => ({ label: s.label, ok: s.ok }))
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-1.5">
                  {m.ok
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    : <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                  }
                  <span className="text-xs text-muted-foreground truncate">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Latest 20 users ── */}
        <div>
          <p className="text-xs text-muted-foreground font-display mb-3 uppercase tracking-widest">
            Latest 20 Registered Users
          </p>
          {isLoading ? (
            <UserTableSkeleton />
          ) : (
            <div className="card-nw overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      {["#", "Display Name", "Masked Email", "Joined", "XP", "Level", "Challenge"].map((h) => (
                        <th key={h} className={`px-4 py-3 font-display text-xs text-muted-foreground uppercase tracking-wider ${h === "XP" || h === "Level" ? "text-right" : h === "Challenge" ? "text-center" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u, i) => (
                      <tr key={i} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground font-display text-xs">{i + 1}</td>
                        <td className="px-4 py-3 font-display font-semibold text-foreground">{u.displayName}</td>
                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{u.maskedEmail}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-display font-bold text-secondary">
                          {(u.xp ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-display text-foreground">{u.level}</td>
                        <td className="px-4 py-3 text-center">
                          {u.challengeEnrolled
                            ? <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                            : <span className="text-muted-foreground text-xs">—</span>
                          }
                        </td>
                      </tr>
                    ))}
                    {recentUsers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                          {data ? "No users found." : "User data unavailable — query may have timed out."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Emails are masked (e.g. <code className="bg-muted/30 px-1 rounded">a***@gmail.com</code>). No full emails, passwords, or private data are shown.
          </p>
        </div>

        {/* ── Footer ── */}
        <div className="rounded-xl border border-border/50 bg-muted/10 p-4 text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            NodeWaves Quest Beta Review — Read-only. All funnel counts are <strong>distinct users</strong>.
            Activity totals are <strong>total event counts</strong>.
            XP, badges, and ranks are educational achievement points only — not financial instruments, tokens, or guaranteed rewards.
          </p>
          {generatedAt && (
            <p className="text-xs text-muted-foreground">
              Generated: <span className="font-mono">{new Date(generatedAt).toUTCString()}</span>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
