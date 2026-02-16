/**
 * Tavern-cut pizza progress tracker — 4 corner slices representing 4 questions.
 * Each slice fills based on answer status: unanswered, correct, or wrong.
 */

interface SliceStatus {
  answered: boolean;
  correct: boolean;
}

interface PizzaProgressProps {
  slices: SliceStatus[];
}

export default function PizzaProgress({ slices }: PizzaProgressProps) {
  // 4 corner slices of a square (tavern-cut) pizza
  // Positioned: top-left, top-right, bottom-right, bottom-left
  const slicePositions = [
    { label: "Q1", clipPath: "polygon(0% 0%, 50% 0%, 50% 50%, 0% 50%)" },
    { label: "Q2", clipPath: "polygon(50% 0%, 100% 0%, 100% 50%, 50% 50%)" },
    { label: "Q3", clipPath: "polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)" },
    { label: "Q4", clipPath: "polygon(0% 50%, 50% 50%, 50% 100%, 0% 100%)" },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-muted-foreground text-[10px] tracking-widest">
        ── TAVERN CUT ──
      </p>
      <div className="relative w-20 h-20">
        {/* Pizza base (square — it's tavern cut!) */}
        <div className="absolute inset-0 pixel-border bg-muted" />

        {/* Grid lines */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-border -translate-x-[1px] z-10" />
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-border -translate-y-[1px] z-10" />

        {/* Slices */}
        {slicePositions.map((pos, i) => {
          const slice = slices[i];
          const bg = !slice?.answered
            ? "bg-muted"
            : slice.correct
            ? "bg-primary/70"
            : "bg-destructive/70";
          const glow = slice?.answered && slice.correct ? "shadow-[0_0_8px_hsl(120_100%_65%/0.4)]" : "";

          return (
            <div
              key={i}
              className={`absolute inset-[3px] ${bg} ${glow} transition-colors duration-500`}
              style={{ clipPath: pos.clipPath }}
            />
          );
        })}

        {/* Slice labels */}
        {slicePositions.map((pos, i) => {
          const slice = slices[i];
          const textColor = !slice?.answered
            ? "text-muted-foreground"
            : slice.correct
            ? "text-primary-foreground"
            : "text-destructive-foreground";
          // Position labels in center of each quadrant
          const labelPositions = [
            "top-[15%] left-[15%]",
            "top-[15%] right-[15%]",
            "bottom-[15%] right-[15%]",
            "bottom-[15%] left-[15%]",
          ];
          return (
            <span
              key={`label-${i}`}
              className={`absolute ${labelPositions[i]} ${textColor} text-[8px] z-20`}
            >
              {slice?.answered ? (slice.correct ? "★" : "✖") : (i + 1)}
            </span>
          );
        })}
      </div>
      <p className="text-muted-foreground text-[8px]">
        {slices.filter((s) => s.answered).length}/4
      </p>
    </div>
  );
}
