import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { NWQLogo, NWQIcon } from "@/components/NWQIcon";
import {
  Users, BookOpen, Target, Zap, Award, Trophy, Share2, Megaphone,
  Settings, BarChart3, Shield, ChevronRight, Plus, Edit, Trash2,
  ArrowLeft, Eye, CheckCircle2, XCircle, RefreshCw, Crown, TrendingUp,
  Activity, Gamepad2, Brain, AlertTriangle, Flame, MessageSquarePlus, CheckCheck, Clock, Ban, Search
} from "lucide-react";
import { toast } from "sonner";

type AdminTab = "overview" | "analytics" | "users" | "lessons" | "quizzes" | "xp" | "badges" | "challenges" | "leaderboard" | "referrals" | "announcements" | "campaigns" | "feedback";

const ADMIN_TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "analytics", label: "Beta Analytics", icon: TrendingUp },
  { key: "users", label: "Users", icon: Users },
  { key: "lessons", label: "Lessons", icon: BookOpen },
  { key: "quizzes", label: "Quizzes", icon: Target },
  { key: "xp", label: "XP Config", icon: Zap },
  { key: "badges", label: "Badges", icon: Award },
  { key: "challenges", label: "Challenges", icon: Trophy },
  { key: "leaderboard", label: "Leaderboard", icon: Crown },
  { key: "referrals", label: "Referrals", icon: Share2 },
  { key: "announcements", label: "Announcements", icon: Megaphone },
  { key: "campaigns", label: "Campaigns", icon: Settings },
  { key: "feedback", label: "Feedback", icon: MessageSquarePlus },
] as const;

