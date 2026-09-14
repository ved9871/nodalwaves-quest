import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { MobileNav } from "@/components/MobileNav";
import { NWQLogo } from "@/components/NWQIcon";
import {
  Coins, Lock, Cpu, Building2, Vault, Landmark, Shield, Users, Rocket,
  Zap, Target, ShieldCheck, Crown, Flame, Sparkles, Play, Pause,
  ChevronsRight, ArrowRight, Trophy, Star, Youtube, Instagram, Send, BookOpen,
} from "lucide-react";
import "./arcade.css";

const MARK_URL = `${import.meta.env.BASE_URL}nodalwaves-mark.png`;
const COMMUNITY_URL = "https://chat.whatsapp.com/HK3Cilk04AI2a0h6NqvkQ8?mode=gi_t";
const ARCADE_FONTS = "https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Exo+2:wght@400;500;600;700&display=swap";

const STAGES = [
  { id: 1, name: "Nodal Hub", desc: "Nodal Token basics and how $NODAL moves", icon: Coins, level: 1, locked: false },
  { id: 2, name: "Staking Vault", desc: "Staking, commitment tiers, non-custodial design", icon: Lock, level: 2, locked: false },
  { id: 3, name: "Lite Node Station", desc: "Hardware-free nodes, explained", icon: Cpu, level: 4, locked: true },
  { id: 4, name: "Founder Tower", desc: "The Founder Node tier", icon: Building2, level: 6, locked: true },
  { id: 5, name: "Node Vault Chamber", desc: "Vault tiers, Bronze to Diamond", icon: Vault, level: 8, locked: true },
  { id: 6, name: "Treasury Hall", desc: "The treasury flywheel", icon: Landmark, level: 10, locked: true },
  { id: 7, name: "Security Lab", desc: "Seed phrases and scam spotting", icon: Shield, level: 12, locked: true },
  { id: 8, name: "Community Arena", desc: "How the community runs", icon: Users, level: 15, locked: true },
  { id: 9, name: "Future Utility Zone", desc: "Gaming Protocol and what's next", icon: Rocket, level: 18, locked: true },
];

type Rarity = "common" | "rare" | "epic" | "legendary";
const RARITY: Record<Rarity, { label: string; tone: "muted" | "default" | "hot"; text: string }> = {
  common: { label: "Common", tone: "muted", text: "text-[#c0c0c0]" },
  rare: { label: "Rare", tone: "default", text: "text-[#e8e8ec]" },
  epic: { label: "Epic", tone: "hot", text: "text-[#ff4d66]" },
  legendary: { label: "Legendary", tone: "hot", text: "text-[#ff4d66]" },
};

const BADGES: { name: string; hint: string; icon: typeof Star; rarity: Rarity }[] = [
  { name: "First Quest", hint: "Finish your first lesson", icon: Sparkles, rarity: "common" },
  { name: "Scam Spotter", hint: "Clear Scam Detector", icon: ShieldCheck, rarity: "rare" },
  { name: "On Fire", hint: "Hold a 7-day streak", icon: Flame, rarity: "rare" },
  { name: "Node Scholar", hint: "Clear the node stages", icon: Cpu, rarity: "epic" },
  { name: "Vault Master", hint: "Ace the vault quiz", icon: Vault, rarity: "epic" },
  { name: "Wave Legend", hint: "Clear all nine stages", icon: Crown, rarity: "legendary" },
];

const CABINETS = [
  { name: "Node Charge", tag: "Tapping mission", icon: Zap, xp: "+75 XP", stats: [["Speed", 9], ["Focus", 7], ["Brains", 3]] as const },
  { name: "Quiz Battle", tag: "Beat the clock", icon: Target, xp: "+100 XP", stats: [["Speed", 6], ["Focus", 6], ["Brains", 9]] as const },
  { name: "Scam Detector", tag: "Security mission", icon: ShieldCheck, xp: "+75 XP", stats: [["Speed", 4], ["Focus", 8], ["Brains", 8]] as const },
];

const HIGH_SCORES = [
  { rank: 1, name: "CryptoLearner", level: 24, xp: 12450 },
  { rank: 2, name: "NodeMaster", level: 22, xp: 11200 },
  { rank: 3, name: "Web3Scholar", level: 19, xp: 9800 },
  { rank: 4, name: "QuestHunter", level: 17, xp: 8500 },
  { rank: 5, name: "StakingPro", level: 15, xp: 7200 },
];

