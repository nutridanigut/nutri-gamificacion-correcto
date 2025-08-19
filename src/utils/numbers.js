export function clamp(val, min=0, max=100){
  return Math.min(Math.max(val, min), max);
}

export function percent(part, total){
  if(total <= 0) return 0;
  return clamp(Math.round((part/total)*100), 0, 100);
}
