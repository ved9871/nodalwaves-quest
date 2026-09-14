import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { NWQLogo } from "@/components/NWQIcon";
import { useState } from "react";
import {
  Coins, Lock, Cpu, Building2, Vault, Landmark, Shield, Users, Rocket,
  ChevronRight, BookOpen, Zap, CheckCircle2, ArrowLeft, X, Trophy, Gamepad2
} from "lucide-react";

const ZONE_ICONS: Record<string, React.ElementType> = {
  Coins, Lock, Cpu, Building2, Vault, Landmark, Shield, Users, Rocket,
};

// Must match server formula
function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

interface LockedZoneInfo {
  name: string;
  requiredLevel: number;
  color: string;
}

export default function Quests() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: zones } = trpc.zones.list.useQuery();
  const { data: xpInfo } = trpc.profile.xpInfo.useQuery(undefined, { enabled: isAuthenticated });
  const { data: userUnlocks } = trpc.zones.userUnlocks.useQuery(undefined, { enabled: isAuthenticated });
  const [lockedModal, setLockedModal] = useState<LockedZoneInfo | null>(null);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  if (!isAuthenticated) { window.location.href = "/login"; return null; }

  const unlockedZoneIds = new Set(userUnlocks?.map(u => u.zoneId) ?? []);
  const currentLevel = xpInfo?.level ?? 1;
  const currentXp = xpInfo?.xp ?? 0;

  const handleZoneClick = (zone: { id: number; name: string; requiredLevel: number; color: string | null }, isUnlocked: boolean) => {
    if (isUnlocked) {
      navigate(`/zone/${zone.id}`);
    } else {
      setLockedModal({ name: zone.name, requiredLevel: zone.requiredLevel, color: zone.color ?? "#E53E3E" });
    }
  };

  const xpNeededForModal = lockedModal
    ? Math.max(0, xpForLevel(lockedModal.requiredLevel) - currentXp)
    : 0;

  const modalProgress = lockedModal
    ? Math.min(100, Math.round((currentXp / xpForLevel(lockedModal.requiredLevel)) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <NWQLogo compact iconSize={26} responsive />
        </div>
      </nav>

      <div className="container py-8">
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-4xl text-gradient-red mb-2">Quest Zones</h1>
          <p className="text-muted-foreground">Select a zone to begin your learning journey</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge className="bg-primary/20 text-primary border-primary/40 font-display text-xs">
              Level {currentLevel}
            </Badge>
            <Badge className="bg-secondary/20 text-secondary border-secondary/40 font-display text-xs">
              {currentXp.toLocaleString()} XP
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones?.map((zone, i) => {
            const IconComp = ZONE_ICONS[zone.icon ?? "Coins"] ?? Coins;
            const isUnlocked = unlockedZoneIds.has(zone.id) || zone.requiredLevel <= currentLevel;
            const xpNeeded = Math.max(0, xpForLevel(zone.requiredLevel) - currentXp);
            return (
              <div
                key={zone.id}
                onClick={() => handleZoneClick(zone, isUnlocked)}
                className={`card-nw p-5 relative overflow-hidden transition-all animate-fade-in-up cursor-pointer ${
                  isUnlocked ? "hover:border-primary/50" : "opacity-70 hover:opacity-90"
                }`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="absolute top-3 right-3 font-display text-xs text-muted-foreground/40 font-bold">
                  {String(zone.order).padStart(2, "0")}
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
                    style={{ backgroundColor: `${zone.color}20`, border: `2px solid ${zone.color}40` }}>
                    <IconComp className="w-7 h-7" style={{ color: isUnlocked ? (zone.color ?? "#E53E3E") : "#6B7280" }} />
                    {!isUnlocked && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-muted rounded-full flex items-center justify-center border border-border">
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-sm text-foreground">{zone.name}</h3>
                      {isUnlocked
                        ? <CheckCircle2 className="w-3 h-3 text-green-400" />
                        : <Lock className="w-3 h-3 text-muted-foreground" />
                      }
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{zone.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-display font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${zone.color}20`, color: isUnlocked ? (zone.color ?? "#E53E3E") : "#6B7280" }}>
                        LVL {zone.requiredLevel}+
                      </span>
                      {isUnlocked ? (
                        <span className="text-xs text-green-400 font-display">✓ Unlocked</span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-display">
                          You are Level {currentLevel} · Need {xpNeeded.toLocaleString()} more XP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isUnlocked ? (
                  <div className="mt-4 flex items-center justify-end text-xs text-primary font-display font-semibold">
                    Enter Zone <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                ) : (
                  <div className="mt-4 flex items-center justify-end text-xs text-muted-foreground font-display">
                    <Lock className="w-3 h-3 mr-1" /> Tap to see how to unlock
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: isUnlocked ? `linear-gradient(90deg, transparent, ${zone.color}, transparent)` : "none" }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Locked Zone Modal */}
      {lockedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={() => setLockedModal(null)}
        >
          <div
            className="card-nw w-full max-w-sm p-6 relative animate-fade-in-up"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setLockedModal(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${lockedModal.color}15`, border: `2px solid ${lockedModal.color}30` }}>
                <Lock className="w-8 h-8" style={{ color: lockedModal.color }} />
              </div>
            </div>

            <h2 className="font-display font-black text-xl text-foreground text-center mb-1">
              {lockedModal.name}
            </h2>
            <p className="text-xs text-muted-foreground text-center mb-5">This zone is locked</p>

            <div className="bg-muted/30 p-4 rounded-xl mb-5 space-y-2 border border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-display">Required Level</span>
                <span className="font-display font-black" style={{ color: lockedModal.color }}>Level {lockedModal.requiredLevel}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-display">Your Level</span>
                <span className="font-display font-black text-foreground">Level {currentLevel}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-display">XP Needed</span>
                <span className="font-display font-black text-secondary">{xpNeededForModal.toLocaleString()} XP</span>
              </div>
              <div className="pt-1">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress to Level {lockedModal.requiredLevel}</span>
                  <span>{modalProgress}%</span>
                </div>
                <Progress value={modalProgress} className="h-2" />
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mb-5 leading-relaxed">
              <span className="font-display font-bold text-foreground">{lockedModal.name}</span> unlocks at{" "}
              <span className="font-display font-bold" style={{ color: lockedModal.color }}>Level {lockedModal.requiredLevel}</span>.
              You are <span className="font-display font-bold text-foreground">Level {currentLevel}</span>.
              Earn <span className="font-display font-bold text-secondary">{xpNeededForModal.toLocaleString()} more XP</span> to unlock this zone.
            </p>

            <div className="mb-5">
              <p className="text-xs text-muted-foreground font-display uppercase tracking-widest mb-3">Earn XP by:</p>
              <div className="space-y-2">
                {[
                  { icon: BookOpen, label: "Complete available lessons", color: "#805AD5", path: "/quests" },
                  { icon: Gamepad2, label: "Play today's mini-games", color: "#E53E3E", path: "/mini-games" },
                  { icon: Trophy, label: "Join / continue the 7-Day Challenge", color: "#F6AD55", path: "/challenge" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { setLockedModal(null); navigate(item.path); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-muted/40"
                    style={{ border: `1px solid ${item.color}25` }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${item.color}20` }}>
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <span className="text-sm font-display text-foreground">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full btn-nw font-display font-bold"
              onClick={() => { setLockedModal(null); navigate("/quests"); }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Earn XP Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
