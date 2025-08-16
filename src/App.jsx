import { useState, useEffect } from "react";
import "./index.css";

export default function App() {
  const [progreso, setProgreso] = useState(
    parseInt(localStorage.getItem("progreso")) || 0
  );
  const [meta, setMeta] = useState(
    parseInt(localStorage.getItem("meta")) || 60
  );
  const [racha, setRacha] = useState(
    parseInt(localStorage.getItem("racha")) || 0
  );
  const [mensaje, setMensaje] = useState("");

  // Guardar datos en localStorage
  useEffect(() => {
    localStorage.setItem("progreso", progreso);
    localStorage.setItem("meta", meta);
    localStorage.setItem("racha", racha);
  }, [progreso, meta, racha]);

  // Mensajes motivadores según avance
  useEffect(() => {
    if (progreso === 0) setMensaje("💡 ¡Vamos, da el primer paso!");
    else if (progreso < meta / 2) setMensaje("⚡ ¡Buen inicio, sigue!");
    else if (progreso < meta) setMensaje("🔥 Estás cerca de tu meta!");
    else if (progreso >= meta) setMensaje("🏆 ¡Meta alcanzada!");
  }, [progreso, meta]);

  // Actualizar racha cuando se cumple meta
  useEffect(() => {
    if (progreso >= meta) {
      if (!localStorage.getItem("metaCumplidaHoy")) {
        setRacha(racha + 1);
        localStorage.setItem("metaCumplidaHoy", "true");
      }
    } else {
      localStorage.removeItem("metaCumplidaHoy");
    }
  }, [progreso, meta, racha]);

  return (
    <div className="app">
      <h1>🌱 Progreso Nutricional</h1>

      <div className="card">
        <h2>📊 Tu progreso</h2>
        <input
          type="range"
          min="0"
          max="100"
          value={progreso}
          onChange={(e) => setProgreso(parseInt(e.target.value))}
        />
        <p>{progreso}%</p>
        <div
          className="barra"
          style={{
            width: progreso + "%",
            background: progreso >= meta ? "green" : "orange",
          }}
        ></div>
        <p>{mensaje}</p>
      </div>

      <div className="card">
        <h2>🎯 Meta diaria</h2>
        <input
          type="number"
          value={meta}
          onChange={(e) => setMeta(parseInt(e.target.value))}
        />
        <p>Meta actual: {meta}%</p>
      </div>

      <div className="card">
        <h2>🔥 Racha</h2>
        <p>{racha} días seguidos cumpliendo la meta</p>
      </div>

      {progreso >= 100 && (
        <div className="logro">🏅 ¡Logro desbloqueado: 100% completado!</div>
      )}
    </div>
  );
}
