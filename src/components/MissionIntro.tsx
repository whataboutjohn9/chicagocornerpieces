import { useState, useEffect } from "react";
import { DailyMission } from "@/lib/mission-data";

interface MissionIntroProps {
  mission: DailyMission;
  onStart: () => void;
}

export default function MissionIntro({ mission, onStart }: MissionIntroProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 2200);
    const t3 = setTimeout(() => setStep(3), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-xl mx-auto animate-fade-in">
      <div className="pixel-border p-6 bg-card w-full text-center">
        <p className="text-secondary text-glow-amber text-xs mb-4">
          ── INCOMING TRANSMISSION ──
        </p>

        {step >= 0 && (
          <p className="text-foreground text-glow leading-relaxed mb-4 animate-fade-in">
            <span className="text-secondary text-glow-amber">{mission.character}</span>{" "}
            needs you to bring corner pieces of pizza!
          </p>
        )}

        {step >= 1 && (
          <p className="text-muted-foreground text-sm mb-2 animate-fade-in">
            📍 You are currently at{" "}
            <span className="text-foreground text-glow">{mission.startLocation}</span>
          </p>
        )}

        {step >= 2 && (
          <p className="text-muted-foreground text-sm mb-4 animate-fade-in">
            🏁 Meet them at{" "}
            <span className="text-foreground text-glow">{mission.endLocation}</span>
          </p>
        )}

        {step >= 3 && (
          <p className="text-muted-foreground text-xs animate-fade-in">
            Answer trivia questions along the trail to earn your slices!
          </p>
        )}
      </div>

      {step >= 3 && (
        <button
          onClick={onStart}
          className="pixel-border bg-muted px-8 py-4 text-secondary text-glow-amber hover:bg-border transition-colors animate-fade-in"
        >
          ▶ HIT THE TRAIL
        </button>
      )}
    </div>
  );
}
