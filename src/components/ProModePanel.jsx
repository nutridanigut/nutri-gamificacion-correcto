import { STAGE_THRESHOLDS } from "../gamification/spriteAssets";

export default function ProModePanel({
  active,
  onToggle,
  simStreak,
  setSimStreak,
  simProgress,
  setSimProgress,
  previewStage,
  setPreviewStage,
}) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <label>
        <input type="checkbox" checked={active} onChange={onToggle} /> Pro Mode
      </label>
      {active && (
        <div className="row" style={{ marginTop: 8 }}>
          <label>
            Racha
            <input
              type="number"
              value={simStreak}
              onChange={(e) => setSimStreak(Number(e.target.value))}
              style={{ marginLeft: 4 }}
            />
          </label>
          <label>
            % Día
            <input
              type="number"
              value={simProgress}
              onChange={(e) => setSimProgress(Number(e.target.value))}
              style={{ marginLeft: 4 }}
            />
          </label>
          <label>
            Etapa
            <select
              value={previewStage || ""}
              onChange={(e) => setPreviewStage(e.target.value || null)}
              style={{ marginLeft: 4 }}
            >
              <option value="">auto</option>
              {STAGE_THRESHOLDS.map((d, idx) => (
                <option key={d} value={`evolution-${idx + 1}`}>
                  {`evolution-${idx + 1}`}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
