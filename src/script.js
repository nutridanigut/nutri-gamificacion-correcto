// Guardar comidas marcadas y progreso en localStorage
const meals = document.querySelectorAll(".meal");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const reinforcement = document.getElementById("reinforcement");
const streakEl = document.getElementById("streak");
const rewardEl = document.getElementById("reward");
const tips = [
  "Toma suficiente agua durante el día 💧",
  "Come frutas y verduras de colores distintos 🌈",
  "Muévete al menos 15 minutos diarios 🚶‍♂️",
  "No te castigues por un día difícil, sigue adelante 💪",
  "Recuerda: pequeños cambios logran grandes resultados 🌟"
];

let streak = localStorage.getItem("streak") || 0;
let weeklyData = JSON.parse(localStorage.getItem("weeklyData")) || [0,0,0,0,0,0,0];

// Mostrar tip aleatorio
document.getElementById("dailyTip").innerText = tips[Math.floor(Math.random()*tips.length)];

// Manejo de comidas
meals.forEach(meal => {
  meal.addEventListener("change", updateProgress);
});

// Actualizar progreso
function updateProgress() {
  const total = meals.length;
  const checked = document.querySelectorAll(".meal:checked").length;
  const percent = Math.round((checked / total) * 100);

  progressBar.value = percent;
  progressText.innerText = `${percent}% completado`;

  reinforcement.innerText = checked > 0 ? "¡Bien hecho, sigue así! 🎉" : "👉 Marca tus comidas para avanzar";

  // Si completó el 100%, actualizar racha
  if (percent === 100) {
    streak++;
    localStorage.setItem("streak", streak);
    streakEl.innerText = `${streak} días seguidos cumpliendo la meta`;

    if (streak >= 5) {
      rewardEl.style.display = "block";
    }
  } else {
    streak = 0;
    localStorage.setItem("streak", streak);
    streakEl.innerText = "0 días seguidos cumpliendo la meta";
    rewardEl.style.display = "none";
  }

  // Guardar progreso en el día actual (0 = domingo)
  const today = new Date().getDay();
  weeklyData[today] = percent;
  localStorage.setItem("weeklyData", JSON.stringify(weeklyData));
  updateWeeklyChart();
}

// Graficar progreso semanal
const ctx = document.getElementById("weeklyChart").getContext("2d");
let chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],
    datasets: [{
      label: "Progreso (%)",
      data: weeklyData,
      backgroundColor: "rgba(75,192,192,0.6)"
    }]
  }
});

function updateWeeklyChart() {
  chart.data.datasets[0].data = weeklyData;
  chart.update();
}
