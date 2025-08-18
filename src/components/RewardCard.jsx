// src/components/RewardCard.jsx
export default function RewardCard({ reward, onClaim, claimed }) {
  if (!reward) return null;
  return (
    <div className={`reward ${claimed ? "claimed" : ""}`}>
      <div className="reward-title">🎁 {reward.title}</div>
      <div className="reward-type">
        {reward.type === "cosmetic" && "Accesorio / Skin"}
        {reward.type === "content"  && "Contenido desbloqueado"}
        {reward.type === "session"  && "Sesión / Beneficio"}
      </div>
      {!claimed ? (
        <button className="btn" onClick={onClaim}>Canjear</button>
      ) : (
        <div className="muted">✅ Canjeado</div>
      )}
    </div>
  );
}
