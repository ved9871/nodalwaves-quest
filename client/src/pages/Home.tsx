import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";
import { MobileNav } from "@/components/MobileNav";
import {
  Coins, Lock, Cpu, Building2, Vault, Landmark, Shield, Users,
  Zap, Trophy, Star, Target, BookOpen, Award, ChevronRight, Play,
  TrendingUp, Globe, Flame, Crown, CheckCircle2, ArrowRight, Swords, Rocket,
  Map, RefreshCw, Layers, Medal, Hexagon, AlertTriangle
} from "lucide-react";
import { NWQLogo, NWQIcon } from "@/components/NWQIcon";

const ZONES = [
  { id: 1, name: "NWS Hub", desc: "Learn the NWS token fundamentals", icon: Coins, color: "#E53E3E", level: 1, locked: false },
  { id: 2, name: "Staking Vault", desc: "Master General Staking mechanics", icon: Lock, color: "#C0C7D0", level: 2, locked: false },
  { id: 3, name: "Lite Node Station", desc: "Explore Lite Node operations", icon: Cpu, color: "#38A169", level: 4, locked: true },
  { id: 4, name: "Founder Tower", desc: "Understand Founder Node roles", icon: Building2, color: "#3182CE", level: 6, locked: true },
  { id: 5, name: "Node Vault Chamber", desc: "Deep-dive into Node Vault", icon: Vault, color: "#805AD5", level: 8, locked: true },
  { id: 6, name: "Treasury Hall", desc: "Discover ecosystem treasury", icon: Landmark, color: "#DD6B20", level: 10, locked: true },
  { id: 7, name: "Security Lab", desc: "Master wallet safety & scam protection", icon: Shield, color: "#E53E3E", level: 12, locked: true },
  { id: 8, name: "Community Arena", desc: "Engage with the community", icon: Users, color: "#38B2AC", level: 15, locked: true },
  { id: 9, name: "Future Utility Zone", desc: "Preview upcoming ecosystem utilities", icon: Rocket, color: "#9F7AEA", level: 18, locked: true },
];

const FEATURES = [
  { icon: BookOpen, title: "Quest-Based Learning", desc: "Progress through structured quests covering every NodeWaves ecosystem pillar — from NWS token basics to advanced node mechanics.", color: "#E53E3E" },
  { icon: Zap, title: "XP & Level System", desc: "Earn XP for every lesson, quiz, and daily check-in. Level up through 50 ranks and unlock new zones as you grow.", color: "#C0C7D0" },
  { icon: Trophy, title: "Badge Collection", desc: "Unlock achievement badges for streaks, quiz scores, zone completions, and community participation.", color: "#38A169" },
  { icon: Swords, title: "Mini-Games", desc: "Play Node Charge tapping missions, Timed Quiz Battles, and Scam Detector challenges for bonus XP.", color: "#3182CE" },
  { icon: Crown, title: "Global Leaderboard", desc: "Compete with learners worldwide. Climb the ranks and earn community recognition as a NodeWaves expert.", color: "#805AD5" },
  { icon: Users, title: "Referral System", desc: "Invite friends and earn bonus XP when they join and complete their first quest.", color: "#38B2AC" },
];

