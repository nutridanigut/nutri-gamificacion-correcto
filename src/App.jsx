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

const WEEK_LABELS = ["D", "L", "M", "M", "J", "V", "S"]; // dom..sáb

function todayKey() {
  return new Date().toDateString(); // p.ej. "Mon Aug 12 2025"
}

function todayIndex() {
  return new Date().getDay(); // 0=Dom .. 6=Sab
}

function getMedal(streak) {
  if (streak >= 30) return { name: "Oro", emoji: "🥇", need: 30 };
  if (streak >= 14) return { name: "Plata", emoji: "🥈", need: 14 };
  if (streak >= 7) return { name: "Bronce", emoji: "🥉", need: 7 };
  return null;
}

export default function App() {
  // -------- Persistencia básica --------
  const [meals, setMeals] = useState(() => {
    const savedMeals = localStorage.getItem("meals");
    const savedDate = localStorage.getItem("mealsDate");
    // reset automático si es nuevo día
    if (!savedMeals || savedDate !== todayKey()) {
      const empty = MEALS.reduce((acc, m) => ({ ...acc, [m.key]: false }), {});
      localStorage.setItem("meals", JSON.stringify(empty));
      localStorage.setItem("mealsDate", todayKey());
      return empty;
    }
    return JSON.parse(savedMeals);
  });

  const [goal, setGoal] = useState(() => {
    const saved = localStorage.getItem("goal");
    return saved ? Number(saved) : 100; // meta = completar todas las comidas
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("streak");
    return saved ? Number(saved) : 0;
  });

  const [weeklyData, setWeeklyData] = useState(() => {
    const saved = localStorage.getItem("weeklyData");
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        return Array.isArray(arr) && arr.length === 7 ? arr : [0, 0, 0, 0, 0, 0, 0];
      } catch {
        return [0, 0, 0, 0, 0, 0, 0];
      }
    }
    return [0, 0, 0, 0, 0, 0, 0];
  });

  // -------- Derivados --------
  const percent = useMemo(() => {
    const total = MEALS.length;
    const checked = Object.values(meals).filter(Boolean).length;
    return Math.round((checked / total) * 100);
  }, [meals]);

  const message = useMemo(() => {
    if (percent === 0) return "💡 ¡Vamos, da el primer paso!";
    if (percent < 50) return "⚡ Buen inicio, sigue marcando.";
    if (percent < goal) return "🔥 ¡Estás cerca de tu meta!";
    return "🏆 ¡Meta alcanzada hoy!";
  }, [percent, goal]);

  const tip = useMemo(() => {
    const idx = new Date().getDate() % TIPS.length;
    return TIPS[idx];
  }, []);

  const medal = getMedal(streak);
  const nextMedal =
    streak >= 30 ? null : streak >= 14 ? { name: "Oro", need: 30 } : streak >= 7 ? { name: "Plata", need: 14 } : { name: "Bronce", need: 7 };

  // -------- Efectos de guardado --------
  useEffect(() => {
    localStorage.setItem("meals", JSON.stringify(meals));
    localStorage.setItem("mealsDate", todayKey());
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("goal", String(goal));
  }, [goal]);

  // Actualizar weeklyData cuando cambia el % del día
  useEffect(() => {
    const idx = todayIndex();
    const newArr = [...weeklyData];
    newArr[idx] = percent;
    setWeeklyData(newArr);
    localStorage.setItem("weeklyData", JSON.stringify(newArr));
  }, [percent]); // eslint-disable-line

  // Racha: contar un día solo la primera vez que alcanza la meta
  useEffect(() => {
    const today = todayKey();
    const lastCounted = localStorage.getItem("lastDay");

    if (percent >= goal && lastCounted !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("streak", String(newStreak));
      localStorage.setItem("lastDay", today);
    }
  }, [percent, goal, streak]);

  // -------- Handlers --------
  function toggleMeal(key) {
    setMeals((m) => ({ ...m, [key]: !m[key] }));
  }

  function resetToday() {
    const empty = MEALS.reduce((acc, x) => ({ ...acc, [x.key]: false }), {});
    setMeals(empty);
  }

  return (
    <div className="container">
      <h1>🌱 Progreso Nutricional</h1>

      {/* Comidas */}
      <div className="card">
        <h2>🍽️ Comidas del día</h2>
        <ul className="list">
          {MEALS.map((m) => (
            <li key={m.key}>
              <label>
                <input
                  type="checkbox"
                  checked={!!meals[m.key]}
                  onChange={() => toggleMeal(m.key)}
                />
                {m.label}
              </label>
            </li>
          ))}
        </ul>
        <button className="btn" onClick={resetToday}>Reiniciar día</button>
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
        <p className="strong">{percent}% completado</p>
        <p>{message}</p>
      </div>

      {/* Meta + Racha + Medalla */}
      <div className="card">
        <h2>🎯 Meta & 🔥 Racha</h2>
        <div className="row">
          <label>
            Meta (%):
            <input
              type="number"
              min={10}
              max={100}
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value || 0))}
            />
          </label>
          <div className="streak">🔥 {streak} días seguidos</div>
        </div>

        <div className="medals">
          <div className="medal">
            {medal ? `${medal.emoji} Medalla ${medal.name}` : "— Sin medalla aún —"}
          </div>
          {nextMedal && (
            <div className="next">
              Próxima: {nextMedal.name} a {nextMedal.need} días. Te faltan{" "}
              <b>{nextMedal.need - streak}</b>.
            </div>
          )}
        </div>
      </div>

      {/* Historial semanal */}
      <div className="card">
        <h2>📅 Historial semanal</h2>
        <div className="week-grid">
          {weeklyData.map((val, i) => (
            <div className="week-col" key={i} title={`${WEEK_LABELS[i]}: ${val}%`}>
              <div className="bar-wrap">
                <div
                  className="bar"
                  style={{
                    height: `${val}%`,
                    background: val >= 60 ? "#16a34a" : "#f59e0b",
                  }}
                />
              </div>
              <div className="week-label">{WEEK_LABELS[i]}</div>
            </div>
          ))}
        </div>
        <div className="legend">
          <span className="dot dot-green"></span> ≥60% &nbsp;&nbsp;
          <span className="dot dot-amber"></span> &lt;60%
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
