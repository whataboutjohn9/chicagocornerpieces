import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  TriviaQuestion,
  DailyState,
  loadDailyState,
  saveDailyState,
  getRandomMessage,
  getTodayKey,
} from "@/lib/game-data";

export default function TriviaGame() {
  const [question, setQuestion] = useState<TriviaQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyState, setDailyState] = useState<DailyState | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    const saved = loadDailyState();
    if (saved) {
      setDailyState(saved);
      setLoading(false);
      return;
    }
    fetchQuestion();
  }, []);

  async function fetchQuestion() {
    try {
      setLoading(true);
      const { data, error: fnError } = await supabase.functions.invoke(
        "daily-trivia",
        { body: { date: getTodayKey() } }
      );
      if (fnError) throw fnError;
      setQuestion(data as TriviaQuestion);
    } catch (e) {
      console.error("Failed to fetch question:", e);
      setError("The trail is impassable... Try again later.");
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(idx: number) {
    if (dailyState || revealing || !question) return;
    setSelectedIdx(idx);
    setRevealing(true);

    setTimeout(() => {
      const isCorrect = idx === question.correctIndex;
      const state: DailyState = {
        date: getTodayKey(),
        selectedAnswer: idx,
        isCorrect,
        message: getRandomMessage(isCorrect),
      };
      saveDailyState(state);
      setDailyState(state);
      setRevealing(false);
    }, 1500);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <p className="text-glow">Loading today's trail challenge...</p>
        <span className="cursor-blink text-2xl">█</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <p className="text-destructive">{error}</p>
        <button
          onClick={fetchQuestion}
          className="pixel-border bg-muted px-6 py-3 text-foreground hover:bg-border transition-colors"
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  // Already answered today
  if (dailyState) {
    return (
      <div className="flex flex-col items-center gap-8 p-6 max-w-xl mx-auto animate-fade-in">
        <div
          className={`pixel-border p-6 w-full text-center ${
            dailyState.isCorrect ? "text-foreground" : "text-destructive"
          }`}
        >
          <p className={`text-lg mb-4 ${dailyState.isCorrect ? "text-glow" : ""}`}>
            {dailyState.isCorrect ? "★ CORRECT ★" : "✖ WRONG ✖"}
          </p>
          <p className={`${dailyState.isCorrect ? "text-glow-amber text-secondary" : ""}`}>
            {dailyState.message}
          </p>
        </div>
        <div className="pixel-border p-4 w-full text-center bg-muted">
          <p className="text-muted-foreground text-xs">
            The trail continues tomorrow...
          </p>
          <p className="cursor-blink mt-2 text-secondary text-glow-amber">
            Come back for a new challenge!
          </p>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl mx-auto animate-fade-in">
      <div className="pixel-border p-6 bg-card">
        <p className="text-secondary text-glow-amber text-xs mb-4">
          ── DAILY TRAIL CHALLENGE ──
        </p>
        <p className="text-foreground text-glow leading-relaxed">
          {question.question}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={revealing}
              className={`pixel-border p-4 text-left transition-colors w-full ${
                isSelected && revealing
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-card text-foreground hover:bg-muted"
              } disabled:cursor-not-allowed`}
            >
              <span className="text-secondary mr-3">
                {String.fromCharCode(65 + idx)}.
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {revealing && (
        <p className="text-center text-muted-foreground cursor-blink">
          Checking the trail map...
        </p>
      )}
    </div>
  );
}
