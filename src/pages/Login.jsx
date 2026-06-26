import { useState } from 'react'
import { useStore } from '../store'

export default function Login() {
  const login = useStore(s => s.login)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')

  const handle = (e) => {
    e.preventDefault()
    if (!login(email, pass)) setErr('Неверный email или пароль')
  }

  const demo = (role) => {
    const map = { admin: ['admin@bothr.kz','123'], hr: ['hr@bothr.kz','123'], employee: ['emp@bothr.kz','123'] }
    const [e,p] = map[role]
    setEmail(e); setPass(p)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:56, height:56, borderRadius:16, background:'var(--accent)', marginBottom:16 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h1 style={{ fontSize:28, fontWeight:700, color:'var(--text)', marginBottom:4 }}>BotHR</h1>
          <p style={{ color:'var(--text2)', fontSize:14 }}>WhatsApp автоматизация для HR</p>
        </div>

        <div className="card" style={{ padding:32 }}>
          <h2 style={{ fontSize:18, fontWeight:600, marginBottom:24 }}>Вход в систему</h2>
          <form onSubmit={handle}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.kz" required />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••" required />
            </div>
            {err && <p style={{ color:'var(--danger)', fontSize:12, marginBottom:12 }}>{err}</p>}
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'10px' }}>
              Войти
            </button>
          </form>

          <div className="divider" />

          <p style={{ fontSize:12, color:'var(--text2)', marginBottom:10 }}>Демо-доступ:</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[['admin','Админ'],['hr','HR'],['employee','Сотрудник']].map(([role, label]) => (
              <button key={role} className="btn btn-ghost btn-sm" onClick={() => demo(role)} style={{ flex:1 }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign:'center', color:'var(--text2)', fontSize:11, marginTop:20 }}>
          BotHR · Казахстан · WhatsApp Business API
        </p>
      </div>
    </div>
  )
}
