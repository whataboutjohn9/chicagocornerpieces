import { useState, useEffect } from "react";
import { DailyMission } from "@/lib/mission-data";

interface MissionIntroProps {
  mission: DailyMission;
  onStart: () => void;
}

function getWeatherDescription(code: number): string {
  const map: Record<number, string> = {
    0: "clear skies",
    1: "mainly clear skies",
    2: "partly cloudy skies",
    3: "overcast skies",
    45: "foggy conditions",
    48: "freezing fog",
    51: "light drizzle",
    53: "moderate drizzle",
    55: "dense drizzle",
    61: "slight rain",
    63: "moderate rain",
    65: "heavy rain",
    66: "light freezing rain",
    67: "heavy freezing rain",
    71: "slight snowfall",
    73: "moderate snowfall",
    75: "heavy snowfall",
    77: "snow grains",
    80: "slight rain showers",
    81: "moderate rain showers",
    82: "violent rain showers",
    85: "slight snow showers",
    86: "heavy snow showers",
    95: "thunderstorms",
    96: "thunderstorms with slight hail",
    99: "thunderstorms with heavy hail",
  };
  return map[code] || "unusual weather";
}

export default function MissionIntro({ mission, onStart }: MissionIntroProps) {
  const [step, setStep] = useState(0);
  const [weather, setWeather] = useState<string | null>(null);

  useEffect(() => {
    // Fetch Chicago weather from Open-Meteo (free, no key)
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=41.8781&longitude=-87.6298&current=temperature_2m,weather_code&temperature_unit=fahrenheit"
    )
      .then((r) => r.json())
      .then((data) => {
        const temp = Math.round(data.current.temperature_2m);
        const desc = getWeatherDescription(data.current.weather_code);
        setWeather(`${temp}°F with ${desc}`);
      })
      .catch(() => setWeather(null));
  }, []);

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

        {weather && (
          <p className="text-muted-foreground text-sm mb-4 animate-fade-in">
            🌤️ Meteorologist Morgan Kolkmeyer says{" "}
            <span className="text-foreground text-glow">{weather}</span> in Chicago today.
          </p>
        )}

        {step >= 0 && (
          <p className="text-foreground text-glow leading-relaxed mb-4 animate-fade-in">
            <span className="text-secondary text-glow-amber">{mission.character}</span>{" "}
            is in{" "}
            <span className="text-foreground text-glow">{mission.endLocation}</span>{" "}
            asking for four corner pieces of pizza!
          </p>
        )}

        {step >= 1 && (
          <p className="text-muted-foreground text-sm mb-2 animate-fade-in">
            📍 You are currently in{" "}
            <span className="text-foreground text-glow">{mission.startLocation}</span>
          </p>
        )}

        {step >= 2 && (
          <p className="text-muted-foreground text-sm mb-4 animate-fade-in">
            🏁 Deliver to them in{" "}
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
