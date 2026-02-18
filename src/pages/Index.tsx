import { useState, useEffect } from "react";
import TriviaGame from "@/components/TriviaGame";

function getWeatherDescription(code: number): string {
  const map: Record<number, string> = {
    0: "clear skies", 1: "mainly clear skies", 2: "partly cloudy skies",
    3: "overcast skies", 45: "foggy conditions", 48: "freezing fog",
    51: "light drizzle", 53: "moderate drizzle", 55: "dense drizzle",
    61: "slight rain", 63: "moderate rain", 65: "heavy rain",
    66: "light freezing rain", 67: "heavy freezing rain",
    71: "slight snowfall", 73: "moderate snowfall", 75: "heavy snowfall",
    77: "snow grains", 80: "slight rain showers", 81: "moderate rain showers",
    82: "violent rain showers", 85: "slight snow showers", 86: "heavy snow showers",
    95: "thunderstorms", 96: "thunderstorms with slight hail", 99: "thunderstorms with heavy hail",
  };
  return map[code] || "unusual weather";
}

const Index = () => {
  const [weather, setWeather] = useState<string | null>(null);

  useEffect(() => {
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
        {weather && (
          <p className="text-muted-foreground text-xs mt-3">
            🌤️ Meteorologist Morgan Kolkmeyer says{" "}
            <span className="text-foreground text-glow">{weather}</span> in Chicago today.
          </p>
        )}
        <p className="text-muted-foreground text-[10px] mt-3">
          Four questions. One chance each. Don't die of dysentery.
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
