import { useStore } from '../store'

export default function EmployeePortal() {
  const { currentUser, bots, employees } = useStore()
  const emp = employees.find(e => e.id === currentUser?.id) || employees[0]
  const step = emp?.onboardingStep || 0

  const STEPS = [
    { title:'Добро пожаловать!', icon:'👋', desc:'Познакомьтесь с компанией', done: step >= 1 },
    { title:'Получение оборудования', icon:'💻', desc:'Ноутбук, пропуск, корпоративный телефон', done: step >= 2 },
    { title:'Политики компании', icon:'📋', desc:'Ознакомьтесь с регламентами', done: step >= 3 },
    { title:'Знакомство с командой', icon:'🤝', desc:'Встреча с коллегами и руководителем', done: step >= 4 },
    { title:'Онбординг завершён!', icon:'🎉', desc:'Вы успешно прошли онбординг', done: step >= 5 },
  ]

  const myBot = bots.find(b => b.template === 'onboarding')

  return (
    <div style={{ maxWidth:600, margin:'0 auto' }}>
      {/* WhatsApp card */}
      <div style={{ background:'linear-gradient(135deg, var(--accent3), var(--accent2))', borderRadius:16, padding:24, marginBottom:24, color:'white' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
            💬
          </div>
          <div>
            <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:18 }}>HR-помощник</div>
            <div style={{ fontSize:12, opacity:0.8 }}>BotHR · WhatsApp бот</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#90EE90' }} />
            <span style={{ fontSize:12 }}>Онлайн</span>
          </div>
        </div>

        {/* Simulated chat */}
        <div style={{ background:'rgba(0,0,0,0.15)', borderRadius:10, padding:14, marginBottom:14 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <ChatBubble from="bot" text={`Привет, ${currentUser?.name?.split(' ')[0]}! 👋 Я ваш HR-помощник. Давайте начнём онбординг!`} />
            {step >= 1 && <ChatBubble from="user" text="Привет! Готов начать 🙌" />}
            {step >= 2 && <ChatBubble from="bot" text="Отлично! Вы уже получили рабочий ноутбук и пропуск?" />}
            {step >= 2 && <ChatBubble from="user" text="✅ Да, всё получил" />}
            {step >= 3 && <ChatBubble from="bot" text="Супер! Пожалуйста, ознакомьтесь с политиками компании." />}
          </div>
        </div>

        <a href={`https://wa.me/77012345678?text=Привет, HR-помощник!`} target="_blank" rel="noopener"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px 16px', background:'white', color:'var(--accent3)', borderRadius:8, textDecoration:'none', fontWeight:600, fontSize:14 }}>
          💬 Открыть в WhatsApp
        </a>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ fontWeight:600, fontSize:15 }}>Прогресс онбординга</h3>
          <span style={{ fontSize:13, fontWeight:700, color:'var(--accent)' }}>{Math.round(step/5*100)}%</span>
        </div>
        <div style={{ height:6, background:'var(--border)', borderRadius:3, marginBottom:20 }}>
          <div style={{ height:'100%', width:`${step/5*100}%`, background:'var(--accent)', borderRadius:3, transition:'width 0.5s' }}/>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {STEPS.map((s,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background: s.done?'rgba(37,211,102,0.08)':'var(--surface2)', borderRadius:8, border:`1px solid ${s.done?'var(--accent)':'var(--border)'}` }}>
              <div style={{ width:32, height:32, borderRadius:8, background:s.done?'var(--accent)':'var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                {s.done ? '✅' : s.icon}
              </div>
              <div>
                <p style={{ fontWeight:500, fontSize:13, color: s.done?'var(--accent)':'var(--text)' }}>{s.title}</p>
                <p style={{ fontSize:11, color:'var(--text2)' }}>{s.desc}</p>
              </div>
              {i===step && <span className="badge badge-blue" style={{ marginLeft:'auto', flexShrink:0 }}>Текущий</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight:600, fontSize:14, marginBottom:12 }}>Полезные контакты</h3>
        {[
          { name:'HR-менеджер', role:'Айгерим Сатыбалды', phone:'+77001234567', icon:'👩‍💼' },
          { name:'IT-поддержка', role:'Helpdesk', phone:'+77007654321', icon:'💻' },
        ].map((c,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom: i===0?'1px solid var(--border)':'none' }}>
            <span style={{ fontSize:20 }}>{c.icon}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:500, fontSize:13 }}>{c.name}</p>
              <p style={{ fontSize:11, color:'var(--text2)' }}>{c.role}</p>
            </div>
            <a href={`https://wa.me/${c.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener"
              className="btn btn-ghost btn-sm" style={{ textDecoration:'none' }}>💬 WA</a>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatBubble({ from, text }) {
  const isBot = from === 'bot'
  return (
    <div style={{ display:'flex', justifyContent: isBot?'flex-start':'flex-end' }}>
      <div style={{
        maxWidth:'80%', padding:'8px 12px', borderRadius: isBot?'4px 12px 12px 12px':'12px 4px 12px 12px',
        background: isBot?'white':'rgba(37,211,102,0.9)', color: isBot?'#111':'white',
        fontSize:12, lineHeight:1.4,
      }}>
        {text}
      </div>
    </div>
  )
}
