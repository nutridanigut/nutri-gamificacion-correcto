import { useEffect, useMemo, useState } from "react";

const MEALS = [
  { key: "desayuno", label: "Desayuno" },
  { key: "colacion1", label: "Colación AM" },
  { key: "almuerzo", label: "Almuerzo" },
  { key: "colacion2", label: "Colación PM" },
  { key: "once", label: "Once" },
  { key: "colacion3", label: "Colación nocturna (opcional)" },
];

const TIPS = [
  "💧 Toma agua a lo largo del día.",
  "🌈 Suma frutas/verduras de colores.",
  "🚶‍♀️ Muévete 10–15 minutos.",
  "💪 La constancia vale más que la perfección.",
  "🧠 Si un día fallas, retoma al siguiente.",
];

export default function App() {
  // Estado de comidas (se inicializa desde localStorage)
  const [meals, setMeals] = useState(() => {
    const saved = localStorage.getItem("meals");
    if (saved) return JSON.parse(saved);
    // por defecto: todas desmarcadas
    return MEALS.reduce((acc, m) => ({ ...acc, [m.key]: false }), {});
  });

  // Meta diaria (por si luego quieres cambiarla)
  const [goal, setGoal] = useState(() => {
    const saved = localStorage.getItem("goal");
    return saved ? Number(saved) : 100; // meta = completar todas las comidas
  });

  // Racha (días seguidos cumpliendo meta)
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("streak");
    return saved ? Number(saved) : 0;
  });

  // Guardar al cambiar
  useEffect(() => {
    localStorage.setItem("meals", JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("goal", String(goal));
  }, [goal]);

  // % completado
  const percent = useMemo(() => {
    const total = MEALS.length;
    const checked = Object.values(meals).filter(Boolean).length;
    return Math.round((checked / total) * 100);
  }, [meals]);

  // Mensaje motivador
  const message = useMemo(() => {
    if (percent === 0) return "💡 ¡Vamos, da el primer paso!";
    if (percent < 50) return "⚡ Buen inicio, sigue marcando.";
    if (percent < goal) return "🔥 ¡Estás cerca de tu meta!";
    return "🏆 ¡Meta alcanzada hoy!";
  }, [percent, goal]);

  // Actualiza racha cuando se alcanza la meta por primera vez en el día
  useEffect(() => {
    const today = new Date().toDateString();
    const lastDay = localStorage.getItem("lastDay");

    if (percent >= goal) {
      if (lastDay !== today) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem("streak", String(newStreak));
        localStorage.setItem("lastDay", today);
      }
    } else {
      // si baja de la meta, no rompemos la racha del día ya contado
      // solo mostramos el valor actual guardado
    }
  }, [percent, goal, streak]);

  // Tip del día (se fija por fecha)
  const tip = useMemo(() => {
    const dayIndex = new Date().getDate() % TIPS.length;
    return TIPS[dayIndex];
  }, []);

  function toggleMeal(key) {
    setMeals((m) => ({ ...m, [key]: !m[key] }));
  }

  function resetToday() {
    const reset = MEALS.reduce((acc, x) => ({ ...acc, [x.key]: false }), {});
    setMeals(reset);
  }

  return (
    <div className="container">
      <h1>🌱 Progreso Nutricional</h1>

      {/* Comidas del día */}
      <div className="card">
        <h2>🍽️ Comidas del día</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {MEALS.map((m) => (
            <li key={m.key} style={{ marginBottom: 8 }}>
              <label>
                <input
                  type="checkbox"
                  checked={!!meals[m.key]}
                  onChange={() => toggleMeal(m.key)}
                  style={{ marginRight: 8 }}
                />
                {m.label}
              </label>
            </li>
          ))}
        </ul>
        <button onClick={resetToday} style={{ marginTop: 10 }}>
          Reiniciar día
        </button>
      </div>

      {/* Progreso */}
      <div className="card">
        <h2>📊 Progreso diario</h2>
        <div className="progress-bar">
          <div
            className="progress"
            style={{
              width: `${percent}%`,
              background: percent >= goal ? "#16a34a" : "#f59e0b",
            }}
          />
        </div>
        <p style={{ fontWeight: "bold" }}>{percent}% completado</p>
        <p>{message}</p>
      </div>

      {/* Meta y racha */}
      <div className="card">
        <h2>🎯 Meta & 🔥 Racha</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label>
            Meta (%):
            <input
              type="number"
              min={10}
              max={100}
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value || 0))}
              style={{ marginLeft: 8, width: 80 }}
            />
          </label>
          <span style={{ marginLeft: "auto", fontWeight: 600 }}>
            🔥 {streak} días seguidos
          </span>
        </div>
      </div>

      {/* Tip del día */}
      <div className="card">
        <h2>💡 Tip del día</h2>
        <p>{tip}</p>
      </div>
    </div>
  );
}
