import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, useParams } from "wouter";
import { getLoginUrl } from "@/const";
import { NWQLogo } from "@/components/NWQIcon";
import {
  ArrowLeft, BookOpen, Zap, CheckCircle2, Clock, ChevronRight, Play, Lock
} from "lucide-react";
import { toast } from "sonner";

export default function ZonePage() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ zoneId: string }>();
  const zoneId = parseInt(params.zoneId ?? "1");

  const { data: zones } = trpc.zones.list.useQuery();
  const { data: lessons, isLoading } = trpc.lessons.byZone.useQuery({ zoneId }, { enabled: !!zoneId });
  const { data: userProgress } = trpc.lessons.userProgress.useQuery(undefined, { enabled: isAuthenticated });
  const { data: quizzes } = trpc.quizzes.byZone.useQuery({ zoneId }, { enabled: !!zoneId });

  const zone = zones?.find(z => z.id === zoneId);
  const completedLessonIds = new Set(userProgress?.map(p => p.lessonId) ?? []);

  if (!isAuthenticated) { window.location.href = "/login"; return null; }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <button onClick={() => navigate("/quests")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <NWQLogo compact iconSize={26} responsive />
        </div>
      </nav>

      <div className="container py-8 max-w-3xl mx-auto">
        {zone && (
          <div className="card-nw p-6 mb-8 border-l-4" style={{ borderLeftColor: zone.color ?? "#E53E3E" }}>
            <h1 className="font-display font-black text-3xl mb-2" style={{ color: zone.color ?? "#E53E3E" }}>
              {zone.name}
            </h1>
            <p className="text-muted-foreground">{zone.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/40 font-display text-xs">
                {lessons?.length ?? 0} Lessons
              </Badge>
              <Badge className="bg-secondary/20 text-secondary border-secondary/40 font-display text-xs">
                {quizzes?.length ?? 0} Quizzes
              </Badge>
              <Badge className="bg-muted text-muted-foreground border-border font-display text-xs">
                Level {zone.requiredLevel}+
              </Badge>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : lessons && lessons.length > 0 ? (
          <div className="space-y-3">
            <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Lessons
            </h2>
            {lessons.map((lesson, i) => {
              const isCompleted = completedLessonIds.has(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                  className={`w-full card-nw p-4 text-left flex items-center gap-4 group transition-all animate-fade-in-up ${
                    isCompleted ? "border-green-500/30" : "hover:border-primary/50"
                  }`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? "bg-green-500/20 border border-green-500/40" : "bg-muted/50 border border-border"
                  }`}>
                    {isCompleted
                      ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                      : <span className="font-display font-bold text-sm text-muted-foreground">{i + 1}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-sm text-foreground mb-0.5">{lesson.title}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-secondary" />
                        +{lesson.xpReward} XP
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~5 min
                      </span>
                    </div>
                  </div>
                  {isCompleted ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/40 font-display text-xs">Done</Badge>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </button>
              );
            })}

            {/* Quizzes */}
            {quizzes && quizzes.length > 0 && (
              <>
                <h2 className="font-display font-bold text-lg text-foreground mt-8 mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-secondary" />
                  Zone Quizzes
                </h2>
                {quizzes.map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="w-full card-nw p-4 text-left flex items-center gap-4 group hover:border-secondary/50 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-secondary/20 border border-secondary/40">
                      <Play className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm text-foreground mb-0.5">{quiz.title}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-secondary" />
                          +{quiz.xpReward} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {quiz.timeLimitSeconds}s limit
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                  </button>
                ))}
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl text-foreground mb-2">Lessons Coming Soon</h3>
            <p className="text-muted-foreground mb-6">Content for this zone is being prepared. Check back soon!</p>
            <Button onClick={() => navigate("/quests")} className="btn-glow bg-primary text-primary-foreground font-display">
              Explore Other Zones
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
