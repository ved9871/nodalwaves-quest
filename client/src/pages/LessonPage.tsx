import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, useParams } from "wouter";
import { getLoginUrl } from "@/const";
import { ArrowLeft, Zap, CheckCircle2, BookOpen, ChevronRight, Play, Lightbulb } from "lucide-react";
import { toast } from "sonner";

function XpCelebration({ xp, onClose }: { xp: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="card-nw p-8 text-center max-w-sm w-full mx-4 border-glow-gold animate-level-up">
        <div className="text-5xl mb-4">⚡</div>
        <div className="font-display font-black text-3xl text-gradient-gold mb-2">Lesson Complete!</div>
        <div className="font-display font-bold text-5xl text-foreground mb-2">+{xp} XP</div>
        <p className="text-muted-foreground text-sm mb-6">Great work! Keep learning to unlock more zones.</p>
        <Button onClick={onClose} className="btn-gold-glow bg-secondary text-secondary-foreground font-display font-bold w-full">
          Continue
        </Button>
      </div>
    </div>
  );
}

// Static lesson content map for MVP
// Each topic has sections (paragraphs) + keyTakeaways (3 bullet points)
const LESSON_CONTENT: Record<string, {
  sections: { title: string; body: string }[];
  keyTakeaways: string[];
}> = {
  nws: {
    sections: [
      { title: "What is $NODAL?", body: "$NODAL is the native utility token of the NodalWaves ecosystem. It is designed to power participation, staking, node operations, and community governance within the NodalWaves network." },
      { title: "Nodal Token Utility", body: "$NODAL tokens are used for: participating in staking pools, acquiring and operating nodes (Lite Node and Founder Node), accessing the Node Vault, and participating in community governance decisions." },
      { title: "Token Economics", body: "The Nodal Token supply is structured to support long-term ecosystem sustainability. Token distribution is designed to align incentives between node operators, stakers, and community participants. Always refer to official NodalWaves documentation for the latest tokenomics details." },
      { title: "How to Acquire $NODAL", body: "$NODAL can be acquired through supported exchanges, community participation programs, and ecosystem activities. Always use official and verified channels. Never share your wallet private key with anyone." },
    ],
    keyTakeaways: [
      "$NODAL is a utility token — it powers real ecosystem activities, not just speculation.",
      "$NODAL is used for staking, node licenses, vault participation, and future governance.",
      "Always use official channels to acquire $NODAL. Do your own research before any financial decision.",
    ],
  },
  staking: {
    sections: [
      { title: "What is Staking?", body: "Staking is the process of locking up tokens in a protocol to support network operations. In return, stakers may receive rewards based on the protocol's design and rules. Think of it as contributing your tokens to help the network run, while earning a share of ecosystem activity." },
      { title: "General Staking in NodalWaves", body: "NodalWaves General Staking allows $NODAL holders to participate in the ecosystem by committing their tokens for a set period. Staking supports the ecosystem treasury and long-term network growth. The rewards you receive depend on the protocol rules and ecosystem performance — they are not fixed or guaranteed." },
      { title: "Staking Risks", body: "Staking involves real risks. Your tokens are locked for a period, meaning you cannot sell or move them freely. Market prices can change while your tokens are locked. Smart contract bugs, though rare, are also a risk in any DeFi protocol. Always understand the lock-up terms before staking." },
      { title: "Responsible Staking", body: "Only stake amounts you are comfortable having locked for the specified period. Research the protocol thoroughly using official NodalWaves documentation. Staking rewards depend on ecosystem performance and protocol rules — they are not a guaranteed income source." },
    ],
    keyTakeaways: [
      "Staking means locking your $NODAL to support the network — rewards depend on protocol rules, not fixed rates.",
      "Your tokens are locked during the staking period — plan your finances accordingly.",
      "Staking carries risks including lock-up periods, market volatility, and smart contract risk.",
    ],
  },
  lite_node: {
    sections: [
      { title: "What is a Lite Node?", body: "A Lite Node is the entry-level way to participate in the NodalWaves network infrastructure. It is designed for community members who want to contribute to the ecosystem without the larger commitment of a Founder Node. Think of it as your first step into active network participation." },
      { title: "What Does a Lite Node Do?", body: "Lite Nodes support the NodalWaves network by helping with data validation and network operations. By running a Lite Node, you become part of the infrastructure that keeps the ecosystem working. Node operators who meet the requirements may receive ecosystem rewards aligned with treasury performance." },
      { title: "Requirements and Responsibilities", body: "To operate a Lite Node, you need to hold a minimum amount of $NODAL tokens as specified in the official documentation, maintain your node's uptime, and follow the technical setup guidelines. Running a node is a responsibility — the network depends on reliable operators." },
      { title: "Important Considerations", body: "Lite Node participation is not a guaranteed income source. Rewards depend on ecosystem performance, protocol rules, and your node's activity. Before purchasing a Lite Node license, read the official NodalWaves documentation carefully and make your own informed decision." },
      { title: "Risk Disclosure", body: "Node participation involves financial risk. The value of $NODAL can go up or down. Node rewards are not guaranteed. Only participate with funds you can afford to have committed long-term. NodalQuest is an educational platform — this is not financial advice." },
    ],
    keyTakeaways: [
      "A Lite Node is an entry-level way to participate in NodalWaves network infrastructure.",
      "Node rewards depend on ecosystem performance and protocol rules — they are not guaranteed.",
      "Always read official documentation and understand the risks before purchasing any node license.",
    ],
  },
  founder_node: {
    sections: [
      { title: "What is a Founder Node?", body: "A Founder Node is the premium tier of node participation in the NodalWaves ecosystem. Founder Node operators are considered core infrastructure providers who take on a greater role in supporting the network. This is a deeper commitment compared to a Lite Node." },
      { title: "The Role of Founder Nodes", body: "Founder Nodes contribute to ecosystem stability, participate in governance decisions, and support the broader network infrastructure. Because of their larger role, Founder Node operators may receive enhanced ecosystem rewards — but these rewards depend on protocol rules and ecosystem health, not fixed rates." },
      { title: "Treasury-Aligned Model", body: "Node purchases in NodalWaves are designed to support the ecosystem treasury and long-term growth. This is a community-first model — node activity is meant to benefit the broader ecosystem, not just individual operators. The treasury funds development, community programs, and ecosystem expansion." },
      { title: "What You Need to Know Before Joining", body: "Becoming a Founder Node operator requires a significant $NODAL commitment. You should understand the technical requirements, financial commitment, and lock-up conditions. Always consult official NodalWaves documentation and make your decision independently." },
      { title: "Risk and Responsibility", body: "Founder Node participation carries financial risk. $NODAL value can change. Rewards are not guaranteed. This is not a passive income product. You are making a long-term ecosystem commitment. Only participate with funds you can afford to have committed, and always do your own research." },
    ],
    keyTakeaways: [
      "Founder Nodes are the premium tier — they require a larger $NODAL commitment and carry greater responsibilities.",
      "Node purchases support the ecosystem treasury — this is a community-first, not profit-first, model.",
      "Rewards depend on ecosystem performance and protocol rules — they are not guaranteed fixed returns.",
    ],
  },
  node_vault: {
    sections: [
      { title: "What is Node Vault?", body: "The Node Vault — also called the Node-Linked Vault — is a specialized mechanism within the NodalWaves ecosystem that connects your staking activity to your node operations. It is designed to create a synergy between the two, potentially amplifying your ecosystem participation." },
      { title: "How Node Vault Works", body: "When you participate in the Node Vault, your staked $NODAL and your node license work together within the vault mechanism. This alignment is designed to support the ecosystem treasury while giving active participants a way to deepen their involvement. The specific rules and reward structures are defined by the NodalWaves protocol." },
      { title: "Who is Node Vault For?", body: "Node Vault is designed for participants who are already operating a node and want to combine their staking activity with their node participation. It is an advanced feature — not a starting point for beginners. You should first understand $NODAL, staking, and nodes before exploring the vault." },
      { title: "Participation Conditions", body: "Participating in the Node Vault requires understanding the specific rules, lock-up conditions, and exit mechanisms. Always read the official documentation before committing any funds. Conditions may change as the protocol evolves." },
      { title: "Risk Disclosure", body: "Vault participation involves crypto-related risks including smart contract risk, market volatility, and liquidity risk. No guaranteed returns are promised. The vault is not a savings account. Participate only with funds you can afford to have locked, and always make independent financial decisions." },
    ],
    keyTakeaways: [
      "Node Vault connects staking and node operations — it is designed for active, committed ecosystem participants.",
      "Vault rewards depend on protocol rules and ecosystem performance — no guaranteed returns.",
      "This is an advanced feature — understand $NODAL, staking, and nodes first before exploring the vault.",
    ],
  },
  treasury: {
    sections: [
      { title: "What is the NodalWaves Treasury?", body: "The NodalWaves Treasury is the ecosystem's financial reserve. It is funded through node sales, ecosystem activities, and protocol fees. The treasury is designed to ensure the long-term sustainability and growth of the NodalWaves protocol — not to enrich any single person or team." },
      { title: "What Does the Treasury Fund?", body: "The treasury supports several key areas: ongoing protocol development and upgrades, security audits to keep the ecosystem safe, community programs and educational initiatives, marketing and ecosystem expansion, and emergency reserves for unexpected situations." },
      { title: "Community-First Governance", body: "NodalWaves is built as a community-first ecosystem. The treasury is designed to be governed in a way that benefits all participants. As the ecosystem matures, governance mechanisms will guide how treasury funds are allocated. This means the community has a voice in the ecosystem's direction." },
      { title: "Why the Treasury Matters to You", body: "When you participate in NodalWaves — whether through staking, nodes, or community activities — a portion of that activity contributes to the treasury. A healthy treasury means the ecosystem can keep growing, rewarding participants, and building new features over time." },
      { title: "Transparency and Verification", body: "Always verify treasury-related information from official NodalWaves channels. Do not rely on unofficial sources, social media rumors, or third-party claims about treasury performance. Make any financial decisions based on your own research and verified official data." },
    ],
    keyTakeaways: [
      "The NodalWaves Treasury is the ecosystem's financial reserve — it funds development, community, and long-term growth.",
      "Treasury management is designed to benefit all participants, not a single team or entity.",
      "Always verify treasury information from official NodalWaves sources before making any financial decisions.",
    ],
  },
  wallet_safety: {
    sections: [
      { title: "Why Wallet Safety Matters", body: "Your crypto wallet is your identity and your vault in Web3. Unlike a bank account, there is no customer support to call if you lose access. If your wallet is compromised or your seed phrase is stolen, your assets are gone permanently. This makes wallet safety one of the most important skills in Web3." },
      { title: "Your Seed Phrase is Everything", body: "Your seed phrase — also called a recovery phrase or mnemonic — is a set of 12 or 24 words that gives complete access to your wallet. Anyone who has your seed phrase controls your wallet entirely. Never share it with anyone, ever — not even NodalWaves team members, support agents, or people claiming to help you." },
      { title: "How to Store Your Seed Phrase Safely", body: "Write your seed phrase on paper and store it in a secure physical location — like a safe or a locked drawer. Never take a photo of it. Never type it into any website or app unless you are restoring your wallet on a trusted device. Never store it in cloud storage, email, or messaging apps." },
      { title: "Common Wallet Threats", body: "Watch out for phishing websites that look identical to real platforms but steal your credentials. Be careful of fake wallet apps on app stores. Never connect your wallet to unknown websites. Be suspicious of anyone who contacts you offering help with your wallet — this is almost always a scam." },
      { title: "Best Practices for Daily Use", body: "Use a hardware wallet for large holdings — it keeps your private keys offline. Use separate wallets for different purposes: one for daily use, one for savings. Always double-check URLs before connecting your wallet. Enable all available security features. If something feels wrong, stop and verify before proceeding." },
    ],
    keyTakeaways: [
      "Your seed phrase is the master key to your wallet — never share it with anyone, under any circumstances.",
      "Write your seed phrase on paper and store it securely offline — never digitally.",
      "Always verify URLs and be suspicious of anyone offering unsolicited help with your wallet.",
    ],
  },
  scam_protection: {
    sections: [
      { title: "The Web3 Scam Landscape", body: "The Web3 space has many scams targeting both newcomers and experienced users. Scammers are creative and constantly evolving their tactics. The best defense is education — understanding how scams work makes you much harder to deceive. This lesson covers the most common threats you will encounter." },
      { title: "Common Scam Types", body: "Rug pulls happen when a project raises funds and then suddenly disappears. Phishing attacks use fake websites or emails that look identical to real platforms to steal your credentials. Fake airdrops ask you to connect your wallet or enter your seed phrase to claim tokens that do not exist. Impersonation scams involve fake team members or support agents asking for funds or access." },
      { title: "Red Flags to Watch For", body: "Be very cautious if you see: guaranteed returns or profits with no risk, pressure to act quickly before an opportunity disappears, requests for your seed phrase or private key, unverified team members with no public identity, no clear documentation or whitepaper, or promises of passive income with no explanation of how it works." },
      { title: "How to Verify Before You Trust", body: "Always go to official websites directly — never click links from social media, DMs, or emails. Check the URL carefully for typos or extra characters. Verify announcements on multiple official channels before acting. If a community member or support agent asks for your seed phrase, it is always a scam — report and block them immediately." },
      { title: "If You Think You Have Been Scammed", body: "If you believe your wallet has been compromised, move your remaining assets to a new wallet immediately. Do not send more funds trying to recover what was lost — this is a common second scam. Report the incident to the official NodalWaves community channels so others can be warned. Remember: in Web3, there is no undo button." },
    ],
    keyTakeaways: [
      "No legitimate project will ever ask for your seed phrase — this is always a scam.",
      "Guaranteed returns, pressure tactics, and unverified teams are major red flags.",
      "Always verify information from official sources before connecting your wallet or sending funds.",
    ],
  },
};

