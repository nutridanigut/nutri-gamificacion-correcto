import { useEffect, useMemo, useRef, useState } from "react";

/** ----- Datos base ----- */
const ALL_MEALS = [
  { key: "desayuno",  label: "Desayuno",     defaultTime: "08:00" },
  { key: "colacion1", label: "Colación AM",  defaultTime: "11:00" },
  { key: "almuerzo",  label: "Almuerzo",     defaultTime: "13:00" },
  { key: "colacion2", label: "Colación PM",  defaultTime: "17:00" },
  { key: "once",      label: "Once",         defaultTime: "20:00" },
  { key: "colacion3", label: "Colación nocturna", defaultTime: "22:00" },
];

const TIPS_LOW  = ["🌱 Pequeños pasos → grandes cambios", "💧 Hidrátate durante el día", "🧠 Si fallas hoy, retoma mañana", "🍎 Suma 1 fruta hoy"];
const TIPS_HIGH = ["💪 ¡Excelente constancia!", "🥗 Varía colores/vegetales", "🚶‍♀️ Suma 10–15’ de movimiento", "🧩 Mantén tu racha, vas genial"];
const WEEK_LABELS = ["D", "L", "M", "M", "J", "V", "S"]; // dom..sáb

/** ----- Utilidades ----- */
const todayKey  = () => new Date().toDateString();
const todayIdx  = () => new Date().getDay();
const hhmmToMin = (t) => { const [h,m] = t.split(":").map(Number); return h*60+m; };

function getMedal(streak) {
  if (streak >= 30) return { name: "Oro",   emoji: "🥇", need: 30 };
  if (streak >= 14) return { name: "Plata", emoji: "🥈", need: 14 };
  if (streak >= 7)  return { name: "Bronce",emoji: "🥉", need: 7  };
  return null;
}

/** ----- Mascota: importa imágenes ----- */
import osito1 from "./assets/mascota/osito1.png";
import osito2 from "./assets/mascota/osito2.png";
import osito3 from "./assets/mascota/osito3.png";
import osito4 from "./assets/mascota/osito4.png";

/** Mapea racha → nivel 1..4 */
function streakToLevel(streak) {
  if (streak < 3)  return 1;   // inicio
  if (streak < 7)  return 2;   // mejora
  if (streak < 14) return 3;   // fuerte
  return 4;                    // maestro
}

