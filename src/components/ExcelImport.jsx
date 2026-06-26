import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { useStore } from '../store'

export default function ExcelImport({ onImported }) {
  const { addBot, currentUser } = useStore()
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [botName, setBotName] = useState('')
  const inputRef = useRef()

  const parseExcel = (file) => {
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })

        if (!rows.length) { setError('Файл пустой'); return }

        // Validate columns
        const required = ['Шаг', 'Тип', 'Текст']
        const keys = Object.keys(rows[0])
        const missing = required.filter(r => !keys.includes(r))
        if (missing.length) {
          setError(`Нет колонок: ${missing.join(', ')}. Скачайте шаблон.`)
          return
        }

        const nodes = []
        const edges = []

        // Add start node
        nodes.push({ id: 'n0', type: 'start', label: 'Старт', x: 60, y: 60, message: '' })

        rows.forEach((row, i) => {
          const id = `n${i + 1}`
          const type = mapType(String(row['Тип']).toLowerCase().trim())
          const options = row['Варианты']
            ? String(row['Варианты']).split(',').map(s => s.trim()).filter(Boolean)
            : undefined

          nodes.push({
            id,
            type,
            label: row['Название'] || `Шаг ${row['Шаг']}`,
            x: 60,
            y: (i + 1) * 130 + 60,
            message: String(row['Текст']),
            ...(options && { options }),
          })

          // Connect to previous
          const prevId = i === 0 ? 'n0' : `n${i}`
          edges.push({ from: prevId, to: id })
        })

        setBotName(file.name.replace(/\.(xlsx|xls)$/i, ''))
        setPreview({ nodes, edges, rows })
      } catch (err) {
        setError('Ошибка чтения файла: ' + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const mapType = (t) => {
    if (t.includes('вопрос') || t.includes('question') || t.includes('кнопк')) return 'question'
    if (t.includes('ввод') || t.includes('input') || t.includes('текст')) return 'input'
    if (t.includes('конец') || t.includes('end') || t.includes('завершен')) return 'end'
    if (t.includes('условие') || t.includes('condition')) return 'condition'
    return 'message'
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) parseExcel(file)
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) parseExcel(file)
  }

  const importBot = () => {
    if (!preview) return
    addBot({
      name: botName || 'Импортированный бот',
      status: 'draft',
      template: 'custom',
      whatsappNumber: '',
      assignedTo: [],
      nodes: preview.nodes,
      edges: preview.edges,
    })
    setPreview(null)
    setBotName('')
    if (onImported) onImported()
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Шаг', 'Тип', 'Название', 'Текст', 'Варианты'],
      [1, 'message', 'Приветствие', 'Добро пожаловать в компанию! 🎉', ''],
      [2, 'question', 'Оборудование', 'Вы получили ноутбук и пропуск?', 'Да получил,Нет ещё'],
      [3, 'message', 'Политики', 'Ознакомьтесь с политиками компании по ссылке.', ''],
      [4, 'input', 'Дата выхода', 'Введите вашу дату выхода на работу (дд.мм.гггг):', ''],
      [5, 'end', 'Завершение', 'Онбординг завершён! HR свяжется с вами. 💪', ''],
    ])

    // Column widths
    ws['!cols'] = [{ wch: 6 }, { wch: 12 }, { wch: 20 }, { wch: 50 }, { wch: 30 }]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Сценарий')
    XLSX.writeFile(wb, 'bothr-шаблон-сценария.xlsx')
  }

  return (
    <div>
      {/* Download template */}
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
        <button className="btn btn-ghost btn-sm" onClick={downloadTemplate}>
          📥 Скачать шаблон Excel
        </button>
      </div>

      {/* Drop zone */}
      {!preview && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 12,
            padding: '40px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'rgba(37,211,102,0.05)' : 'var(--surface2)',
            transition: 'all 0.2s',
          }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
            Перетащите Excel файл сюда
          </p>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
            или нажмите для выбора · .xlsx, .xls
          </p>
          <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); inputRef.current.click() }}>
            📂 Выбрать файл
          </button>
          <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{ display:'none' }} onChange={handleFile} />
        </div>
      )}

      {error && (
        <div style={{ marginTop:12, padding:12, background:'rgba(239,68,68,0.1)', border:'1px solid var(--danger)', borderRadius:8, fontSize:12, color:'var(--danger)' }}>
          ❌ {error}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:4 }}>Название бота</label>
              <input value={botName} onChange={e => setBotName(e.target.value)}
                style={{ fontWeight:600 }} placeholder="Название бота" />
            </div>
            <span className="badge badge-green" style={{ marginTop:18 }}>
              ✅ {preview.nodes.length - 1} шагов
            </span>
          </div>

          {/* Steps preview */}
          <div style={{ background:'var(--surface2)', borderRadius:10, border:'1px solid var(--border)', overflow:'hidden', marginBottom:16 }}>
            <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', fontSize:11, color:'var(--text2)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>
              Предпросмотр сценария
            </div>
            <div style={{ maxHeight:280, overflowY:'auto' }}>
              {preview.rows.map((row, i) => (
                <div key={i} style={{ display:'flex', gap:12, padding:'10px 14px', borderBottom: i < preview.rows.length-1 ? '1px solid var(--border)' : 'none', alignItems:'flex-start' }}>
                  <div style={{ width:24, height:24, borderRadius:6, background:'var(--accent)22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--accent)', flexShrink:0 }}>
                    {i+1}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:3 }}>
                      <span style={{ fontSize:12, fontWeight:600 }}>{row['Название'] || `Шаг ${row['Шаг']}`}</span>
                      <TypeBadge type={String(row['Тип'])} />
                    </div>
                    <p style={{ fontSize:11, color:'var(--text2)', lineHeight:1.4 }}>{String(row['Текст']).slice(0, 80)}{String(row['Текст']).length > 80 ? '...' : ''}</p>
                    {row['Варианты'] && (
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:4 }}>
                        {String(row['Варианты']).split(',').map((v,j) => (
                          <span key={j} className="tag" style={{ fontSize:10 }}>{v.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-primary" onClick={importBot}>
              🚀 Создать бота из Excel
            </button>
            <button className="btn btn-ghost" onClick={() => { setPreview(null); setError('') }}>
              ← Загрузить другой файл
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TypeBadge({ type }) {
  const t = type.toLowerCase()
  const map = {
    message: { label:'Сообщение', color:'var(--blue)' },
    question: { label:'Вопрос', color:'var(--purple)' },
    вопрос: { label:'Вопрос', color:'var(--purple)' },
    input: { label:'Ввод', color:'var(--warn)' },
    ввод: { label:'Ввод', color:'var(--warn)' },
    end: { label:'Конец', color:'var(--accent)' },
    конец: { label:'Конец', color:'var(--accent)' },
    завершение: { label:'Конец', color:'var(--accent)' },
  }
  const m = Object.entries(map).find(([k]) => t.includes(k))?.[1] || { label: type, color:'var(--text2)' }
  return (
    <span style={{ fontSize:10, padding:'2px 7px', borderRadius:10, background: m.color+'22', color: m.color, fontWeight:600 }}>
      {m.label}
    </span>
  )
}
