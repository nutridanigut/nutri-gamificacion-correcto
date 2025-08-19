// utilidades de localStorage resilientes
const memory = {};

export function getJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return Object.prototype.hasOwnProperty.call(memory, key)
      ? memory[key]
      : fallback;
  }
}

export function setJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    memory[key] = value;
  }
}