/** ----- Componente ----- */
export default function App() {
  /** Tema (claro/oscuro) */
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  /** Modo Pro (config oculta). Activas con ?pro=1 o con el switch */
  const [proMode, setProMode] = useState(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("pro") === "1") { localStorage.setItem("proMode","1"); return true; }
    return localStorage.getItem("proMode") === "1";
  });
  useEffect(() => { proMode ? localStorage.setItem("proMode","1") : localStorage.removeItem("proMode"); }, [proMode]);

  /** Qué comidas cuentan */
  const [enabledMeals, setEnabledMeals] = useState(() => {
    const saved = localStorage.getItem("enabledMeals");
    if (saved) return JSON.parse(saved);
    return ALL_MEALS.reduce((acc, m) => ({ ...acc, [m.key]: m.key !== "colacion3" }), {});
  });
  useEffect(() => localStorage.setItem("enabledMeals", JSON.stringify(enabledMeals)), [enabledMeals]);

  /** Horarios (recordatorios internos) */
  const [mealTimes, setMealTimes] = useState(() => {
    const saved = localStorage.getItem("mealTimes");
    if (saved) return JSON.parse(saved);
    const base = ALL_MEALS.reduce((acc, m) => ({ ...acc, [m.key]: m.defaultTime }), {});
    localStorage.setItem("mealTimes", JSON.stringify(base));
    return base;
  });
  useEffect(() => localStorage.setItem("mealTimes", JSON.stringify(mealTimes)), [mealTimes]);

  /** Estado de hoy: comidas hechas */
  const [mealsDone, setMealsDone] = useState(() => {
    const savedMeals = localStorage.getItem("mealsDone");
    const savedDate  = localStorage.getItem("mealsDate");
    if (!savedMeals || savedDate !== todayKey()) {
      const empty = ALL_MEALS.reduce((acc, m) => ({ ...acc, [m.key]: false }), {});
      localStorage.setItem("mealsDone", JSON.stringify(empty));
      localStorage.setItem("mealsDate", todayKey());
      return empty;
    }
    return JSON.parse(savedMeals);
  });
  useEffect(() => {
    localStorage.setItem("mealsDone", JSON.stringify(mealsDone));
    localStorage.setItem("mealsDate", todayKey());
  }, [mealsDone]);

  /** Meta / racha / puntos / semanal */
  const [goal, setGoal] = useState(() => Number(localStorage.getItem("goal") || 100));
  useEffect(() => localStorage.setItem("goal", String(goal)), [goal]);

  const [streak, setStreak] = useState(() => Number(localStorage.getItem("streak") || 0));
  const [points, setPoints] = useState(() => Number(localStorage.getItem("points") || 0));
  const [weeklyData, setWeeklyData] = useState(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("weeklyData") || "[]");
      return Array.isArray(arr) && arr.length === 7 ? arr : [0,0,0,0,0,0,0];
    } catch { return [0,0,0,0,0,0,0]; }
  });

  /** Derivados */
  const activeKeys = useMemo(() => ALL_MEALS.filter(m => enabledMeals[m.key]).map(m => m.key), [enabledMeals]);
  const percent = useMemo(() => {
    const total = activeKeys.length || 1;
    const checked = activeKeys.filter(k => mealsDone[k]).length;
    return Math.round((checked / total) * 100);
  }, [activeKeys, mealsDone]);

  const message = useMemo(() => {
    if (percent === 0)      return "💡 ¡Vamos, da el primer paso!";
    if (percent < 50)       return "⚡ Buen inicio, sigue marcando.";
    if (percent < goal)     return "🔥 ¡Estás cerca de tu meta!";
    return "🏆 ¡Meta alcanzada hoy!";
  }, [percent, goal]);

  const tip = useMemo(() => {
    const pool = percent < 60 ? TIPS_LOW : TIPS_HIGH;
    return pool[new Date().getDate() % pool.length];
  }, [percent]);

  const medal = getMedal(streak);
  const nextMedal = streak >= 30 ? null
    : streak >= 14 ? { name: "Oro", need: 30 }
    : streak >= 7  ? { name: "Plata", need: 14 }
    : { name: "Bronce", need: 7 };

  /** Guardar semanal al cambiar % */
  useEffect(() => {
    const idx = todayIdx();
    const arr = [...weeklyData];
    arr[idx] = percent;
    setWeeklyData(arr);
    localStorage.setItem("weeklyData", JSON.stringify(arr));
  }, [percent]); // eslint-disable-line

  /** Racha + puntos (1 vez por día al alcanzar meta) */
  useEffect(() => {
    const today = todayKey();
    const lastCounted = localStorage.getItem("lastDay");
    if (percent >= goal && lastCounted !== today) {
      const newStreak = streak + 1;
      const newPoints = points + 2;
      setStreak(newStreak);
      setPoints(newPoints);
      localStorage.setItem("streak", String(newStreak));
      localStorage.setItem("points", String(newPoints));
      localStorage.setItem("lastDay", today);
    }
  }, [percent, goal, streak, points]);

  /** Recordatorios internos (mientras app abierta) */
  const [pendingMeals, setPendingMeals] = useState([]);
  const [dismissToday, setDismissToday] = useState(() => localStorage.getItem("dismissReminders") === todayKey());
  useEffect(() => {
    if (dismissToday) return;
    const winMin = 90;
    const check = () => {
      const now = new Date();
      const cur = now.getHours()*60 + now.getMinutes();
      const due = ALL_MEALS
        .filter(m => enabledMeals[m.key])
        .filter(m => {
          const t = mealTimes[m.key] || m.defaultTime;
          const base = hhmmToMin(t);
          return cur >= base && cur <= base + winMin && !mealsDone[m.key];
        })
        .map(m => m.label);
      setPendingMeals(due);
    };
    check();
    const id = setInterval(check, 60 * 1000);
    return () => clearInterval(id);
  }, [enabledMeals, mealTimes, mealsDone, dismissToday]);

  function dismissRemindersForToday() {
    setDismissToday(true);
    localStorage.setItem("dismissReminders", todayKey());
  }

  /** Handlers */
  function toggleEnabled(key) { setEnabledMeals(e => ({ ...e, [key]: !e[key] })); }
  function toggleDone(key)    { setMealsDone(d => ({ ...d, [key]: !d[key] })); }
  function resetToday() {
    const empty = ALL_MEALS.reduce((acc, x) => ({ ...acc, [x.key]: false }), {});
    setMealsDone(empty);
  }
  function applyPreset(n) {
    let preset = {};
    if (n === 3) preset = { desayuno: true, almuerzo: true, once: true };
    if (n === 4) preset = { desayuno: true, almuerzo: true, colacion2: true, once: true };
    if (n === 5) preset = { desayuno: true, colacion1: true, almuerzo: true, colacion2: true, once: true };
    if (n === 6) preset = { desayuno: true, colacion1: true, almuerzo: true, colacion2: true, once: true, colacion3: true };
    const full = ALL_MEALS.reduce((acc, m) => ({ ...acc, [m.key]: !!preset[m.key] }), {});
    setEnabledMeals(full);
  }

  /** ----- Mascota: nivel y animación de rebote ----- */
  const level = useMemo(() => streakToLevel(streak), [streak]);
  const prevLevelRef = useRef(level);
  const [bounce, setBounce] = useState(false);
  const mascotSrc = useMemo(() => {
    return [osito1, osito2, osito3, osito4][level - 1];
  }, [level]);

  useEffect(() => {
    if (prevLevelRef.current !== level) {
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 800);
      prevLevelRef.current = level;
      return () => clearTimeout(t);
    }
  }, [level]);

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>🌱 Progreso Nutricional</h1>
        <div className="header-actions">
          <button className="ghost" onClick={() => setDark(d => !d)}>
            {dark ? "☀️ Claro" : "🌙 Oscuro"}
          </button>
          <button className="ghost" onClick={() => setProMode(v => !v)}>
            {proMode ? "🔓 Modo Pro" : "🔒 Modo Pro"}
          </button>
        </div>
      </header>

      {/* Banner de recordatorios */}
      {!dismissToday && pendingMeals.length > 0 && (
        <div className="banner">
          ⏰ ¡Hora de {pendingMeals.join(", ")}! — marca cuando la realices.
          <button className="link" onClick={dismissRemindersForToday}>ocultar por hoy</button>
        </div>
      )}

      {/* MASCOTA */}
      <div className="card mascota-card">
        <h2>🐻 Tu Mascota</h2>
        <div className="mascota-box">
          <img
            src={mascotSrc}
            alt="Osito"
            className={`mascota-img ${bounce ? "bounce" : ""}`}
          />
          <div className="mascota-info">
            <div className="mascota-level">Nivel {level}</div>
            <div className="mascota-note">
              {level === 1 && "Tu osito está despertando ✨"}
              {level === 2 && "Tu osito se ve más feliz 😃"}
              {level === 3 && "Tu osito está fuerte 💪"}
              {level >= 4 && "¡Osito maestro de la salud! 🏆"}
            </div>
          </div>
        </div>
      </div>

      {/* Configuración (Modo Pro) */}
      {proMode && (
        <div className="card">
          <h2>⚙️ Configuración (solo profesional)</h2>

          <div className="chips">
            <button className="chip" onClick={() => applyPreset(3)}>Preset 3 (D+Alm+Once)</button>
            <button className="chip" onClick={() => applyPreset(4)}>Preset 4</button>
            <button className="chip" onClick={() => applyPreset(5)}>Preset 5</button>
            <button className="chip" onClick={() => applyPreset(6)}>Preset 6</button>
          </div>

          <div className="row two-cols">
            <div>
              <h3>¿Qué comidas cuentan?</h3>
              <ul className="list">
                {ALL_MEALS.map(m => (
                  <li key={m.key}>
                    <label>
                      <input
                        type="checkbox"
                        checked={!!enabledMeals[m.key]}
                        onChange={() => toggleEnabled(m.key)}
                      />
                      {m.label}
                    </label>
                  </li>
                ))}
              </ul>
              <p className="muted">El % del día se calcula sobre las comidas activas.</p>
            </div>

            <div>
              <h3>Horarios (recordatorios internos)</h3>
              <ul className="list">
                {ALL_MEALS.map(m => (
                  <li key={m.key}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ minWidth: 160 }}>{m.label}</span>
                      <input
                        type="time"
                        value={mealTimes[m.key] || m.defaultTime}
                        onChange={(e) => setMealTimes(t => ({ ...t, [m.key]: e.target.value }))}
                      />
                    </label>
                  </li>
                ))}
              </ul>
              <p className="muted">Mostrará un aviso durante ~90 min desde la hora señalada.</p>
            </div>
          </div>
        </div>
      )}

      {/* Comidas del día */}
      <div className="card">
        <h2>🍽️ Comidas del día</h2>
        {activeKeys.length === 0 ? (
          <p className="muted">Activa al menos una comida en Configuración.</p>
        ) : (
          <ul className="list">
            {ALL_MEALS.filter(m => enabledMeals[m.key]).map(m => (
              <li key={m.key}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!mealsDone[m.key]}
                    onChange={() => toggleDone(m.key)}
                  />
                  {m.label}
                </label>
              </li>
            ))}
          </ul>
        )}
        <button className="btn" onClick={resetToday}>Reiniciar día</button>
      </div>

      {/* Progreso */}
      <div className="card">
        <h2>📊 Progreso diario</h2>
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${percent}%`, background: percent >= goal ? "#16a34a" : "#f59e0b" }}
          />
        </div>
        <p className="strong">{percent}% completado</p>
        <p>{message}</p>
      </div>

      {/* Meta / Racha / Puntos / Medallas */}
      <div className="card">
        <h2>🎯 Meta, 🔥 Racha, ⭐ Puntos</h2>
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
          <div className="points">⭐ {points} pts</div>
        </div>

        <div className="medals">
          <div className="medal">
            {medal ? `${medal.emoji} Medalla ${medal.name}` : "— Sin medalla aún —"}
          </div>
          {nextMedal && (
            <div className="next">
              Próxima: {nextMedal.name} a {nextMedal.need} días. Te faltan <b>{nextMedal.need - streak}</b>.
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
                  style={{ height: `${val}%`, background: val >= 60 ? "#16a34a" : "#f59e0b" }}
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
