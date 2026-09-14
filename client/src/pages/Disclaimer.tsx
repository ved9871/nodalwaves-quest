import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, AlertTriangle, Info, BookOpen, Scale } from "lucide-react";

export default function DisclaimerPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <button onClick={() => navigate(-1 as any)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-base text-gradient-red">Risk & Disclaimer</span>
          </div>
        </div>
      </nav>

      <div className="container py-10 max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display font-black text-3xl text-gradient-red mb-2">Risk & Disclaimer</h1>
          <p className="text-muted-foreground text-sm">Please read carefully before participating in NodalWaves Quest.</p>
          <p className="text-xs text-muted-foreground mt-1">Last updated: April 2026</p>
        </div>

        {/* Platform Nature */}
        <div className="card-nw p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="font-display font-bold text-lg text-foreground">What is NodalWaves Quest?</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              NodalWaves Quest is a <strong className="text-foreground">learning and community participation platform</strong> designed
              to educate users about the NodalWaves ecosystem, Web3 concepts, blockchain technology, staking, nodes, wallet safety,
              and decentralized finance fundamentals.
            </p>
            <p>
              The platform operates as an educational game with progression mechanics including XP points, badges, levels, leaderboard
              rankings, and quest completions. These elements are designed to make learning engaging and rewarding in a non-financial sense.
            </p>
          </div>
        </div>

        {/* Non-Financial Nature */}
        <div className="card-nw p-6 border-glow-gold">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 border border-secondary/40 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="font-display font-bold text-lg text-foreground">Non-Financial Rewards</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">XP (Experience Points), badges, ranks, levels, leaderboard positions, and quest
              completion records do NOT represent:</strong>
            </p>
            <ul className="space-y-2 ml-4">
              {[
                "Guaranteed token rewards or Nodal Token allocations",
                "Financial return, investment income, or profit",
                "A promise of future monetary value or conversion",
                "Fixed APY, staking yield, or passive income",
                "Any form of financial instrument or security",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 p-3 rounded-lg bg-secondary/10 border border-secondary/30 text-foreground text-xs font-display">
              ⚠️ NodalWaves Quest is NOT a "tap to earn" app. It is NOT a guaranteed income platform. It is a Web3 education and community engagement tool.
            </p>
          </div>
        </div>

        {/* Crypto Risk */}
        <div className="card-nw p-6 border-glow-red">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display font-bold text-lg text-foreground">Cryptocurrency & Web3 Risk</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              The content provided on NodalWaves Quest is for <strong className="text-foreground">educational purposes only</strong>.
              Any information about $NODAL tokens, staking, nodes, vaults, or treasury mechanisms is provided to help users understand
              the NodalWaves ecosystem — not as financial advice.
            </p>
            <p>
              Participating in any Web3 product, including purchasing tokens, running nodes, or staking, involves significant risks:
            </p>
            <ul className="space-y-2 ml-4">
              {[
                "Cryptocurrency values are highly volatile and can decrease to zero",
                "Smart contract risks, including bugs and exploits, may result in loss of funds",
                "Regulatory changes may affect the legality or operation of Web3 products",
                "Liquidity risks may prevent you from selling or withdrawing assets",
                "Past performance of any ecosystem does not guarantee future results",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Educational Content */}
        <div className="card-nw p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="font-display font-bold text-lg text-foreground">Educational Content Disclaimer</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              All lessons, quizzes, and educational content within NodalWaves Quest are created for informational and educational
              purposes only. The content reflects the NodalWaves ecosystem as understood at the time of writing and may not reflect
              the most current state of the protocol.
            </p>
            <p>
              NodalWaves Quest does not provide financial advice, investment recommendations, or legal guidance. Users should conduct
              their own research (DYOR) and consult qualified professionals before making any financial decisions.
            </p>
          </div>
        </div>

        {/* User Responsibility */}
        <div className="card-nw p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="font-display font-bold text-lg text-foreground">User Responsibility</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>By using NodalWaves Quest, you acknowledge and agree that:</p>
            <ul className="space-y-2 ml-4">
              {[
                "You are using this platform for educational and community engagement purposes only",
                "You understand that XP, badges, and ranks have no guaranteed monetary value",
                "You will make independent decisions about any Web3 participation after your own research",
                "You accept all risks associated with cryptocurrency and Web3 participation",
                "NodalWaves and its team are not liable for any financial losses from ecosystem participation",
                "Campaign rewards, if any, are subject to change and are not guaranteed",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Node Purchases */}
        <div className="card-nw p-6">
          <h2 className="font-display font-bold text-lg text-foreground mb-3">About Node Purchases & Ecosystem Activity</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Information about Lite Nodes, Founder Nodes, Node Vaults, and other NodalWaves ecosystem products is provided for
              educational purposes only. Any node purchases or ecosystem participation:
            </p>
            <ul className="space-y-2 ml-4">
              {[
                "Are designed to support the ecosystem treasury and long-term growth, not as guaranteed income sources",
                "Involve $NODAL-based mechanics and treasury-aligned structures",
                "Should be evaluated independently based on publicly available documentation",
                "Do not constitute an investment contract or promise of financial return",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Summary box */}
        <div className="p-5 rounded-2xl bg-muted/20 border border-border text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Summary:</strong> NodalWaves Quest is a Web3 education platform. Learn, grow, compete,
            and participate in the community. Always do your own research before making any financial decisions. Crypto involves risk.
            Your learning journey here is the reward.
          </p>
        </div>

        <div className="flex justify-center pb-8">
          <Button onClick={() => navigate(-1 as any)} className="bg-primary text-primary-foreground font-display font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
