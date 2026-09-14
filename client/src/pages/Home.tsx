import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { MobileNav } from "@/components/MobileNav";
import { NWQLogo } from "@/components/NWQIcon";
import {
  Coins, Lock, Cpu, Building2, Vault, Landmark, Shield, Users, Rocket,
  Zap, Target, Crown, BookOpen, Award, Swords, Globe, ArrowRight,
  Play, CheckCircle2, Flame, ShieldCheck, AlertTriangle, Layers,
  Gamepad2, Trophy, Youtube, Instagram, Send,
} from "lucide-react";

const MARK_URL = `${import.meta.env.BASE_URL}nodalwaves-mark.png`;
const COMMUNITY_URL = "https://chat.whatsapp.com/HK3Cilk04AI2a0h6NqvkQ8?mode=gi_t";

const ZONES = [
  { id: 1, name: "Nodal Hub", desc: "Nodal Token fundamentals and how $NODAL moves through the ecosystem", icon: Coins, level: 1, locked: false },
  { id: 2, name: "Staking Vault", desc: "General staking, commitment tiers, and non-custodial design", icon: Lock, level: 2, locked: false },
  { id: 3, name: "Lite Node Station", desc: "What a Lite Node is and how hardware-free nodes work", icon: Cpu, level: 4, locked: true },
  { id: 4, name: "Founder Tower", desc: "The Founder Node tier and its role in the network", icon: Building2, level: 6, locked: true },
  { id: 5, name: "Node Vault Chamber", desc: "Node-Linked Vaults, from Bronze through Diamond", icon: Vault, level: 8, locked: true },
  { id: 6, name: "Treasury Hall", desc: "The treasury flywheel and wallet transparency", icon: Landmark, level: 10, locked: true },
  { id: 7, name: "Security Lab", desc: "Wallet safety, seed phrases, and spotting scams", icon: Shield, level: 12, locked: true },
  { id: 8, name: "Community Arena", desc: "How the community is organized and how to contribute", icon: Users, level: 15, locked: true },
  { id: 9, name: "Future Utility Zone", desc: "The Gaming Protocol, marketplace, and what's next", icon: Rocket, level: 18, locked: true },
];

const STATS = [
  { value: "09", label: "Learning zones", icon: Globe },
  { value: "50+", label: "Quests and lessons", icon: BookOpen },
  { value: "14+", label: "Badges to collect", icon: Award },
  { value: "03", label: "Mini-games", icon: Swords },
];

const STEPS = [
  { n: "01", title: "Learn", desc: "Short lessons across nine zones, from Nodal Token basics to node and vault mechanics.", icon: BookOpen },
  { n: "02", title: "Prove", desc: "Timed quizzes and mini-games turn what you've learned into XP.", icon: Target },
  { n: "03", title: "Rise", desc: "Level up, unlock the next zone, collect badges, and climb the leaderboard.", icon: Trophy },
];

const LAYERS = [
  {
    tier: "Layer 03",
    name: "Expansion",
    desc: "Where the ecosystem grows outward.",
    items: ["Gaming Chain and Protocol", "Marketplace", "Developer tools"],
    width: "max-w-2xl",
    active: false,
  },
  {
    tier: "Layer 02",
    name: "Engagement",
    desc: "Where the community learns, plays, and builds reputation.",
    items: ["Nodal Quest", "Nodal Pulse", "XP and badges", "Nodal Passport"],
    width: "max-w-3xl",
    active: true,
  },
  {
    tier: "Layer 01",
    name: "Foundation",
    desc: "Security, trust, and participation architecture.",
    items: ["$NODAL on Polygon", "Staking / PoS", "Lite and Founder Nodes", "Node-Linked Vaults", "Treasury", "Wallet transparency"],
    width: "max-w-4xl",
    active: false,
  },
];

const GAMES = [
  { name: "Node Charge", sub: "Tapping mission", desc: "Tap fast to charge a node. A test of speed and focus.", icon: Zap, xp: "+75 XP" },
  { name: "Quiz Battle", sub: "Speed knowledge", desc: "Answer Web3 questions against the clock for bonus XP.", icon: Target, xp: "+100 XP" },
  { name: "Scam Detector", sub: "Security mission", desc: "Tell real Web3 scenarios from fakes before they catch you out.", icon: ShieldCheck, xp: "+75 XP" },
];

