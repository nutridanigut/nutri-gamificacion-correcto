// utilidades de fecha en formato ISO YYYY-MM-DD
const MS_DAY = 24*60*60*1000;

export function toKey(date){
  return date.toISOString().slice(0,10);
}

export function today(){
  return new Date();
}

export function todayKey(){
  return toKey(today());
}

export function yesterday(){
  return addDays(today(), -1);
}

export function addDays(date, days){
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a, b){
  return toKey(new Date(a)) === toKey(new Date(b));
}

export function daysBetween(a, b){
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.floor((d2 - d1) / MS_DAY);
}
