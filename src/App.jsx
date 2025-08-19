import { useEffect, useMemo, useState } from "react";
import "./style.css";
import { todayKey, todayIdx, hhmmToMin, WEEK_LABELS } from "./utils/date";
import { REWARDS, randomLoot, STAGE_THRESHOLDS } from "./gamification/rewards";
import LevelMap from "./components/LevelMap";
import RewardCard from "./components/RewardCard";
import Mascota from "./components/Mascota";
import Walker from "./components/Walker";
import { getJSON, setJSON } from "./utils/storage";

/** ----- Config base ----- */
const ALL_MEALS = [
  { key: "desayuno",  label: "Desayuno",     defaultTime: "08:00" },
  { key: "colacion1", label: "Colación AM",  defaultTime: "11:00" },
  { key: "almuerzo",  label: "Almuerzo",     defaultTime: "13:00" },
  { key: "colacion2", label: "Colación PM",  defaultTime: "17:00" },
  { key: "once",      label: "Once",         defaultTime: "20:00" },
  { key: "colacion3", label: "Colación nocturna (opcional)", defaultTime: "22:00" },
];

const TIPS_LOW  = ["🌱 Pequeños pasos → grandes cambios", "💧 Bebe agua durante el día", "🧠 Si fallas hoy, retoma mañana", "🍎 Suma 1 fruta"];
const TIPS_HIGH = ["💪 ¡Excelente constancia!", "🥗 Varía colores/vegetales", "🚶 10–15 min de movimiento", "🧩 Mantén tu racha"];

function getMedal(streak) {
  if (streak >= 30) return { name: "Oro", emoji: "🥇", need: 30 };
  if (streak >= 14) return { name: "Plata", emoji: "🥈", need: 14 };
  if (streak >= 7)  return { name: "Bronce", emoji: "🥉", need: 7  };
  return null;
}

