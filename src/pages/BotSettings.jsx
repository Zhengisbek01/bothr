import { useState } from 'react'
import { useStore } from '../store'
import BotScheduler from '../components/BotScheduler'

export default function BotSettings({ bot, onBack }) {
  const { updateBot } = useStore()
  const [tab, setTab] = useState('schedule')
  const [schedule, setSchedule] = useState(bot.schedule || {
    triggerType: 'manual', days: [], time: '09:00',
    delayDays: 1, delayEvent: 'onboarding',
    timezone: 'Asia/Almaty', active: false,
  })
  const [waNumber, setWaNumber] = useState(bot.whatsappNumber || '')
  const [saved, setSaved] = useState(false)

  const save = () => {
    updateBot(bot.id, { schedule, whatsappNumber: waNumber })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const TABS = [
    { id: 'schedule', label: '📅 Расписание' },
    { id: 'whatsapp', label: '📱 WhatsApp' },
    { id: 'employees', label: '👥 Получатели' },
  ]

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Назад</button>
        <h2 style={{ fontSize: 17, fontWeight: 600 }}>{bot.name} — Настройки</h2>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--surface)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: tab === t.id ? 'var(--surface2)' : 'transparent',
              color: tab === t.id ? 'var(--text)' : 'var(--text2)',
              fontWeight: tab === t.id ? 600 : 400, fontSize: 13,
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'schedule' && <BotScheduler schedule={schedule} onChange={setSchedule} />}
        {tab === 'whatsapp' && (
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>📱 WhatsApp номер</h3>
            <div className="form-group">
              <label>Номер отправителя</label>
              <input value={waNumber} onChange={e => setWaNumber(e.target.value)} placeholder="+7700XXXXXX" />
              <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>Номер подключённый к WhatsApp Business API</p>
            </div>
          </div>
        )}
        {tab === 'employees' && <EmployeesTab bot={bot} onUpdate={(data) => updateBot(bot.id, data)} />}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" onClick={save}>{saved ? '✅ Сохранено' : '💾 Сохранить'}</button>
        <button className="btn btn-ghost" onClick={onBack}>Отмена</button>
      </div>
    </div>
  )
}

function EmployeesTab({ bot, onUpdate }) {
  const { employees } = useStore()
  const assigned = bot.assignedTo || []

  const toggle = (id) => {
    const next = assigned.includes(id) ? assigned.filter(a => a !== id) : [...assigned, id]
    onUpdate({ assignedTo: next })
  }

  return (
    <div>
      <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>👥 Получатели</h3>
      <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>Выберите сотрудников</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {employees.map(emp => (
          <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: assigned.includes(emp.id) ? 'rgba(37,211,102,0.08)' : 'var(--surface2)', border: `1px solid ${assigned.includes(emp.id) ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={assigned.includes(emp.id)} onChange={() => toggle(emp.id)} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, fontSize: 13 }}>{emp.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text2)' }}>{emp.dept} · {emp.phone || 'нет телефона'}</p>
            </div>
            {!emp.phone && <span style={{ fontSize: 10, color: 'var(--danger)' }}>⚠️ нет номера</span>}
          </label>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 12 }}>Выбрано: <b style={{ color: 'var(--accent)' }}>{assigned.length}</b> из {employees.length}</p>
    </div>
  )
}
