import TriviaGame from "@/components/TriviaGame";

const Index = () => {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background relative">
      {/* CRT scanline overlay */}
      <div className="crt-overlay" />

      {/* Header */}
      <header className="w-full max-w-xl px-6 pt-10 pb-6 text-center">
        <h1 className="text-secondary text-glow-amber text-lg mb-2">
          CHICAGO TRAIL
        </h1>
        <p className="text-foreground text-glow text-xs tracking-widest">
          ═══ DAILY TRIVIA ═══
        </p>
        <p className="text-muted-foreground text-[10px] mt-3">
          One question. One chance. Don't die of dysentery.
        </p>
      </header>

      {/* Game */}
      <TriviaGame />

      {/* Footer */}
      <footer className="mt-auto pb-6 text-center">
        <p className="text-muted-foreground text-[10px]">
          🦬 Press SPACE to continue...
        </p>
      </footer>
    </main>
  );
};

export default Index;
