import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { NWQLogo } from "@/components/NWQIcon";
import { ArrowLeft, Zap, Target, Shield, Play, Clock, CheckCircle2, XCircle, Info } from "lucide-react";
import { toast } from "sonner";

// ─── Mini-Games Hub ────────────────────────────────────────────────────────────
export function MiniGamesHub() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated) { window.location.href = "/login"; return null; }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Back to Dashboard">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <NWQLogo compact iconSize={26} responsive />
        </div>
      </nav>

      <div className="container py-8 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-3xl md:text-4xl text-gradient-red mb-2">Skill Challenges</h1>
          <p className="text-muted-foreground text-sm md:text-base">Play mini-games to earn bonus XP and sharpen your Web3 skills</p>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground bg-muted/30 rounded-lg px-4 py-2 max-w-sm mx-auto">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Each game awards XP once per day. Practice anytime — XP resets daily.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: "Node Charge",
              subtitle: "Tapping Mission",
              desc: "Tap rapidly to charge the node before time runs out. Earn XP based on your speed.",
              color: "#38A169",
              xp: "+75 XP / day",
              path: "/mini-games/node-charge",
              emoji: "⚡",
            },
            {
              name: "Timed Quiz Battle",
              subtitle: "Speed Knowledge",
              desc: "Answer Web3 questions under time pressure. Score big for maximum XP.",
              color: "#3182CE",
              xp: "+100 XP / day",
              path: "/mini-games/quiz-battle",
              emoji: "🎯",
            },
            {
              name: "Scam Detector",
              subtitle: "Security Mission",
              desc: "Identify real vs fake Web3 scenarios. Protect yourself and earn security XP.",
              color: "#E53E3E",
              xp: "+75 XP / day",
              path: "/mini-games/scam-detector",
              emoji: "🛡️",
            },
          ].map((game) => (
            <div
              key={game.name}
              className="card-nw p-6 text-center group cursor-pointer hover:border-primary/50 transition-all animate-fade-in-up"
              onClick={() => navigate(game.path)}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-4xl"
                style={{ backgroundColor: `${game.color}20`, border: `2px solid ${game.color}40` }}
              >
                {game.emoji}
              </div>
              <div
                className="inline-block text-xs font-display font-bold px-3 py-1 rounded-full mb-3"
                style={{ backgroundColor: `${game.color}20`, color: game.color }}
              >
                {game.xp}
              </div>
              <h3 className="font-display font-bold text-lg mb-1 text-foreground">{game.name}</h3>
              <p className="text-xs text-muted-foreground mb-3 font-display">{game.subtitle}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{game.desc}</p>
              <Button
                className="w-full font-display text-sm"
                style={{ backgroundColor: `${game.color}20`, color: game.color, border: `1px solid ${game.color}40` }}
                variant="outline"
              >
                <Play className="w-4 h-4 mr-2" />
                Play Now
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Node Charge Game ─────────────────────────────────────────────────────────
export function NodeChargeGame() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [gameState, setGameState] = useState<"idle" | "playing" | "done">("idle");
  const [charge, setCharge] = useState(0);
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [alreadyPlayedToday, setAlreadyPlayedToday] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Use ref to track final taps count to avoid stale closure in useEffect
  const tapsRef = useRef(0);
  // Track whether the timer has been started by the first tap
  const timerStartedRef = useRef(false);
  const utils = trpc.useUtils();

  const saveScore = trpc.miniGames.saveScore.useMutation({
    onSuccess: (data) => {
      if (data.alreadyPlayedToday) {
        setAlreadyPlayedToday(true);
        toast.info("You already earned XP from Node Charge today. Play again tomorrow for more XP!");
      } else {
        toast.success(`Node Charge complete! +${data.xpEarned} XP earned!`);
      }
      utils.profile.xpInfo.invalidate();
    },
    onError: () => {
      setSaveError("Failed to save your score. Please check your connection and try again.");
    },
  });

  const startGame = () => {
    setCharge(0);
    setTaps(0);
    tapsRef.current = 0;
    timerStartedRef.current = false;
    setTimeLeft(15);
    setSaveError(null);
    setAlreadyPlayedToday(false);
    // Clear any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGameState("playing");
  };

  const startTimerOnFirstTap = () => {
    if (timerStartedRef.current) return;
    timerStartedRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
  };

  // Watch timeLeft: when it hits 0 during playing, end the game
  useEffect(() => {
    if (gameState === "playing" && timeLeft === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setGameState("done");
    }
  }, [timeLeft, gameState]);

  // Save score when game ends — use ref to get accurate final taps count
  useEffect(() => {
    if (gameState === "done") {
      const finalTaps = tapsRef.current;
      if (finalTaps > 0) {
        const xp = Math.min(75, Math.floor(finalTaps * 1.5));
        saveScore.mutate({ gameType: "node_charge", score: finalTaps, xpEarned: xp });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleTap = useCallback((e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if (gameState !== "playing") return;
    // Start timer on first tap
    startTimerOnFirstTap();
    let x = 0, y = 0;
    if ("clientX" in e) {
      const rect = e.currentTarget.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else if (e.touches[0]) {
      const rect = e.currentTarget.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    }
    const newRipple = { id: Date.now(), x, y };
    setRipples(r => [...r.slice(-5), newRipple]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== newRipple.id)), 600);
    tapsRef.current += 1;
    setTaps(t => t + 1);
    setCharge(c => Math.min(100, c + 2));
  }, [gameState]);

  if (!isAuthenticated) { window.location.href = "/login"; return null; }

  const finalTaps = tapsRef.current || taps;
  const finalXp = Math.min(75, Math.floor(finalTaps * 1.5));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <button onClick={() => navigate("/mini-games")} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Back to Mini-Games">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-400" />
            <span className="font-display font-bold text-base" style={{ color: "#38A169" }}>Node Charge</span>
          </div>
        </div>
      </nav>

      <div className="container py-8 max-w-md mx-auto text-center">
        {gameState === "idle" && (
          <div className="card-nw p-8 animate-fade-in-up">
            <div className="text-6xl mb-4">⚡</div>
            <h2 className="font-display font-black text-3xl mb-1" style={{ color: "#38A169" }}>Node Charge</h2>
            <p className="text-xs font-display text-muted-foreground mb-5">Tapping Mission</p>

            {/* How to Play */}
            <div className="bg-muted/30 border border-border rounded-xl p-4 mb-5 text-left">
              <h3 className="font-display font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-green-400" />
                How to Play
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-green-400/20 text-green-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  Tap or click the glowing node button as fast as you can.
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-green-400/20 text-green-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  The timer starts on your first tap — you have 15 seconds.
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-green-400/20 text-green-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  A higher tap count earns more XP — up to +75 XP per day.
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-green-400/20 text-green-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                  You can earn XP once per day from this mini-game. Practice anytime!
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="card-nw p-3 text-center">
                <div className="font-display font-black text-2xl text-foreground">15s</div>
                <div className="text-xs text-muted-foreground">Time Limit</div>
              </div>
              <div className="card-nw p-3 text-center">
                <div className="font-display font-black text-2xl" style={{ color: "#38A169" }}>+75 XP</div>
                <div className="text-xs text-muted-foreground">Max / Day</div>
              </div>
            </div>

            <Button onClick={startGame} className="w-full font-display font-bold text-lg py-6" style={{ backgroundColor: "#38A169", color: "white" }}>
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div className="font-display font-bold text-lg text-foreground">Taps: {taps}</div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className={`font-display font-black text-2xl ${taps === 0 ? "text-muted-foreground" : timeLeft <= 5 ? "text-primary animate-pulse" : "text-foreground"}`}>
                  {taps === 0 ? "15s" : `${timeLeft}s`}
                </span>
              </div>
            </div>

            {/* Charge bar */}
            <div className="h-4 bg-muted rounded-full overflow-hidden mb-6">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${charge}%`, background: "linear-gradient(90deg, #38A169, #68D391)" }}
              />
            </div>

            {/* Tap button — supports both mouse and touch */}
            <button
              onClick={handleTap}
              onTouchStart={handleTap}
              className="relative w-48 h-48 rounded-full mx-auto block overflow-hidden select-none"
              style={{
                background: "radial-gradient(circle, #38A16920, #38A16940)",
                border: "4px solid #38A16960",
                boxShadow: `0 0 ${20 + charge / 2}px #38A16960`,
                touchAction: "manipulation",
              }}
              aria-label="Tap to charge"
            >
              <Zap className="w-20 h-20 mx-auto text-green-400 pointer-events-none" style={{ filter: "drop-shadow(0 0 10px #38A169)" }} />
              {ripples.map(r => (
                <span
                  key={r.id}
                  className="absolute rounded-full animate-tap-ripple pointer-events-none"
                  style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40, border: "2px solid #38A169" }}
                />
              ))}
            </button>
            <p className="text-muted-foreground text-sm mt-4 font-display animate-pulse">
              {taps === 0 ? "👆 TAP TO START — TIMER BEGINS ON FIRST TAP" : "TAP FAST!"}
            </p>
          </div>
        )}

        {gameState === "done" && (
          <div className="card-nw p-8 animate-level-up">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="font-display font-black text-3xl mb-2" style={{ color: "#38A169" }}>
              {finalTaps >= 30 ? "Node Fully Charged!" : finalTaps >= 15 ? "Good Charge!" : "Keep Practicing!"}
            </h2>
            {alreadyPlayedToday && (
              <div className="bg-muted/50 border border-border rounded-lg px-4 py-2 mb-4 text-xs text-muted-foreground">
                You already earned XP from Node Charge today. Come back tomorrow for more XP!
              </div>
            )}
            {saveError && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 mb-4 text-xs text-primary">
                {saveError}
              </div>
            )}
            {saveScore.isPending && (
              <div className="text-xs text-muted-foreground mb-4 animate-pulse">Saving your score...</div>
            )}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card-nw p-4 text-center">
                <div className="font-display font-black text-3xl text-foreground">{finalTaps}</div>
                <div className="text-xs text-muted-foreground">Total Taps</div>
              </div>
              <div className="card-nw p-4 text-center">
                <div className="font-display font-black text-3xl text-gradient-gold">
                  {alreadyPlayedToday ? "0" : `+${finalXp}`}
                </div>
                <div className="text-xs text-muted-foreground">XP Earned</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={startGame} variant="outline" className="flex-1 border-border font-display">Play Again</Button>
              <Button onClick={() => navigate("/mini-games")} className="flex-1 font-display font-bold" style={{ backgroundColor: "#38A169", color: "white" }}>Done</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Timed Quiz Battle ────────────────────────────────────────────────────────
const QUIZ_BATTLE_QUESTIONS = [
  { q: "What does NWS stand for in the NodeWaves ecosystem?", options: ["NodeWaves System", "NodeWaves Token", "Network Web Service", "Node Wallet System"], correct: 1 },
  { q: "What is staking in Web3?", options: ["Selling tokens quickly", "Locking tokens to support network operations", "Mining new tokens", "Transferring tokens between wallets"], correct: 1 },
  { q: "What should you NEVER share with anyone?", options: ["Your username", "Your wallet address", "Your seed phrase / private key", "Your transaction history"], correct: 2 },
  { q: "What is a Lite Node in NodeWaves?", options: ["A lightweight participation node", "A mobile app", "A type of staking pool", "A wallet type"], correct: 0 },
  { q: "What is a rug pull in Web3?", options: ["A network upgrade", "A project that raises funds then abandons", "A type of staking reward", "A wallet security feature"], correct: 1 },
  { q: "What does the NodeWaves Treasury support?", options: ["Only team salaries", "Long-term development and community programs", "Token burning only", "External investments"], correct: 1 },
  { q: "What is a Founder Node?", options: ["A basic wallet", "A higher-tier participation node", "A type of token", "A governance vote"], correct: 1 },
  { q: "Which is a red flag for a Web3 scam?", options: ["Clear documentation", "Guaranteed risk-free returns", "Verified team members", "Open source code"], correct: 1 },
];

export function QuizBattleGame() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [gameState, setGameState] = useState<"idle" | "playing" | "done">("idle");
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(8);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [alreadyPlayedToday, setAlreadyPlayedToday] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Use ref to track score to avoid stale closure on final question
  const scoreRef = useRef(0);
  const utils = trpc.useUtils();

  const saveScore = trpc.miniGames.saveScore.useMutation({
    onSuccess: (data) => {
      if (data.alreadyPlayedToday) {
        setAlreadyPlayedToday(true);
        toast.info("You already earned XP from Quiz Battle today. Play again tomorrow for more XP!");
      } else {
        toast.success(`Quiz Battle done! +${data.xpEarned} XP!`);
      }
      utils.profile.xpInfo.invalidate();
    },
    onError: () => {
      setSaveError("Failed to save your score. Please check your connection and try again.");
    },
  });

  const questions = QUIZ_BATTLE_QUESTIONS.slice(0, 5);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearTimer();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  // When timeLeft hits 0 during playing, auto-advance
  useEffect(() => {
    if (gameState !== "playing" || timeLeft > 0) return;
    // Time ran out — treat as wrong answer
    handleAnswer(-1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, gameState]);

  const startGame = () => {
    setCurrentQ(0);
    setScore(0);
    scoreRef.current = 0;
    setSelected(null);
    setTimeLeft(8);
    setSaveError(null);
    setAlreadyPlayedToday(false);
    setGameState("playing");
    startTimer();
  };

  const handleAnswer = useCallback((idx: number) => {
    if (selected !== null) return; // prevent double-submit
    clearTimer();
    setSelected(idx);

    const isCorrect = idx === questions[currentQ]?.correct;
    if (isCorrect) {
      scoreRef.current += 1;
      setScore(s => s + 1);
    }

    setTimeout(() => {
      const next = currentQ + 1;
      if (next < questions.length) {
        setCurrentQ(next);
        setSelected(null);
        setTimeLeft(8);
        startTimer();
      } else {
        // Use ref for accurate final score (avoids stale closure)
        const finalScore = scoreRef.current;
        const xp = Math.round((finalScore / questions.length) * 100);
        setGameState("done");
        saveScore.mutate({ gameType: "quiz_battle", score: finalScore, xpEarned: xp });
      }
    }, 1200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, currentQ, questions, startTimer]);

  useEffect(() => () => clearTimer(), []);

  if (!isAuthenticated) { window.location.href = "/login"; return null; }

  const q = questions[currentQ];
  const finalScore = scoreRef.current;
  const displayXp = Math.round((finalScore / questions.length) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <button onClick={() => navigate("/mini-games")} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Back to Mini-Games">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="font-display font-bold text-base" style={{ color: "#3182CE" }}>Timed Quiz Battle</span>
          </div>
        </div>
      </nav>

      <div className="container py-8 max-w-lg mx-auto">
        {gameState === "idle" && (
          <div className="card-nw p-8 text-center animate-fade-in-up">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="font-display font-black text-3xl mb-1" style={{ color: "#3182CE" }}>Timed Quiz Battle</h2>
            <p className="text-xs font-display text-muted-foreground mb-5">Speed Knowledge Challenge</p>

            {/* How to Play */}
            <div className="bg-muted/30 border border-border rounded-xl p-4 mb-5 text-left">
              <h3 className="font-display font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" style={{ color: "#3182CE" }} />
                How to Play
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: "#3182CE20", color: "#3182CE" }}>1</span>
                  Answer 5 Web3 questions before the timer runs out.
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: "#3182CE20", color: "#3182CE" }}>2</span>
                  Each question has an 8-second countdown — answer quickly!
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: "#3182CE20", color: "#3182CE" }}>3</span>
                  Correct answers increase your score. More correct = more XP.
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: "#3182CE20", color: "#3182CE" }}>4</span>
                  You can earn XP once per day from this mini-game. Practice anytime!
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="card-nw p-3 text-center">
                <div className="font-display font-black text-2xl text-foreground">5 Qs</div>
                <div className="text-xs text-muted-foreground">8s Each</div>
              </div>
              <div className="card-nw p-3 text-center">
                <div className="font-display font-black text-2xl" style={{ color: "#3182CE" }}>+100 XP</div>
                <div className="text-xs text-muted-foreground">Max / Day</div>
              </div>
            </div>

            <Button onClick={startGame} className="w-full font-display font-bold text-lg py-6" style={{ backgroundColor: "#3182CE", color: "white" }}>
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          </div>
        )}

        {gameState === "playing" && q && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-display text-muted-foreground">Q {currentQ + 1}/{questions.length}</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: timeLeft <= 3 ? "#E53E3E" : "#3182CE" }} />
                <span className="font-display font-black text-2xl" style={{ color: timeLeft <= 3 ? "#E53E3E" : "#3182CE" }}>{timeLeft}s</span>
              </div>
              <span className="text-xs font-display text-muted-foreground">Score: {score}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-5">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(timeLeft / 8) * 100}%`, backgroundColor: timeLeft <= 3 ? "#E53E3E" : "#3182CE" }} />
            </div>
            <div className="card-nw p-5 mb-4">
              <h3 className="font-display font-bold text-base md:text-lg text-foreground mb-5 leading-snug">{q.q}</h3>
              <div className="space-y-3">
                {q.options.map((opt, i) => {
                  let cls = "w-full p-3 rounded-xl border-2 text-left font-display font-semibold text-sm transition-all ";
                  if (selected === null) cls += "border-border bg-muted/30 hover:border-blue-400/50 active:scale-[0.98] text-foreground";
                  else if (i === q.correct) cls += "border-green-400 bg-green-400/20 text-green-400";
                  else if (i === selected && i !== q.correct) cls += "border-primary bg-primary/20 text-primary";
                  else cls += "border-border bg-muted/20 text-muted-foreground";
                  return (
                    <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null} className={cls} style={{ touchAction: "manipulation" }}>
                      <span className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-black flex-shrink-0">{String.fromCharCode(65 + i)}</span>
                        <span className="flex-1 text-left">{opt}</span>
                        {selected !== null && i === q.correct && <CheckCircle2 className="w-4 h-4 ml-auto text-green-400 flex-shrink-0" />}
                        {selected === i && i !== q.correct && <XCircle className="w-4 h-4 ml-auto text-primary flex-shrink-0" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            {selected !== null && (
              <p className="text-xs text-center text-muted-foreground animate-fade-in-up">
                {selected === q.correct ? "✅ Correct!" : selected === -1 ? "⏱ Time's up!" : "❌ Wrong answer"} — Next question coming up...
              </p>
            )}
          </div>
        )}

        {gameState === "done" && (
          <div className="card-nw p-8 text-center animate-level-up">
            <div className="text-5xl mb-4">{finalScore >= 4 ? "🏆" : finalScore >= 2 ? "🎯" : "📚"}</div>
            <h2 className="font-display font-black text-3xl mb-2" style={{ color: "#3182CE" }}>Battle Complete!</h2>
            <p className="text-muted-foreground text-sm mb-4">
              {finalScore >= 4 ? "Excellent! You're a Web3 knowledge champion!" : finalScore >= 2 ? "Good effort! Keep learning to score higher." : "Keep studying the NodeWaves ecosystem!"}
            </p>
            {alreadyPlayedToday && (
              <div className="bg-muted/50 border border-border rounded-lg px-4 py-2 mb-4 text-xs text-muted-foreground">
                You already earned XP from Quiz Battle today. Come back tomorrow for more XP!
              </div>
            )}
            {saveError && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 mb-4 text-xs text-primary">
                {saveError}
              </div>
            )}
            {saveScore.isPending && (
              <div className="text-xs text-muted-foreground mb-4 animate-pulse">Saving your score...</div>
            )}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card-nw p-4 text-center">
                <div className="font-display font-black text-3xl text-foreground">{finalScore}/{questions.length}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="card-nw p-4 text-center">
                <div className="font-display font-black text-3xl text-gradient-gold">
                  {alreadyPlayedToday ? "0" : `+${displayXp}`}
                </div>
                <div className="text-xs text-muted-foreground">XP Earned</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={startGame} variant="outline" className="flex-1 border-border font-display">Play Again</Button>
              <Button onClick={() => navigate("/mini-games")} className="flex-1 font-display font-bold" style={{ backgroundColor: "#3182CE", color: "white" }}>Done</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Scam Detector ────────────────────────────────────────────────────────────
const SCAM_SCENARIOS = [
  { scenario: "A stranger DMs you: 'Send 0.1 ETH to this address and get 1 ETH back guaranteed!'", isScam: true, explanation: "This is a classic doubling scam. No legitimate service guarantees returns like this." },
  { scenario: "NodeWaves official website asks you to connect your wallet to check your balance.", isScam: false, explanation: "Connecting your wallet to official dApps is normal. Always verify the URL is correct first." },
  { scenario: "A 'NodeWaves admin' in Telegram asks for your seed phrase to 'verify your account'.", isScam: true, explanation: "No legitimate team member will ever ask for your seed phrase. This is a phishing attempt." },
  { scenario: "You receive an airdrop notification asking you to approve a contract to claim tokens.", isScam: true, explanation: "Fake airdrop approvals can drain your wallet. Always research before approving contracts." },
  { scenario: "A project promises 500% APY with zero risk on their new DeFi platform.", isScam: true, explanation: "Guaranteed high returns with zero risk is a classic scam red flag. No investment is risk-free." },
  { scenario: "You buy NWS tokens from a verified exchange listed on the official NodeWaves website.", isScam: false, explanation: "Purchasing from verified, official exchanges is the safe way to acquire tokens." },
  { scenario: "Someone offers to 'help' you recover lost crypto if you give them your private key.", isScam: true, explanation: "No one can recover crypto without your private key — and asking for it is always a scam." },
  { scenario: "You read the official NodeWaves whitepaper before deciding to participate.", isScam: false, explanation: "Reading official documentation is responsible behavior. Always research before participating." },
];

export function ScamDetectorGame() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [gameState, setGameState] = useState<"idle" | "playing" | "done">("idle");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [alreadyPlayedToday, setAlreadyPlayedToday] = useState(false);
  // Use ref to track score to avoid stale closure on final scenario
  const scoreRef = useRef(0);
  const utils = trpc.useUtils();

  const saveScore = trpc.miniGames.saveScore.useMutation({
    onSuccess: (data) => {
      if (data.alreadyPlayedToday) {
        setAlreadyPlayedToday(true);
        toast.info("You already earned XP from Scam Detector today. Play again tomorrow for more XP!");
      } else {
        toast.success(`Scam Detector done! +${data.xpEarned} XP!`);
      }
      utils.profile.xpInfo.invalidate();
    },
    onError: () => {
      setSaveError("Failed to save your score. Please check your connection and try again.");
    },
  });

  const scenarios = SCAM_SCENARIOS.slice(0, 6);

  const startGame = () => {
    setCurrentIdx(0);
    setScore(0);
    scoreRef.current = 0;
    setAnswered(null);
    setShowExplanation(false);
    setSaveError(null);
    setAlreadyPlayedToday(false);
    setGameState("playing");
  };

  const handleGuess = (guessIsScam: boolean) => {
    if (answered !== null) return; // prevent double-submit
    const correct = guessIsScam === scenarios[currentIdx].isScam;
    setAnswered(correct);
    setShowExplanation(true);
    if (correct) {
      scoreRef.current += 1;
      setScore(s => s + 1);
    }

    setTimeout(() => {
      const next = currentIdx + 1;
      if (next < scenarios.length) {
        setCurrentIdx(next);
        setAnswered(null);
        setShowExplanation(false);
      } else {
        // Use ref for accurate final score
        const finalScore = scoreRef.current;
        const xp = Math.round((finalScore / scenarios.length) * 75);
        setGameState("done");
        saveScore.mutate({ gameType: "scam_detector", score: finalScore, xpEarned: xp });
      }
    }, 2200);
  };

  if (!isAuthenticated) { window.location.href = "/login"; return null; }

  const current = scenarios[currentIdx];
  const finalScore = scoreRef.current;
  const displayXp = Math.round((finalScore / scenarios.length) * 75);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <button onClick={() => navigate("/mini-games")} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Back to Mini-Games">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-base text-gradient-red">Scam Detector</span>
          </div>
        </div>
      </nav>

      <div className="container py-8 max-w-lg mx-auto">
        {gameState === "idle" && (
          <div className="card-nw p-8 text-center animate-fade-in-up">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="font-display font-black text-3xl text-gradient-red mb-1">Scam Detector</h2>
            <p className="text-xs font-display text-muted-foreground mb-5">Security Mission</p>

            {/* How to Play */}
            <div className="bg-muted/30 border border-border rounded-xl p-4 mb-5 text-left">
              <h3 className="font-display font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                How to Play
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  Read each Web3 scenario carefully.
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  Choose whether it is <span className="text-green-400 font-semibold mx-1">✅ Legit</span> or <span className="text-primary font-semibold mx-1">🚨 Scam</span>.
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  After each answer, learn why it is correct or incorrect.
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                  You can earn XP once per day from this mini-game. Practice anytime!
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="card-nw p-3 text-center">
                <div className="font-display font-black text-2xl text-foreground">6</div>
                <div className="text-xs text-muted-foreground">Scenarios</div>
              </div>
              <div className="card-nw p-3 text-center">
                <div className="font-display font-black text-2xl text-gradient-gold">+75 XP</div>
                <div className="text-xs text-muted-foreground">Max / Day</div>
              </div>
            </div>

            <Button onClick={startGame} className="w-full btn-glow bg-primary text-primary-foreground font-display font-bold text-lg py-6">
              <Shield className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          </div>
        )}

        {gameState === "playing" && current && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-display text-muted-foreground">Scenario {currentIdx + 1}/{scenarios.length}</span>
              <span className="text-xs font-display text-muted-foreground">Score: {score}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-5">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentIdx + 1) / scenarios.length) * 100}%` }} />
            </div>

            <div className="card-nw p-5 mb-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 text-lg mt-0.5">📋</div>
                <p className="text-foreground leading-relaxed font-medium text-sm md:text-base">{current.scenario}</p>
              </div>

              {showExplanation && (
                <div className={`p-3 rounded-lg border mt-3 animate-fade-in-up ${answered ? "bg-green-500/10 border-green-500/40" : "bg-primary/10 border-primary/40"}`}>
                  <p className="text-xs leading-relaxed" style={{ color: answered ? "#68D391" : "#FC8181" }}>
                    {answered ? "✅ Correct! " : "❌ Wrong! "}{current.explanation}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleGuess(false)}
                disabled={answered !== null}
                className={`p-5 rounded-xl border-2 font-display font-bold text-base md:text-lg transition-all ${
                  answered !== null ? "opacity-50 cursor-not-allowed" : "hover:border-green-400 hover:bg-green-400/10 active:scale-[0.97]"
                } border-border bg-muted/30 text-foreground`}
                style={{ touchAction: "manipulation" }}
              >
                ✅ Legit
              </button>
              <button
                onClick={() => handleGuess(true)}
                disabled={answered !== null}
                className={`p-5 rounded-xl border-2 font-display font-bold text-base md:text-lg transition-all ${
                  answered !== null ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/10 active:scale-[0.97]"
                } border-border bg-muted/30 text-foreground`}
                style={{ touchAction: "manipulation" }}
              >
                🚨 Scam!
              </button>
            </div>

            {answered !== null && !showExplanation && (
              <p className="text-xs text-center text-muted-foreground mt-3 animate-pulse">Next scenario coming up...</p>
            )}
          </div>
        )}

        {gameState === "done" && (
          <div className="card-nw p-8 text-center animate-level-up">
            <div className="text-5xl mb-4">{finalScore >= 5 ? "🛡️" : finalScore >= 3 ? "🔍" : "📚"}</div>
            <h2 className="font-display font-black text-3xl text-gradient-red mb-2">Mission Complete!</h2>
            <p className="text-muted-foreground text-sm mb-4">
              {finalScore >= 5 ? "Excellent! You're a Web3 security expert!" : finalScore >= 3 ? "Good job! Keep learning to spot more scams." : "Keep studying scam patterns to protect yourself!"}
            </p>
            {alreadyPlayedToday && (
              <div className="bg-muted/50 border border-border rounded-lg px-4 py-2 mb-4 text-xs text-muted-foreground">
                You already earned XP from Scam Detector today. Come back tomorrow for more XP!
              </div>
            )}
            {saveError && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 mb-4 text-xs text-primary">
                {saveError}
              </div>
            )}
            {saveScore.isPending && (
              <div className="text-xs text-muted-foreground mb-4 animate-pulse">Saving your score...</div>
            )}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card-nw p-4 text-center">
                <div className="font-display font-black text-3xl text-foreground">{finalScore}/{scenarios.length}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="card-nw p-4 text-center">
                <div className="font-display font-black text-3xl text-gradient-gold">
                  {alreadyPlayedToday ? "0" : `+${displayXp}`}
                </div>
                <div className="text-xs text-muted-foreground">XP Earned</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={startGame} variant="outline" className="flex-1 border-border font-display">Play Again</Button>
              <Button onClick={() => navigate("/mini-games")} className="flex-1 btn-glow bg-primary text-primary-foreground font-display font-bold">Done</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MiniGamesHub;
