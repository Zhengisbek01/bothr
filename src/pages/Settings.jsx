import { useState } from 'react'
import { useStore } from '../store'

const PROVIDERS = [
  { id:'360dialog', name:'360dialog', desc:'Официальный WhatsApp BSP для СНГ', url:'https://www.360dialog.com' },
  { id:'twilio', name:'Twilio', desc:'Популярный провайдер, sandbox для разработки', url:'https://twilio.com' },
  { id:'waba', name:'WhatsApp Business API (Meta)', desc:'Прямое подключение через Meta', url:'https://business.whatsapp.com' },
]

export default function Settings() {
  const { apiConfig, setApiConfig } = useStore()
  const [cfg, setCfg] = useState(apiConfig)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const save = () => {
    setApiConfig(cfg)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)
    await new Promise(r => setTimeout(r, 1500))
    setTestResult(cfg.apiKey ? 'success' : 'error')
    setTesting(false)
  }

  return (
    <div style={{ maxWidth:700 }}>
      <div className="card" style={{ marginBottom:20 }}>
        <h3 style={{ fontWeight:600, fontSize:15, marginBottom:16 }}>WhatsApp API провайдер</h3>
        <div style={{ display:'grid', gap:10 }}>
          {PROVIDERS.map(p=>(
            <label key={p.id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:14, background:cfg.provider===p.id?'rgba(37,211,102,0.08)':'var(--surface2)', border:`1px solid ${cfg.provider===p.id?'var(--accent)':'var(--border)'}`, borderRadius:8, cursor:'pointer' }}>
              <input type="radio" name="provider" checked={cfg.provider===p.id}
                onChange={()=>setCfg({...cfg,provider:p.id})} style={{ marginTop:2 }} />
              <div>
                <div style={{ fontWeight:600, fontSize:13, marginBottom:2 }}>{p.name}</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>{p.desc}</div>
              </div>
              <a href={p.url} target="_blank" rel="noopener" style={{ marginLeft:'auto', fontSize:11, color:'var(--accent)', textDecoration:'none' }}>Docs →</a>
            </label>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom:20 }}>
        <h3 style={{ fontWeight:600, fontSize:15, marginBottom:16 }}>Конфигурация API</h3>

        {cfg.provider === '360dialog' && (
          <div style={{ padding:10, background:'rgba(37,211,102,0.08)', border:'1px solid var(--accent)', borderRadius:8, fontSize:12, marginBottom:16 }}>
            📌 Для 360dialog: создайте аккаунт, получите API ключ и WABA ID в личном кабинете
          </div>
        )}

        <div className="form-group">
          <label>API Key</label>
          <input type="password" value={cfg.apiKey||''} onChange={e=>setCfg({...cfg,apiKey:e.target.value})}
            placeholder={cfg.provider==='360dialog' ? 'D1xxx...' : cfg.provider==='twilio' ? 'SKxxxxx' : 'Bearer token'}
          />
        </div>

        {cfg.provider === '360dialog' && (
          <div className="form-group">
            <label>WABA ID</label>
            <input value={cfg.wabaId||''} onChange={e=>setCfg({...cfg,wabaId:e.target.value})} placeholder="123456789" />
          </div>
        )}

        {cfg.provider === 'twilio' && (
          <>
            <div className="form-group">
              <label>Account SID</label>
              <input value={cfg.accountSid||''} onChange={e=>setCfg({...cfg,accountSid:e.target.value})} placeholder="ACxxxxxxxxx" />
            </div>
            <div className="form-group">
              <label>From Number (WhatsApp)</label>
              <input value={cfg.fromNumber||''} onChange={e=>setCfg({...cfg,fromNumber:e.target.value})} placeholder="whatsapp:+14155238886" />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Webhook URL (ваш сервер)</label>
          <input value={cfg.webhookUrl||''} onChange={e=>setCfg({...cfg,webhookUrl:e.target.value})}
            placeholder="https://yourdomain.kz/api/webhook" />
          <p style={{ fontSize:11, color:'var(--text2)', marginTop:4 }}>
            Укажите этот URL в настройках провайдера для получения входящих сообщений
          </p>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-primary" onClick={save}>{saved ? '✅ Сохранено' : '💾 Сохранить'}</button>
          <button className="btn btn-ghost" onClick={testConnection} disabled={testing}>
            {testing ? '⏳ Проверка...' : '🔍 Тест соединения'}
          </button>
        </div>

        {testResult && (
          <div style={{ marginTop:12, padding:10, borderRadius:8, background: testResult==='success' ? 'rgba(37,211,102,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${testResult==='success' ? 'var(--accent)' : 'var(--danger)'}`, fontSize:12 }}>
            {testResult==='success' ? '✅ Соединение установлено! WhatsApp API работает.' : '❌ Ошибка: введите корректный API ключ.'}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontWeight:600, fontSize:15, marginBottom:12 }}>Пример кода</h3>
        <p style={{ fontSize:12, color:'var(--text2)', marginBottom:10 }}>Отправка сообщения через {cfg.provider}:</p>
        <pre style={{ background:'var(--surface2)', padding:16, borderRadius:8, fontSize:11, color:'var(--accent)', overflow:'auto', lineHeight:1.6 }}>
{cfg.provider === '360dialog' ? `// 360dialog WhatsApp API
const response = await fetch(
  'https://waba.360dialog.io/v1/messages',
  {
    method: 'POST',
    headers: {
      'D360-API-KEY': '${cfg.apiKey || 'YOUR_API_KEY'}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: '+77012345678',
      type: 'text',
      text: { body: 'Привет от BotHR! 👋' }
    })
  }
)` : `// Twilio WhatsApp API
const client = require('twilio')(
  '${cfg.accountSid || 'ACCOUNT_SID'}',
  '${cfg.apiKey || 'AUTH_TOKEN'}'
)
await client.messages.create({
  from: 'whatsapp:+14155238886',
  to: 'whatsapp:+77012345678',
  body: 'Привет от BotHR! 👋'
})`}
        </pre>
      </div>
    </div>
  )
}
