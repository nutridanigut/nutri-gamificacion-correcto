import { useEffect, useState } from "react";
import Mascota from "./components/Mascota";
import Walker from "./components/Walker";
import LevelMap from "./components/LevelMap";
import RewardCard from "./components/RewardCard";
import Inventory from "./components/Inventory";
import ProModePanel from "./components/ProModePanel";
import { getJSON, setJSON } from "./utils/storage";
import { todayKey } from "./utils/date";
import { clamp } from "./utils/numbers";
import { MILESTONES, rewardForStreak } from "./gamification/rewards";
import { streakToStageKey } from "./gamification/spriteAssets";
import { shouldDropLoot, randomLoot } from "./gamification/loot";

export default function App() {
  const [streak, setStreak] = useState(() => getJSON("app.streak", 0));
  const [progress, setProgress] = useState(() => getJSON("app.dailyProgress", 0));
  const [inventory, setInventory] = useState(() => getJSON("app.inventory", []));
  const [claimed, setClaimed] = useState(() => getJSON("app.claimedRewards", {}));
  const [lastDate, setLastDate] = useState(() => getJSON("app.lastCheckDate", todayKey()));

  // cambio de día
  useEffect(() => {
    const today = todayKey();
    if (lastDate !== today) {
      if (progress < 100) setStreak(0);
      setProgress(0);
      setLastDate(today);
    }
  }, []);

  // persistencia
  useEffect(() => setJSON("app.streak", streak), [streak]);
  useEffect(() => setJSON("app.dailyProgress", progress), [progress]);
  useEffect(() => setJSON("app.inventory", inventory), [inventory]);
  useEffect(() => setJSON("app.claimedRewards", claimed), [claimed]);
  useEffect(() => setJSON("app.lastCheckDate", lastDate), [lastDate]);

  // loot
  useEffect(() => {
    if (shouldDropLoot(streak)) {
      const item = randomLoot();
      setInventory((inv) => [...inv, item]);
    }
  }, [streak]);

  const reward = rewardForStreak(streak);
  const rewardClaimed = reward ? claimed[reward.day] : false;

  function claimReward() {
    if (reward && !rewardClaimed) {
      setClaimed((c) => ({ ...c, [reward.day]: true }));
      setInventory((inv) => [
        ...inv,
        { id: `reward_${reward.day}`, label: reward.title, type: reward.type },
      ]);
    }
  }

  function markProgress(val) {
    setProgress(clamp(val, 0, 100));
  }

  function completeToday() {
    if (progress < 100) {
      markProgress(100);
      setStreak((s) => s + 1);
    }
  }

  // pro mode
  const [proMode, setProMode] = useState(false);
  const [simStreak, setSimStreak] = useState(streak);
  const [simProgress, setSimProgress] = useState(progress);
  const [previewStage, setPreviewStage] = useState(null);

  const displayStreak = proMode ? simStreak : streak;
  const displayProgress = proMode ? simProgress : progress;
  const stageKey = previewStage || streakToStageKey(displayStreak);

  return (
    <div className="container">
      <h1>Nutri Gamificación</h1>
      <ProModePanel
        active={proMode}
        onToggle={() => setProMode((p) => !p)}
        simStreak={simStreak}
        setSimStreak={setSimStreak}
        simProgress={simProgress}
        setSimProgress={setSimProgress}
        previewStage={previewStage}
        setPreviewStage={setPreviewStage}
      />
      <div className="card" style={{ textAlign: "center" }}>
        <Mascota streak={displayStreak} stageKey={stageKey} />
        <p className="muted">Racha: {displayStreak} día(s)</p>
      </div>
      <div className="card">
        <Walker percent={displayProgress} streak={displayStreak} />
        {!proMode && (
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn" onClick={() => markProgress(progress + 10)}>
              +10%
            </button>
            <button className="btn" onClick={completeToday}>
              Completar día
            </button>
          </div>
        )}
      </div>
      <div className="card">
        <LevelMap streak={displayStreak} thresholds={MILESTONES} />
      </div>
      {reward && (
        <div className="card">
          <h2>Recompensa</h2>
          <RewardCard reward={reward} claimed={rewardClaimed} onClaim={claimReward} />
        </div>
      )}
      <div className="card">
        <h2>Inventario</h2>
        <Inventory items={inventory} />
      </div>
    </div>
  );
}