const LEADERS = [
  { rank: 1, name: "CryptoLearner", level: 24, xp: 12450 },
  { rank: 2, name: "NodeMaster", level: 22, xp: 11200 },
  { rank: 3, name: "Web3Scholar", level: 19, xp: 9800 },
  { rank: 4, name: "QuestHunter", level: 17, xp: 8500 },
  { rank: 5, name: "StakingPro", level: 15, xp: 7200 },
];

const ROADMAP = [
  { phase: "Phase 1", title: "Soft beta learning game", status: "live", items: ["Lessons and timed quizzes", "XP, levels, and badges", "Three mini-games", "7-Day Web3 Challenge"] },
  { phase: "Phase 2", title: "Retention and community", status: "planned", items: ["Referral tracking", "Daily missions and streaks", "PWA install", "Beta feedback tools"] },
  { phase: "Phase 3", title: "Full game world", status: "planned", items: ["Animated world map", "Avatar customisation", "Seasonal missions"] },
  { phase: "Phase 4", title: "Competitions arena", status: "future", items: ["Team and country leagues", "Web3 Knowledge League", "NodalWaves Ambassador Cup"] },
  { phase: "Phase 5", title: "Ecosystem utility", status: "future", items: ["Node-holder missions", "Nodal Passport integration", "Broader $NODAL utility"] },
];

const STATUS_LABEL: Record<string, string> = { live: "Live now", planned: "Planned", future: "Future" };

// `immediate` animates on mount instead of on scroll, so above-the-fold content
// never depends on an IntersectionObserver firing.
function Reveal({ children, delay = 0, className = "", immediate = false }: { children: ReactNode; delay?: number; className?: string; immediate?: boolean }) {
  const reduce = useReducedMotion();
  const shown = { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      {...(immediate ? { animate: shown } : { whileInView: shown, viewport: { once: true, margin: "-80px" } })}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ eyebrow, title, accent, sub }: { eyebrow: string; title: string; accent?: string; sub?: string }) {
  return (
    <Reveal className="text-center max-w-2xl mx-auto mb-14">
      <p className="hud-label flex items-center justify-center gap-3">
        <span aria-hidden className="h-px w-8 bg-crimson" />
        {eyebrow}
        <span aria-hidden className="h-px w-8 bg-crimson" />
      </p>
      <h2 className="font-display font-bold text-4xl md:text-5xl leading-[1.05] mt-4 text-balance">
        <span className="text-chrome">{title}</span>
        {accent && <> <span className="text-crimson">{accent}</span></>}
      </h2>
      {sub && <p className="text-[#9aa1ab] text-lg mt-5 leading-relaxed text-pretty">{sub}</p>}
    </Reveal>
  );
}

