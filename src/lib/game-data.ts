export interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export const correctMessages = [
  "You have successfully forded the Chicago River!",
  "Your oxen are well-fed on deep dish pizza!",
  "You found a shortcut through the L tunnel!",
  "A kind stranger shares their Italian beef with your party!",
  "You traded goods at the Magnificent Mile — great deal!",
  "Your wagon made it safely down Lake Shore Drive!",
  "You discovered fresh water at Buckingham Fountain!",
  "The wind at your back speeds you through the prairie!",
];

export const wrongMessages = [
  "You have died of dysentery near Wrigley Field.",
  "Your wagon broke an axle on Lake Shore Drive.",
  "A thief stole your Italian beef.",
  "You got lost in the L train tunnels for 3 days.",
  "Your oxen were startled by the Bean's reflection.",
  "A blizzard off Lake Michigan buried your wagon.",
  "You tried to ford the Chicago River and lost 2 oxen.",
  "Bandits ambushed you in the Pedway.",
  "Your party ate bad hot dogs at Soldier Field.",
  "The Hawk (wind) blew your supplies into the lake.",
];

export function getRandomMessage(isCorrect: boolean): string {
  const messages = isCorrect ? correctMessages : wrongMessages;
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export interface DailyState {
  date: string;
  selectedAnswer: number;
  isCorrect: boolean;
  message: string;
}

export function loadDailyState(): DailyState | null {
  try {
    const stored = localStorage.getItem("chicago-trail-trivia");
    if (!stored) return null;
    const state: DailyState = JSON.parse(stored);
    if (state.date !== getTodayKey()) return null;
    return state;
  } catch {
    return null;
  }
}

export function saveDailyState(state: DailyState): void {
  localStorage.setItem("chicago-trail-trivia", JSON.stringify(state));
}