const STATS = [
  { value: "9", label: "Learning Zones", icon: Globe },
  { value: "50+", label: "Quests & Lessons", icon: BookOpen },
  { value: "14+", label: "Badges to Earn", icon: Award },
  { value: "3", label: "Mini-Games", icon: Swords },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container flex items-center justify-between h-16">
          {/* Single logo — iconOnly on mobile, full lockup on desktop */}
          <Link href="/">
            <span className="flex items-center gap-2 select-none">
              {/* Icon always visible */}
              <NWQIcon size={32} />
              {/* Text hidden on small screens */}
              <span className="hidden sm:block font-display font-bold text-sm leading-none whitespace-nowrap">
                <span style={{ color: "#ffffff" }}>Node</span>
                <span style={{ color: "#C81038" }}>Waves</span>
                <span style={{ color: "#C6CDD6" }}> Quest</span>
              </span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#zones" className="hover:text-foreground transition-colors">Zones</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#leaderboard" className="hover:text-foreground transition-colors">Leaderboard</a>
            <a href="/challenge" className="hover:text-secondary transition-colors font-semibold text-secondary/80">7-Day Challenge</a>
            <a href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</a>
            <a href="/campaign-rules" className="hover:text-foreground transition-colors">Campaign Rules</a>
          </div>
          <div className="flex items-center gap-3">
            {/* Desktop CTA buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Button onClick={() => navigate("/dashboard")} className="btn-glow bg-primary text-primary-foreground font-display text-sm">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/login")} className="text-sm text-muted-foreground hover:text-foreground">
                    Login
                  </Button>
                  <Button onClick={handleStart} className="btn-glow bg-primary text-primary-foreground font-display text-sm">
                    Start Free Quest
                  </Button>
                </>
              )}
            </div>
            {/* Mobile hamburger */}
            <MobileNav activePage="home" />
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.55 0.22 25), transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.82 0.012 250), transparent)" }} />

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/40 font-display text-xs tracking-widest px-4 py-1">
              🎮 BETA LAUNCH — FREE TO PLAY
            </Badge>

            <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl leading-none mb-6 animate-fade-in-up">
              <span className="text-gradient-red">Play the Quest.</span>
              <br />
              <span className="text-foreground">Learn the Ecosystem.</span>
              <br />
              <span className="text-gradient-gold">Rise Through the Ranks.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in-up delay-200 leading-relaxed">
              NodeWaves Quest is a gamified Web3 education platform. Complete quests, earn XP,
              unlock badges, and master the NodeWaves ecosystem through interactive learning.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
              <Button
                onClick={handleStart}
                size="lg"
                className="btn-glow bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-lg px-10 py-6 rounded-xl tracking-wider"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Free Quest
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById("zones")?.scrollIntoView({ behavior: "smooth" })}
                className="border-border text-foreground hover:border-primary/50 font-display text-lg px-8 py-6 rounded-xl"
              >
                Explore Zones
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Tagline line */}
            <div className="mt-6 animate-fade-in-up delay-350">
              <p className="text-sm text-muted-foreground/70 font-medium tracking-wide">
                Play the Quest. Learn NodeWaves. Rank Up.
              </p>
            </div>

            {/* Stats bar */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up delay-400">
              {STATS.map((stat) => (
                <div key={stat.label} className="card-nw p-4 text-center">
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="font-display font-bold text-2xl text-gradient-gold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-border rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-3 bg-primary rounded-full" />
          </div>
        </div>
      </section>

      {/* ── World Map Zones ─────────────────────────────────────────────────── */}
      <section id="zones" className="py-24 relative">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/40 font-display text-xs tracking-widest px-4 py-1">
              🗺️ WORLD MAP
            </Badge>
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="text-gradient-gold">9 Zones to Conquer</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each zone covers a core NodeWaves ecosystem pillar. Unlock zones by leveling up through quests and earning XP.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ZONES.map((zone, i) => (
              <div
                key={zone.id}
                className={`card-nw p-5 relative overflow-hidden group cursor-pointer animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.08}s` }}
                onClick={handleStart}
              >
                {/* Zone number */}
                <div className="absolute top-3 right-3 font-display text-xs text-muted-foreground/50 font-bold">
                  ZONE {String(zone.id).padStart(2, "0")}
                </div>

                {/* Lock overlay */}
                {zone.locked && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <div className="text-center">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground font-display">Reach Level {zone.level}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${zone.color}20`, border: `1px solid ${zone.color}40` }}
                  >
                    <zone.icon className="w-6 h-6" style={{ color: zone.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-sm text-foreground">{zone.name}</h3>
                      {zone.locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{zone.desc}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className="text-xs font-display font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${zone.color}20`, color: zone.color }}
                      >
                        LVL {zone.level}+
                      </div>
                      {!zone.locked && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Unlocked
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom glow line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${zone.color}, transparent)` }}
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button onClick={handleStart} className="btn-glow bg-primary text-primary-foreground font-display font-bold px-8 py-3">
              Start Exploring Zones
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Features Section ────────────────────────────────────────────────── */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/40 font-display text-xs tracking-widest px-4 py-1">
              ⚡ PLATFORM FEATURES
            </Badge>
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="text-gradient-red">Fun First.</span>{" "}
              <span className="text-foreground">Learning Inside.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A full game-feel progression system built around Web3 education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <div
                key={feat.title}
                className="card-nw p-6 group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${feat.color}20`, border: `1px solid ${feat.color}40` }}
                >
                  <feat.icon className="w-6 h-6" style={{ color: feat.color }} />
                </div>
                <h3 className="font-display font-bold text-base mb-2 text-foreground">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mini-Games Preview ──────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/40 font-display text-xs tracking-widest px-4 py-1">
              🎮 MINI-GAMES
            </Badge>
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="text-gradient-gold">3 Skill Challenges</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Node Charge", subtitle: "Tapping Mission", desc: "Tap rapidly to charge a node and earn XP. Test your speed and focus.", icon: Zap, color: "#38A169", badge: "+75 XP" },
              { name: "Timed Quiz Battle", subtitle: "Speed Knowledge", desc: "Answer Web3 questions under time pressure. Score big for bonus XP.", icon: Target, color: "#3182CE", badge: "+100 XP" },
              { name: "Scam Detector", subtitle: "Security Mission", desc: "Identify real vs fake Web3 scenarios. Protect yourself and earn XP.", icon: Shield, color: "#E53E3E", badge: "+75 XP" },
            ].map((game, i) => (
              <div
                key={game.name}
                className="card-nw p-6 text-center group cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${i * 0.15}s` }}
                onClick={handleStart}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${game.color}20`, border: `2px solid ${game.color}40` }}
                >
                  <game.icon className="w-10 h-10" style={{ color: game.color }} />
                </div>
                <div
                  className="inline-block text-xs font-display font-bold px-3 py-1 rounded-full mb-3"
                  style={{ backgroundColor: `${game.color}20`, color: game.color }}
                >
                  {game.badge}
                </div>
                <h3 className="font-display font-bold text-lg mb-1 text-foreground">{game.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{game.subtitle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{game.desc}</p>
                <Button
                  className="mt-4 w-full font-display text-sm"
                  style={{ backgroundColor: `${game.color}20`, color: game.color, border: `1px solid ${game.color}40` }}
                  variant="outline"
                >
                  Play Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leaderboard Preview ─────────────────────────────────────────────── */}
      <section id="leaderboard" className="py-24 relative">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/40 font-display text-xs tracking-widest px-4 py-1">
                🏆 COMPETITION LAYER
              </Badge>
              <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
                <span className="text-gradient-gold">Compete.</span>
                <br />
                <span className="text-foreground">Rise the Ranks.</span>
                <br />
                <span className="text-gradient-red">Earn Recognition.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                The global leaderboard tracks XP, quest completions, and streak performance.
                Earn community recognition, event access, and become eligible for campaign-based rewards under official rules.
              </p>
              <p className="text-xs text-muted-foreground mb-6 italic">
                Rewards, if any, are subject to official campaign rules and are not guaranteed.{" "}
                <a href="/campaign-rules" className="text-primary hover:underline">View Campaign Rules</a>
              </p>
              <div className="space-y-3">
                {["Learn-to-Qualify", "Compete-to-Win", "Educate-to-Grow"].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary font-display font-bold text-sm">
                      {i + 1}
                    </div>
                    <span className="font-display font-semibold text-foreground">{step}</span>
                  </div>
                ))}
              </div>
              <Button onClick={handleStart} className="mt-8 btn-gold-glow bg-secondary text-secondary-foreground font-display font-bold px-8 py-3">
                Join the Competition
                <Trophy className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Leaderboard preview */}
            <div className="card-nw p-6 border-glow-gold">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-lg text-gradient-gold">Top Questers</h3>
                <Badge className="bg-secondary/20 text-secondary border-secondary/40 text-xs font-display">LIVE</Badge>
              </div>
              <div className="space-y-3">
                {[
                  { rank: 1, name: "CryptoLearner", xp: "12,450", badge: "👑", level: 24 },
                  { rank: 2, name: "NodeMaster", xp: "11,200", badge: "🥈", level: 22 },
                  { rank: 3, name: "Web3Scholar", xp: "9,800", badge: "🥉", level: 19 },
                  { rank: 4, name: "QuestHunter", xp: "8,500", badge: "⭐", level: 17 },
                  { rank: 5, name: "StakingPro", xp: "7,200", badge: "⭐", level: 15 },
                ].map((entry) => (
                  <div key={entry.rank} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-lg w-8 text-center">{entry.badge}</span>
                    <div className="flex-1">
                      <div className="font-display font-semibold text-sm text-foreground">{entry.name}</div>
                      <div className="text-xs text-muted-foreground">Level {entry.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-sm text-gradient-gold">{entry.xp}</div>
                      <div className="text-xs text-muted-foreground">XP</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Sample data — join to see real rankings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Community & Event CTA ───────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Community CTA */}
            <div className="card-nw p-8 border-glow-red relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl"
                style={{ background: "radial-gradient(circle, oklch(0.55 0.22 25), transparent)" }} />
              <Users className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-display font-bold text-2xl mb-3 text-foreground">Join the NodeWaves Quest Community</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Connect with beta testers, ask questions, share your Quest progress, report bugs, and get official NodeWaves Quest updates.
              </p>
              <a
                href="https://chat.whatsapp.com/HK3Cilk04AI2a0h6NqvkQ8?mode=gi_t"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button className="btn-glow bg-primary text-primary-foreground font-display font-bold w-full">
                  Join Official Community
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>

            {/* Event CTA */}
            <div className="card-nw p-8 border-glow-gold relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl"
                style={{ background: "radial-gradient(circle, oklch(0.82 0.012 250), transparent)" }} />
              <Flame className="w-10 h-10 text-secondary mb-4" />
              <h3 className="font-display font-bold text-2xl mb-3 text-foreground">Upcoming Challenges & Events</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Join skill-based learning challenges, Web3 knowledge leagues, and community events as they go live during the NodeWaves Quest beta.
              </p>
              <Button
                disabled
                className="btn-gold-glow bg-secondary text-secondary-foreground font-display font-bold w-full opacity-60 cursor-not-allowed"
                onClick={() => {}}
              >
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Treasury-Aligned Ecosystem ────────────────────────────────────── */}
      <section id="treasury" className="py-24 relative">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container relative z-10">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/40 font-display text-xs tracking-widest px-4 py-1">
              🏗️ ECOSYSTEM DESIGN
            </Badge>
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-6">
              <span className="text-gradient-gold">Treasury-Aligned</span>
              <br />
              <span className="text-foreground">Ecosystem</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              NodeWaves is designed as a community-first ecosystem powered by NWS. Node participation and ecosystem
              activity are positioned around treasury alignment and long-term ecosystem growth, not a founder/team
              pocket-first model.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Coins,
                title: "NWS-Based Participation",
                desc: "All ecosystem activity is built around the NWS token, ensuring community members are at the centre of every interaction.",
                color: "#E53E3E",
              },
              {
                icon: Landmark,
                title: "Treasury-Aligned Growth",
                desc: "Node participation and ecosystem contributions are designed to support the ecosystem treasury and long-term sustainable growth.",
                color: "#C0C7D0",
              },
              {
                icon: Users,
                title: "Community-First Education",
                desc: "NodeWaves Quest exists to educate the community first. Informed participants make better decisions for themselves and the ecosystem.",
                color: "#38A169",
              },
            ].map((card) => (
              <div key={card.title} className="card-nw p-6 text-center group">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${card.color}20`, border: `1px solid ${card.color}40` }}
                >
                  <card.icon className="w-7 h-7" style={{ color: card.color }} />
                </div>
                <h3 className="font-display font-bold text-base text-foreground mb-2">{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8 max-w-xl mx-auto">
            Rewards, if any, are subject to official campaign rules and are not guaranteed.
          </p>
        </div>
      </section>

      {/* ── Roadmap ─────────────────────────────────────────────────────────── */}
      <section id="roadmap" className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 60%, oklch(0.55 0.22 25 / 0.06) 0%, transparent 70%)" }} />
        <div className="container relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 text-secondary text-xs font-display font-bold uppercase tracking-widest mb-6">
              <Map className="w-3.5 h-3.5" />
              Planned Direction
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl mb-4">
              <span className="text-foreground">NodeWaves Quest</span>
              <br />
              <span className="text-gradient-gold">Roadmap</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From Soft Beta to Full Web3 Learning Game
            </p>
          </div>

          {/* Phase cards — vertical timeline on mobile, staggered on desktop */}
          <div className="relative">
            {/* Vertical connector line (desktop) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
              style={{ background: "linear-gradient(to bottom, transparent, oklch(0.55 0.22 25 / 0.4) 20%, oklch(0.82 0.012 250 / 0.3) 80%, transparent)" }} />

            <div className="space-y-8 md:space-y-0">
              {[
                {
                  phase: "Phase 1",
                  title: "Soft Beta Learning Game",
                  status: "live",
                  statusLabel: "LIVE NOW",
                  icon: Rocket,
                  color: "#E53E3E",
                  items: ["Lessons & timed quizzes", "XP system & level progression", "Badge collection", "Mini-games (Node Charge, Quiz Battle, Scam Detector)", "Global leaderboard", "7-Day Web3 Learning Challenge"],
                },
                {
                  phase: "Phase 2",
                  title: "Retention & Community Growth",
                  status: "planned",
                  statusLabel: "PLANNED",
                  icon: RefreshCw,
                  color: "#C0C7D0",
                  items: ["Referral tracking & invite rewards", "Improved daily missions", "Celebration moments & streak bonuses", "PWA install guidance", "Beta feedback tools", "Stronger community onboarding"],
                },
                {
                  phase: "Phase 3",
                  title: "Full Game World",
                  status: "planned",
                  statusLabel: "PLANNED",
                  icon: Layers,
                  color: "#38A169",
                  items: ["Animated world map experience", "Avatar upgrades & customisation", "Reward chests & seasonal missions", "Deeper zone progression", "Enhanced game-feel interactions"],
                },
                {
                  phase: "Phase 4",
                  title: "Competitions & Ambassador Arena",
                  status: "future",
                  statusLabel: "FUTURE",
                  icon: Medal,
                  color: "#805AD5",
                  items: ["Team & country competitions", "Web3 Knowledge League", "Skill-based learning challenges", "NodeWaves Ambassador Cup", "NodeWaves Pitch Battle"],
                },
                {
                  phase: "Phase 5",
                  title: "Ecosystem Utility",
                  status: "future",
                  statusLabel: "FUTURE",
                  icon: Hexagon,
                  color: "#3182CE",
                  items: ["Node-holder missions", "Node Vault access concepts", "NFT/badge marketplace concepts", "Broader NWS ecosystem use cases", "Utility layer integration"],
                },
              ].map((p, i) => {
                const Icon = p.icon;
                const isLeft = i % 2 === 0;
                const statusColors: Record<string, string> = {
                  live: "bg-green-500/20 text-green-400 border-green-500/30",
                  planned: "bg-secondary/20 text-secondary border-secondary/30",
                  future: "bg-muted/20 text-muted-foreground border-border",
                };
                return (
                  <div key={p.phase} className={`md:grid md:grid-cols-2 md:gap-8 md:items-center mb-8 md:mb-16 ${
                    isLeft ? "" : "md:[&>*:first-child]:order-2"
                  }`}>
                    {/* Card */}
                    <div
                      className="relative rounded-2xl border p-6 transition-all hover:scale-[1.01]"
                      style={{
                        background: "oklch(0.12 0.005 260 / 0.8)",
                        borderColor: p.status === "live" ? `${p.color}55` : "oklch(0.25 0.005 260)",
                        boxShadow: p.status === "live" ? `0 0 24px ${p.color}22` : undefined,
                      }}
                    >
                      {/* Phase label + status */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-display font-bold text-xs tracking-widest" style={{ color: p.color }}>
                          {p.phase}
                        </span>
                        <span className={`text-xs font-display font-bold px-2.5 py-0.5 rounded-full border ${statusColors[p.status]}`}>
                          {p.statusLabel}
                        </span>
                      </div>
                      {/* Icon + title */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${p.color}22`, border: `1px solid ${p.color}44` }}>
                          <Icon className="w-5 h-5" style={{ color: p.color }} />
                        </div>
                        <h3 className="font-display font-bold text-lg text-foreground leading-tight">{p.title}</h3>
                      </div>
                      {/* Feature list */}
                      <ul className="space-y-1.5">
                        {p.items.map(item => (
                          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: p.color }} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Timeline dot (desktop only) */}
                    <div className="hidden md:flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                        style={{
                          background: p.status === "live" ? p.color : "oklch(0.15 0.005 260)",
                          borderColor: p.color,
                          boxShadow: p.status === "live" ? `0 0 12px ${p.color}88` : undefined,
                        }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safety disclaimer */}
          <div className="mt-12 rounded-2xl border border-border/50 p-5 flex gap-3 items-start"
            style={{ background: "oklch(0.10 0.005 260 / 0.6)" }}>
            <AlertTriangle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-foreground font-semibold">Roadmap Disclaimer: </span>
              This roadmap represents the planned direction of NodeWaves Quest. Features may evolve based on beta feedback, technical development, community needs, and official campaign rules. Phases and timelines are indicative only and subject to change. XP, badges, ranks, and roadmap features do not represent guaranteed income, fixed returns, or guaranteed token rewards. Participation in NodeWaves Quest is voluntary and educational in nature.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, oklch(0.55 0.22 25 / 0.08) 0%, transparent 70%)" }} />
        <div className="container relative z-10 text-center">
          <h2 className="font-display font-black text-4xl md:text-6xl mb-6">
            <span className="text-gradient-red">Ready to Begin</span>
            <br />
            <span className="text-foreground">Your Quest?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
            Join early learners mastering the NodeWaves ecosystem. Free to play. Fun to learn.
          </p>
          <Button
            onClick={handleStart}
            size="lg"
            className="btn-glow bg-primary hover:bg-primary/90 text-primary-foreground font-display font-black text-xl px-14 py-7 rounded-xl tracking-wider"
          >
            <Play className="w-6 h-6 mr-3" />
            Start Free Quest
          </Button>
          <p className="text-xs text-muted-foreground mt-6">
            No token rewards promised. XP, badges, and ranks are educational achievements only.{" "}
            <a href="/disclaimer" className="text-primary hover:underline">Read Disclaimer</a>
          </p>
          <p className="text-xs text-muted-foreground/60 mt-3 max-w-lg mx-auto leading-relaxed">
            This is not a guaranteed income app. Users learn, earn XP, unlock badges, and may qualify for selected rewards under official campaign rules.
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <NWQLogo compact iconSize={28} />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A gamified Web3 education platform for the NodeWaves ecosystem.
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm mb-3 text-foreground">Platform</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div><a href="#zones" className="hover:text-foreground transition-colors">World Map</a></div>
                <div><a href="#features" className="hover:text-foreground transition-colors">Features</a></div>
                <div><a href="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</a></div>
                <div><a href="#roadmap" className="hover:text-foreground transition-colors">Roadmap</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm mb-3 text-foreground">Learn</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div><a href="/quests" className="hover:text-foreground transition-colors">Quests</a></div>
                <div><a href="/mini-games" className="hover:text-foreground transition-colors">Mini-Games</a></div>
                <div><a href="/badges" className="hover:text-foreground transition-colors">Badges</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm mb-3 text-foreground">Legal</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div><a href="/disclaimer" className="hover:text-foreground transition-colors">Risk Disclaimer</a></div>
                <div><a href="/campaign-rules" className="hover:text-foreground transition-colors">Campaign Rules</a></div>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2026 NodeWaves Quest. Educational platform only.
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-lg">
              ⚠️ XP, badges, and ranks do not represent guaranteed token rewards or financial return.
              Crypto participation involves risk. Learn responsibly.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
