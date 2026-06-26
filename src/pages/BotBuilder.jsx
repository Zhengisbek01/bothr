import { useState } from 'react'
import { useStore } from '../store'
import BotEditor from '../components/BotEditor'
import ExcelImport from '../components/ExcelImport'

const TEMPLATES = [
  { id:'onboarding', name:'Онбординг сотрудника', icon:'🎯', desc:'Приветствие, выдача оборудования, ознакомление с политиками', nodes: 5 },
  { id:'survey', name:'Опрос удовлетворённости', icon:'📊', desc:'eNPS опрос, оценка условий труда', nodes: 3 },
  { id:'leave', name:'Заявка на отпуск', icon:'🏖️', desc:'Подача заявки, уведомление руководителя', nodes: 4 },
  { id:'blank', name:'Пустой бот', icon:'➕', desc:'Начать с нуля', nodes: 0 },
]

export default function BotBuilder() {
  const { bots, addBot, deleteBot, updateBot, currentUser } = useStore()
  const isAdmin = currentUser?.role === 'admin'
  const myBots = isAdmin ? bots : bots.filter(b => b.createdBy === currentUser?.id)

  const [view, setView] = useState('list') // list | template | editor | excel
  const [editBot, setEditBot] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = myBots.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  const createFromTemplate = (tpl) => {
    const newBot = {
      name: tpl.name, status:'draft', template: tpl.id,
      whatsappNumber:'', assignedTo:[],
      nodes: getTemplateNodes(tpl.id), edges: getTemplateEdges(tpl.id),
    }
    addBot(newBot)
    setEditBot({ ...newBot, id: `bot-${Date.now()}` })
    setView('editor')
  }

  if (view === 'editor' && editBot) {
    return <BotEditor bot={editBot} onBack={() => { setView('list'); setEditBot(null) }} />
  }

  if (view === 'template') {
    return (
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <button className="btn btn-ghost" onClick={() => setView('list')}>← Назад</button>
          <h2 style={{ fontSize:18, fontWeight:600 }}>Выберите шаблон</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
          {TEMPLATES.map(tpl => (
            <button key={tpl.id} onClick={() => createFromTemplate(tpl)}
              style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24, textAlign:'left', cursor:'pointer', transition:'all 0.2s', color:'var(--text)' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none' }}>
              <div style={{ fontSize:32, marginBottom:12 }}>{tpl.icon}</div>
              <div style={{ fontWeight:600, fontSize:15, marginBottom:6 }}>{tpl.name}</div>
              <div style={{ fontSize:12, color:'var(--text2)', marginBottom:12 }}>{tpl.desc}</div>
              {tpl.nodes > 0 && <span className="badge badge-blue">{tpl.nodes} шагов</span>}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (view === 'excel') {
    return (
      <div style={{ maxWidth:680 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <button className="btn btn-ghost" onClick={() => setView('list')}>← Назад</button>
          <div>
            <h2 style={{ fontSize:18, fontWeight:600 }}>Импорт из Excel</h2>
            <p style={{ fontSize:12, color:'var(--text2)' }}>Загрузите сценарий бота из .xlsx файла</p>
          </div>
        </div>

        {/* Format hint */}
        <div className="card" style={{ marginBottom:20, padding:16 }}>
          <p style={{ fontSize:12, fontWeight:600, marginBottom:10, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.5px' }}>
            Формат таблицы
          </p>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
              <thead>
                <tr>
                  {['Шаг', 'Тип', 'Название', 'Текст', 'Варианты'].map(h => (
                    <th key={h} style={{ padding:'6px 10px', background:'var(--surface2)', border:'1px solid var(--border)', textAlign:'left', color:'var(--text2)', fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1','message','Приветствие','Добро пожаловать! 🎉',''],
                  ['2','question','Оборудование','Ноутбук получили?','Да,Нет'],
                  ['3','input','Дата выхода','Введите дату:',''],
                  ['4','end','Завершение','Онбординг завершён!',''],
                ].map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding:'6px 10px', border:'1px solid var(--border)', color: j===1 ? 'var(--accent)' : 'var(--text)' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize:11, color:'var(--text2)', marginTop:8 }}>
            Типы: <b style={{color:'var(--blue)'}}>message</b> · <b style={{color:'var(--purple)'}}>question</b> · <b style={{color:'var(--warn)'}}>input</b> · <b style={{color:'var(--accent)'}}>end</b>
          </p>
        </div>

        <div className="card">
          <ExcelImport onImported={() => setView('list')} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <input type="text" placeholder="🔍 Поиск ботов..." value={search}
          onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:200 }} />
        <div style={{ display:'flex', gap:8 }}>
          {isAdmin && (
            <button className="btn btn-ghost" onClick={() => setView('excel')}
              style={{ borderColor:'rgba(34,197,94,0.4)', color:'var(--accent)' }}>
              📊 Импорт из Excel
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => setView('template')}>📋 Шаблоны</button>
          <button className="btn btn-primary" onClick={() => setView('template')}>➕ Новый бот</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 24px', background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🤖</div>
          <p style={{ fontSize:15, color:'var(--text2)', marginBottom:20 }}>Нет ботов. Создайте первого!</p>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            {isAdmin && <button className="btn btn-ghost" onClick={() => setView('excel')}>📊 Загрузить из Excel</button>}
            <button className="btn btn-primary" onClick={() => setView('template')}>➕ Создать бота</button>
          </div>
        </div>
      ) : (
        <div style={{ display:'grid', gap:12 }}>
          {filtered.map(bot => (
            <BotCard key={bot.id} bot={bot}
              onEdit={() => { setEditBot(bot); setView('editor') }}
              onDelete={() => deleteBot(bot.id)}
              onToggle={() => updateBot(bot.id, { status: bot.status === 'active' ? 'draft' : 'active' })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function BotCard({ bot, onEdit, onDelete, onToggle }) {
  return (
    <div className="card" style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px' }}>
      <div style={{ width:44, height:44, borderRadius:10, background: bot.status==='active' ? 'rgba(37,211,102,0.15)' : 'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
        {bot.template === 'custom' ? '📊' : '🤖'}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
          <span style={{ fontWeight:600, fontSize:14 }}>{bot.name}</span>
          <span className={`badge ${bot.status==='active' ? 'badge-green' : 'badge-warn'}`}>
            {bot.status==='active' ? '● Активен' : '○ Черновик'}
          </span>
          {bot.template === 'custom' && <span className="badge badge-blue">Excel</span>}
        </div>
        <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--text2)', flexWrap:'wrap' }}>
          <span>📨 Отправлено: {bot.stats.sent}</span>
          <span>✅ Завершено: {bot.stats.completed}</span>
          <span>⏳ В процессе: {bot.stats.pending}</span>
          {bot.nodes && <span>🔗 Шагов: {bot.nodes.length - 1}</span>}
        </div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button className="btn btn-ghost btn-sm" onClick={onToggle}>
          {bot.status==='active' ? '⏸ Пауза' : '▶ Запустить'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onEdit}>✏️ Редактор</button>
        <button className="btn btn-sm" style={{ background:'rgba(239,68,68,0.15)', color:'var(--danger)', border:'1px solid transparent' }} onClick={onDelete}>🗑</button>
      </div>
    </div>
  )
}

function getTemplateNodes(tplId) {
  const templates = {
    onboarding: [
      { id:'n1', type:'start', label:'Старт', x:60, y:60, message:'' },
      { id:'n2', type:'message', label:'Приветствие', x:60, y:180, message:'Добро пожаловать в компанию! 🎉 Я ваш HR-помощник BotHR.' },
      { id:'n3', type:'question', label:'Получили ноутбук?', x:60, y:300, message:'Вы получили рабочий ноутбук и пропуск?', options:['✅ Да', '❌ Нет'] },
      { id:'n4', type:'message', label:'Политики', x:60, y:420, message:'Пожалуйста, ознакомьтесь с политиками компании по ссылке.' },
      { id:'n5', type:'end', label:'Завершение', x:60, y:540, message:'Онбординг завершён! Ваш HR свяжется с вами. 💪' },
    ],
    survey: [
      { id:'n1', type:'start', label:'Старт', x:60, y:60, message:'' },
      { id:'n2', type:'question', label:'Оценка', x:60, y:180, message:'Оцените удовлетворённость от 1 до 5:', options:['⭐1','⭐⭐2','⭐⭐⭐3','⭐⭐⭐⭐4','⭐⭐⭐⭐⭐5'] },
      { id:'n3', type:'end', label:'Спасибо', x:60, y:300, message:'Спасибо за отзыв!' },
    ],
    leave: [
      { id:'n1', type:'start', label:'Старт', x:60, y:60, message:'' },
      { id:'n2', type:'message', label:'Инфо', x:60, y:180, message:'Заявка на отпуск. Укажите даты.' },
      { id:'n3', type:'input', label:'Дата начала', x:60, y:300, message:'Введите дату начала отпуска (дд.мм.гггг):' },
      { id:'n4', type:'end', label:'Отправлено', x:60, y:420, message:'Заявка отправлена руководителю на согласование!' },
    ],
    blank: [
      { id:'n1', type:'start', label:'Старт', x:60, y:60, message:'' },
    ],
  }
  return templates[tplId] || templates.blank
}

function getTemplateEdges(tplId) {
  const edges = {
    onboarding: [{from:'n1',to:'n2'},{from:'n2',to:'n3'},{from:'n3',to:'n4'},{from:'n4',to:'n5'}],
    survey: [{from:'n1',to:'n2'},{from:'n2',to:'n3'}],
    leave: [{from:'n1',to:'n2'},{from:'n2',to:'n3'},{from:'n3',to:'n4'}],
    blank: [],
  }
  return edges[tplId] || []
}
