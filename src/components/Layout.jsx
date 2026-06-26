import { useState } from 'react'
import { useStore } from '../store'

const NAV_ADMIN = [
  { id:'dashboard', label:'Дашборд', icon:'📊' },
  { id:'bots', label:'Все боты', icon:'🤖' },
  { id:'employees', label:'Сотрудники', icon:'👥' },
  { id:'analytics', label:'Аналитика', icon:'📈' },
  { id:'settings', label:'Настройки API', icon:'⚙️' },
]
const NAV_HR = [
  { id:'dashboard', label:'Дашборд', icon:'📊' },
  { id:'bots', label:'Мои боты', icon:'🤖' },
  { id:'employees', label:'Сотрудники', icon:'👥' },
  { id:'analytics', label:'Отчёты', icon:'📈' },
]
const NAV_EMP = [
  { id:'mychat', label:'Мои задачи', icon:'✅' },
  { id:'profile', label:'Профиль', icon:'👤' },
]

export default function Layout({ page, setPage, children }) {
  const { currentUser, logout } = useStore()
  const [collapsed, setCollapsed] = useState(false)

  const nav = currentUser?.role === 'admin' ? NAV_ADMIN : currentUser?.role === 'hr' ? NAV_HR : NAV_EMP
  const roleLabel = { admin: 'Администратор', hr: 'HR-менеджер', employee: 'Сотрудник' }[currentUser?.role]
  const roleColor = { admin: 'var(--danger)', hr: 'var(--accent)', employee: 'var(--blue)' }[currentUser?.role]

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 220, flexShrink:0, background:'var(--surface)',
        borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column',
        transition:'width 0.2s ease', overflow:'hidden'
      }}>
        {/* Header */}
        <div style={{ padding:'16px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontSize:18 }}>💬</span>
          </div>
          {!collapsed && <div>
            <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:15, color:'var(--text)' }}>BotHR</div>
            <div style={{ fontSize:10, color:'var(--text2)' }}>WhatsApp Platform</div>
          </div>}
          <button onClick={() => setCollapsed(!collapsed)} style={{ marginLeft:'auto', background:'none', border:'none', color:'var(--text2)', fontSize:16, padding:4 }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
          {nav.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)}
              style={{
                width:'100%', display:'flex', alignItems:'center', gap:10,
                padding:'10px 10px', borderRadius:8, border:'none', cursor:'pointer',
                background: page === item.id ? 'rgba(37,211,102,0.12)' : 'transparent',
                color: page === item.id ? 'var(--accent)' : 'var(--text2)',
                fontWeight: page === item.id ? 600 : 400,
                fontSize:13, textAlign:'left', marginBottom:2,
                transition:'all 0.15s',
              }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:'12px 10px', borderTop:'1px solid var(--border)' }}>
          {!collapsed && <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:2 }}>{currentUser?.name}</div>
            <span style={{ fontSize:10, padding:'2px 6px', borderRadius:10, background: roleColor + '22', color: roleColor }}>{roleLabel}</span>
          </div>}
          <button onClick={logout} className="btn btn-ghost btn-sm" style={{ width:'100%', justifyContent:'center' }}>
            {collapsed ? '🚪' : '🚪 Выйти'}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Topbar */}
        <div style={{ height:56, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 24px', background:'var(--surface)', flexShrink:0 }}>
          <div style={{ flex:1 }}>
            <h2 style={{ fontSize:16, fontWeight:600, color:'var(--text)' }}>
              {nav.find(n => n.id === page)?.icon} {nav.find(n => n.id === page)?.label}
            </h2>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div className="dot dot-green" style={{ animation:'pulse 2s infinite' }}/>
            <span style={{ fontSize:12, color:'var(--text2)' }}>WhatsApp API</span>
          </div>
        </div>

        {/* Page */}
        <div style={{ flex:1, overflow:'auto', padding:'24px' }}>
          {children}
        </div>
      </main>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}