export default function AdminPanel() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch current user role directly (most reliable source)
  const meQuery = trpc.auth.me.useQuery();
  const userRole = meQuery.data?.role;
  const isDemoAdmin = userRole === "demo_admin";
  const isFullAdmin = userRole === "admin";

  // Admin data queries
  const { data: stats } = trpc.admin.stats.useQuery();
  const { data: betaAnalytics } = trpc.admin.betaAnalytics.useQuery(undefined, { enabled: activeTab === "analytics" });
  const { data: users, refetch: refetchUsers } = trpc.admin.users.useQuery({ limit: 100 }, { enabled: activeTab === "users" });
  const { data: lessons, refetch: refetchLessons } = trpc.admin.lessons.useQuery(undefined, { enabled: activeTab === "lessons" });
  const { data: quizzes, refetch: refetchQuizzes } = trpc.admin.quizzes.useQuery(undefined, { enabled: activeTab === "quizzes" });
  const { data: xpConfig, refetch: refetchXp } = trpc.admin.xpConfig.useQuery(undefined, { enabled: activeTab === "xp" });
  const { data: badges, refetch: refetchBadges } = trpc.admin.badges.useQuery(undefined, { enabled: activeTab === "badges" });
  const { data: leaderboard, refetch: refetchLeaderboard } = trpc.admin.leaderboard.useQuery(undefined, { enabled: activeTab === "leaderboard" });
  const { data: adminReferrals } = trpc.admin.referrals.useQuery(undefined, { enabled: activeTab === "referrals" });
  const { data: dailyActiveUsers } = trpc.admin.dailyActiveUsers.useQuery(undefined, { enabled: activeTab === "overview" || activeTab === "analytics" });
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackStatus, setFeedbackStatus] = useState<"all" | "new" | "reviewed" | "resolved" | "dismissed">("all");
  const { data: feedbackSummary, refetch: refetchFeedbackSummary } = trpc.feedback.summary.useQuery(undefined, { enabled: activeTab === "overview" || activeTab === "feedback" });
  const markAllReviewedMut = trpc.feedback.markAllReviewed.useMutation({
    onSuccess: (res) => {
      toast.success(`Marked ${res.updated} item${res.updated !== 1 ? 's' : ''} as reviewed.`);
      refetchFeedback();
      refetchFeedbackSummary();
    },
    onError: () => toast.error("Failed to mark all as reviewed."),
  });
  const { data: feedbackData, refetch: refetchFeedback } = trpc.feedback.list.useQuery(
    { page: feedbackPage, status: feedbackStatus },
    { enabled: activeTab === "feedback" }
  );
  const updateFeedbackStatus = trpc.feedback.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated!"); refetchFeedback(); },
    onError: (err) => toast.error(err.message),
  });
  const updateRoleMut = trpc.admin.updateUserRole.useMutation({ onSuccess: () => { toast.success("Role updated!"); refetchUsers(); } });
  const banUserMut = trpc.admin.banUser.useMutation({ onSuccess: () => { toast.success("User status updated!"); refetchUsers(); } });
  const resetLeaderboardMut = trpc.admin.resetLeaderboard.useMutation({
    onSuccess: () => { toast.success("Leaderboard reset! All XP set to 0."); refetchLeaderboard(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteAnnouncementRealMut = trpc.admin.deleteAnnouncement.useMutation({ onSuccess: () => { toast.success("Announcement deleted!"); refetchAnnouncements(); } });
  const { data: announcements, refetch: refetchAnnouncements } = trpc.admin.announcements.useQuery(undefined, { enabled: activeTab === "announcements" });

  // Mutations
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", type: "info" as const, ctaText: "", ctaLink: "" });

  // User Management search/filter state
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [challengeFilter, setChallengeFilter] = useState("all");

  // Filtered users (client-side, no DB query needed)
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const search = userSearch.trim().toLowerCase();
    return users.filter((u: any) => {
      // Text search: display name, username, masked email prefix
      if (search) {
        const nameMatch = (u.name ?? "").toLowerCase().includes(search);
        const usernameMatch = (u.username ?? "").toLowerCase().includes(search);
        const emailPrefix = (u.maskedEmail ?? "").split("@")[0].toLowerCase();
        const emailMatch = emailPrefix.includes(search);
        if (!nameMatch && !usernameMatch && !emailMatch) return false;
      }
      // Role filter
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      // Challenge enrolled filter
      if (challengeFilter === "enrolled" && !u.challengeEnrolled) return false;
      if (challengeFilter === "not_enrolled" && u.challengeEnrolled) return false;
      return true;
    });
  }, [users, userSearch, roleFilter, challengeFilter]);
  const createAnnouncement = trpc.admin.upsertAnnouncement.useMutation({
    onSuccess: () => { toast.success("Announcement created!"); refetchAnnouncements(); setNewAnnouncement({ title: "", content: "", type: "info", ctaText: "", ctaLink: "" }); },
    onError: (e) => toast.error(e.message),
  });
  const deleteAnnouncement = trpc.admin.upsertAnnouncement.useMutation({
    onSuccess: () => { toast.success("Deleted!"); refetchAnnouncements(); },
  });
  const deleteAnnouncementMut = trpc.admin.upsertAnnouncement.useMutation({ onSuccess: () => { toast.success("Deleted!"); refetchAnnouncements(); } });
  const updateXpConfigMut = trpc.admin.updateXpConfig.useMutation({
    onSuccess: () => { toast.success("XP config updated!"); refetchXp(); },
    onError: (e) => toast.error(e.message),
  });

  // Show loading spinner while auth is resolving — never redirect prematurely
  if (authLoading || meQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-display text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // After auth resolves: if not logged in at all, redirect to home
  if (!isAuthenticated && !meQuery.data) { navigate("/"); return null; }

  if (userRole !== "admin" && userRole !== "demo_admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card-nw p-8 text-center max-w-sm">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-foreground mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground mb-4">You need admin privileges to access this panel.</p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate("/admin-login")} className="bg-primary text-primary-foreground font-display">
              Sign In as Admin
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="font-display">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-56" : "w-14"} flex-shrink-0 glass border-r border-border flex flex-col transition-all duration-200 sticky top-0 h-screen overflow-y-auto`}>
        <div className="p-3 border-b border-border flex items-center gap-2 min-h-[52px]">
          {sidebarOpen ? (
            <NWQLogo compact iconSize={22} />
          ) : (
            <NWQIcon size={22} />
          )}
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as AdminTab)}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all text-sm ${
                activeTab === tab.key
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && (
                <span className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="font-display font-semibold truncate">{tab.label}</span>
                  {tab.key === "feedback" && (stats?.newFeedbackCount ?? 0) > 0 && (
                    <span className="ml-auto flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                      {(stats?.newFeedbackCount ?? 0) > 99 ? "99+" : stats?.newFeedbackCount}
                    </span>
                  )}
                </span>
              )}
              {!sidebarOpen && tab.key === "feedback" && (stats?.newFeedbackCount ?? 0) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600" />
              )}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="font-display font-semibold">Back to App</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">

          {/* Demo Admin Banner */}
          {isDemoAdmin && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-amber-900/20 border border-amber-600/40 rounded-xl">
              <Shield className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-amber-300 font-semibold text-sm">Demo Admin — Beta Review Mode</p>
                <p className="text-amber-400/70 text-xs mt-0.5">
                  You have read-only access to all sections plus Announcements management. Destructive actions (delete users, change roles, reset leaderboard) are disabled in this mode.
                </p>
              </div>
            </div>
          )}

          {/* Overview */}
          {activeTab === "overview" && (
            <div>
              <h1 className="font-display font-black text-2xl text-gradient-red mb-6">Dashboard Overview</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { label: "Total Registered Users", value: stats?.totalUsers ?? 0, icon: Users, color: "#3182CE" },
                  { label: "Joined Today", value: stats?.todayUsers ?? 0, icon: Zap, color: "#38A169" },
                  { label: "Total Lessons", value: stats?.totalLessons ?? 0, icon: BookOpen, color: "#805AD5" },
                  { label: "Total Quizzes", value: stats?.totalQuizzes ?? 0, icon: Target, color: "#D69E2E" },
                ].map((s) => (
                  <div key={s.label} className="card-nw p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                        <s.icon className="w-4 h-4" style={{ color: s.color }} />
                      </div>
                      <span className="text-xs text-muted-foreground font-display">{s.label}</span>
                    </div>
                    <div className="font-display font-black text-3xl text-foreground">{s.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              {/* User breakdown row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Normal Users", value: stats?.normalUsers ?? 0, icon: Users, color: "#63B3ED" },
                  { label: "Admin Users", value: stats?.adminUsers ?? 0, icon: Shield, color: "#FC8181" },
                  { label: "Challenge Enrolled", value: stats?.challengeEnrolled ?? 0, icon: Trophy, color: "#F6AD55" },
                ].map((s) => (
                  <div key={s.label} className="card-nw p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                        <s.icon className="w-4 h-4" style={{ color: s.color }} />
                      </div>
                      <span className="text-xs text-muted-foreground font-display">{s.label}</span>
                    </div>
                    <div className="font-display font-black text-3xl text-foreground">{s.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              {/* Engagement totals — fixed from hardcoded 0 */}
              <p className="text-xs text-muted-foreground font-display mb-3 uppercase tracking-widest">Engagement Totals</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { label: "Badges Awarded", value: stats?.totalBadgesAwarded ?? 0, icon: Award, color: "#D69E2E" },
                  { label: "Lessons Completed", value: stats?.totalLessonsCompleted ?? 0, icon: CheckCircle2, color: "#38A169" },
                  { label: "Quiz Attempts", value: stats?.totalQuizAttempts ?? 0, icon: Target, color: "#E53E3E" },
                  { label: "Mini-Game Plays", value: stats?.totalMiniGamePlays ?? 0, icon: Gamepad2, color: "#9F7AEA" },
                ].map((s) => (
                  <div key={s.label} className="card-nw p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                        <s.icon className="w-4 h-4" style={{ color: s.color }} />
                      </div>
                      <span className="text-xs text-muted-foreground font-display">{s.label}</span>
                    </div>
                    <div className="font-display font-black text-3xl text-foreground">{(s.value).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              {/* Today's activity */}
              <p className="text-xs text-muted-foreground font-display mb-3 uppercase tracking-widest">Today's Activity</p>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
                {[
                  { label: "Active Users Today", value: stats?.activeUsersToday ?? 0, icon: Activity, color: "#38A169" },
                  { label: "XP Earned Today", value: stats?.xpEarnedToday ?? 0, icon: Zap, color: "#F6AD55" },
                ].map((s) => (
                  <div key={s.label} className="card-nw p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                        <s.icon className="w-4 h-4" style={{ color: s.color }} />
                      </div>
                      <span className="text-xs text-muted-foreground font-display">{s.label}</span>
                    </div>
                    <div className="font-display font-black text-3xl text-foreground">{(s.value).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              {/* Engagement depth */}
              <p className="text-xs text-muted-foreground font-display mb-3 uppercase tracking-widest">Engagement Depth</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Users with 0 XP", value: stats?.usersWithZeroXp ?? 0, icon: AlertTriangle, color: "#FC8181" },
                  { label: "Users with ≥1 Lesson", value: stats?.usersWithLesson ?? 0, icon: BookOpen, color: "#805AD5" },
                  { label: "Users with ≥1 Quiz", value: stats?.usersWithQuiz ?? 0, icon: Brain, color: "#D69E2E" },
                  { label: "Users with ≥1 Mini-Game", value: stats?.usersWithMiniGame ?? 0, icon: Gamepad2, color: "#9F7AEA" },
                  { label: "Streak ≥3 Days", value: stats?.usersWithStreak3Plus ?? 0, icon: Flame, color: "#F6AD55" },
                ].map((s) => (
                  <div key={s.label} className="card-nw p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                        <s.icon className="w-4 h-4" style={{ color: s.color }} />
                      </div>
                      <span className="text-xs text-muted-foreground font-display">{s.label}</span>
                    </div>
                    <div className="font-display font-black text-3xl text-foreground">{(s.value).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              {/* 7-Day Active Users Sparkline */}
              <div className="mt-6">
                <p className="text-xs text-muted-foreground font-display mb-3 uppercase tracking-widest">Last 7 Days — Daily Active Users</p>
                <div className="card-nw p-4">
                  {!dailyActiveUsers ? (
                    <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">Loading chart data...</div>
                  ) : dailyActiveUsers.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">No activity data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={dailyActiveUsers} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E53E3E" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#E53E3E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} tickFormatter={(v) => v.slice(5)} />
                        <YAxis tick={{ fontSize: 10, fill: "#888" }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                          labelStyle={{ color: "#aaa" }}
                          formatter={(v: number) => [`${v} users`, "Active"]}
                        />
                        <Area type="monotone" dataKey="count" stroke="#E53E3E" fill="url(#dauGrad)" strokeWidth={2} dot={{ r: 3, fill: "#E53E3E" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Feedback Summary Card */}
              <div className="mt-6">
                <p className="text-xs text-muted-foreground font-display mb-3 uppercase tracking-widest">Beta Feedback Summary</p>
                <div className="card-nw p-4">
                  {!feedbackSummary ? (
                    <div className="h-16 flex items-center justify-center text-muted-foreground text-sm">Loading feedback data...</div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquarePlus className="w-4 h-4 text-primary" />
                          <span className="text-sm font-display font-semibold">Total Submissions: {feedbackSummary.total}</span>
                          {feedbackSummary.totalNew > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">{feedbackSummary.totalNew} New</span>
                          )}
                        </div>
                        <button
                          onClick={() => setActiveTab("feedback")}
                          className="text-xs text-primary hover:underline font-display font-semibold"
                        >
                          View Feedback →
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {([
                          { key: "bug", label: "Bug", color: "bg-red-900/40 text-red-300 border-red-700/40" },
                          { key: "suggestion", label: "Suggestion", color: "bg-blue-900/40 text-blue-300 border-blue-700/40" },
                          { key: "confusing_text", label: "Confusing Text", color: "bg-yellow-900/40 text-yellow-300 border-yellow-700/40" },
                          { key: "mobile_issue", label: "Mobile Issue", color: "bg-purple-900/40 text-purple-300 border-purple-700/40" },
                          { key: "game_issue", label: "Game Issue", color: "bg-green-900/40 text-green-300 border-green-700/40" },
                        ] as const).map(({ key, label, color }) => (
                          <span key={key} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-display font-semibold ${color}`}>
                            {label}
                            <span className="font-bold">{feedbackSummary.byType[key] ?? 0}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Beta Analytics */}
          {activeTab === "analytics" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h1 className="font-display font-black text-2xl text-gradient-red">Beta Funnel Analytics</h1>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded font-display">ADMIN ONLY</span>
              </div>

              {/* ── Section 1: Conversion Funnel — Unique Users ── */}
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs text-muted-foreground font-display uppercase tracking-widest">Conversion Funnel</p>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-display font-bold">Unique Users</span>
              </div>
              <div className="card-nw p-6 mb-6">
                <div className="space-y-4">
                  {(betaAnalytics?.funnel ?? []).map((step, i) => {
                    const count = step.count;
                    const pct = step.pctOfRegistered;
                    const dropOff = step.dropOffFromPrev;
                    const STEP_COLORS = ["#3182CE","#38A169","#F6AD55","#805AD5","#D69E2E","#E53E3E","#9F7AEA","#48BB78"];
                    const color = STEP_COLORS[i % STEP_COLORS.length];
                    return (
                      <div key={step.label}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-display w-4">{i + 1}</span>
                            <span className="text-sm font-display font-bold text-foreground">{step.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {count === null ? (
                              <span className="text-xs text-red-400 font-display">Unable to load</span>
                            ) : (
                              <>
                                <span className="text-xs text-muted-foreground">{count.toLocaleString()} users</span>
                                {pct !== null && (
                                  <span className="text-xs font-display font-black" style={{ color }}>{pct}% of registered</span>
                                )}
                                {dropOff !== null && i > 0 && (
                                  <span className="text-xs text-red-400 font-display">↓{dropOff}% drop-off</span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct ?? 0}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    );
                  })}
                  {!betaAnalytics && (
                    <div className="text-sm text-muted-foreground text-center py-4">Loading funnel data...</div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-4">All counts are distinct users. Percentages are relative to total registered users. Drop-off is relative to the previous step.</p>
              </div>

              {/* ── Section 2: Activity Totals — Total Events ── */}
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs text-muted-foreground font-display uppercase tracking-widest">Activity Totals</p>
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-display font-bold">Total Events</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Lesson Completions", value: betaAnalytics?.activityTotals?.totalLessonsCompleted, icon: BookOpen, color: "#805AD5" },
                  { label: "Quiz Attempts", value: betaAnalytics?.activityTotals?.totalQuizAttempts, icon: Brain, color: "#D69E2E" },
                  { label: "Mini-Game Plays", value: betaAnalytics?.activityTotals?.totalMiniGamePlays, icon: Gamepad2, color: "#E53E3E" },
                  { label: "Badges Awarded", value: betaAnalytics?.activityTotals?.totalBadgesAwarded, icon: Trophy, color: "#F6AD55" },
                  { label: "Total XP Earned", value: betaAnalytics?.activityTotals?.totalXpEarned, icon: Zap, color: "#38A169" },
                ].map((s) => (
                  <div key={s.label} className="card-nw p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                        <s.icon className="w-4 h-4" style={{ color: s.color }} />
                      </div>
                      <span className="text-xs text-muted-foreground font-display">{s.label}</span>
                    </div>
                    {s.value === null || s.value === undefined ? (
                      <div className="text-sm text-red-400 font-display">Unable to load</div>
                    ) : (
                      <div className="font-display font-black text-3xl text-foreground">{s.value.toLocaleString()}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* ── Section 3: Today's Activity ── */}
              <p className="text-xs text-muted-foreground font-display mb-3 uppercase tracking-widest">Today's Activity</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: "XP Earned Today", value: betaAnalytics?.xpEarnedToday, icon: Zap, color: "#F6AD55" },
                  { label: "Active Users Today", value: betaAnalytics?.activeUsersToday, icon: Activity, color: "#38A169" },
                ].map((s) => (
                  <div key={s.label} className="card-nw p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                        <s.icon className="w-4 h-4" style={{ color: s.color }} />
                      </div>
                      <span className="text-xs text-muted-foreground font-display">{s.label}</span>
                    </div>
                    {s.value === null || s.value === undefined ? (
                      <div className="text-sm text-red-400 font-display">Unable to load</div>
                    ) : (
                      <div className="font-display font-black text-3xl text-foreground">{s.value.toLocaleString()}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* ── Section 4: Engagement Depth ── */}
              <p className="text-xs text-muted-foreground font-display mb-3 uppercase tracking-widest">Engagement Depth</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Users with 0 XP", value: betaAnalytics?.usersWithZeroXp, icon: AlertTriangle, color: "#FC8181" },
                  { label: "Streak ≥3 Days", value: betaAnalytics?.usersWithStreak3Plus, icon: Flame, color: "#F6AD55" },
                  { label: "Registered Today", value: betaAnalytics?.todayUsers, icon: Users, color: "#38A169" },
                ].map((s) => (
                  <div key={s.label} className="card-nw p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                        <s.icon className="w-4 h-4" style={{ color: s.color }} />
                      </div>
                      <span className="text-xs text-muted-foreground font-display">{s.label}</span>
                    </div>
                    {s.value === null || s.value === undefined ? (
                      <div className="text-sm text-red-400 font-display">Unable to load</div>
                    ) : (
                      <div className="font-display font-black text-3xl text-foreground">{s.value.toLocaleString()}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* 7-Day Active Users Sparkline */}
              <div className="mt-6">
                <p className="text-xs text-muted-foreground font-display mb-3 uppercase tracking-widest">Last 7 Days — Daily Active Users</p>
                <div className="card-nw p-4">
                  {!dailyActiveUsers ? (
                    <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">Loading chart data...</div>
                  ) : dailyActiveUsers.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">No activity data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={dailyActiveUsers} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="dauGrad2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3182CE" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3182CE" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} tickFormatter={(v) => v.slice(5)} />
                        <YAxis tick={{ fontSize: 10, fill: "#888" }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                          labelStyle={{ color: "#aaa" }}
                          formatter={(v: number) => [`${v} users`, "Active"]}
                        />
                        <Area type="monotone" dataKey="count" stroke="#3182CE" fill="url(#dauGrad2)" strokeWidth={2} dot={{ r: 3, fill: "#3182CE" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Users */}
          {activeTab === "users" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display font-black text-2xl text-gradient-red">User Management</h1>
                <Button onClick={() => refetchUsers()} variant="outline" size="sm" className="border-border font-display">
                  <RefreshCw className="w-4 h-4 mr-2" />Refresh
                </Button>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-wrap gap-3 mb-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search by name, username, or email…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 bg-muted/20 border-border font-display text-sm h-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px] h-9 bg-muted/20 border-border font-display text-sm">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="demo_admin">Demo Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={challengeFilter} onValueChange={setChallengeFilter}>
                  <SelectTrigger className="w-[170px] h-9 bg-muted/20 border-border font-display text-sm">
                    <SelectValue placeholder="Challenge Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                    <SelectItem value="not_enrolled">Not Enrolled</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground font-display whitespace-nowrap">
                  Showing {filteredUsers.length} of {users?.length ?? 0} users
                </span>
              </div>

              <div className="card-nw overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead className="border-b border-border bg-muted/10">
                    <tr>
                      {["#", "Display Name", "Email", "Level", "XP Points", "Challenge", "Joined", "Last Active", "Role", "Actions"].map(h => (
                        <th key={h} className="text-left p-3 font-display font-semibold text-muted-foreground text-xs whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u: any) => {
                      const joinedDate = u.createdAt ? new Date(u.createdAt) : null;
                      const lastActiveDate = u.lastSignedIn ? new Date(u.lastSignedIn) : null;
                      const isValidDate = (d: Date | null) => d && !isNaN(d.getTime());
                      return (
                        <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          {/* # serial */}
                          <td className="p-3 text-xs text-muted-foreground font-mono">{u.rowNumber}</td>
                          {/* Display Name + username tooltip */}
                          <td className="p-3">
                            <div className="font-display font-semibold text-foreground text-sm">{u.name ?? "—"}</div>
                            {u.username && <div className="text-xs text-muted-foreground">@{u.username}</div>}
                          </td>
                          {/* Masked email */}
                          <td className="p-3 text-xs text-muted-foreground font-mono">
                            {u.maskedEmail ?? "—"}
                          </td>
                          {/* Level */}
                          <td className="p-3">
                            <Badge className="bg-primary/20 text-primary border-primary/40 font-display text-xs">Lv{u.level ?? 1}</Badge>
                          </td>
                          {/* XP */}
                          <td className="p-3 font-display font-semibold text-secondary text-xs whitespace-nowrap">
                            {(u.xp ?? 0).toLocaleString()} XP
                          </td>
                          {/* Challenge enrolled */}
                          <td className="p-3 text-center">
                            {u.challengeEnrolled
                              ? <span className="text-green-400 text-xs font-bold">✓ Yes</span>
                              : <span className="text-muted-foreground text-xs">No</span>}
                          </td>
                          {/* Joined date */}
                          <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                            {isValidDate(joinedDate) ? joinedDate!.toLocaleDateString() : "—"}
                          </td>
                          {/* Last active */}
                          <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                            {isValidDate(lastActiveDate) ? lastActiveDate!.toLocaleDateString() : "—"}
                          </td>
                          {/* Role */}
                          <td className="p-3">
                            <Badge className={`font-display text-xs ${
                              u.role === "admin" ? "bg-primary/20 text-primary border-primary/40"
                              : u.role === "demo_admin" ? "bg-yellow-900/40 text-yellow-300 border-yellow-700/40"
                              : "bg-muted text-muted-foreground border-border"
                            }`}>
                              {u.role}
                            </Badge>
                          </td>
                          {/* Actions */}
                          <td className="p-3">
                            {isFullAdmin ? (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 border-border font-display text-xs"
                                  onClick={() => updateRoleMut.mutate({ userId: u.id, role: u.role === 'admin' ? 'user' : 'admin' })}
                                  title={`Internal ID: ${u.id}`}
                                >
                                  {u.role === 'admin' ? 'Demote' : 'Promote'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 border-primary/40 text-primary font-display text-xs"
                                  onClick={() => banUserMut.mutate({ userId: u.id, ban: u.role !== 'banned' })}
                                >
                                  {u.role === 'banned' ? 'Unban' : 'Ban'}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-500 italic">Read-only</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {users && users.length > 0 ? "No users match your search or filters." : "No users found"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lessons */}
          {activeTab === "lessons" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display font-black text-2xl text-gradient-red">Lesson Management</h1>
                <Button onClick={() => toast.info("Lesson editor coming soon!")} className="bg-primary text-primary-foreground font-display" size="sm">
                  <Plus className="w-4 h-4 mr-2" />Add Lesson
                </Button>
              </div>
              <div className="card-nw overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      {["ID", "Title", "Zone", "Topic", "XP Reward", "Order", "Actions"].map(h => (
                        <th key={h} className="text-left p-3 font-display font-semibold text-muted-foreground text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lessons?.map((l: any) => (
                      <tr key={l.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-3 text-xs text-muted-foreground">{l.id}</td>
                        <td className="p-3 font-display font-semibold text-foreground text-xs">{l.title}</td>
                        <td className="p-3 text-xs text-muted-foreground">{l.zoneName ?? l.zoneId}</td>
                        <td className="p-3"><Badge className="bg-muted text-muted-foreground border-border font-display text-xs">{l.topic}</Badge></td>
                        <td className="p-3 font-display font-semibold text-secondary text-xs">+{l.xpReward}</td>
                        <td className="p-3 text-xs text-foreground">{l.order}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-border" onClick={() => toast.info("Edit coming soon!")}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!lessons || lessons.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">No lessons found</div>
                )}
              </div>
            </div>
          )}

          {/* Quizzes */}
          {activeTab === "quizzes" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display font-black text-2xl text-gradient-red">Quiz Management</h1>
                <Button onClick={() => toast.info("Quiz editor coming soon!")} className="bg-primary text-primary-foreground font-display" size="sm">
                  <Plus className="w-4 h-4 mr-2" />Add Quiz
                </Button>
              </div>
              <div className="card-nw overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      {["ID", "Title", "Zone", "Questions", "Time Limit", "Pass %", "XP", "Actions"].map(h => (
                        <th key={h} className="text-left p-3 font-display font-semibold text-muted-foreground text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes?.map((q: any) => (
                      <tr key={q.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-3 text-xs text-muted-foreground">{q.id}</td>
                        <td className="p-3 font-display font-semibold text-foreground text-xs">{q.title}</td>
                        <td className="p-3 text-xs text-muted-foreground">{q.zoneName ?? q.zoneId}</td>
                        <td className="p-3 text-xs text-foreground">{q.questionCount ?? 0}</td>
                        <td className="p-3 text-xs text-foreground">{q.timeLimitSeconds}s</td>
                        <td className="p-3 text-xs text-foreground">{q.passingScore}%</td>
                        <td className="p-3 font-display font-semibold text-secondary text-xs">+{q.xpReward}</td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-border" onClick={() => toast.info("Edit coming soon!")}>
                            <Edit className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!quizzes || quizzes.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">No quizzes found</div>
                )}
              </div>
            </div>
          )}

          {/* XP Config */}
          {activeTab === "xp" && (
            <div>
              <h1 className="font-display font-black text-2xl text-gradient-red mb-6">XP Configuration</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {xpConfig?.map((config: any) => (
                  <div key={config.id} className="card-nw p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-display font-bold text-sm text-foreground">{config.action}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{config.description}</div>
                      </div>
                      <div className="font-display font-black text-2xl text-gradient-gold">+{config.xpAmount}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={config.xpAmount}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-sm text-foreground font-display focus:outline-none focus:border-primary"
                        id={`xp-${config.id}`}
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(`xp-${config.id}`) as HTMLInputElement;
                          updateXpConfigMut.mutate({ key: config.action, value: parseInt(input.value) });
                        }}
                        className="bg-primary text-primary-foreground font-display text-xs"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {activeTab === "badges" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display font-black text-2xl text-gradient-red">Badge Management</h1>
                <Button onClick={() => toast.info("Badge creator coming soon!")} className="bg-primary text-primary-foreground font-display" size="sm">
                  <Plus className="w-4 h-4 mr-2" />Add Badge
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges?.map((badge: any) => (
                  <div key={badge.id} className="card-nw p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: `${badge.color ?? "#D69E2E"}20`, border: `1px solid ${badge.color ?? "#D69E2E"}40` }}>
                      🏅
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm text-foreground">{badge.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{badge.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-secondary/20 text-secondary border-secondary/40 font-display text-xs">+{badge.xpBonus} XP</Badge>
                        <span className="text-xs text-muted-foreground font-mono">{badge.slug}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-border flex-shrink-0" onClick={() => toast.info("Edit coming soon!")}>
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Challenges */}
          {activeTab === "challenges" && (
            <div>
              <h1 className="font-display font-black text-2xl text-gradient-red mb-6">Skill Challenges</h1>
              <div className="space-y-4">
                {[
                  { name: "7-Day Web3 Learning Challenge", status: "Upcoming", participants: 0, type: "Weekly" },
                  { name: "Web3 Knowledge League", status: "Upcoming", participants: 0, type: "Monthly" },
                  { name: "NodeWaves Pitch Battle", status: "Planned", participants: 0, type: "Event" },
                  { name: "Wallet Safety Mission", status: "Planned", participants: 0, type: "Campaign" },
                  { name: "Community Educator Challenge", status: "Planned", participants: 0, type: "Campaign" },
                  { name: "Monthly Ambassador Cup", status: "Planned", participants: 0, type: "Monthly" },
                ].map((challenge) => (
                  <div key={challenge.name} className="card-nw p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="font-display font-bold text-sm text-foreground mb-1">{challenge.name}</div>
                      <div className="flex items-center gap-2">
                        <Badge className={`font-display text-xs ${challenge.status === "Upcoming" ? "bg-secondary/20 text-secondary border-secondary/40" : "bg-muted text-muted-foreground border-border"}`}>
                          {challenge.status}
                        </Badge>
                        <Badge className="bg-muted text-muted-foreground border-border font-display text-xs">{challenge.type}</Badge>
                        <span className="text-xs text-muted-foreground">{challenge.participants} participants</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-border font-display text-xs" onClick={() => toast.info("Challenge editor coming soon!")}>
                      <Settings className="w-3 h-3 mr-1" />Configure
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {activeTab === "leaderboard" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display font-black text-2xl text-gradient-red">Leaderboard Management</h1>
{isFullAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/40 text-primary font-display"
                  onClick={() => {
                    if (window.confirm("WARNING: This will reset ALL user XP to 0. This cannot be undone. Continue?")) {
                      resetLeaderboardMut.mutate();
                    }
                  }}
                  disabled={resetLeaderboardMut.isPending}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset All XP
                </Button>
                )}
              </div>
              <div className="card-nw overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      {["Rank", "Username", "XP", "Level", "Streak", "Badges", "Joined"].map(h => (
                        <th key={h} className="text-left p-3 font-display font-semibold text-muted-foreground text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard?.map((entry: any, i: number) => (
                      <tr key={entry.userId} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <span className={`font-display font-black text-sm ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                            #{i + 1}
                          </span>
                        </td>
                        <td className="p-3 font-display font-semibold text-foreground text-xs">{entry.username ?? "—"}</td>
                        <td className="p-3 font-display font-semibold text-secondary text-xs">{(entry.xp ?? 0).toLocaleString()}</td>
                        <td className="p-3"><Badge className="bg-primary/20 text-primary border-primary/40 font-display text-xs">Lv{entry.level}</Badge></td>
                        <td className="p-3 text-xs text-foreground">{entry.currentStreak ?? 0}d</td>
                        <td className="p-3 text-xs text-foreground">{entry.badgeCount ?? 0}</td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Referrals */}
          {activeTab === "referrals" && (
            <div>
              <h1 className="font-display font-black text-2xl text-gradient-red mb-6">Referral Management</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="card-nw p-5 text-center">
                  <Share2 className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="font-display font-black text-3xl text-foreground">{stats?.totalUsers ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Total Users</div>
                </div>
                <div className="card-nw p-5 text-center">
                  <Zap className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <div className="font-display font-black text-3xl text-gradient-gold">100</div>
                  <div className="text-xs text-muted-foreground">XP per Referral</div>
                </div>
                <div className="card-nw p-5 text-center">
                  <Settings className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="font-display font-black text-3xl text-green-400">Active</div>
                  <div className="text-xs text-muted-foreground">Program Status</div>
                </div>
              </div>
              <div className="card-nw p-5 mb-6">
                <h3 className="font-display font-bold text-base text-foreground mb-3">Referral Rules</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Each user gets a unique referral code upon profile setup</p>
                  <p>• Referrer earns +100 XP when referred user completes first quest</p>
                  <p>• Referred user earns +50 XP welcome bonus</p>
                  <p>• No limit on number of referrals per user</p>
                  <p>• Referral tracking is automatic via URL parameter</p>
                </div>
              </div>
              {adminReferrals && adminReferrals.length > 0 && (
                <div className="card-nw overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-display font-bold text-sm text-foreground">Referral Records ({adminReferrals.length})</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        {["ID", "Referrer ID", "Referred ID", "Status", "Date"].map(h => (
                          <th key={h} className="text-left p-3 font-display font-semibold text-muted-foreground text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {adminReferrals.map((r: any) => (
                        <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="p-3 text-xs text-muted-foreground">{r.id}</td>
                          <td className="p-3 text-xs text-foreground">{r.referrerId}</td>
                          <td className="p-3 text-xs text-foreground">{r.referredId}</td>
                          <td className="p-3"><Badge className="bg-green-500/20 text-green-400 border-green-500/40 font-display text-xs">{r.status ?? 'pending'}</Badge></td>
                          <td className="p-3 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {(!adminReferrals || adminReferrals.length === 0) && (
                <div className="card-nw p-8 text-center text-muted-foreground">No referral records yet</div>
              )}
            </div>
          )}

          {/* Announcements */}
          {activeTab === "announcements" && (
            <div>
              <h1 className="font-display font-black text-2xl text-gradient-red mb-6">Announcements</h1>
              {/* Create form */}
              <div className="card-nw p-5 mb-6">
                <h3 className="font-display font-bold text-base text-foreground mb-4">Create Announcement</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(a => ({ ...a, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm text-foreground font-display focus:outline-none focus:border-primary"
                  />
                  <textarea
                    placeholder="Content"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement(a => ({ ...a, content: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm text-foreground font-display focus:outline-none focus:border-primary resize-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="CTA Button Text (optional)"
                      value={newAnnouncement.ctaText}
                      onChange={(e) => setNewAnnouncement(a => ({ ...a, ctaText: e.target.value }))}
                      className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm text-foreground font-display focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="CTA Link URL (optional)"
                      value={newAnnouncement.ctaLink}
                      onChange={(e) => setNewAnnouncement(a => ({ ...a, ctaLink: e.target.value }))}
                      className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm text-foreground font-display focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={newAnnouncement.type}
                      onChange={(e) => setNewAnnouncement(a => ({ ...a, type: e.target.value as any }))}
                      className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm text-foreground font-display focus:outline-none focus:border-primary"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="event">Event</option>
                      <option value="campaign">Campaign</option>
                    </select>
                    <Button
                      onClick={() => createAnnouncement.mutate({
                        title: newAnnouncement.title,
                        content: newAnnouncement.content,
                        type: newAnnouncement.type as any,
                        isActive: true,
                        ctaText: newAnnouncement.ctaText || undefined,
                        ctaLink: newAnnouncement.ctaLink || undefined,
                      })}
                      disabled={!newAnnouncement.title || !newAnnouncement.content || createAnnouncement.isPending}
                      className="bg-primary text-primary-foreground font-display"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {createAnnouncement.isPending ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </div>
              </div>
              {/* List */}
              <div className="space-y-3">
                {announcements?.map((ann: any) => (
                  <div key={ann.id} className="card-nw p-4 flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-bold text-sm text-foreground">{ann.title}</span>
                        <Badge className={`font-display text-xs ${ann.type === "event" ? "bg-secondary/20 text-secondary border-secondary/40" : "bg-muted text-muted-foreground border-border"}`}>
                          {ann.type}
                        </Badge>
                        {ann.isActive && <Badge className="bg-green-500/20 text-green-400 border-green-500/40 font-display text-xs">Active</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{ann.content}</p>
                      {ann.ctaText && ann.ctaLink && (
                        <a href={ann.ctaLink} target="_blank" rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs font-display font-bold text-primary border border-primary/40 rounded px-2 py-1 hover:bg-primary/10 transition-colors">
                          {ann.ctaText} →
                        </a>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/40 text-red-400 h-7 w-7 p-0 flex-shrink-0"
                      onClick={() => deleteAnnouncementRealMut.mutate({ id: ann.id })}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {(!announcements || announcements.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">No announcements yet</div>
                )}
              </div>
            </div>
          )}

          {/* Campaigns */}
          {activeTab === "campaigns" && (
            <div>
              <h1 className="font-display font-black text-2xl text-gradient-red mb-6">Campaign Rules</h1>
              <div className="space-y-4">
                <div className="card-nw p-5">
                  <h3 className="font-display font-bold text-base text-foreground mb-3">Active Campaign Rules</h3>
                  <div className="space-y-3">
                    {[
                      { rule: "Daily Check-in Bonus", value: "+25 XP", status: "Active" },
                      { rule: "Streak Milestone (7 days)", value: "+100 XP + Badge", status: "Active" },
                      { rule: "Streak Milestone (30 days)", value: "+500 XP + Badge", status: "Active" },
                      { rule: "First Lesson Completed", value: "+50 XP + Badge", status: "Active" },
                      { rule: "First Quiz Passed", value: "+75 XP", status: "Active" },
                      { rule: "Referral Bonus", value: "+100 XP", status: "Active" },
                      { rule: "Perfect Quiz Score", value: "+50 Bonus XP", status: "Active" },
                      { rule: "Level Up Bonus", value: "+25 XP per level", status: "Active" },
                    ].map((rule) => (
                      <div key={rule.rule} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border">
                        <div>
                          <div className="font-display font-semibold text-sm text-foreground">{rule.rule}</div>
                          <div className="text-xs text-secondary font-display">{rule.value}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/40 font-display text-xs">{rule.status}</Badge>
                          <Button size="sm" variant="outline" className="h-7 border-border font-display text-xs" onClick={() => toast.info("Campaign editor coming soon!")}>
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-nw p-5">
                  <h3 className="font-display font-bold text-base text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Compliance Notes
                  </h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• All XP, badges, and ranks are educational engagement rewards only</p>
                    <p>• No guaranteed token conversion or financial return is promised</p>
                    <p>• Campaign rewards are subject to change without notice</p>
                    <p>• Users are informed via disclaimer page of non-financial nature of rewards</p>
                    <p>• All content is educational and does not constitute financial advice</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Tab */}
          {activeTab === "feedback" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <MessageSquarePlus className="w-5 h-5 text-primary" />
                  Beta Feedback
                </h2>
                <div className="flex items-center gap-2">
                  <select
                    value={feedbackStatus}
                    onChange={(e) => { setFeedbackStatus(e.target.value as typeof feedbackStatus); setFeedbackPage(1); }}
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground font-display focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="all">All</option>
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                  {(feedbackSummary?.totalNew ?? 0) > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Mark all ${feedbackSummary?.totalNew} new feedback item${feedbackSummary?.totalNew !== 1 ? 's' : ''} as Reviewed? This cannot be undone.`)) {
                          markAllReviewedMut.mutate();
                        }
                      }}
                      disabled={markAllReviewedMut.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors text-xs font-display font-semibold disabled:opacity-50"
                    >
                      {markAllReviewedMut.isPending ? (
                        <><div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" /> Marking...</>
                      ) : (
                        <>✓ Mark all as Reviewed ({feedbackSummary?.totalNew})</>
                      )}
                    </button>
                  )}
                  <button onClick={() => refetchFeedback()} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {!feedbackData ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : feedbackData.rows.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquarePlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-display">No feedback yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbackData.rows.map((fb) => {
                    const statusColors: Record<string, string> = {
                      new: "bg-primary/20 text-primary border-primary/40",
                      reviewed: "bg-blue-500/20 text-blue-400 border-blue-500/40",
                      resolved: "bg-green-500/20 text-green-400 border-green-500/40",
                      dismissed: "bg-muted text-muted-foreground border-border",
                    };
                    const issueLabels: Record<string, string> = {
                      bug: "🐛 Bug",
                      suggestion: "💡 Suggestion",
                      confusing_text: "📝 Confusing Text",
                      mobile_issue: "📱 Mobile Issue",
                      game_issue: "🎮 Game Issue",
                    };
                    return (
                      <div key={fb.id} className="card-nw p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              {issueLabels[fb.issueType] ?? fb.issueType}
                            </span>
                            {fb.pageOrSection && (
                              <span className="font-display text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {fb.pageOrSection}
                              </span>
                            )}
                            <span className={`font-display text-xs font-bold px-2 py-0.5 rounded border ${statusColors[fb.status] ?? statusColors.new}`}>
                              {fb.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {(["new", "reviewed", "resolved", "dismissed"] as const).map((s) => (
                              <button
                                key={s}
                                disabled={fb.status === s || updateFeedbackStatus.isPending}
                                onClick={() => updateFeedbackStatus.mutate({ id: fb.id, status: s })}
                                title={`Mark as ${s}`}
                                className={`p-1.5 rounded text-xs transition-colors ${
                                  fb.status === s
                                    ? "bg-primary/20 text-primary cursor-default"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {s === "new" && <Clock className="w-3.5 h-3.5" />}
                                {s === "reviewed" && <Eye className="w-3.5 h-3.5" />}
                                {s === "resolved" && <CheckCheck className="w-3.5 h-3.5" />}
                                {s === "dismissed" && <Ban className="w-3.5 h-3.5" />}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{fb.message}</p>
                        {fb.screenshotNote && (
                          <p className="text-xs text-muted-foreground italic">Note: {fb.screenshotNote}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-display font-semibold">{fb.userName ?? "User #" + fb.userId}</span>
                          {fb.deviceType && <span>{fb.deviceType}</span>}
                          {fb.browser && <span>{fb.browser}</span>}
                          <span>{new Date(fb.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {feedbackData && feedbackData.total > feedbackData.pageSize && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground font-display">
                    Showing {((feedbackPage - 1) * feedbackData.pageSize) + 1}–{Math.min(feedbackPage * feedbackData.pageSize, feedbackData.total)} of {feedbackData.total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={feedbackPage <= 1}
                      onClick={() => setFeedbackPage(p => p - 1)}
                      className="px-3 py-1.5 rounded border border-border text-sm font-display hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      disabled={feedbackPage * feedbackData.pageSize >= feedbackData.total}
                      onClick={() => setFeedbackPage(p => p + 1)}
                      className="px-3 py-1.5 rounded border border-border text-sm font-display hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
