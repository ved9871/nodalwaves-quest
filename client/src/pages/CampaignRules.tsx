import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, XCircle, FileText, Users, Zap } from "lucide-react";

const RULES = [
  {
    id: 1,
    icon: XCircle,
    color: "#E53E3E",
    title: "No Guaranteed Income",
    content:
      "Participation in NodalWaves Quest does not guarantee any income, financial return, or monetary reward of any kind. NodalWaves Quest is an educational and community participation platform. Any reference to 'rewards' refers exclusively to in-platform XP, badges, ranks, and leaderboard recognition — not financial compensation.",
  },
  {
    id: 2,
    icon: XCircle,
    color: "#E53E3E",
    title: "No Guaranteed $NODAL or Token Reward",
    content:
      "XP points, badges, ranks, and quest completions earned on NodalWaves Quest do not represent, and cannot be converted into, $NODAL tokens or any other cryptocurrency or digital asset. No token allocation, airdrop, or on-chain reward is guaranteed to any user based on platform activity unless explicitly announced through official NodalWaves channels with published eligibility criteria.",
  },
  {
    id: 3,
    icon: CheckCircle2,
    color: "#D69E2E",
    title: "Campaign-Based Rewards Only",
    content:
      "From time to time, NodalWaves may run official campaigns that include community rewards such as event access, merchandise, recognition, or other non-financial benefits. Any such campaign will be announced through official NodalWaves channels. Participation in the platform does not automatically qualify a user for any campaign reward. Each campaign will have its own published eligibility criteria, timeline, and selection process.",
  },
  {
    id: 4,
    icon: FileText,
    color: "#3182CE",
    title: "Winners Selected Based on Published Rules",
    content:
      "Where a campaign includes a competitive or selection element, winners will be determined solely according to the published rules for that specific campaign. Published rules will specify: the eligibility period, the qualifying criteria (e.g., minimum XP, zone completions, quiz scores), the selection method (e.g., top leaderboard rank, random draw among eligible participants), and the announcement process. No verbal or informal commitments override the published rules.",
  },
  {
    id: 5,
    icon: AlertTriangle,
    color: "#E53E3E",
    title: "Fraud and Duplicate Accounts",
    content:
      "Users found to be operating multiple accounts, using automated bots, exploiting platform bugs, or engaging in any form of fraudulent activity will be permanently disqualified from all current and future campaigns. NodalWaves reserves the right to investigate suspicious activity and take action including account suspension, XP reset, and removal from leaderboards. Disqualification decisions are final.",
  },
  {
    id: 6,
    icon: Shield,
    color: "#805AD5",
    title: "Admin Decision and Eligibility Rules",
    content:
      "NodalWaves and its designated administrators retain full discretion to determine eligibility for any campaign reward. This includes the right to verify user identity, review account activity, and disqualify any participant who does not meet the published criteria or who has violated platform terms. Admin decisions regarding campaign eligibility and reward allocation are final and not subject to appeal.",
  },
  {
    id: 7,
    icon: Users,
    color: "#38A169",
    title: "Platform Purpose",
    content:
      "NodalWaves Quest is designed as a learning and community participation platform. Its primary purpose is to educate users about the NodalWaves ecosystem — including $NODAL, staking, nodes, Node Vault, treasury mechanics, wallet safety, and scam protection. The platform's XP, badge, and rank systems exist to make learning engaging, not to create financial incentives. Users should engage with the platform to learn, not to speculate.",
  },
  {
    id: 8,
    icon: Zap,
    color: "#D69E2E",
    title: "Changes to Campaign Rules",
    content:
      "NodalWaves reserves the right to modify, suspend, or cancel any campaign at any time. Changes will be communicated through official channels. Continued participation in the platform after a rule change constitutes acceptance of the updated terms. Users are encouraged to review campaign rules before each campaign period.",
  },
];

export default function CampaignRules() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-secondary" />
            <span className="font-display font-bold text-base text-gradient-red">Campaign Rules</span>
          </div>
        </div>
      </nav>

      <div className="container py-12 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-xs text-primary tracking-widest">OFFICIAL CAMPAIGN RULES</span>
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl mb-4">
            <span className="text-gradient-red">Campaign</span>{" "}
            <span className="text-foreground">Rules &amp; Eligibility</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
            NodalWaves Quest is an educational platform. These rules govern how campaign-based community
            rewards work — and what they do not include.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/30 text-sm text-primary font-display font-semibold">
            ⚠️ Rewards, if any, are subject to official campaign rules and are not guaranteed.
          </div>
        </div>

        {/* Rules */}
        <div className="space-y-4">
          {RULES.map((rule) => (
            <div key={rule.id} className="card-nw p-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${rule.color}20`, border: `1px solid ${rule.color}40` }}
                >
                  <rule.icon className="w-5 h-5" style={{ color: rule.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-display font-black text-xs text-muted-foreground">RULE {rule.id}</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground mb-2">{rule.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rule.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary box */}
        <div className="mt-10 card-nw p-6 border-glow-red">
          <h3 className="font-display font-bold text-base text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            Summary: What NodalWaves Quest Is and Is Not
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-display font-semibold text-xs text-green-400 mb-2 tracking-widest">✓ WHAT IT IS</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {[
                  "A free Web3 education platform",
                  "A gamified learning experience",
                  "An XP, badge, and rank system",
                  "A community participation platform",
                  "A place to learn about $NODAL, staking, nodes, and treasury",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-display font-semibold text-xs text-primary mb-2 tracking-widest">✗ WHAT IT IS NOT</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {[
                  "A guaranteed earning app",
                  "A token distribution mechanism",
                  "An investment product",
                  "A source of guaranteed income",
                  "A promise of $NODAL or crypto rewards",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <XCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Last updated */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            Last updated: April 2026. These rules apply to all campaigns run on the NodalWaves Quest platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/disclaimer")}
              className="border-border font-display text-xs"
            >
              <Shield className="w-3 h-3 mr-1" />
              Risk Disclaimer
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/")}
              className="bg-primary text-primary-foreground font-display text-xs"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