const WORLDS = [
  { n: "01", name: "Foundation", desc: "The base layer: security, trust, and participation.", items: ["$NODAL", "Staking", "Nodes", "Vaults", "Treasury"], here: false },
  { n: "02", name: "Engagement", desc: "Where you learn, play, and build a rep.", items: ["Nodal Quest", "Nodal Pulse", "XP + badges", "Nodal Passport"], here: true },
  { n: "03", name: "Expansion", desc: "Where the ecosystem levels up next.", items: ["Gaming Protocol", "Marketplace", "Dev tools"], here: false },
];

const SEASONS = [
  { s: "S1", title: "Soft beta", status: "Live", items: ["Lessons + timed quizzes", "XP, levels, badges", "3 mini-games", "7-Day Challenge"] },
  { s: "S2", title: "Squad up", status: "Next", items: ["Referrals", "Daily missions", "Streak boosts"] },
  { s: "S3", title: "Open world", status: "Planned", items: ["Animated world map", "Avatar customisation", "Seasonal missions"] },
  { s: "S4", title: "Arena", status: "Planned", items: ["Team + country leagues", "Web3 Knowledge League", "Ambassador Cup"] },
  { s: "S5", title: "Ecosystem", status: "Future", items: ["Node-holder missions", "Nodal Passport", "More $NODAL utility"] },
];

const TICKER = ["Free to play", "9 stages", "14+ badges", "+100 XP Quiz Battle", "Scam Detector", "Node Charge", "Season 01 live", "Power the next wave"];

