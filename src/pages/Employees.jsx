import { useState } from 'react'
import { useStore } from '../store'

const DEPTS = ['IT','HR','Финансы','Продажи','Маркетинг','Операции']

export default function Employees() {
  const { employees, addEmployee, updateEmployee, bots } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name:'', email:'', dept:'IT', phone:'', status:'active' })

  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.dept.toLowerCase().includes(search.toLowerCase()))

  const submit = () => {
    if (!form.name || !form.email) return
    addEmployee({ ...form, onboardingStep: 0 })
    setForm({ name:'', email:'', dept:'IT', phone:'', status:'active' })
    setShowAdd(false)
  }

  const onboardingBot = bots.find(b => b.template === 'onboarding' && b.status === 'active')

  return (
    <div>
      <div style={{ display:'flex', gap:12, marginBottom:20 }}>
        <input type="text" placeholder="🔍 Поиск сотрудников..." value={search}
          onChange={e=>setSearch(e.target.value)} style={{ flex:1, maxWidth:320 }} />
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          ➕ Добавить сотрудника
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom:20 }}>
          <h3 style={{ fontWeight:600, marginBottom:16, fontSize:15 }}>Новый сотрудник</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label>ФИО *</label>
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Иванов Иван Иванович" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="ivan@company.kz" />
            </div>
            <div className="form-group">
              <label>Телефон (WhatsApp)</label>
              <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+77012345678" />
            </div>
            <div className="form-group">
              <label>Отдел</label>
              <select value={form.dept} onChange={e=>setForm({...form,dept:e.target.value})}>
                {DEPTS.map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          {onboardingBot && (
            <div style={{ padding:10, background:'rgba(37,211,102,0.08)', border:'1px solid var(--accent)', borderRadius:8, marginBottom:12, fontSize:12 }}>
              ✅ При добавлении будет запущен бот: <b>{onboardingBot.name}</b>
            </div>
          )}
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-primary" onClick={submit}>Добавить и запустить онбординг</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Отмена</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--border)' }}>
              {['Сотрудник','Отдел','Телефон','Онбординг','Статус','Действия'].map(h=>(
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, color:'var(--text2)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(emp => (
              <tr key={emp.id} style={{ borderBottom:'1px solid var(--border)' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'var(--accent)22', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color:'var(--accent)' }}>
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontWeight:500, fontSize:13 }}>{emp.name}</p>
                      <p style={{ fontSize:11, color:'var(--text2)' }}>{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding:'12px 16px' }}>
                  <span className="tag">{emp.dept}</span>
                </td>
                <td style={{ padding:'12px 16px', fontSize:12, color:'var(--text2)' }}>{emp.phone || '—'}</td>
                <td style={{ padding:'12px 16px' }}>
                  <OnboardingProgress step={emp.onboardingStep || 0} total={5} />
                </td>
                <td style={{ padding:'12px 16px' }}>
                  <span className={`badge ${emp.status==='active' ? 'badge-green' : 'badge-warn'}`}>
                    {emp.status==='active' ? 'Активен' : 'Ожидание'}
                  </span>
                </td>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>updateEmployee(emp.id,{onboardingStep:Math.min((emp.onboardingStep||0)+1,5)})}>▶ Шаг</button>
                    <a href={`https://wa.me/${emp.phone?.replace(/\D/g,'')}`} target="_blank" rel="noopener" className="btn btn-ghost btn-sm" style={{ textDecoration:'none' }}>💬 WA</a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state"><p>Нет сотрудников</p></div>
        )}
      </div>
    </div>
  )
}

function OnboardingProgress({ step, total }) {
  const pct = Math.round((step / total) * 100)
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text2)', marginBottom:3 }}>
        <span>Шаг {step}/{total}</span>
        <span>{pct}%</span>
      </div>
      <div style={{ height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background: pct===100 ? 'var(--accent)' : 'var(--blue)', borderRadius:2, transition:'width 0.3s' }}/>
      </div>
    </div>
  )
}
