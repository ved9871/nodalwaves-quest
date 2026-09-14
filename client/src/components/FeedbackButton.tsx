/**
 * FeedbackButton — floating "Report Bug / Send Feedback" button for logged-in users.
 * Appears as a small button on the dashboard. Opens a modal with a simple form.
 */
import { useState } from "react";
import { MessageSquarePlus, X, Send, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const ISSUE_TYPES = [
  { value: "bug", label: "🐛 Bug Report" },
  { value: "suggestion", label: "💡 Suggestion" },
  { value: "confusing_text", label: "📝 Confusing Text" },
  { value: "mobile_issue", label: "📱 Mobile Issue" },
  { value: "game_issue", label: "🎮 Game Issue" },
] as const;

type IssueType = (typeof ISSUE_TYPES)[number]["value"];

const PAGE_OPTIONS = [
  "Dashboard", "Zone Map", "Lesson Page", "Quiz Page",
  "Mini-Games", "Leaderboard", "Profile", "Daily Check-In",
  "Reward Chest", "Challenge Page", "Other",
];

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [issueType, setIssueType] = useState<IssueType>("bug");
  const [pageOrSection, setPageOrSection] = useState("");
  const [message, setMessage] = useState("");
  const [screenshotNote, setScreenshotNote] = useState("");
  const [deviceType, setDeviceType] = useState(() => {
    if (typeof window === "undefined") return "";
    const ua = navigator.userAgent;
    if (/Mobi|Android/i.test(ua)) return "Mobile";
    if (/Tablet|iPad/i.test(ua)) return "Tablet";
    return "Desktop";
  });
  const [browser, setBrowser] = useState(() => {
    if (typeof window === "undefined") return "";
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    return "Other";
  });

  const submit = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      toast.success("Feedback submitted!", { description: "Thank you for helping improve NodeWaves Quest." });
      setOpen(false);
      setMessage("");
      setScreenshotNote("");
      setPageOrSection("");
    },
    onError: (err) => {
      toast.error("Failed to submit", { description: err.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      toast.error("Message too short", { description: "Please describe the issue in at least 5 characters." });
      return;
    }
    submit.mutate({
      issueType,
      pageOrSection: pageOrSection || undefined,
      message: message.trim(),
      screenshotNote: screenshotNote.trim() || undefined,
      deviceType: deviceType || undefined,
      browser: browser || undefined,
    });
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 font-display text-sm font-semibold"
        aria-label="Report Bug or Send Feedback"
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/80">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-base text-foreground">Report Bug / Send Feedback</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Issue type */}
              <div>
                <label className="block text-xs font-display font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Issue Type <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as IssueType)}
                    className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground font-display pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {ISSUE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Page or section */}
              <div>
                <label className="block text-xs font-display font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Page or Section
                </label>
                <div className="relative">
                  <select
                    value={pageOrSection}
                    onChange={(e) => setPageOrSection(e.target.value)}
                    className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground font-display pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select a page (optional)</option>
                    {PAGE_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-display font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Message <span className="text-primary">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the issue or suggestion clearly..."
                  rows={4}
                  maxLength={2000}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground font-display resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{message.length}/2000</p>
              </div>

              {/* Screenshot note */}
              <div>
                <label className="block text-xs font-display font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Screenshot URL or Note (optional)
                </label>
                <input
                  type="text"
                  value={screenshotNote}
                  onChange={(e) => setScreenshotNote(e.target.value)}
                  placeholder="Paste a screenshot URL or describe what you see"
                  maxLength={500}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground font-display focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Device + Browser row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-display font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    Device Type
                  </label>
                  <div className="relative">
                    <select
                      value={deviceType}
                      onChange={(e) => setDeviceType(e.target.value)}
                      className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground font-display pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="Desktop">Desktop</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Tablet">Tablet</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-display font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    Browser
                  </label>
                  <div className="relative">
                    <select
                      value={browser}
                      onChange={(e) => setBrowser(e.target.value)}
                      className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground font-display pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="Chrome">Chrome</option>
                      <option value="Firefox">Firefox</option>
                      <option value="Safari">Safari</option>
                      <option value="Edge">Edge</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submit.isPending || !message.trim()}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-display font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submit.isPending ? (
                  <span className="animate-spin w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submit.isPending ? "Submitting..." : "Submit Feedback"}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Your feedback helps improve NodeWaves Quest for all beta testers.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
