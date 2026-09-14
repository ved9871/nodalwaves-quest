import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Zap, CheckCircle2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const AVATARS = [
  { id: "avatar1", emoji: "🧑‍💻", name: "Coder" },
  { id: "avatar2", emoji: "🦊", name: "Fox" },
  { id: "avatar3", emoji: "🤖", name: "Bot" },
  { id: "avatar4", emoji: "🐉", name: "Dragon" },
  { id: "avatar5", emoji: "⚡", name: "Spark" },
  { id: "avatar6", emoji: "🔮", name: "Oracle" },
  { id: "avatar7", emoji: "🚀", name: "Rocket" },
  { id: "avatar8", emoji: "🛡️", name: "Shield" },
  { id: "avatar9", emoji: "💎", name: "Diamond" },
  { id: "avatar10", emoji: "🌊", name: "Wave" },
  { id: "avatar11", emoji: "🔥", name: "Flame" },
  { id: "avatar12", emoji: "⭐", name: "Star" },
];

export default function ProfileSetup() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("avatar1");
  const [referralCode, setReferralCode] = useState("");
  const [step, setStep] = useState(1);

  const setupMutation = trpc.profile.setup.useMutation({
    onSuccess: () => {
      toast.success("Profile created! Welcome to NodeWaves Quest!", {
        description: "You earned 50 XP for joining!",
      });
      navigate("/dashboard");
    },
    onError: (err: { message: string }) => {
      toast.error("Setup failed: " + err.message);
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleSubmit = () => {
    if (!username.trim() || username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    setupMutation.mutate({
      username: username.trim(),
      avatarId: selectedAvatar,
      referralCode: referralCode.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, oklch(0.55 0.22 25 / 0.06) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display font-black text-3xl text-gradient-red mb-2">
            Create Your Profile
          </h1>
          <p className="text-muted-foreground text-sm">
            Set up your NodeWaves Quest identity
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm transition-all ${
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 transition-all ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="card-nw p-6">
          {step === 1 && (
            <div className="animate-fade-in-up">
              <h2 className="font-display font-bold text-lg mb-6 text-foreground">Choose Your Avatar</h2>
              <div className="grid grid-cols-4 gap-3 mb-6">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      selectedAvatar === av.id
                        ? "border-primary bg-primary/20 scale-105"
                        : "border-border hover:border-primary/50 bg-muted/30"
                    }`}
                  >
                    <span className="text-2xl">{av.emoji}</span>
                    <span className="text-xs text-muted-foreground font-display">{av.name}</span>
                  </button>
                ))}
              </div>
              <Button
                onClick={() => setStep(2)}
                className="w-full btn-glow bg-primary text-primary-foreground font-display font-bold"
              >
                Next: Set Username
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in-up">
              <h2 className="font-display font-bold text-lg mb-6 text-foreground">Set Your Username</h2>

              {/* Selected avatar preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border mb-6">
                <span className="text-3xl">
                  {AVATARS.find(a => a.id === selectedAvatar)?.emoji}
                </span>
                <div>
                  <div className="text-xs text-muted-foreground font-display">Selected Avatar</div>
                  <div className="font-display font-bold text-sm text-foreground">
                    {AVATARS.find(a => a.id === selectedAvatar)?.name}
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="ml-auto text-xs text-primary hover:underline font-display"
                >
                  Change
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-display font-semibold text-foreground mb-2 block">
                    Username *
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. NodeHunter42"
                    className="bg-muted/50 border-border focus:border-primary font-display"
                    maxLength={32}
                  />
                  <p className="text-xs text-muted-foreground mt-1">3–32 characters. This is your public display name.</p>
                </div>

                <div>
                  <label className="text-sm font-display font-semibold text-foreground mb-2 block">
                    Referral Code (Optional)
                  </label>
                  <Input
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter referral code"
                    className="bg-muted/50 border-border focus:border-primary font-display uppercase"
                    maxLength={16}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Both you and your referrer earn bonus XP.</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-border font-display"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={setupMutation.isPending || username.length < 3}
                  className="flex-1 btn-glow bg-primary text-primary-foreground font-display font-bold"
                >
                  {setupMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Start Quest (+50 XP)
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Logged in as {user?.name || user?.email}
        </p>
      </div>
    </div>
  );
}
