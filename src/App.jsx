import { useEffect, useMemo, useRef, useState } from "react";
import "./style.css";

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
const WEEK_LABELS = ["D", "L", "M", "M", "J", "V", "S"];

const todayKey  = () => new Date().toDateString();
const todayIdx  = () => new Date().getDay();
const hhmmToMin = (t) => { const [h,m] = t.split(":").map(Number); return h*60+m; };
function getMedal(streak) {
  if (streak >= 30) return { name: "Oro",   emoji: "🥇", need: 30 };
  if (streak >= 14) return { name: "Plata", emoji: "🥈", need: 14 };
  if (streak >= 7)  return { name: "Bronce",emoji: "🥉", need: 7  };
  return null;
}

/** ----- Spritesheets (por ahora: 2 de prueba) ----- */
import ositoSheet from "./assets/mascota/osito_sheet.png";
import humanoSheet from "./assets/mascota/humano_sheet.png";

/** Mapa por racha → spritesheet (cambia rutas cuando tengas artes por etapa) */
const SHEETS = {
  base: ositoSheet,
  d3:   ositoSheet,
  d7:   ositoSheet,
  d10:  ositoSheet,
  d14:  ositoSheet,
  d15:  humanoSheet,
  d18:  humanoSheet,
  d21:  humanoSheet,
};

const SPRITE_FRAMES = 8;
const FRAME_W = 256;
const FRAME_H = 256;
const SPRITE_FPS = 8;

function streakToKey(streak) {
  if (streak >= 21) return "d21";
  if (streak >= 18) return "d18";
  if (streak >= 15) return "d15";
  if (streak >= 14) return "d14";
  if (streak >= 10) return "d10";
  if (streak >= 7)  return "d7";
  if (streak >= 3)  return "d3";
  return "base";
}

/** ----- Sprite animado ----- */
function Sprite({ sheet, frames = SPRITE_FRAMES, w = FRAME_W, h = FRAME_H, fps = SPRITE_FPS, play = true }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!play) return;
    const id = setInterval(() => setIdx(i => (i + 1) % frames), 1000 / fps);
    return () => clearInterval(id);
  }, [frames, fps, play]);

  return (
    <div
      className="sprite"
      style={{
        width: w,
        height: h,
        backgroundImage: `url(${sheet})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${w * frames}px ${h}px`,
        backgroundPosition: `-${idx * w}px 0px`,
      }}
    />
  );
}

/** ----- App ----- */
export default function App() {
  /** Tema */
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  /** Modo Pro + Simulación */
  const [proMode, setProMode] = useState(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("pro") === "1") { localStorage.setItem("proMode","1"); return true; }
    return localStorage.getItem("proMode") === "1";
  });
  useEffect(() => { proMode ? localStorage.setItem("proMode","1") : localStorage.removeItem("proMode"); }, [proMode]);

  const [simulate, setSimulate] = useState(() => localStorage.getItem("proSim") === "1");
  useEffect(() => { simulate ? localStorage.setItem("proSim","1") : localStorage.removeItem("proSim"); }, [simulate]);

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

  /** Comidas hechas (día) */
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

  /** Guardar semanal */
  useEffect(() => {
    const idx = todayIdx();
    const arr = [...weeklyData];
    arr[idx] = percent;
    setWeeklyData(arr);
    localStorage.setItem("weeklyData", JSON.stringify(arr));
  }, [percent]); // eslint-disable-line

  /** Racha + puntos (solo si NO está en simulación) */
  useEffect(() => {
    if (simulate) return;
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
  }, [percent, goal, streak, points, simulate]);

  /** Recordatorios internos */
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

  /** Presets + handlers */
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

  /** --- Evolución por racha + movimiento por % --- */
  const evoKey = streakToKey(streak);
  const sheet = SHEETS[evoKey] || SHEETS.base;
  const trackProgressStyle = { "--p": percent };

  /** --- Simuladores (solo UI) --- */
  const [simStreak, setSimStreak] = useState(streak);
  const [simPercent, setSimPercent] = useState(percent);

  // Aplica simulación a estado real
  function applySimulation() {
    setStreak(simStreak);
    localStorage.setItem("streak", String(simStreak));
    // porcentaje simulado solo para la pista (no altera comidas); lo forzamos visualmente:
    // Para visualizar, marcamos comidas equivalentes (aprox).
    const total = Math.max(1, ALL_MEALS.filter(m => enabledMeals[m.key]).length);
    const need = Math.round((simPercent / 100) * total);
    const actives = ALL_MEALS.filter(m => enabledMeals[m.key]).map(m => m.key);
    const newDone = ALL_MEALS.reduce((acc, m, i) => {
      acc[m.key] = actives.includes(m.key) && i < need;
      return acc;
    }, {});
    setMealsDone(newDone);
  }

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
          {/* “Retrato”: frame 0 del sheet */}
          <div className="portrait">
            <div
              className="sprite"
              style={{
                width: 160, height: 160,
                backgroundImage: `url(${sheet})`,
                backgroundSize: `${160 * SPRITE_FRAMES}px 160px`,
                backgroundPosition: `0px 0px`,
              }}
            />
          </div>
          <div className="mascota-info">
            <div className="mascota-level">Racha: {streak} días</div>
            <div className="mascota-note">
              {evoKey === "base" && "Tu osito está despertando ✨"}
              {evoKey === "d3"  && "💥 Primer power-up: abdomen"}
              {evoKey === "d7"  && "🛡️ Armadura activada"}
              {evoKey === "d10" && "⚔️ Casco + espada"}
              {evoKey === "d14" && "🛡️🔒 Oculto en armadura"}
              {evoKey === "d15" && "🧍 Transición a humano"}
              {evoKey === "d18" && "💪 Tonificación visible"}
              {evoKey === "d21" && "🏆 Abdomen marcado (leyenda)"}
            </div>
          </div>
        </div>
      </div>

      {/* PISTA: camina según % del día */}
      <div className="card">
        <h2>🚶 Progreso del día (tu personaje camina)</h2>
        <div className="track">
          <div className="track-fill" style={{ width: `${percent}%` }} />
          <div className="walker" style={trackProgressStyle}>
            <Sprite sheet={sheet} frames={SPRITE_FRAMES} w={64} h={64} fps={SPRITE_FPS} play={true} />
          </div>
        </div>
        <p className="strong">{percent}% del día</p>
      </div>

      {/* ----- Configuración & Simuladores (Modo Pro) ----- */}
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

          <hr style={{ opacity: .2, margin: "12px 0" }} />

          <div className="row" style={{ gap: 16, alignItems: "flex-end" }}>
            <div>
              <h3>🧪 Simulación</h3>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={simulate}
                  onChange={(e) => setSimulate(e.target.checked)}
                />
                Pausar auto-rachas (usar controles manuales)
              </label>
            </div>

            <div>
              <label>Racha (días):&nbsp;</label>
              <input
                type="number"
                min={0}
                value={simStreak}
                onChange={(e)=>setSimStreak(Math.max(0, Number(e.target.value||0)))}
              />
              <button className="chip" onClick={()=>setSimStreak(s=>s+1)}>+1</button>
              <button className="chip" onClick={()=>setSimStreak(s=>Math.max(0,s-1))}>-1</button>
            </div>

            <div>
              <label>Progreso %:&nbsp;</label>
              <input
                type="number"
                min={0} max={100}
                value={simPercent}
                onChange={(e)=>setSimPercent(Math.min(100, Math.max(0, Number(e.target.value||0))))}
              />
            </div>

            <button className="btn" onClick={applySimulation}>Aplicar simulación</button>
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

      {/* Progreso numérico */}
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
