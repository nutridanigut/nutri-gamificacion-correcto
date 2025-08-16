
import React, { useMemo, useState } from 'react'
import { Trophy, Flame, Clock, Heart, Sparkles, CheckCircle2 } from 'lucide-react'
import { ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'

const WEEK_DAYS = ['L','M','M','J','V','S','D']

const initialBenefits = [
  { hours: 24, title: 'Hidratación y energía', text: 'Con 1 día cumpliendo la pauta al 60%+, mejora la hidratación y la energía se estabiliza.' },
  { hours: 72, title: 'Mejor digestión', text: 'A los 3 días, suele bajar la hinchazón y mejora el tránsito intestinal.' },
  { hours: 168, title: 'Sueño y ansiedad', text: 'A la semana, el sueño tiende a regularse y disminuyen los picoteos por ansiedad.' },
  { hours: 720, title: 'Composición corporal', text: 'Al mes, empiezas a notar cambios en medidas y ropa.' },
]

const initialRewards = [
  { points: 5, title: 'Receta premium', desc: 'Receta exclusiva descargable.', id: 'r1' },
  { points: 10, title: 'Adelanto del libro', desc: 'Capítulo de adelanto del ebook.', id: 'r2' },
  { points: 15, title: 'Q&A grupal', desc: 'Acceso a sesión grupal online.', id: 'r3' },
]

function ProgressRing({ percent }) {
  const data = [{ name: 'Cumplimiento', value: Math.max(0.01, percent), fill: '#16a34a' }]
  return (
    <div style={{ height: 160, width: 160 }}>
      <ResponsiveContainer>
        <RadialBarChart innerRadius='60%' outerRadius='100%' data={data} startAngle={90} endAngle={-270}>
          <RadialBar dataKey='value' cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function App() {
  const [adherence, setAdherence] = useState(62)
  const [streak, setStreak] = useState(3)
  const [points, setPoints] = useState(4)
  const [weekLog, setWeekLog] = useState([80,60,30,0,70,90,50])
  const [startDate] = useState(() => new Date())

  const hoursSinceStart = useMemo(() => Math.floor((Date.now() - startDate.getTime()) / 36e5), [startDate])
  const activeBenefitIndex = useMemo(() => initialBenefits.reduce((acc, b, i) => hoursSinceStart >= b.hours ? i : acc, -1), [hoursSinceStart])
  const nextReward = initialRewards.find(r => points < r.points)

  function handleQuickLog(value) {
    const today = new Date().getDay()
    const idx = (today + 6) % 7
    const updated = [...weekLog]
    updated[idx] = value
    setWeekLog(updated)
    const avg = Math.round(updated.reduce((a,b)=>a+b,0)/7)
    setAdherence(avg)
    if (value >= 80) setPoints(p=>p+2)
    else if (value >= 60) setPoints(p=>p+1)
    if (avg >= 60) setStreak(s => Math.max(s, s+1))
    else setStreak(0)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#fafafa', color:'#111827', padding:24 }}>
      <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gap:24 }}>
        <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ fontSize:28, fontWeight:600 }}>Gamificación Nutri – MVP</h1>
            <p style={{ fontSize:14, color:'#4b5563' }}>Adherencia simple: % semanal, racha, puntos y beneficios por tiempo.</p>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <div style={{ padding:'4px 10px', borderRadius:9999, background:'#dcfce7', color:'#15803d', fontSize:14, display:'flex', alignItems:'center', gap:6 }}>
              <Flame size={16}/> Racha: <strong>{streak}</strong>
            </div>
            <div style={{ padding:'4px 10px', borderRadius:9999, background:'#fef3c7', color:'#b45309', fontSize:14, display:'flex', alignItems:'center', gap:6 }}>
              <Trophy size={16}/> Puntos: <strong>{points}</strong>
            </div>
          </div>
        </header>

        <section style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:24 }}>
          <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 8px 24px rgba(0,0,0,0.06)', padding:24, display:'flex', alignItems:'center', gap:16 }}>
            <ProgressRing percent={adherence}/>
            <div>
              <h2 style={{ fontSize:20, fontWeight:600 }}>Cumplimiento semanal</h2>
              <p style={{ fontSize:14, color:'#4b5563' }}>Objetivo saludable: ≥ 60%</p>
              <p style={{ fontSize:32, fontWeight:700, marginTop:8 }}>{adherence}%</p>
              <div style={{ marginTop:8, display:'flex', gap:8, flexWrap:'wrap', fontSize:12 }}>
                <span style={{ padding:'4px 8px', borderRadius:8, background:'#f5f5f5' }}>Meta 60% = 1 punto</span>
                <span style={{ padding:'4px 8px', borderRadius:8, background:'#f5f5f5' }}>≥80% = 2 puntos</span>
              </div>
            </div>
          </div>

          <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 8px 24px rgba(0,0,0,0.06)', padding:24 }}>
            <h2 style={{ fontSize:20, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}><Clock size={20}/> Beneficios por tiempo</h2>
            <p style={{ fontSize:14, color:'#4b5563', marginBottom:12 }}>Inspirado en apps para dejar de fumar.</p>
            <ul style={{ display:'grid', gap:12 }}>
              {initialBenefits.map((b,i)=>(
                <li key={b.hours} style={{ padding:12, borderRadius:12, border:'1px solid', borderColor: i<=activeBenefitIndex ? '#bbf7d0' : '#e5e7eb', background: i<=activeBenefitIndex ? '#f0fdf4' : '#fff' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {i<=activeBenefitIndex ? <CheckCircle2 size={20} color="#16a34a"/> : <Heart size={20} color="#6b7280"/>}
                    <div style={{ fontWeight:600 }}>{b.title}</div>
                    <span style={{ marginLeft:'auto', fontSize:12, color:'#6b7280' }}>{b.hours}h</span>
                  </div>
                  <p style={{ fontSize:14, color:'#374151', marginTop:6 }}>{b.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:24 }}>
          <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 8px 24px rgba(0,0,0,0.06)', padding:24 }}>
            <h2 style={{ fontSize:20, fontWeight:600, marginBottom:16 }}>Semana en curso</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:8 }}>
              {weekLog.map((val, i) => (
                <div key={i} style={{ padding:12, borderRadius:12, border:'1px solid #e5e7eb', textAlign:'center' }}>
                  <div style={{ fontSize:12, color:'#6b7280', marginBottom:4 }}>{WEEK_DAYS[i]}</div>
                  <div style={{ fontSize:28, fontWeight:700 }}>{val}%</div>
                  <div style={{ marginTop:6, fontSize:12 }}>{val >= 80 ? '2 pts' : val >= 60 ? '1 pt' : '0'}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:16 }}>
              <p style={{ fontSize:14, color:'#4b5563', marginBottom:8 }}>Registrar rápido el día de hoy</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {[0,30,60,80,100].map(v => (
                  <button key={v} onClick={() => handleQuickLog(v)} style={{ padding:'8px 12px', borderRadius:12, background:'#111827', color:'#fff', fontSize:14 }}>
                    Hoy {v}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 8px 24px rgba(0,0,0,0.06)', padding:24 }}>
            <h2 style={{ fontSize:20, fontWeight:600, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}><Trophy size={20}/> Recompensas</h2>
            <ul style={{ display:'grid', gap:12 }}>
              {initialRewards.map(r => {
                const unlocked = points >= r.points
                return (
                  <li key={r.id} style={{ padding:12, borderRadius:12, border:'1px solid', borderColor: unlocked ? '#fde68a' : '#e5e7eb', background: unlocked ? '#fffbeb' : '#fff' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Sparkles size={20} color={unlocked ? '#b45309' : '#6b7280'} />
                      <div style={{ fontWeight:600 }}>{r.title}</div>
                      <span style={{ marginLeft:'auto', fontSize:12, color:'#6b7280' }}>{r.points} pts</span>
                    </div>
                    <p style={{ fontSize:14, color:'#374151', marginTop:6 }}>{r.desc}</p>
                    {unlocked ? (
                      <button style={{ marginTop:8, width:'100%', padding:'8px 12px', borderRadius:10, background:'#b45309', color:'#fff', fontSize:14 }}>Canjear</button>
                    ) : (
                      <button disabled style={{ marginTop:8, width:'100%', padding:'8px 12px', borderRadius:10, background:'#f3f4f6', color:'#374151', fontSize:14 }}>Bloqueado</button>
                    )}
                  </li>
                )
              })}
            </ul>
            {nextReward && (
              <div style={{ marginTop:12, fontSize:14, color:'#4b5563' }}>
                Próximo desbloqueo a <strong>{nextReward.points} pts</strong>.
              </div>
            )}
          </div>
        </section>

        <footer style={{ fontSize:12, color:'#6b7280', textAlign:'center', paddingTop:16 }}>
          MVP de demostración. Lógica: 60% = adherencia saludable, puntos por umbral, racha semanal, beneficios por tiempo.
        </footer>
      </div>
    </div>
  )
}
