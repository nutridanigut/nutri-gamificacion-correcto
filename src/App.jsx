import { useState, useEffect } from "react";

function App() {
  // --- PROGRESO ---
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("progress");
    return saved ? JSON.parse(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem("progress", JSON.stringify(progress));
  }, [progress]);

  // --- META DIARIA ---
  const [dailyGoal, setDailyGoal] = useState(60);

  // --- RACHA ---
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("streak");
    return saved ? JSON.parse(saved) : 0;
  });

  useEffect(() => {
    const today = new Date().toDateString();
    const lastDay = localStorage.getItem("lastDay");

    if (progress >= dailyGoal && lastDay !== today) {
      setStreak((prev) => {
        const newStreak = prev + 1;
        localStorage.setItem("streak", JSON.stringify(newStreak));
        localStorage.setItem("lastDay", today);
        return newStreak;
      });
    }
  }, [progress, dailyGoal]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🌱 Progreso Nutricional</h1>

      {/* Barra de progreso */}
      <p>Progreso actual: {progress}%</p>
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={(e) => setProgress(Number(e.target.value))}
      />

      {/* Meta diaria */}
      <div style={{ marginTop: "1rem" }}>
        <p>
          Meta diaria: {dailyGoal}%{" "}
          {progress >= dailyGoal ? "✅ ¡Meta cumplida!" : "❌ Aún no llegas"}
        </p>
        <input
          type="number"
          value={dailyGoal}
          onChange={(e) => setDailyGoal(Number(e.target.value))}
          min="10"
          max="100"
        />
      </div>

      {/* Racha */}
      <div style={{ marginTop: "1rem" }}>
        <p>🔥 Racha de días cumplidos: {streak}</p>
      </div>
    </div>
  );
}

export default App;
