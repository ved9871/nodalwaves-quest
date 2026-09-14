import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation, useParams } from "wouter";
import { getLoginUrl } from "@/const";
import { NWQLogo } from "@/components/NWQIcon";
import { ArrowLeft, Zap, Clock, CheckCircle2, XCircle, Trophy, Target } from "lucide-react";
import { toast } from "sonner";

type QuizState = "intro" | "question" | "result";

export default function QuizPage() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const quizId = parseInt(params.id ?? "1");

  const [state, setState] = useState<QuizState>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState<{ score: number; correct: number; total: number; passed: boolean; xpEarned: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const utils = trpc.useUtils();
  const { data: quiz, isLoading } = trpc.quizzes.get.useQuery({ quizId }, { enabled: !!quizId });

  const submitMutation = trpc.quizzes.submit.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setState("result");
      if (data.newBadges && data.newBadges.length > 0) {
        data.newBadges.forEach((b: { name: string }) => toast.success(`🏆 Badge Unlocked: ${b.name}!`));
      }
      utils.profile.xpInfo.invalidate();
    },
    onError: (err: { message: string }) => toast.error(err.message),
  });

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  if (!isAuthenticated) { window.location.href = "/login"; return null; }
  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );
  if (!quiz) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Quiz not found</p>
    </div>
  );

  const startQuiz = () => {
    setCurrentQ(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setTimeLeft(quiz.timeLimitSeconds);
    setTotalTime(quiz.timeLimitSeconds);
    setStartTime(Date.now());
    setState("question");

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit([...answers, -1]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleAnswer = (answerIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIdx);
    const newAnswers = [...answers, answerIdx];

    setTimeout(() => {
      if (currentQ < quiz.questions.length - 1) {
        setCurrentQ(q => q + 1);
        setSelectedAnswer(null);
        setAnswers(newAnswers);
      } else {
        clearInterval(timerRef.current!);
        handleSubmit(newAnswers);
      }
    }, 800);
  };

  const handleSubmit = (finalAnswers: number[]) => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    submitMutation.mutate({ quizId, answers: finalAnswers, timeTaken });
  };

  const question = quiz.questions[currentQ];
  const timePercent = Math.round((timeLeft / totalTime) * 100);
  const timerColor = timeLeft < 10 ? "#E53E3E" : timeLeft < 20 ? "#D69E2E" : "#38A169";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <button onClick={() => navigate(-1 as any)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <NWQLogo compact iconSize={26} responsive />
        </div>
      </nav>

      <div className="container py-8 max-w-2xl mx-auto">
        {/* Intro */}
        {state === "intro" && (
          <div className="card-nw p-8 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-2xl bg-secondary/20 border border-secondary/40 flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-secondary" />
            </div>
            <h1 className="font-display font-black text-3xl text-gradient-red mb-3">{quiz.title}</h1>
            {quiz.description && <p className="text-muted-foreground mb-6">{quiz.description}</p>}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="card-nw p-3 text-center">
                <div className="font-display font-black text-2xl text-foreground">{quiz.questions.length}</div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
              <div className="card-nw p-3 text-center">
                <div className="font-display font-black text-2xl text-foreground">{quiz.timeLimitSeconds}s</div>
                <div className="text-xs text-muted-foreground">Time Limit</div>
              </div>
              <div className="card-nw p-3 text-center">
                <div className="font-display font-black text-2xl text-gradient-gold">+{quiz.xpReward}</div>
                <div className="text-xs text-muted-foreground">XP Reward</div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border mb-6 text-left">
              <p className="text-xs text-muted-foreground">
                ✅ Pass mark: {quiz.passingScore}% | Answer all questions before time runs out | Perfect score earns +50 bonus XP
              </p>
            </div>
            <Button onClick={startQuiz} className="btn-glow bg-primary text-primary-foreground font-display font-bold w-full text-lg py-6">
              <Zap className="w-5 h-5 mr-2" />
              Start Quiz
            </Button>
          </div>
        )}

        {/* Question */}
        {state === "question" && question && (
          <div className="animate-fade-in-up">
            {/* Timer & progress */}
            <div className="card-nw p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-display">
                  Question {currentQ + 1} of {quiz.questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: timerColor }} />
                  <span className="font-display font-black text-lg" style={{ color: timerColor }}>
                    {timeLeft}s
                  </span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${timePercent}%`, backgroundColor: timerColor }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="card-nw p-6 mb-4">
              <h2 className="font-display font-bold text-xl text-foreground mb-6 leading-relaxed">
                {question.question}
              </h2>

              <div className="space-y-3">
                {(question.options as string[]).map((option, i) => {
                  let btnClass = "w-full p-4 rounded-xl border-2 text-left font-display font-semibold text-sm transition-all ";
                  if (selectedAnswer === null) {
                    btnClass += "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/10 text-foreground";
                  } else if (i === selectedAnswer) {
                    btnClass += "border-primary bg-primary/20 text-primary";
                  } else {
                    btnClass += "border-border bg-muted/20 text-muted-foreground";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={selectedAnswer !== null}
                      className={btnClass}
                    >
                      <span className="inline-flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-black flex-shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {state === "result" && result && (
          <div className="card-nw p-8 text-center animate-fade-in-up">
            <div className="text-5xl mb-4">{result.passed ? "🎉" : "📚"}</div>
            <h2 className="font-display font-black text-3xl mb-2">
              {result.passed ? <span className="text-gradient-gold">Quest Complete!</span> : <span className="text-foreground">Keep Learning!</span>}
            </h2>
            <p className="text-muted-foreground mb-6">
              {result.passed ? "Excellent work! You passed the quiz." : `You need ${quiz.passingScore}% to pass. Try again!`}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="card-nw p-4 text-center">
                <div className="font-display font-black text-3xl text-foreground">{result.score}%</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div className="card-nw p-4 text-center">
                <div className="font-display font-black text-3xl text-green-400">{result.correct}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="card-nw p-4 text-center">
                <div className="font-display font-black text-3xl text-gradient-gold">+{result.xpEarned}</div>
                <div className="text-xs text-muted-foreground">XP Earned</div>
              </div>
            </div>

            {/* Score bar */}
            <div className="mb-8">
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${result.score}%`,
                    background: result.passed
                      ? "linear-gradient(90deg, oklch(0.55 0.22 25), oklch(0.82 0.012 250))"
                      : "oklch(0.60 0.17 145)"
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span className="text-primary font-display">Pass: {quiz.passingScore}%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="flex gap-3">
              {!result.passed && (
                <Button onClick={startQuiz} variant="outline" className="flex-1 border-border font-display">
                  Try Again
                </Button>
              )}
              <Button
                onClick={() => navigate(`/zone/${quiz.zoneId ?? 1}`)}
                className="flex-1 btn-glow bg-primary text-primary-foreground font-display font-bold"
              >
                {result.passed ? "Continue" : "Back to Zone"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
