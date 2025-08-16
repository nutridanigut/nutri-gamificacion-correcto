// Guardar progreso en localStorage
const checkboxes = document.querySelectorAll("input[type=checkbox]");
const progressBar = document.getElementById("progress");
const progressText = document.getElementById("progress-text");
const streakText = document.getElementById("streak");
const tipText = document.getElementById("tip");

let streak = localStorage.getItem("streak") ? parseInt(localStorage.getItem("streak")) : 0;
let lastDate = localStorage.getItem("lastDate");

const tips = [
  "¡Sigue así! Cada comida saludable cuenta 💪",
  "Recuerda hidratarte durante el día 💧",
  "Pequeños pasos llevan a grandes cambios 🌱",
  "La constancia es tu mejor aliada 🔑"
];

// Cargar estado de checkboxes
checkboxes.forEach(cb => {
  const saved = localStorage.getItem(cb.dataset.meal);
  if (saved === "true") cb.checked = true;
});

updateProgress();

// Evento cuando se marca una comida
checkboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    localStorage.setItem(cb.dataset.meal, cb.checked);
    updateProgress();
  });
});

function updateProgress() {
  const total = checkboxes.length;
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
  const percent = Math.round((checked / total) * 100);

  progressBar.style.width = percent + "%";
  progressText.textContent = percent + "% completado";

  // Tips motivacionales aleatorios
  if (checked > 0) {
    tipText.textContent = tips[Math.floor(Math.random() * tips.length)];
  }

  // Rachas
  const today = new Date().toDateString();
  if (checked === total) {
    if (lastDate !== today) {
      streak++;
      localStorage.setItem("streak", streak);
      localStorage.setItem("lastDate", today);
    }
  }
  streakText.textContent = "🔥 " + streak + " días seguidos";
}
