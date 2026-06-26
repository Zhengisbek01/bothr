import { useStore } from '../store'

export default function Analytics() {
  const { bots, employees } = useStore()
  const totalSent = bots.reduce((s,b)=>s+b.stats.sent,0)
  const totalCompleted = bots.reduce((s,b)=>s+b.stats.completed,0)
  const rate = totalSent ? Math.round(totalCompleted/totalSent*100) : 0

  const onboarded = employees.filter(e=>(e.onboardingStep||0)>=5).length
  const onboardRate = employees.length ? Math.round(onboarded/employees.length*100) : 0

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:28 }}>
        {[
          { label:'Сообщений отправлено', value:totalSent, icon:'📨', color:'var(--blue)' },
          { label:'Завершено диалогов', value:totalCompleted, icon:'✅', color:'var(--accent)' },
          { label:'Конверсия', value:`${rate}%`, icon:'🎯', color:'var(--purple)' },
          { label:'Онбординг завершён', value:`${onboardRate}%`, icon:'🏁', color:'var(--warn)' },
        ].map((s,i)=>(
          <div key={i} className="card">
            <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontSize:26, fontWeight:700, color:s.color, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:11, color:'var(--text2)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div className="card">
          <h3 style={{ fontWeight:600, fontSize:15, marginBottom:16 }}>Статистика по ботам</h3>
          {bots.map(bot=>(
            <div key={bot.id} style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:13 }}>
                <span style={{ fontWeight:500 }}>{bot.name}</span>
                <span style={{ color:'var(--text2)' }}>{bot.stats.sent > 0 ? Math.round(bot.stats.completed/bot.stats.sent*100) : 0}%</span>
              </div>
              <div style={{ height:6, background:'var(--border)', borderRadius:3 }}>
                <div style={{ height:'100%', width:`${bot.stats.sent > 0 ? Math.round(bot.stats.completed/bot.stats.sent*100) : 0}%`, background:'var(--accent)', borderRadius:3 }}/>
              </div>
              <div style={{ display:'flex', gap:16, fontSize:11, color:'var(--text2)', marginTop:4 }}>
                <span>Отправлено: {bot.stats.sent}</span>
                <span>Завершено: {bot.stats.completed}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ fontWeight:600, fontSize:15, marginBottom:16 }}>Онбординг по отделам</h3>
          {['IT','Финансы','Продажи'].map((dept,i)=>{
            const deptEmps = employees.filter(e=>e.dept===dept)
            const done = deptEmps.filter(e=>(e.onboardingStep||0)>=5).length
            const pct = deptEmps.length ? Math.round(done/deptEmps.length*100) : 0
            return (
              <div key={dept} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:13 }}>
                  <span>{dept} <span style={{ color:'var(--text2)', fontSize:11 }}>({deptEmps.length} чел)</span></span>
                  <span style={{ fontWeight:600 }}>{pct}%</span>
                </div>
                <div style={{ height:6, background:'var(--border)', borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:['var(--blue)','var(--purple)','var(--warn)'][i], borderRadius:3 }}/>
                </div>
              </div>
            )
          })}

          <div className="divider" />
          <h4 style={{ fontWeight:600, fontSize:13, marginBottom:12 }}>Активность за неделю</h4>
          <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80 }}>
            {[40,65,30,80,55,90,45].map((v,i)=>(
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div style={{ width:'100%', height:`${v}%`, background:'var(--accent)', borderRadius:'3px 3px 0 0', opacity:0.7 }}/>
                <span style={{ fontSize:9, color:'var(--text2)' }}>{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
