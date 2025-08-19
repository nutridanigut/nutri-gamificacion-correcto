// src/utils/storage.js
// Helpers to persist JSON data safely in localStorage.

export function getJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn('getJSON error', err);
    return fallback;
  }
}

export function setJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('setJSON error', err);
  }
}

// Optional React hook for convenience
// TODO: consider moving to a dedicated hooks directory if project grows.
import { useEffect, useState } from 'react';
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => getJSON(key, initial));
  useEffect(() => { setJSON(key, value); }, [key, value]);
  return [value, setValue];
}