export default function App() {
  /** Tema */
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  /** Modo pro + simulador */
  const [proMode, setProMode] = useState(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("pro") === "1") { localStorage.setItem("proMode","1"); return true; }
    return localStorage.getItem("proMode") === "1";
  });
  useEffect(()=>{ proMode ? localStorage.setItem("proMode","1") : localStorage.removeItem("proMode"); },[proMode]);

  const [simulate, setSimulate] = useState(() => localStorage.getItem("proSim") === "1");
  useEffect(()=>{ simulate ? localStorage.setItem("proSim","1") : localStorage.removeItem("proSim"); },[simulate]);

  /** Qué comidas cuentan */
  const [enabledMeals, setEnabledMeals] = useState(() => {
    const saved = getJSON("enabledMeals", null);
    if (saved) return saved;
    return ALL_MEALS.reduce((acc, m) => ({ ...acc, [m.key]: m.key !== "colacion3" }), {});
  });
  useEffect(() => setJSON("enabledMeals", enabledMeals), [enabledMeals]);

  /** Horarios */
  const [mealTimes, setMealTimes] = useState(() => {
    const saved = getJSON("mealTimes", null);
    if (saved) return saved;
    const base = ALL_MEALS.reduce((acc, m) => ({ ...acc, [m.key]: m.defaultTime }), {});
    setJSON("mealTimes", base);
    return base;
  });
  useEffect(()=> setJSON("mealTimes", mealTimes), [mealTimes]);

  /** Estado del día */
  const [mealsDone, setMealsDone] = useState(() => {
    const sd = localStorage.getItem("mealsDate");
    const sm = getJSON("mealsDone", null);
    if (!sm || sd !== todayKey()) {
      const empty = ALL_MEALS.reduce((acc,m)=>({ ...acc, [m.key]: false }),{});
      setJSON("mealsDone", empty);
      localStorage.setItem("mealsDate", todayKey());
      return empty;
    }
    return sm;
  });
  useEffect(() => {
    setJSON("mealsDone", mealsDone);
    localStorage.setItem("mealsDate", todayKey());
  }, [mealsDone]);

  /** Meta / racha / puntos / semanal */
  const [goal, setGoal] = useState(() => Number(getJSON("goal", 100)));
  useEffect(()=>setJSON("goal", goal),[goal]);

  const [streak, setStreak] = useState(() => Number(getJSON("streak", 0)));
  const [points, setPoints] = useState(() => Number(getJSON("points", 0)));

  const [weeklyData, setWeeklyData] = useState(() => {
    const arr = getJSON("weeklyData", [0,0,0,0,0,0,0]);
    return Array.isArray(arr) && arr.length === 7 ? arr : [0,0,0,0,0,0,0];
  });

  /** Inventario y recompensas */
  const [inventory, setInventory] = useState(() => getJSON("inventory", []));
  useEffect(()=>setJSON("inventory", inventory),[inventory]);

  const [claimed, setClaimed] = useState(() => getJSON("claimedRewards", {}));
  useEffect(()=>setJSON("claimedRewards", claimed),[claimed]);

  /** Derivados */
  const activeKeys = useMemo(() => ALL_MEALS.filter(m => enabledMeals[m.key]).map(m => m.key), [enabledMeals]);
  const percent = useMemo(() => {
    const total = activeKeys.length || 1;
    const checked = activeKeys.filter(k => mealsDone[k]).length;
    return Math.round((checked / total) * 100);
  }, [activeKeys, mealsDone]);

  const tip = useMemo(() => {
    const pool = percent < 60 ? TIPS_LOW : TIPS_HIGH;
    return pool[new Date().getDate() % pool.length];
  }, [percent]);

  /** Guardar semanal */
  useEffect(() => {
    const idx = todayIdx();
    const arr = [...weeklyData]; arr[idx] = percent;
    setWeeklyData(arr);
    setJSON("weeklyData", arr);
  }, [percent]); // eslint-disable-line

  /** Racha/puntos automáticos (si no simulo) */
  useEffect(() => {
    if (simulate) return;
    const today = todayKey();
    const last = localStorage.getItem("lastDay");
    if (percent >= goal && last !== today) {
      const ns = streak + 1;
      const np = points + 2;
      setStreak(ns); setPoints(np);
      setJSON("streak", ns);
      setJSON("points", np);
      localStorage.setItem("lastDay", today);

      // Cofre cada 3 días de racha
      if (ns % 3 === 0) {
        const loot = randomLoot();
        setInventory(inv => [...inv, loot]);
      }
    }
  }, [percent, goal, streak, points, simulate]);

  /** Recordatorios (banner) */
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
    check(); const id = setInterval(check, 60*1000);
    return () => clearInterval(id);
  }, [enabledMeals, mealTimes, mealsDone, dismissToday]);

  function dismissRemindersForToday() {
    setDismissToday(true); localStorage.setItem("dismissReminders", todayKey());
  }

  /** Handlers básicos */
  function toggleEnabled(key){ setEnabledMeals(e => ({ ...e, [key]: !e[key] })); }
  function toggleDone(key){ setMealsDone(d => ({ ...d, [key]: !d[key] })); }
  function resetToday(){
    const empty = ALL_MEALS.reduce((acc,x)=>({ ...acc, [x.key]: false }),{});
    setMealsDone(empty);
  }
  function applyPreset(n){
    let preset = {};
    if (n===3) preset = { desayuno:true, almuerzo:true, once:true };
    if (n===4) preset = { desayuno:true, almuerzo:true, colacion2:true, once:true };
    if (n===5) preset = { desayuno:true, colacion1:true, almuerzo:true, colacion2:true, once:true };
    if (n===6) preset = { desayuno:true, colacion1:true, almuerzo:true, colacion2:true, once:true, colacion3:true };
    const full = ALL_MEALS.reduce((acc,m)=>({ ...acc, [m.key]: !!preset[m.key] }),{});
    setEnabledMeals(full);
  }

  /** Simuladores (pro) */
  const [simStreak, setSimStreak] = useState(streak);
  const [simPercent, setSimPercent] = useState(percent);
  function applySimulation(){
    setStreak(simStreak);
    setJSON("streak", simStreak);
    const total = Math.max(1, activeKeys.length);
    const need = Math.round((simPercent/100)*total);
    const newDone = ALL_MEALS.reduce((acc,m,i)=>{
      acc[m.key] = i < need && enabledMeals[m.key]; return acc;
    }, {});
    setMealsDone(newDone);
  }

  /** Selector de evolución (Pro) */
  const PREVIEW_STAGES = [0,3,7,10,14,18,21];
  const [preview, setPreview] = useState(null); // streak para previsualizar
  const displayStreak = preview ?? streak;

  /** Recompensa del día (si hay hito) */
  const todaysReward = REWARDS.find(r => r.day === streak);
  const rewardClaimed = todaysReward ? !!claimed[todaysReward.day] : false;
  function claimReward(){
    if (!todaysReward) return;
    setClaimed(c => ({ ...c, [todaysReward.day]: true }));
    // si es "cosmetic", lo metemos a inventario
    if (todaysReward.type === "cosmetic") {
      setInventory(inv => [...inv, { id: todaysReward.payload, label: todaysReward.title, type: "cosmetic" }]);
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>🌱 Progreso Nutricional</h1>
        <div className="header-actions">
          <button className="ghost" aria-label="Cambiar tema" onClick={() => setDark(d=>!d)}>{dark ? "☀️ Claro" : "🌙 Oscuro"}</button>
          <button className="ghost" aria-label="Alternar modo Pro" onClick={() => setProMode(v=>!v)}>{proMode ? "🔓 Pro" : "🔒 Pro"}</button>
        </div>
      </header>

      {!dismissToday && pendingMeals.length > 0 && (
        <div className="banner">
          ⏰ ¡Hora de {pendingMeals.join(", ")}! — marca cuando la realices.
          <button className="link" onClick={dismissRemindersForToday}>ocultar por hoy</button>
        </div>
      )}

      {/* MASCOTA */}
      <div className="card">
        <h2>🐻 Tu Mascota</h2>
        <div className="row" style={{ alignItems:"center" }}>
          <Mascota streak={displayStreak} size={128} speed={1} />
          <div>
            <div style={{ fontWeight:700 }}>Racha: {streak} días</div>
          </div>
        </div>
      </div>

      {/* PISTA (camina según % del día) */}
      <div className="card">
        <h2>🚶 Progreso del día (tu personaje camina)</h2>
        <Walker percent={percent} streak={displayStreak} size={64} speed={1} />
        <p><b>{percent}%</b> del día</p>
        <p className="muted">El % del día se calcula sobre tus comidas activas.</p>
      </div>

      {/* MODO PRO (config + simuladores) */}
      {proMode && (
        <div className="card">
          <h2>⚙️ Configuración (Pro)</h2>
          <div className="row">
            <div>
              <label>Meta (%): </label>
              <input type="number" min={10} max={100} value={goal} onChange={e=>setGoal(Number(e.target.value||0))}/>
            </div>
            <div className="muted" style={{marginLeft:"auto"}}>Activa/desactiva comidas y horarios abajo</div>
          </div>

          <hr style={{opacity:.2, margin:"12px 0"}}/>

          <div className="row" style={{gap:16, alignItems:"flex-end"}}>
            <label style={{display:"flex",alignItems:"center",gap:8}}>
              <input type="checkbox" checked={simulate} onChange={(e)=>setSimulate(e.target.checked)}/>
              Pausar auto‑racha (usar controles manuales)
            </label>

            <div>
              <label>Racha: </label>
              <input type="number" min={0} value={simStreak} onChange={e=>setSimStreak(Math.max(0, Number(e.target.value||0)))}/>
              <button className="btn" style={{marginLeft:8}} onClick={()=>setSimStreak(s=>s+1)}>+1</button>
            </div>

            <div>
              <label>Progreso %: </label>
              <input type="number" min={0} max={100} value={simPercent} onChange={e=>setSimPercent(Math.min(100, Math.max(0, Number(e.target.value||0))))}/>
            </div>

            <button className="btn" aria-label="Aplicar simulación" onClick={applySimulation}>Aplicar simulación</button>
          </div>

          <div className="row" style={{marginTop:10}}>
            <button className="ghost" onClick={()=>applyPreset(3)}>Preset 3 (D+Alm+Once)</button>
            <button className="ghost" onClick={()=>applyPreset(4)}>Preset 4</button>
            <button className="ghost" onClick={()=>applyPreset(5)}>Preset 5</button>
            <button className="ghost" onClick={()=>applyPreset(6)}>Preset 6</button>
          </div>

          <div className="row" style={{marginTop:10}}>
            {PREVIEW_STAGES.map((s,i)=>(
              <button key={s} className="ghost" onClick={()=>setPreview(s)} aria-label={`Ver evolución ${i+1}`}>Evo {i+1}</button>
            ))}
            {preview !== null && (
              <button className="link" onClick={()=>setPreview(null)} aria-label="Cerrar previsualización">Cerrar</button>
            )}
          </div>
        </div>
      )}

      {/* COMIDAS DEL DÍA */}
      <div className="card">
        <h2>🍽️ Comidas del día</h2>
        <div className="two-cols">
          <div>
            <ul className="list">
              {ALL_MEALS.filter(m=>enabledMeals[m.key]).map(m=>(
                <li key={m.key}>
                  <label><input type="checkbox" checked={!!mealsDone[m.key]} onChange={()=>toggleDone(m.key)}/> {m.label}</label>
                </li>
              ))}
            </ul>
            <button className="btn" onClick={resetToday}>Reiniciar día</button>
          </div>
          {proMode && (
            <div>
              <h3>¿Qué comidas cuentan?</h3>
              <ul className="list">
                {ALL_MEALS.map(m=>(
                  <li key={m.key}>
                    <label><input type="checkbox" checked={!!enabledMeals[m.key]} onChange={()=>toggleEnabled(m.key)}/> {m.label}</label>
                  </li>
                ))}
              </ul>
              <h3>Horarios</h3>
              <ul className="list">
                {ALL_MEALS.map(m=>(
                  <li key={m.key}>
                    <label style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{minWidth:160}}>{m.label}</span>
                      <input type="time" value={mealTimes[m.key] || m.defaultTime} onChange={e=>setMealTimes(t=>({ ...t, [m.key]: e.target.value }))}/>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* PROGRESO CLÁSICO */}
      <div className="card">
        <h2>📊 Progreso diario</h2>
        <div className="progress-bar"><div className="progress" style={{ width:`${percent}%`, background: percent>=goal ? "#16a34a" : "#f59e0b" }}/></div>
        <p className="muted">{percent<goal ? "🔥 ¡Estás cerca de tu meta!" : "🏆 ¡Meta alcanzada hoy!"}</p>
      </div>

      {/* MAPA DE NIVELES */}
      <div className="card">
        <h2>🗺️ Mapa de niveles (1–21)</h2>
        <LevelMap streak={streak} thresholds={STAGE_THRESHOLDS}/>
      </div>

      {/* RECOMPENSA DEL DÍA */}
      {todaysReward && (
        <div className="card">
          <h2>🎁 Recompensa por hito</h2>
          <RewardCard reward={todaysReward} claimed={rewardClaimed} onClaim={claimReward}/>
        </div>
      )}

      {/* INVENTARIO */}
      <div className="card">
        <h2>🎒 Inventario</h2>
        {inventory.length === 0 ? (
          <p className="muted">Aún no has desbloqueado objetos. ¡Sigue sumando días! 🎯</p>
        ) : (
          <div className="chips">
            {inventory.map((it, i)=>(
              <div key={i} className="chip">{it.label || it.id}</div>
            ))}
          </div>
        )}
        <p className="muted" style={{marginTop:8}}>Cada 3 días de racha recibes un cofre sorpresa.</p>
      </div>

      {/* HISTORIAL SEMANAL */}
      <div className="card">
        <h2>📅 Historial semanal</h2>
        <div className="levelmap">
          {weeklyData.map((val,i)=>(
            <div key={i} className="lm-cell done" style={{height:60}}>
              <div className="lm-num">{WEEK_LABELS[i]}</div>
              <div className="muted">{val}%</div>
            </div>
          ))}
        </div>
        <div className="muted" style={{marginTop:8}}>Verde ≥60%, ámbar &lt;60%.</div>
      </div>

      {/* TIP DEL DÍA */}
      <div className="card">
        <h2>💡 Tip del día</h2>
        <p>{tip}</p>
      </div>
    </div>
  );
}
codex/fix-build-errors-in-app.jsx

 codex/fix-vite-build-and-prepare-for-vercel-deploy


 main
