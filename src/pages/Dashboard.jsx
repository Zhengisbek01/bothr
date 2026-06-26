import { useStore } from '../store'

export default function Dashboard() {
  const { currentUser, bots, employees } = useStore()
  const isAdmin = currentUser?.role === 'admin'
  const isHR = currentUser?.role === 'hr'

  const myBots = isAdmin ? bots : bots.filter(b => b.createdBy === currentUser?.id)
  const activeBots = myBots.filter(b => b.status === 'active')
  const totalSent = myBots.reduce((s, b) => s + b.stats.sent, 0)
  const totalCompleted = myBots.reduce((s, b) => s + b.stats.completed, 0)

  const stats = isAdmin ? [
    { label:'Всего ботов', value: bots.length, icon:'🤖', color:'var(--accent)' },
    { label:'Активных', value: bots.filter(b=>b.status==='active').length, icon:'✅', color:'var(--blue)' },
    { label:'Сотрудников', value: employees.length, icon:'👥', color:'var(--purple)' },
    { label:'Сообщений отправлено', value: totalSent, icon:'📨', color:'var(--warn)' },
  ] : [
    { label:'Мои боты', value: myBots.length, icon:'🤖', color:'var(--accent)' },
    { label:'Активных', value: activeBots.length, icon:'✅', color:'var(--blue)' },
    { label:'Отправлено', value: totalSent, icon:'📨', color:'var(--purple)' },
    { label:'Завершено', value: totalCompleted, icon:'🎯', color:'var(--warn)' },
  ]

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>
          Добро пожаловать, {currentUser?.name?.split(' ')[0]}! 👋
        </h1>
        <p style={{ color:'var(--text2)', fontSize:14 }}>Обзор WhatsApp HR-автоматизации</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:28 }}>
        {stats.map((s,i) => (
          <div key={i} className="card" style={{ padding:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <p style={{ fontSize:11, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' }}>{s.label}</p>
                <p style={{ fontSize:28, fontWeight:700, color:s.color }}>{s.value}</p>
              </div>
              <span style={{ fontSize:24 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
        {/* Bot list */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontWeight:600, fontSize:15 }}>Активные боты</h3>
            <span className="badge badge-green">{activeBots.length} онлайн</span>
          </div>
          {myBots.length === 0 ? (
            <div className="empty-state">
              <p>Нет ботов. Создайте первый!</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {myBots.map(bot => (
                <div key={bot.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--surface2)', borderRadius:8, border:'1px solid var(--border)' }}>
                  <div className={`dot ${bot.status === 'active' ? 'dot-green' : 'dot-gray'}`} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:500, fontSize:13, marginBottom:2 }}>{bot.name}</p>
                    <p style={{ fontSize:11, color:'var(--text2)' }}>
                      Отправлено: {bot.stats.sent} · Завершено: {bot.stats.completed}
                    </p>
                  </div>
                  <span className={`badge ${bot.status === 'active' ? 'badge-green' : 'badge-warn'}`}>
                    {bot.status === 'active' ? 'Активен' : 'Черновик'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <h3 style={{ fontWeight:600, fontSize:15, marginBottom:14 }}>Быстрые действия</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {(isAdmin || isHR) && <>
                <QuickBtn icon="➕" label="Создать бота" />
                <QuickBtn icon="📋" label="Готовые шаблоны" />
                <QuickBtn icon="📊" label="Экспорт отчёта" />
              </>}
              {isAdmin && <QuickBtn icon="👤" label="Добавить HR" />}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontWeight:600, fontSize:15, marginBottom:14 }}>Недавняя активность</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { icon:'✅', text:'Нурлан завершил онбординг', time:'2ч назад' },
                { icon:'📨', text:'Дина получила опрос', time:'4ч назад' },
                { icon:'🤖', text:'Бот онбординга обновлён', time:'вчера' },
              ].map((a,i) => (
                <div key={i} style={{ display:'flex', gap:8, fontSize:12 }}>
                  <span>{a.icon}</span>
                  <div>
                    <p style={{ color:'var(--text)', marginBottom:1 }}>{a.text}</p>
                    <p style={{ color:'var(--text2)' }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickBtn({ icon, label }) {
  return (
    <button style={{
      display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
      background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8,
      color:'var(--text)', fontSize:13, cursor:'pointer', textAlign:'left',
      transition:'all 0.15s',
    }}
    onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
    onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
      <span>{icon}</span> {label}
    </button>
  )
}