// `immediate` animates on mount instead of on scroll, so above-the-fold content
// never depends on an IntersectionObserver firing.
function Reveal({ children, delay = 0, className = "", immediate = false }: { children: ReactNode; delay?: number; className?: string; immediate?: boolean }) {
  const reduce = useReducedMotion();
  const shown = { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      {...(immediate ? { animate: shown } : { whileInView: shown, viewport: { once: true, margin: "-80px" } })}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Glitch({ text, tone = "chrome" }: { text: string; tone?: "chrome" | "neon" }) {
  return (
    <span className="arc-glitch">
      <span className={tone === "chrome" ? "arc-chrome" : "arc-neon"}>{text}</span>
      <span aria-hidden className="arc-glitch-layer is-a">{text}</span>
      <span aria-hidden className="arc-glitch-layer is-b">{text}</span>
    </span>
  );
}

function Frame({ children, tone = "default", className = "", inner = "" }: { children: ReactNode; tone?: "default" | "hot" | "muted"; className?: string; inner?: string }) {
  return (
    <div className={`arc-frame arc-cut is-${tone} ${className}`}>
      <div className={`arc-frame-in arc-cut ${inner}`}>{children}</div>
    </div>
  );
}

function Seg({ value }: { value: number }) {
  return (
    <span className="arc-seg" aria-hidden>
      {Array.from({ length: 10 }, (_, i) => <i key={i} className={i < value ? "is-on" : ""} />)}
    </span>
  );
}

function ArcHeader({ tag, title, accent, sub }: { tag: string; title: string; accent?: string; sub?: string }) {
  return (
    <Reveal className="mb-12 max-w-3xl">
      <p className="arc-display text-xs tracking-[0.3em] text-[#ff4d66] flex items-center gap-2 uppercase">
        <ChevronsRight className="w-4 h-4" aria-hidden />
        {tag}
      </p>
      <h2 className="arc-display font-black uppercase text-3xl sm:text-4xl md:text-5xl leading-[1.08] mt-3 text-balance">
        <span className="arc-chrome">{title}</span>
        {accent && <> <span className="arc-neon">{accent}</span></>}
      </h2>
      {sub && <p className="text-[#a4a4ae] text-lg mt-4 max-w-2xl text-pretty">{sub}</p>}
    </Reveal>
  );
}

function PrimaryButton({ onClick, children, className = "" }: { onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`arc-btn arc-focus ${className}`}>
      <span className="arc-btn-face">{children}</span>
    </button>
  );
}

function PlayerCard() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (reduce || e.pointerType !== "mouse" || !el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(x - 0.5) * 16}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 16}deg`);
    el.style.setProperty("--mx", `${Math.round(x * 100)}%`);
    el.style.setProperty("--my", `${Math.round(y * 100)}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  };

  return (
    <div
      role="img"
      aria-label="Sample player card: Wave Rookie, level 7, 2,450 XP, 5-day streak, 3 of 14 badges"
      className="relative mx-auto w-full max-w-[340px]"
    >
      <div aria-hidden className="absolute -right-3 -top-4 z-10 hidden sm:block">
        <span className="arc-chip">+75 XP</span>
      </div>
      <div aria-hidden className="absolute -left-5 -bottom-4 z-10 hidden sm:block">
        <span className="arc-chip is-silver !bg-[#101014]"><ShieldCheck className="w-3.5 h-3.5" />Badge unlocked</span>
      </div>
      <div aria-hidden className="arc-float">
        <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="arc-card">
          <Frame tone="hot" inner="arc-holo p-5">
            <div className="flex items-center justify-between">
              <span className="arc-display text-[10px] tracking-[0.3em] text-[#ff4d66]">PLAYER CARD</span>
              <span className="arc-display text-[10px] tracking-[0.2em] text-[#a4a4ae]">#0001</span>
            </div>
            <div className="relative mt-4 aspect-square overflow-hidden bg-[#0b0b0e] border border-[#2a2a31]">
              <div className="arc-sun absolute left-1/2 top-[14%] w-[72%] aspect-square -translate-x-1/2" />
              <div className="absolute inset-x-0 bottom-0 h-[38%] overflow-hidden">
                <div className="arc-floor !bottom-0 !h-full !opacity-70" />
              </div>
              <img src={MARK_URL} alt="" width={720} height={720} className="absolute left-1/2 top-1/2 w-[62%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_18px_30px_rgb(0_0_0/0.7)]" />
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <div className="arc-display font-black text-xl text-white tracking-wide">WAVE ROOKIE</div>
                <div className="text-xs text-[#a4a4ae] mt-0.5">Class: Explorer · Season 01</div>
              </div>
              <span className="arc-chip">Starter</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              {[["LVL", "07"], ["XP", "2,450"], ["Streak", "5"]].map(([k, v]) => (
                <div key={k} className="bg-white/[0.03] border border-[#2a2a31] py-2">
                  <div className="arc-display font-bold text-base text-white">{v}</div>
                  <div className="arc-display text-[9px] tracking-[0.2em] text-[#a4a4ae] mt-0.5 uppercase">{k}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {([["Next level", 8], ["Security IQ", 6], ["Badges 3/14", 2]] as const).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[88px_1fr] items-center gap-3">
                  <span className="arc-display text-[9px] tracking-[0.18em] text-[#a4a4ae] uppercase">{k}</span>
                  <Seg value={v} />
                </div>
              ))}
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}

function Ticker() {
  const [paused, setPaused] = useState(false);
  const row = (duplicate: boolean) => (
    <ul aria-hidden={duplicate || undefined} className="flex shrink-0 items-center">
      {TICKER.map((t) => (
        <li key={t} className="arc-display uppercase text-sm tracking-[0.22em] px-6 flex items-center gap-6 whitespace-nowrap text-[#e8e8ec]">
          <span>{t}</span>
          <Star className="w-3.5 h-3.5 text-[#ff1a3c]" aria-hidden />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Quest highlights" className="relative border-y border-[#ff1a3c]/40 bg-[#0e0e12]">
      <div className={`arc-marquee py-4 pr-14 ${paused ? "is-paused" : ""}`}>
        <div className="arc-marquee-track">{row(false)}{row(true)}</div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? "Play the highlights ticker" : "Pause the highlights ticker"}
        className="arc-focus absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-[#c0c0c0] hover:text-white bg-[#0e0e12]"
      >
        {paused ? <Play className="w-4 h-4" aria-hidden /> : <Pause className="w-4 h-4" aria-hidden />}
      </button>
    </section>
  );
}

export default function HomeArcade() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const handleStart = () => navigate(isAuthenticated ? "/dashboard" : "/login");

  useEffect(() => {
    if (!document.getElementById("arcade-fonts")) {
      const link = document.createElement("link");
      link.id = "arcade-fonts";
      link.rel = "stylesheet";
      link.href = ARCADE_FONTS;
      document.head.appendChild(link);
    }
    const previousTitle = document.title;
    document.title = "NodalWaves Quest — Arcade";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <div className="arc-root min-h-screen overflow-x-hidden">
      <div aria-hidden className="arc-scanlines" />

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-[#ff1a3c]/25 bg-[#08080a]/85 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/arcade" className="arc-focus" aria-label="NodalWaves Quest arcade home">
              <NWQLogo compact iconSize={32} />
            </Link>
            <span className="arc-chip hidden sm:inline-flex">Arcade</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            {[["#stages", "Stages"], ["#badges", "Badges"], ["#games", "Games"], ["#season", "Season"]].map(([href, label]) => (
              <a key={href} href={href} className="arc-display uppercase text-[11px] tracking-[0.2em] text-[#a4a4ae] hover:text-white transition-colors">{label}</a>
            ))}
            <Link href="/" className="arc-display uppercase text-[11px] tracking-[0.2em] text-[#ff4d66] hover:text-white transition-colors">Classic view</Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <PrimaryButton onClick={() => navigate("/dashboard")} className="[&_.arc-btn-face]:!min-h-10 [&_.arc-btn-face]:!px-5">Dashboard</PrimaryButton>
              ) : (
                <>
                  <button type="button" onClick={() => navigate("/login")} className="arc-focus arc-display uppercase text-[11px] tracking-[0.2em] text-[#c0c0c0] hover:text-white px-2 min-h-10">
                    Log in
                  </button>
                  <PrimaryButton onClick={handleStart} className="[&_.arc-btn-face]:!min-h-10 [&_.arc-btn-face]:!px-5">Play</PrimaryButton>
                </>
              )}
            </div>
            <MobileNav activePage="home" />
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
          <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 70% 40%, rgb(255 26 60 / 0.18), transparent 60%)" }} />
          <div aria-hidden className="arc-floor" />
          <div className="container relative z-10 grid lg:grid-cols-[1.15fr_0.85fr] gap-14 items-center">
            <div className="text-center lg:text-left">
              <Reveal immediate>
                <span className="arc-chip">
                  <span aria-hidden className="w-1.5 h-1.5 bg-[#ff1a3c] arc-blink" />
                  Season 01 · Soft beta · Free to play
                </span>
              </Reveal>
              <Reveal immediate delay={0.08}>
                <h1 className="arc-display font-black uppercase leading-[0.95] tracking-tight mt-7 text-[2.6rem] sm:text-6xl xl:text-7xl">
                  <Glitch text="Level up" />
                  <br />
                  <span className="arc-chrome">your Web3</span>
                  <br />
                  <Glitch text="game." tone="neon" />
                </h1>
              </Reveal>
              <Reveal immediate delay={0.16}>
                <p className="text-lg md:text-xl text-[#b8b8c2] max-w-xl mx-auto lg:mx-0 mt-7 leading-relaxed text-pretty">
                  NodalWaves Quest turns Web3 into a game you'll actually want to play. Clear stages, beat mini-games,
                  stack XP, and collect badges while you learn how $NODAL, nodes, and wallet security really work.
                </p>
              </Reveal>
              <Reveal immediate delay={0.24} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-10">
                <PrimaryButton onClick={handleStart}>
                  <Play className="w-4 h-4 fill-current" aria-hidden />
                  Press start
                </PrimaryButton>
                <a href="#badges" className="arc-btn-alt arc-focus">
                  <span className="arc-btn-alt-face"><span className="arc-btn-alt-in">See the badges<ArrowRight className="w-4 h-4" aria-hidden /></span></span>
                </a>
              </Reveal>
              <Reveal immediate delay={0.32}>
                <ul className="mt-9 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-[#a4a4ae]">
                  {["Free to play", "Email sign-up", "No wallet needed to start"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <span aria-hidden className="w-1.5 h-1.5 rotate-45 bg-[#ff1a3c]" />
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <Reveal immediate delay={0.12}>
              <PlayerCard />
            </Reveal>
          </div>
        </section>

        <Ticker />

        {/* ── Stage select ───────────────────────────────────────────────── */}
        <section id="stages" className="py-24 scroll-mt-16">
          <div className="container">
            <ArcHeader tag="Stage select" title="Nine stages." accent="No skipping." sub="Every stage unlocks the next. Start at Stage 01 and work your way to the boss level." />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {STAGES.map((s, i) => (
                <Reveal key={s.id} delay={(i % 3) * 0.06}>
                  <button
                    type="button"
                    onClick={handleStart}
                    aria-label={`Stage ${s.id}, ${s.name}: ${s.desc}. ${s.locked ? `Unlocks at level ${s.level}` : "Unlocked"}`}
                    className="arc-focus group block w-full text-left transition-transform duration-200 hover:-translate-y-1"
                  >
                    <Frame tone={s.locked ? "muted" : "hot"} inner="relative overflow-hidden p-5 min-h-[168px]">
                      <span aria-hidden className={`arc-display arc-outline ${s.locked ? "" : "is-hot"} absolute right-4 top-2 font-black text-7xl leading-none select-none`}>
                        {s.id}
                      </span>
                      <div className="relative flex items-center gap-3">
                        <span className={`w-11 h-11 flex items-center justify-center border ${s.locked ? "border-[#2e2e36] bg-white/[0.02]" : "border-[#ff1a3c]/60 bg-[#ff1a3c]/10 shadow-[0_0_18px_rgb(255_26_60/0.35)]"}`}>
                          <s.icon className={`w-5 h-5 ${s.locked ? "text-[#8a8a94]" : "text-[#ff4d66]"}`} aria-hidden />
                        </span>
                        <span className="arc-display text-[10px] tracking-[0.25em] text-[#8a8a94]">STAGE {String(s.id).padStart(2, "0")}</span>
                      </div>
                      <h3 className="relative arc-display font-bold text-lg text-white mt-4 uppercase tracking-wide">{s.name}</h3>
                      <p className="relative text-sm text-[#a4a4ae] mt-1">{s.desc}</p>
                      <div className="relative mt-4 flex items-center justify-between">
                        {s.locked ? (
                          <span className="arc-display text-[10px] tracking-[0.2em] text-[#8a8a94] flex items-center gap-1.5"><Lock className="w-3 h-3" aria-hidden />LVL {s.level} to unlock</span>
                        ) : (
                          <span className="arc-display text-[10px] tracking-[0.2em] text-[#ff4d66] flex items-center gap-1.5"><Play className="w-3 h-3 fill-current" aria-hidden />Play now</span>
                        )}
                        <ChevronsRight className="w-4 h-4 text-[#8a8a94] group-hover:text-[#ff4d66] group-hover:translate-x-1 transition-all" aria-hidden />
                      </div>
                    </Frame>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Badge collection ───────────────────────────────────────────── */}
        <section id="badges" className="py-24 relative scroll-mt-16">
          <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 30%, rgb(255 26 60 / 0.1), transparent 60%)" }} />
          <div className="container relative">
            <ArcHeader tag="Collect the set" title="14+ badges." accent="Flex the rare ones." sub="Every badge is proof you actually learned the thing. Common to Legendary, earned only by playing." />
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {BADGES.map((b, i) => {
                const r = RARITY[b.rarity];
                return (
                  <li key={b.name}>
                    <Reveal delay={i * 0.05} className="h-full">
                      <Frame tone={r.tone} className="h-full transition-transform duration-200 hover:-translate-y-1" inner={`arc-holo ${b.rarity === "legendary" ? "is-animated" : ""} p-4 flex flex-col items-center text-center`}>
                        <span className={`arc-display text-[9px] tracking-[0.25em] uppercase ${r.text}`}>{r.label}</span>
                        <span className={`relative mt-4 w-20 h-20 flex items-center justify-center rounded-full border ${
                          b.rarity === "common" ? "border-[#3a3a42] bg-white/[0.03]" : b.rarity === "rare" ? "border-[#c0c0c0]/50 bg-white/[0.05]" : "border-[#ff1a3c]/60 bg-[#ff1a3c]/10 shadow-[0_0_24px_rgb(255_26_60/0.4)]"
                        }`}>
                          <b.icon className={`w-9 h-9 ${b.rarity === "common" || b.rarity === "rare" ? "text-[#dcdce2]" : "text-[#ff4d66]"}`} aria-hidden />
                        </span>
                        <h3 className="arc-display font-bold text-sm text-white uppercase tracking-wide mt-4 leading-tight">{b.name}</h3>
                        <p className="text-xs text-[#a4a4ae] mt-1.5">{b.hint}</p>
                      </Frame>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
            <p className="mt-8 text-xs text-[#8a8a94] max-w-2xl">
              Badges are in-app achievements. They aren't NFTs or tokens, and they have no monetary value.
            </p>
          </div>
        </section>

        {/* ── Worlds (three-layer ecosystem) ─────────────────────────────── */}
        <section className="py-24">
          <div className="container">
            <ArcHeader tag="The universe" title="Three worlds." accent="You're in World 02." sub="NodalWaves is built in three layers. Quest lives in Engagement, so you learn the Foundation before you ever take part in it." />
            <ol className="grid md:grid-cols-3 gap-4">
              {WORLDS.map((w, i) => (
                <li key={w.n} className="relative">
                  <Reveal delay={i * 0.07} className="h-full">
                    {w.here && (
                      <span className="arc-chip absolute -top-3 left-5 z-10 !bg-[#ff1a3c] !text-[#0a0a0c] !border-[#ff1a3c]">You are here</span>
                    )}
                    <Frame tone={w.here ? "hot" : "default"} className="h-full" inner="p-6">
                      <div className="arc-display text-[10px] tracking-[0.3em] text-[#8a8a94]">WORLD {w.n}</div>
                      <h3 className={`arc-display font-black text-2xl uppercase mt-2 ${w.here ? "arc-neon" : "arc-chrome"}`}>{w.name}</h3>
                      <p className="text-sm text-[#a4a4ae] mt-2">{w.desc}</p>
                      <ul className="flex flex-wrap gap-2 mt-5">
                        {w.items.map((it) => (
                          <li key={it} className={`text-xs px-2.5 py-1 border ${w.here ? "border-[#ff1a3c]/50 text-white bg-[#ff1a3c]/10" : "border-[#2e2e36] text-[#c0c0c0]"}`}>{it}</li>
                        ))}
                      </ul>
                    </Frame>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Arcade cabinets ────────────────────────────────────────────── */}
        <section id="games" className="py-24 relative scroll-mt-16">
          <div className="container">
            <ArcHeader tag="Arcade" title="Short rounds." accent="Big XP." sub="Three mini-games that take a couple of minutes each. Perfect for the bus ride." />
            <div className="grid md:grid-cols-3 gap-5">
              {CABINETS.map((c, i) => (
                <Reveal key={c.name} delay={i * 0.07}>
                  <Frame tone="default" className="h-full" inner="p-5 flex flex-col">
                    <div className="relative aspect-[16/10] overflow-hidden border border-[#2a2a31] bg-[#0b0b0e] flex items-center justify-center">
                      <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgb(255_255_255/0.05)_0_1px,transparent_1px_3px)]" />
                      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 55%, rgb(255 26 60 / 0.35), transparent 60%)" }} />
                      <c.icon className="relative w-14 h-14 text-[#ff4d66] drop-shadow-[0_0_14px_rgb(255_26_60/0.9)]" aria-hidden />
                      <span className="absolute top-2 left-2 arc-display text-[9px] tracking-[0.25em] text-[#a4a4ae]">P1 READY</span>
                      <span className="absolute top-2 right-2 arc-chip !shadow-none !py-0.5">{c.xp}</span>
                    </div>
                    <h3 className="arc-display font-black text-xl text-white uppercase mt-5 tracking-wide">{c.name}</h3>
                    <p className="arc-display text-[10px] tracking-[0.25em] text-[#ff4d66] uppercase mt-1">{c.tag}</p>
                    <dl className="mt-5 space-y-2 flex-1">
                      {c.stats.map(([k, v]) => (
                        <div key={k} className="grid grid-cols-[64px_1fr] items-center gap-3">
                          <dt className="arc-display text-[9px] tracking-[0.2em] text-[#a4a4ae] uppercase">{k}</dt>
                          <dd><Seg value={v} /><span className="sr-only">{v} out of 10</span></dd>
                        </div>
                      ))}
                    </dl>
                    <button type="button" onClick={handleStart} className="arc-btn-alt arc-focus w-full mt-6">
                      <span className="arc-btn-alt-face"><span className="arc-btn-alt-in"><Play className="w-3.5 h-3.5 fill-current" aria-hidden />Play {c.name}</span></span>
                    </button>
                  </Frame>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── High scores ────────────────────────────────────────────────── */}
        <section id="leaderboard" className="py-24 scroll-mt-16">
          <div className="container grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
            <Reveal>
              <p className="arc-display text-xs tracking-[0.3em] text-[#ff4d66] flex items-center gap-2 uppercase">
                <ChevronsRight className="w-4 h-4" aria-hidden />High scores
              </p>
              <h2 className="arc-display font-black uppercase text-3xl sm:text-4xl md:text-5xl leading-[1.08] mt-3 text-balance">
                <span className="arc-chrome">Top the board.</span> <span className="arc-neon">Get known.</span>
              </h2>
              <p className="text-[#a4a4ae] text-lg mt-4 text-pretty">
                The global board tracks XP, stages cleared, and streaks. Top players get community shout-outs and
                event access.
              </p>
              <ol className="mt-8 space-y-3">
                {[["Learn", "to qualify", BookOpen], ["Compete", "to win", Trophy], ["Educate", "to grow", Users]].map(([a, b, Icon]) => {
                  const I = Icon as typeof Star;
                  return (
                    <li key={a as string} className="flex items-center gap-4">
                      <span className="w-10 h-10 flex items-center justify-center border border-[#ff1a3c]/50 bg-[#ff1a3c]/10"><I className="w-4 h-4 text-[#ff4d66]" aria-hidden /></span>
                      <span className="arc-display uppercase text-sm tracking-[0.12em]"><span className="text-white font-bold">{a as string}</span> <span className="text-[#a4a4ae]">{b as string}</span></span>
                    </li>
                  );
                })}
              </ol>
              <PrimaryButton onClick={handleStart} className="mt-9">
                <Trophy className="w-4 h-4" aria-hidden />
                Join the board
              </PrimaryButton>
              <p className="text-xs text-[#8a8a94] mt-5">
                Campaign rewards, if any, follow the{" "}
                <Link href="/campaign-rules" className="text-[#ff4d66] underline-offset-2 hover:underline">official campaign rules</Link>{" "}
                and aren't guaranteed.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <Frame tone="hot" inner="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="arc-display font-black text-lg uppercase arc-chrome">High scores</span>
                  <span className="arc-chip is-silver">Sample</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <caption className="sr-only">Sample leaderboard, top five players by XP</caption>
                    <thead>
                      <tr className="arc-display text-[10px] tracking-[0.2em] text-[#8a8a94] uppercase">
                        <th scope="col" className="py-2 pr-3 font-medium">Rank</th>
                        <th scope="col" className="py-2 pr-3 font-medium">Player</th>
                        <th scope="col" className="py-2 pr-3 font-medium text-right">LVL</th>
                        <th scope="col" className="py-2 font-medium text-right">XP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {HIGH_SCORES.map((p) => (
                        <tr key={p.rank} className={`border-t border-[#24242b] ${p.rank === 1 ? "bg-[#ff1a3c]/[0.08]" : ""}`}>
                          <td className="py-3 pr-3">
                            <span className={`arc-display font-black text-sm ${p.rank === 1 ? "arc-neon" : "text-[#c0c0c0]"}`}>
                              {p.rank === 1 ? <span className="inline-flex items-center gap-1.5"><Crown className="w-4 h-4" aria-hidden />1ST</span> : `${p.rank}${p.rank === 2 ? "ND" : p.rank === 3 ? "RD" : "TH"}`}
                            </span>
                          </td>
                          <td className="py-3 pr-3 font-semibold text-white">{p.name}</td>
                          <td className="py-3 pr-3 text-right arc-display text-sm text-[#a4a4ae]">{p.level}</td>
                          <td className="py-3 text-right arc-display font-bold text-sm text-white">{p.xp.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-[#8a8a94] text-center mt-4">Sample data. Join to see live rankings.</p>
              </Frame>
            </Reveal>
          </div>
        </section>

        {/* ── Season track (roadmap) ─────────────────────────────────────── */}
        <section id="season" className="py-24 relative scroll-mt-16">
          <div className="container">
            <ArcHeader tag="Season track" title="Season 01 is live." accent="Here's what drops next." />
            <div aria-hidden className="hidden lg:block relative h-2 mb-8 bg-[#1c1c22]">
              <div className="absolute inset-y-0 left-0 w-[12%] bg-[#ff1a3c] shadow-[0_0_14px_rgb(255_26_60/0.8)]" />
              <div className="absolute inset-0 grid grid-cols-5">
                {SEASONS.map((s, i) => (
                  <span key={s.s} className="relative">
                    <span className={`absolute left-[10%] top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 border-2 ${i === 0 ? "bg-[#ff1a3c] border-[#ff1a3c]" : "bg-[#08080a] border-[#4a4a52]"}`} />
                  </span>
                ))}
              </div>
            </div>
            <ol className="grid gap-4 lg:grid-cols-5">
              {SEASONS.map((s, i) => (
                <li key={s.s}>
                  <Reveal delay={i * 0.06} className="h-full">
                    <Frame tone={i === 0 ? "hot" : "default"} className="h-full" inner="p-5">
                      <div className="flex items-center justify-between">
                        <span className={`arc-display font-black text-2xl ${i === 0 ? "arc-neon" : "arc-outline"}`}>{s.s}</span>
                        <span className={`arc-chip !shadow-none ${i === 0 ? "" : "is-silver"}`}>{s.status}</span>
                      </div>
                      <h3 className="arc-display font-bold uppercase text-sm tracking-wide text-white mt-4">{s.title}</h3>
                      <ul className="mt-3 space-y-1.5">
                        {s.items.map((it) => (
                          <li key={it} className="flex items-start gap-2 text-sm text-[#a4a4ae]">
                            <span aria-hidden className={`mt-1.5 w-1.5 h-1.5 rotate-45 shrink-0 ${i === 0 ? "bg-[#ff1a3c]" : "bg-[#4a4a52]"}`} />
                            {it}
                          </li>
                        ))}
                      </ul>
                    </Frame>
                  </Reveal>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-xs text-[#8a8a94] max-w-3xl">
              Seasons are indicative and may change with beta feedback. XP, badges, ranks, and season features aren't
              financial instruments and don't represent token rewards or financial return.
            </p>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────────────────── */}
        <section className="relative py-28 overflow-hidden text-center border-t border-[#ff1a3c]/25">
          <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 100%, rgb(255 26 60 / 0.3), transparent 60%)" }} />
          <div aria-hidden className="arc-floor" />
          <div className="container relative">
            <Reveal>
              <p className="arc-display text-xs tracking-[0.4em] text-[#a4a4ae] uppercase">Player 1</p>
              <h2 className="arc-display font-black uppercase text-5xl sm:text-7xl md:text-8xl leading-none mt-5">
                <Glitch text="Game on." tone="neon" />
              </h2>
              <p className="text-[#b8b8c2] text-lg max-w-xl mx-auto mt-6 text-pretty">
                Stage 01 takes about five minutes. Your streak starts today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <PrimaryButton onClick={handleStart}>
                  <Play className="w-4 h-4 fill-current" aria-hidden />
                  Press start
                </PrimaryButton>
                <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="arc-btn-alt arc-focus">
                  <span className="arc-btn-alt-face"><span className="arc-btn-alt-in"><Users className="w-4 h-4" aria-hidden />Join the squad</span></span>
                </a>
              </div>
              <p className="arc-display text-[10px] tracking-[0.3em] text-[#8a8a94] uppercase mt-10">Power the next wave</p>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#24242b] bg-[#0b0b0e] py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-3">
                <NWQLogo compact iconSize={30} />
                <span className="arc-chip">Arcade</span>
              </div>
              <p className="text-sm text-[#a4a4ae] mt-4">The gamified learning layer of the NodalWaves ecosystem.</p>
              <div className="flex gap-2 mt-5">
                {[
                  { href: "https://www.youtube.com/@Nodalwaves", label: "NodalWaves on YouTube", icon: Youtube },
                  { href: "https://t.me/Nodalwaves", label: "NodalWaves on Telegram", icon: Send },
                  { href: "https://www.instagram.com/nodalwaves", label: "NodalWaves on Instagram", icon: Instagram },
                ].map((s) => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="arc-focus w-11 h-11 flex items-center justify-center border border-[#2e2e36] text-[#a4a4ae] hover:text-white hover:border-[#ff1a3c]/60 transition-colors">
                    <s.icon className="w-4 h-4" aria-hidden />
                  </a>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              {[
                { title: "Play", links: [["#stages", "Stages"], ["#games", "Mini-games"], ["#badges", "Badges"], ["/challenge", "7-Day Challenge"]] },
                { title: "Compete", links: [["/leaderboard", "Leaderboard"], ["#season", "Season track"], ["/", "Classic view"]] },
                { title: "Legal", links: [["/disclaimer", "Risk disclaimer"], ["/campaign-rules", "Campaign rules"]] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="arc-display text-[10px] tracking-[0.3em] uppercase text-[#8a8a94] mb-3">{col.title}</h4>
                  <ul className="space-y-2">
                    {col.links.map(([href, label]) => (
                      <li key={label}>
                        {href.startsWith("#") ? (
                          <a href={href} className="text-[#b8b8c2] hover:text-white transition-colors">{label}</a>
                        ) : (
                          <Link href={href} className="text-[#b8b8c2] hover:text-white transition-colors">{label}</Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-[#24242b] mt-10 pt-6 flex flex-col md:flex-row gap-3 justify-between text-xs text-[#8a8a94]">
            <p className="arc-display tracking-[0.15em] uppercase">© 2026 NodalWaves Quest · Arcade edition</p>
            <p className="max-w-xl md:text-right">
              XP, badges, and ranks don't represent token rewards or financial return. Crypto participation involves
              risk. Learn before you take part.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