function HudChip({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div aria-hidden className={`absolute panel-hud hud-frame px-3.5 py-2.5 backdrop-blur-md shadow-[0_12px_40px_rgb(0_0_0/0.6)] ${className}`}>
      {children}
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] aspect-square">
      <div aria-hidden className="absolute inset-[10%] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgb(206 14 45 / 0.55), transparent 65%)" }} />
      <div aria-hidden className="absolute left-1/2 bottom-[4%] -translate-x-1/2 w-[88%] h-[20%]">
        <div className="absolute inset-0 rounded-[50%] border border-crimson/70" style={{ boxShadow: "0 0 34px rgb(206 14 45 / 0.55), inset 0 0 34px rgb(206 14 45 / 0.4)" }} />
        <div className="absolute inset-[16%] rounded-[50%] border border-chrome/25" />
        <div className="absolute inset-[32%] rounded-[50%] bg-crimson/30 blur-md" />
      </div>
      <div aria-hidden className="absolute inset-[13%] rounded-full border border-crimson/40 animate-ring-pulse" />
      <div aria-hidden className="absolute inset-[13%] rounded-full border border-crimson/30 animate-ring-pulse [animation-delay:1.6s]" />
      <img
        src={MARK_URL}
        alt="The NodalWaves badge"
        width={720}
        height={720}
        className="absolute left-[15%] top-[10%] w-[70%] h-[70%] object-contain animate-hud-float drop-shadow-[0_24px_48px_rgb(206_14_45/0.45)]"
      />

      <HudChip className="left-0 top-[12%] w-44">
        <div className="flex items-center justify-between font-mono text-[11px] tracking-widest text-[#8f96a0]">
          <span>PLAYER</span><span className="text-chrome">LVL 07</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-crimson to-crimson-hot shadow-[0_0_10px_rgb(255_46_76/0.8)]" />
        </div>
        <div className="mt-1.5 font-mono text-[11px] text-[#c6cdd6]">2,450 / 3,000 XP</div>
      </HudChip>

      <HudChip className="right-0 top-[44%] hidden sm:block">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-md bg-crimson/15 border border-crimson/40 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-crimson-hot" />
          </span>
          <div>
            <div className="font-mono text-[11px] tracking-widest text-[#8f96a0]">BADGE UNLOCKED</div>
            <div className="font-display font-semibold text-sm text-white">Scam Spotter</div>
          </div>
        </div>
      </HudChip>

      <HudChip className="left-[4%] bottom-[18%] hidden sm:block">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-crimson-hot" />
          <span className="font-mono text-[11px] tracking-widest text-[#8f96a0]">STREAK</span>
          <span className="font-display font-bold text-sm text-white">5 days</span>
        </div>
      </HudChip>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleStart = () => navigate(isAuthenticated ? "/dashboard" : "/login");

  return (
    <div className="min-h-screen bg-void text-foreground overflow-x-hidden">
      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-void/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="focus-hud rounded-md" aria-label="NodalWaves Quest home">
            <NWQLogo compact iconSize={34} />
          </Link>
          <div className="hidden lg:flex items-center gap-7 text-sm text-[#9aa1ab]">
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#zones" className="hover:text-white transition-colors">Zones</a>
            <a href="#ecosystem" className="hover:text-white transition-colors">Ecosystem</a>
            <a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a>
            <Link href="/challenge" className="text-chrome font-semibold hover:opacity-80 transition-opacity">7-Day Challenge</Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <button type="button" onClick={() => navigate("/dashboard")} className="btn-crimson !min-h-10 !px-4 text-sm">
                  Go to dashboard
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => navigate("/login")} className="focus-hud px-3 min-h-10 rounded-md text-sm text-[#c6cdd6] hover:text-white transition-colors">
                    Log in
                  </button>
                  <button type="button" onClick={handleStart} className="btn-crimson !min-h-10 !px-4 text-sm">
                    Start free quest
                  </button>
                </>
              )}
            </div>
            <MobileNav activePage="home" />
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-hud-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
          <div aria-hidden className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-crimson/10 to-transparent animate-scan pointer-events-none" />
          <p aria-hidden className="hud-label absolute left-6 top-24 hidden 2xl:block leading-6">Nodes<br />People<br />Progress</p>
          <p aria-hidden className="hud-label absolute right-6 top-24 hidden 2xl:block text-right leading-6">Learn<br />Prove<br />Rise</p>

          <div className="container relative z-10 grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <Reveal immediate>
                <p className="inline-flex items-center gap-2.5 hud-label rounded-full border border-crimson/40 bg-crimson/10 px-4 py-1.5 !text-[#ff8a99]">
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-crimson-hot animate-pulse" />
                  Soft beta live · Free to play
                </p>
              </Reveal>
              <Reveal immediate delay={0.08}>
                <h1 className="font-display font-bold text-5xl sm:text-6xl xl:text-7xl leading-[0.98] tracking-tight mt-6">
                  <span className="text-chrome">Play the quest.</span>
                  <br />
                  <span className="text-chrome">Power the </span>
                  <span className="text-crimson whitespace-nowrap">next wave.</span>
                </h1>
              </Reveal>
              <Reveal immediate delay={0.16}>
                <p className="text-lg md:text-xl text-[#a3aab4] max-w-xl mx-auto lg:mx-0 mt-6 leading-relaxed text-pretty">
                  NodalWaves Quest is the learning layer of the NodalWaves ecosystem. Work through nine zones of lessons,
                  quizzes, and mini-games on $NODAL, nodes, vaults, and wallet security, with XP, badges, and ranks to
                  show how far you've come.
                </p>
              </Reveal>
              <Reveal immediate delay={0.24} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mt-9">
                <button type="button" onClick={handleStart} className="btn-crimson text-base !px-7">
                  <Play className="w-4 h-4" aria-hidden />
                  Start free quest
                </button>
                <a href="#zones" className="btn-hud text-base">
                  Explore the zones
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </a>
              </Reveal>
              <Reveal immediate delay={0.32}>
                <ul className="mt-9 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 font-mono text-xs tracking-wider text-[#8f96a0]">
                  {["Free to play", "Email or Google sign-in", "Security-first curriculum"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-crimson-hot" aria-hidden />
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal immediate delay={0.12}>
              <HeroVisual />
            </Reveal>
          </div>
        </section>

        {/* ── Stats strip ───────────────────────────────────────────────────── */}
        <section aria-label="Platform at a glance" className="border-y border-white/5 bg-hull/60">
          <div className="container grid grid-cols-2 md:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={s.label} className={`py-8 px-4 flex items-center gap-4 justify-center md:justify-start ${i > 0 ? "md:border-l border-white/5" : ""} ${i % 2 === 1 ? "border-l border-white/5 md:border-l" : ""} ${i > 1 ? "border-t md:border-t-0 border-white/5" : ""}`}>
                <s.icon className="w-5 h-5 text-crimson-hot shrink-0" aria-hidden />
                <div>
                  <div className="font-mono font-semibold text-3xl text-chrome leading-none">{s.value}</div>
                  <div className="text-xs text-[#8f96a0] mt-1.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────────── */}
        <section id="how" className="py-24 scroll-mt-16">
          <div className="container">
            <SectionHeader eyebrow="The loop" title="Learn it. Prove it." accent="Rise." sub="Every quest follows the same three beats, so you always know what the next step is." />
            <div className="grid md:grid-cols-3 gap-5">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.08}>
                  <div className="panel-hud hud-frame p-7 h-full group transition-colors hover:border-crimson/40">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-crimson-hot tracking-widest">{s.n}</span>
                      <s.icon className="w-5 h-5 text-[#6b727c] group-hover:text-chrome transition-colors" aria-hidden />
                    </div>
                    <h3 className="font-display font-bold text-2xl text-white mt-6">{s.title}</h3>
                    <p className="text-[#9aa1ab] mt-3 leading-relaxed">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Zones ─────────────────────────────────────────────────────────── */}
        <section id="zones" className="py-24 relative scroll-mt-16">
          <div aria-hidden className="absolute inset-0 bg-hud-grid opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
          <div className="container relative">
            <SectionHeader eyebrow="World map" title="Nine zones." accent="One ecosystem." sub="Each zone covers one pillar of NodalWaves. Level up to unlock the next." />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ZONES.map((z, i) => (
                <Reveal key={z.id} delay={(i % 3) * 0.06}>
                  <button
                    type="button"
                    onClick={handleStart}
                    aria-label={`${z.name}: ${z.desc}. ${z.locked ? `Unlocks at level ${z.level}` : "Unlocked"}`}
                    className={`focus-hud w-full text-left panel-hud p-5 h-full relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 ${
                      z.locked ? "hover:border-white/15" : "!border-crimson/40 shadow-[0_0_28px_rgb(206_14_45/0.12)] hover:!border-crimson/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] tracking-[0.2em] text-[#6b727c]">ZONE {String(z.id).padStart(2, "0")}</span>
                      <span className={`font-mono text-[11px] tracking-wider px-2 py-0.5 rounded border ${z.locked ? "border-white/10 text-[#8f96a0]" : "border-crimson/40 text-[#ff8a99] bg-crimson/10"}`}>
                        LVL {z.level}+
                      </span>
                    </div>
                    <div className="flex items-start gap-4 mt-4">
                      <span className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border ${z.locked ? "border-white/10 bg-white/[0.03]" : "border-crimson/40 bg-crimson/10"}`}>
                        <z.icon className={`w-5 h-5 ${z.locked ? "text-[#8f96a0]" : "text-crimson-hot"}`} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                          {z.name}
                          {z.locked && <Lock className="w-3.5 h-3.5 text-[#6b727c]" aria-hidden />}
                        </h3>
                        <p className="text-sm text-[#8f96a0] mt-1 leading-relaxed">{z.desc}</p>
                      </div>
                    </div>
                    <div className="mt-4 font-mono text-[11px] tracking-wider flex items-center gap-1.5">
                      {z.locked ? (
                        <span className="text-[#6b727c]">Reach level {z.level} to unlock</span>
                      ) : (
                        <span className="text-chrome flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-crimson-hot" aria-hidden />Unlocked · Start here</span>
                      )}
                    </div>
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-crimson to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Three-layer ecosystem ─────────────────────────────────────────── */}
        <section id="ecosystem" className="py-24 scroll-mt-16">
          <div className="container">
            <SectionHeader
              eyebrow="Where Quest fits"
              title="Three layers."
              accent="One architecture."
              sub="NodalWaves is built as a three-layer participation model. Quest sits in the Engagement layer, so the community understands the Foundation before taking part in it."
            />
            <div className="flex flex-col items-center gap-3">
              {LAYERS.map((l, i) => (
                <Reveal key={l.name} delay={i * 0.08} className={`w-full ${l.width}`}>
                  <div className={`relative rounded-xl p-5 md:p-6 border transition-colors ${
                    l.active
                      ? "border-crimson/60 bg-gradient-to-b from-crimson/15 to-crimson/[0.03] shadow-[0_0_40px_rgb(206_14_45/0.2)]"
                      : "panel-hud"
                  }`}>
                    {l.active && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-widest bg-crimson text-white px-3 py-1 rounded-full whitespace-nowrap">
                        YOU ARE HERE
                      </span>
                    )}
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                      <div className="md:w-48 shrink-0 text-center md:text-left">
                        <div className="font-mono text-[11px] tracking-[0.2em] text-[#6b727c]">{l.tier.toUpperCase()}</div>
                        <div className={`font-display font-bold text-2xl mt-1 ${l.active ? "text-white" : "text-chrome"}`}>{l.name}</div>
                        <div className="text-xs text-[#8f96a0] mt-1">{l.desc}</div>
                      </div>
                      <ul className="flex flex-wrap justify-center md:justify-start gap-2">
                        {l.items.map((item) => (
                          <li key={item} className={`text-sm px-3 py-1.5 rounded-md border ${
                            l.active ? "border-crimson/40 bg-void/60 text-white" : "border-white/10 bg-white/[0.02] text-[#c6cdd6]"
                          }`}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mini-games ────────────────────────────────────────────────────── */}
        <section className="py-24 relative">
          <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, rgb(206 14 45 / 0.08), transparent 65%)" }} />
          <div className="container relative">
            <SectionHeader eyebrow="Mini-games" title="Three skill" accent="challenges." sub="Quick rounds that sharpen what the lessons teach, and add XP while they do it." />
            <div className="grid md:grid-cols-3 gap-5">
              {GAMES.map((g, i) => (
                <Reveal key={g.name} delay={i * 0.08}>
                  <div className="panel-hud hud-frame p-7 h-full flex flex-col text-center group hover:border-crimson/40 transition-colors">
                    <div className="relative w-20 h-20 mx-auto">
                      <div aria-hidden className="absolute inset-0 rounded-full border border-crimson/40 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-2 rounded-full bg-crimson/15 border border-crimson/30 flex items-center justify-center">
                        <g.icon className="w-8 h-8 text-crimson-hot" aria-hidden />
                      </div>
                    </div>
                    <span className="mx-auto mt-5 font-mono text-xs tracking-wider text-chrome border border-white/10 rounded px-2.5 py-1">{g.xp}</span>
                    <h3 className="font-display font-bold text-xl text-white mt-4">{g.name}</h3>
                    <p className="hud-label !text-[11px] mt-1">{g.sub}</p>
                    <p className="text-sm text-[#9aa1ab] mt-3 leading-relaxed flex-1">{g.desc}</p>
                    <button type="button" onClick={handleStart} className="btn-hud w-full mt-6 text-sm">
                      <Gamepad2 className="w-4 h-4" aria-hidden />
                      Play {g.name}
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Leaderboard ───────────────────────────────────────────────────── */}
        <section id="leaderboard" className="py-24 scroll-mt-16">
          <div className="container grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <p className="hud-label flex items-center gap-3"><span aria-hidden className="h-px w-8 bg-crimson" />Competition layer</p>
              <h2 className="font-display font-bold text-4xl md:text-5xl leading-[1.05] mt-4 text-balance">
                <span className="text-chrome">Compete. Rise the ranks.</span>
                <br />
                <span className="text-crimson">Earn recognition.</span>
              </h2>
              <p className="text-[#9aa1ab] text-lg mt-5 leading-relaxed">
                The global leaderboard tracks XP, quest completions, and streaks. Top questers earn community
                recognition and event access.
              </p>
              <ol className="mt-8 space-y-3">
                {["Learn to qualify", "Compete to win", "Educate to grow"].map((step, i) => (
                  <li key={step} className="flex items-center gap-4">
                    <span className="w-9 h-9 rounded-md border border-crimson/40 bg-crimson/10 flex items-center justify-center font-mono text-sm text-[#ff8a99]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display font-semibold text-white">{step}</span>
                  </li>
                ))}
              </ol>
              <button type="button" onClick={handleStart} className="btn-crimson mt-9">
                Join the competition
                <Trophy className="w-4 h-4" aria-hidden />
              </button>
              <p className="text-xs text-[#6b727c] mt-4">
                Campaign rewards, if any, follow the{" "}
                <Link href="/campaign-rules" className="text-[#ff8a99] underline-offset-2 hover:underline">official campaign rules</Link>{" "}
                and aren't guaranteed.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="panel-hud hud-frame p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-bold text-lg text-chrome">Top questers</h3>
                  <span className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-[#ff8a99] border border-crimson/40 bg-crimson/10 rounded-full px-2.5 py-1">
                    <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-crimson-hot animate-pulse" />
                    SAMPLE
                  </span>
                </div>
                <ol className="space-y-2">
                  {LEADERS.map((p) => (
                    <li key={p.rank} className={`flex items-center gap-4 p-3 rounded-lg border ${p.rank === 1 ? "border-crimson/40 bg-crimson/[0.07]" : "border-white/5 bg-white/[0.02]"}`}>
                      <span className="w-8 text-center font-mono text-sm text-[#8f96a0]">
                        {p.rank === 1 ? <Crown className="w-4 h-4 mx-auto text-crimson-hot" aria-label="Rank 1" /> : `#${p.rank}`}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-semibold text-sm text-white truncate">{p.name}</span>
                          <span className="font-mono text-sm text-chrome">{p.xp.toLocaleString()} XP</span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-crimson to-crimson-hot" style={{ width: `${Math.round((p.xp / LEADERS[0].xp) * 100)}%` }} />
                          </div>
                          <span className="font-mono text-[11px] text-[#6b727c] w-12 text-right">LVL {p.level}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-[#6b727c] text-center mt-4">Sample data. Join to see live rankings.</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Roadmap ───────────────────────────────────────────────────────── */}
        <section id="roadmap" className="py-24 relative scroll-mt-16">
          <div aria-hidden className="absolute inset-0 bg-hud-grid opacity-30 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]" />
          <div className="container relative">
            <SectionHeader eyebrow="Planned direction" title="From soft beta to" accent="full game world." />
            <div className="relative">
              <div aria-hidden className="hidden lg:block absolute top-[7px] left-[10%] right-[10%] h-px bg-gradient-to-r from-crimson via-chrome/30 to-white/5" />
              <ol className="grid gap-5 lg:grid-cols-5">
                {ROADMAP.map((p, i) => (
                  <Reveal key={p.phase} delay={i * 0.06}>
                    <li className="h-full flex flex-col">
                      <span aria-hidden className={`hidden lg:block w-3.5 h-3.5 rounded-full mx-auto mb-5 border-2 ${
                        p.status === "live" ? "bg-crimson-hot border-crimson-hot shadow-[0_0_14px_rgb(255_46_76/0.9)]" : "bg-void border-chrome/40"
                      }`} />
                      <div className={`flex-1 rounded-xl p-5 border ${p.status === "live" ? "border-crimson/50 bg-crimson/[0.07]" : "panel-hud"}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] tracking-[0.2em] text-[#8f96a0]">{p.phase.toUpperCase()}</span>
                          <span className={`font-mono text-[10px] tracking-wider px-2 py-0.5 rounded-full border ${
                            p.status === "live" ? "border-crimson/50 text-[#ff8a99]" : "border-white/10 text-[#8f96a0]"
                          }`}>
                            {STATUS_LABEL[p.status].toUpperCase()}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-base text-white mt-3 leading-snug">{p.title}</h3>
                        <ul className="mt-3 space-y-1.5">
                          {p.items.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-[#9aa1ab]">
                              <span aria-hidden className={`mt-2 w-1 h-1 rounded-full shrink-0 ${p.status === "live" ? "bg-crimson-hot" : "bg-[#6b727c]"}`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
            <p className="mt-10 max-w-3xl mx-auto text-xs text-[#6b727c] leading-relaxed text-center flex gap-2 items-start justify-center">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#8f96a0]" aria-hidden />
              <span>
                Phases are indicative and may change with beta feedback and technical development. XP, badges, ranks,
                and roadmap features aren't financial instruments and don't represent token rewards or financial return.
              </span>
            </p>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="container">
            <Reveal>
              <div className="relative overflow-hidden rounded-2xl border border-crimson/40 px-6 py-16 md:py-20 text-center bg-gradient-to-b from-crimson/[0.14] via-hull to-void">
                <div aria-hidden className="absolute inset-0 bg-hud-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
                <div aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-crimson-hot to-transparent" />
                <div className="relative">
                  <img src={MARK_URL} alt="" aria-hidden width={96} height={96} className="w-20 h-20 mx-auto drop-shadow-[0_10px_30px_rgb(206_14_45/0.6)]" />
                  <h2 className="font-display font-bold text-4xl md:text-6xl leading-[1.02] mt-8">
                    <span className="text-chrome">Power the</span>{" "}
                    <span className="text-crimson whitespace-nowrap">next wave.</span>
                  </h2>
                  <p className="text-[#a3aab4] text-lg max-w-xl mx-auto mt-5 leading-relaxed">
                    Start with Zone 01 today. It's free, and the first quest takes about five minutes.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9">
                    <button type="button" onClick={handleStart} className="btn-crimson text-base !px-8">
                      <Play className="w-4 h-4" aria-hidden />
                      Start free quest
                    </button>
                    <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="btn-hud text-base">
                      <Users className="w-4 h-4" aria-hidden />
                      Join the community
                    </a>
                  </div>
                  <p className="text-xs text-[#6b727c] mt-8">
                    Challenges and community events roll out through the beta.{" "}
                    <Link href="/disclaimer" className="text-[#ff8a99] underline-offset-2 hover:underline">Read the disclaimer</Link>
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-hull/40 py-14">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10">
            <div className="col-span-2 md:col-span-1">
              <NWQLogo compact iconSize={30} />
              <p className="text-sm text-[#8f96a0] mt-4 leading-relaxed max-w-xs">
                The gamified learning layer of the NodalWaves ecosystem.
              </p>
              <div className="flex gap-2 mt-5">
                {[
                  { href: "https://www.youtube.com/@Nodalwaves", label: "NodalWaves on YouTube", icon: Youtube },
                  { href: "https://t.me/Nodalwaves", label: "NodalWaves on Telegram", icon: Send },
                  { href: "https://www.instagram.com/nodalwaves", label: "NodalWaves on Instagram", icon: Instagram },
                ].map((s) => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="focus-hud w-11 h-11 rounded-md border border-white/10 flex items-center justify-center text-[#8f96a0] hover:text-white hover:border-crimson/50 transition-colors">
                    <s.icon className="w-4 h-4" aria-hidden />
                  </a>
                ))}
              </div>
            </div>
            <FooterCol title="Platform" links={[["#zones", "World map"], ["#how", "How it works"], ["/leaderboard", "Leaderboard"], ["#roadmap", "Roadmap"]]} />
            <FooterCol title="Learn" links={[["/quests", "Quests"], ["/mini-games", "Mini-games"], ["/badges", "Badges"], ["/challenge", "7-Day Challenge"]]} />
            <FooterCol title="Legal" links={[["/disclaimer", "Risk disclaimer"], ["/campaign-rules", "Campaign rules"]]} />
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <p className="font-mono text-xs text-[#6b727c]">© 2026 NodalWaves Quest · Educational platform</p>
            <p className="text-xs text-[#6b727c] max-w-xl md:text-right leading-relaxed">
              XP, badges, and ranks don't represent token rewards or financial return. Crypto participation involves
              risk. Learn before you take part.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="hud-label !text-[11px] mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm">
        {links.map(([href, label]) => (
          <li key={href}>
            {href.startsWith("#") ? (
              <a href={href} className="text-[#9aa1ab] hover:text-white transition-colors">{label}</a>
            ) : (
              <Link href={href} className="text-[#9aa1ab] hover:text-white transition-colors">{label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
