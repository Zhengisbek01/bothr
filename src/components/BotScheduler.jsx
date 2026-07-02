import { useState } from 'react'

const DAYS = [
  { id: 1, label: 'Пн' }, { id: 2, label: 'Вт' }, { id: 3, label: 'Ср' },
  { id: 4, label: 'Чт' }, { id: 5, label: 'Пт' }, { id: 6, label: 'Сб' }, { id: 0, label: 'Вс' }
]

const TRIGGER_TYPES = [
  { id: 'manual', label: 'Вручную', icon: '👆', desc: 'Только по кнопке' },
  { id: 'onboarding', label: 'При добавлении сотрудника', icon: '👤', desc: 'Сразу автоматически' },
  { id: 'schedule', label: 'По расписанию', icon: '📅', desc: 'В выбранные дни и время' },
  { id: 'delay', label: 'Через N дней', icon: '⏱️', desc: 'После события' },
]

function getDayWord(n) {
  if (n === 1) return 'день'
  if (n >= 2 && n <= 4) return 'дня'
  return 'дней'
}

function getEventLabel(event) {
  const map = { onboarding: 'начала онбординга', hire_date: 'даты найма', probation: 'конца испытательного срока' }
  return map[event] || event
}

export default function BotScheduler({ schedule, onChange }) {
  const s = schedule || {
    triggerType: 'manual',
    days: [],
    time: '09:00',
    delayDays: 1,
    delayEvent: 'onboarding',
    timezone: 'Asia/Almaty',
    active: false,
  }

  const update = (data) => onChange({ ...s, ...data })

  const toggleDay = (day) => {
    const days = s.days.includes(day)
      ? s.days.filter(d => d !== day)
      : [...s.days, day]
    update({ days })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontWeight: 600, fontSize: 15 }}>Расписание отправки</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>{s.active ? 'Активно' : 'Выкл'}</span>
          <div onClick={() => update({ active: !s.active })}
            style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', background: s.active ? 'var(--accent)' : 'var(--border)', transition: 'background 0.2s' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: s.active ? 18 : 2, transition: 'left 0.2s' }} />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Тип запуска</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
          {TRIGGER_TYPES.map(t => (
            <button key={t.id} onClick={() => update({ triggerType: t.id })}
              style={{
                padding: '10px 12px', borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                border: `1px solid ${s.triggerType === t.id ? 'var(--accent)' : 'var(--border)'}`,
                background: s.triggerType === t.id ? 'rgba(37,211,102,0.08)' : 'var(--surface2)',
                transition: 'all 0.15s',
              }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.triggerType === t.id ? 'var(--accent)' : 'var(--text)', marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text2)' }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {s.triggerType === 'schedule' && (
        <>
          <div className="form-group">
            <label>Дни недели</label>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {DAYS.map(d => (
                <button key={d.id} onClick={() => toggleDay(d.id)}
                  style={{
                    width: 40, height: 40, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    border: `1px solid ${s.days.includes(d.id) ? 'var(--accent)' : 'var(--border)'}`,
                    background: s.days.includes(d.id) ? 'var(--accent)' : 'var(--surface2)',
                    color: s.days.includes(d.id) ? '#000' : 'var(--text2)',
                    transition: 'all 0.15s',
                  }}>
                  {d.label}
                </button>
              ))}
            </div>
            {s.days.length === 0 && <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>Выберите хотя бы один день</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Время</label>
              <input type="time" value={s.time} onChange={e => update({ time: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Часовой пояс</label>
              <select value={s.timezone} onChange={e => update({ timezone: e.target.value })}>
                <option value="Asia/Almaty">Алматы (UTC+5)</option>
                <option value="Asia/Astana">Астана (UTC+5)</option>
                <option value="Asia/Oral">Орал (UTC+5)</option>
                <option value="Europe/Moscow">Москва (UTC+3)</option>
              </select>
            </div>
          </div>

          {s.days.length > 0 && (
            <div style={{ padding: 12, background: 'rgba(37,211,102,0.08)', border: '1px solid var(--accent)', borderRadius: 8, fontSize: 12, marginTop: 4 }}>
              <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>📋 Расписание:</p>
              <p style={{ color: 'var(--text)' }}>
                Каждые <b>{s.days.map(d => DAYS.find(x => x.id === d)?.label).join(', ')}</b> в <b>{s.time}</b> ({s.timezone})
              </p>
            </div>
          )}
        </>
      )}

      {s.triggerType === 'delay' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Через сколько дней</label>
              <input type="number" min="1" max="365" value={s.delayDays}
                onChange={e => update({ delayDays: parseInt(e.target.value) || 1 })} />
            </div>
            <div className="form-group">
              <label>После события</label>
              <select value={s.delayEvent} onChange={e => update({ delayEvent: e.target.value })}>
                <option value="onboarding">Начала онбординга</option>
                <option value="hire_date">Даты найма</option>
                <option value="probation">Конца испытательного срока</option>
              </select>
            </div>
            <div className="form-group">
              <label>Время</label>
              <input type="time" value={s.time} onChange={e => update({ time: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Часовой пояс</label>
              <select value={s.timezone} onChange={e => update({ timezone: e.target.value })}>
                <option value="Asia/Almaty">Алматы (UTC+5)</option>
                <option value="Asia/Astana">Астана (UTC+5)</option>
                <option value="Europe/Moscow">Москва (UTC+3)</option>
              </select>
            </div>
          </div>
          <div style={{ padding: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid var(--blue)', borderRadius: 8, fontSize: 12 }}>
            <p style={{ color: 'var(--blue)', fontWeight: 600, marginBottom: 4 }}>📋 Итог:</p>
            <p style={{ color: 'var(--text)' }}>
              Через <b>{s.delayDays} {getDayWord(s.delayDays)}</b> после {getEventLabel(s.delayEvent)} в <b>{s.time}</b>
            </p>
          </div>
        </>
      )}

      {s.triggerType === 'onboarding' && (
        <div style={{ padding: 12, background: 'rgba(37,211,102,0.08)', border: '1px solid var(--accent)', borderRadius: 8, fontSize: 12 }}>
          <p style={{ color: 'var(--accent)' }}>✅ Бот запустится автоматически при добавлении нового сотрудника.</p>
        </div>
      )}

      {s.triggerType === 'manual' && (
        <div style={{ padding: 12, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}>
          <p style={{ color: 'var(--text2)' }}>👆 Запуск только вручную — кнопкой "▶ Запустить" в списке ботов.</p>
        </div>
      )}
    </div>
  )
}