export default function LessonPage() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ lessonId: string }>();
  const lessonId = parseInt(params.lessonId ?? "1");

  const [currentSection, setCurrentSection] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showTakeaways, setShowTakeaways] = useState(false);

  const utils = trpc.useUtils();
  const { data: lesson, isLoading } = trpc.lessons.get.useQuery({ lessonId }, { enabled: !!lessonId });
  const { data: quizzes } = trpc.quizzes.byZone.useQuery(
    { zoneId: lesson?.zoneId ?? 0 },
    { enabled: !!lesson?.zoneId }
  );
  const { data: zones } = trpc.zones.list.useQuery();
  const zone = zones?.find(z => z.id === lesson?.zoneId);

  const completeMutation = trpc.lessons.complete.useMutation({
    onSuccess: (data) => {
      if (!data.alreadyCompleted) {
        setEarnedXp(data.xpEarned);
        setShowCelebration(true);
        if (data.newBadges && data.newBadges.length > 0) {
          data.newBadges.forEach((b: { name: string }) => toast.success(`🏆 Badge Unlocked: ${b.name}!`));
        }
      }
      setCompleted(true);
      utils.lessons.userProgress.invalidate();
      utils.profile.xpInfo.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  if (!isAuthenticated) { window.location.href = "/login"; return null; }
  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );
  if (!lesson) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Lesson not found</p>
        <Button onClick={() => navigate("/quests")} className="mt-4 bg-primary text-primary-foreground font-display">Back to Quests</Button>
      </div>
    </div>
  );

  const content = LESSON_CONTENT[lesson.topic] ?? {
    sections: [
      { title: lesson.title, body: lesson.content || "Content for this lesson is being prepared. Check back soon!" }
    ],
    keyTakeaways: [],
  };

  const sections = content.sections;
  const takeaways = content.keyTakeaways ?? [];
  const isLastSection = currentSection === sections.length - 1;
  const progress = Math.round(((currentSection + 1) / sections.length) * 100);
  const firstQuiz = quizzes?.[0];

  const handleNext = () => {
    if (isLastSection) {
      if (!completed) completeMutation.mutate({ lessonId });
      else setShowTakeaways(true);
    } else {
      setCurrentSection(s => s + 1);
    }
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
    setShowTakeaways(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showCelebration && <XpCelebration xp={earnedXp} onClose={handleCelebrationClose} />}

      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <button onClick={() => navigate(`/zone/${lesson.zoneId}`)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="font-display font-bold text-sm text-foreground truncate">{lesson.title}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-48">
                <div className="h-full xp-bar-fill rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-muted-foreground font-display">{currentSection + 1}/{sections.length}</span>
            </div>
          </div>
          <Badge className="bg-secondary/20 text-secondary border-secondary/40 font-display text-xs">
            +{lesson.xpReward} XP
          </Badge>
        </div>
      </nav>

      <div className="container py-8 max-w-2xl mx-auto space-y-4">

        {/* Key Takeaways + What's Next panel — shown after completion */}
        {showTakeaways && takeaways.length > 0 && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Key Takeaways */}
            <div className="card-nw p-6 border-glow-gold">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-secondary" />
                <span className="font-display font-bold text-base text-secondary">Key Takeaways</span>
              </div>
              <ul className="space-y-3">
                {takeaways.map((t, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="font-display font-bold text-xs text-secondary">{i + 1}</span>
                    </span>
                    <span className="text-sm text-foreground leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What's Next prompt */}
            <div className="card-nw p-6 border border-primary/40 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <ChevronRight className="w-5 h-5 text-primary" />
                <span className="font-display font-bold text-base text-foreground">What's Next?</span>
              </div>
              {firstQuiz ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Great job! Now take the{zone ? ` ${zone.name}` : " Zone"} Quiz to earn XP and test your knowledge.
                  </p>
                  <Button
                    onClick={() => navigate(`/quiz/${firstQuiz.id}`)}
                    className="w-full btn-gold-glow bg-secondary text-secondary-foreground font-display font-bold flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Take Quiz (+{firstQuiz.xpReward} XP)
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Great job! Head back to the zone to continue your learning journey.
                  </p>
                  <Button
                    onClick={() => navigate(`/zone/${lesson.zoneId}`)}
                    className="w-full bg-primary text-primary-foreground font-display font-bold"
                  >
                    Back to Zone
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Main lesson card */}
        {!showTakeaways && (
          <div className="card-nw p-8 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground font-display uppercase tracking-widest">
                Section {currentSection + 1} of {sections.length}
              </span>
            </div>

            <h2 className="font-display font-black text-2xl text-gradient-red mb-6">
              {sections[currentSection]?.title}
            </h2>

            <div className="prose prose-invert max-w-none">
              <p className="text-foreground leading-relaxed text-base">
                {sections[currentSection]?.body}
              </p>
            </div>

            {/* Section dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {sections.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSection(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentSection ? "bg-primary w-4" : i < currentSection ? "bg-green-400" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              {currentSection > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentSection(s => s - 1)}
                  className="flex-1 border-border font-display"
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={completeMutation.isPending}
                className={`flex-1 font-display font-bold ${
                  isLastSection ? "btn-gold-glow bg-secondary text-secondary-foreground" : "btn-glow bg-primary text-primary-foreground"
                }`}
              >
                {completeMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Completing...
                  </span>
                ) : isLastSection ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {completed ? "See Key Takeaways" : `Complete (+${lesson.xpReward} XP)`}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Next Section
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-3 rounded-lg border border-border/50 bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Educational content only. Not financial advice. Always do your own research before any Web3 participation.
          </p>
        </div>
      </div>
    </div>
  );
}
