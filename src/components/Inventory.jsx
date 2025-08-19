import { useState } from "react";

const TYPES = ["all", "sticker", "tip", "cosmetic", "badge", "reward"];

export default function Inventory({ items = [] }) {
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div>
      <div className="row">
        {TYPES.map((t) => (
          <button
            key={t}
            className="ghost"
            style={{ fontWeight: filter === t ? 700 : 400 }}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="muted" style={{ marginTop: 8 }}>
          Sin objetos
        </p>
      ) : (
        <div className="chips" style={{ marginTop: 8 }}>
          {shown.map((it, i) => (
            <div key={i} className="chip">
              {it.label || it.id}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
