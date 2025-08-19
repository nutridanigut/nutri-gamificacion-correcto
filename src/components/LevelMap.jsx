export default function LevelMap({ streak, thresholds = [3,7,10,14,15,18,21] }) {
  const max = 21;
  const cells = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="levelmap">
      {cells.map((d) => {
        const passed = streak >= d;
        const isMilestone = thresholds.includes(d);
        return (
          <div key={d} className={`lm-cell ${passed ? "done" : ""} ${isMilestone ? "mile" : ""}`}>
            <div className="lm-dot" />
            <div className="lm-num">{d}</div>
          </div>
        );
      })}
    </div>
  );
}
