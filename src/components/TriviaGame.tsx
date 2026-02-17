import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  TriviaQuestion,
  MultiDailyState,
  loadMultiDailyState,
  saveMultiDailyState,
  createFreshMultiState,
  getRandomMessage,
  getTodayKey,
} from "@/lib/game-data";
import { getDailyMission } from "@/lib/mission-data";
import PizzaProgress from "./PizzaProgress";
import MissionIntro from "./MissionIntro";

const TOTAL_QUESTIONS = 4;

export default function TriviaGame() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [showMission, setShowMission] = useState(true);

  const mission = getDailyMission(getTodayKey());

  const [multiState, setMultiState] = useState<MultiDailyState>(() => {
    return loadMultiDailyState() || createFreshMultiState();
  });

  useEffect(() => {
    const saved = loadMultiDailyState();
    if (saved && saved.completed) {
      setMultiState(saved);
      setLoading(false);
      setShowMission(false);
      return;
    }
    if (saved && saved.questions && saved.questions.length === TOTAL_QUESTIONS) {
      setMultiState(saved);
      setQuestions(saved.questions);
      setLoading(false);
      // If they already started answering, skip mission
      if (saved.currentIndex > 0) setShowMission(false);
      return;
    }
    // Questions will be fetched when user dismisses mission intro
    setLoading(false);
  }, []);

  async function fetchQuestions() {
    try {
      setLoading(true);
      const { data, error: fnError } = await supabase.functions.invoke(
        "daily-trivia",
        { body: { date: getTodayKey(), count: TOTAL_QUESTIONS } }
      );
      if (fnError) throw fnError;
      const fetched = data as TriviaQuestion[];
      setQuestions(fetched);
      // Cache questions in multiState
      setMultiState((prev) => {
        const updated = { ...prev, questions: fetched };
        saveMultiDailyState(updated);
        return updated;
      });
    } catch (e) {
      console.error("Failed to fetch questions:", e);
      setError("The trail is impassable... Try again later.");
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(idx: number) {
    if (revealing || multiState.completed) return;
    const currentQ = questions[multiState.currentIndex];
    if (!currentQ) return;

    setSelectedIdx(idx);
    setRevealing(true);

    const isCorrect = idx === currentQ.correctIndex;
    const message = getRandomMessage(isCorrect);
    setFeedbackMessage(message);
    setFeedbackCorrect(isCorrect);

    setTimeout(() => {
      setMultiState((prev) => {
        const updated = {
          ...prev,
          results: [...prev.results],
          questions: prev.questions,
        };
        updated.results[prev.currentIndex] = {
          answered: true,
          correct: isCorrect,
          selectedAnswer: idx,
          message,
        };

        const nextIndex = prev.currentIndex + 1;
        if (nextIndex >= TOTAL_QUESTIONS) {
          updated.completed = true;
        } else {
          updated.currentIndex = nextIndex;
        }

        saveMultiDailyState(updated);
        return updated;
      });

      setSelectedIdx(null);
      setRevealing(false);

      // Clear feedback after a brief moment so next question appears clean
      setTimeout(() => setFeedbackMessage(null), 100);
    }, 3800);
  }

  if (showMission && !multiState.completed) {
    return (
      <MissionIntro
        mission={mission}
        onStart={() => {
          setShowMission(false);
          if (questions.length === 0) fetchQuestions();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <p className="text-glow">Loading today's trail challenges...</p>
        <span className="cursor-blink text-2xl">█</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <p className="text-destructive">{error}</p>
        <button
          onClick={fetchQuestions}
          className="pixel-border bg-muted px-6 py-3 text-foreground hover:bg-border transition-colors"
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  // All 4 answered — show summary
  if (multiState.completed) {
    const correctCount = multiState.results.filter((r) => r.correct).length;
    const lastResult = multiState.results[multiState.results.length - 1];
    return (
      <div className="flex flex-col items-center gap-8 p-6 max-w-xl mx-auto animate-fade-in">
        <PizzaProgress slices={multiState.results} />
        <div
          className={`pixel-border p-6 w-full text-center ${
            correctCount >= 3 ? "text-foreground" : "text-destructive"
          }`}
        >
          <p className={`text-lg mb-4 ${correctCount >= 3 ? "text-glow" : ""}`}>
            {correctCount === 4
              ? "★ PERFECT TRAIL ★"
              : correctCount >= 3
              ? "★ GREAT JOURNEY ★"
              : correctCount >= 1
              ? "✖ ROUGH TRAIL ✖"
              : "✖ LOST ON THE TRAIL ✖"}
          </p>
          <p className={`${correctCount >= 3 ? "text-glow-amber text-secondary" : ""}`}>
            {correctCount}/{TOTAL_QUESTIONS} slices delivered to{" "}
            <span className="text-secondary text-glow-amber">{mission.character}</span>{" "}
            at {mission.endLocation} —{" "}
            {correctCount === 4
              ? "A perfect delivery from " + mission.startLocation + "!"
              : correctCount >= 3
              ? "You survived the journey with minor setbacks."
              : correctCount >= 1
              ? "Your wagon barely limped into town."
              : "You never made it past " + mission.startLocation + "."}
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

  const currentQuestion = questions[multiState.currentIndex];
  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl mx-auto animate-fade-in">
      <div className="flex justify-center">
        <PizzaProgress slices={multiState.results} />
      </div>

      {/* Feedback from previous answer */}
      {feedbackMessage && revealing && (
        <div
          className={`pixel-border p-4 text-center animate-fade-in ${
            feedbackCorrect ? "text-foreground" : "text-destructive"
          }`}
        >
          <p className={`text-sm mb-1 ${feedbackCorrect ? "text-glow" : ""}`}>
            {feedbackCorrect ? "★ CORRECT ★" : "✖ WRONG ✖"}
          </p>
          <p className={`text-xs ${feedbackCorrect ? "text-glow-amber text-secondary" : ""}`}>
            {feedbackMessage}
          </p>
        </div>
      )}

      <div className="pixel-border p-6 bg-card">
        <p className="text-secondary text-glow-amber text-xs mb-4">
          ── QUESTION {multiState.currentIndex + 1} OF {TOTAL_QUESTIONS} ──
        </p>
        <p className="text-foreground text-glow leading-relaxed">
          {currentQuestion.question}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrectAnswer = idx === currentQuestion.correctIndex;
          const showAsCorrect = revealing && isCorrectAnswer;
          const showAsWrong = revealing && isSelected && !feedbackCorrect;
          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={revealing}
              className={`pixel-border p-4 text-left transition-colors w-full ${
                showAsCorrect
                  ? "bg-primary text-primary-foreground"
                  : showAsWrong
                  ? "bg-destructive text-destructive-foreground"
                  : isSelected && revealing
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-card text-foreground hover:bg-muted"
              } disabled:cursor-not-allowed`}
            >
              <span className={`mr-3 ${showAsCorrect ? "text-primary-foreground" : "text-secondary"}`}>
                {String.fromCharCode(65 + idx)}.
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {revealing && !feedbackMessage && (
        <p className="text-center text-muted-foreground cursor-blink">
          Checking the trail map...
        </p>
      )}
    </div>
  );
}
