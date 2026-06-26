import { useState, useRef } from 'react'
import { useStore } from '../store'

const NODE_TYPES = [
  { type:'message', label:'Сообщение', icon:'💬', color:'#3b82f6' },
  { type:'media', label:'Фото / Видео', icon:'🖼️', color:'#ec4899' },
  { type:'question', label:'Вопрос с кнопками', icon:'❓', color:'#8b5cf6' },
  { type:'input', label:'Ввод текста', icon:'✍️', color:'#f59e0b' },
  { type:'condition', label:'Условие', icon:'🔀', color:'#ef4444' },
  { type:'end', label:'Завершение', icon:'🏁', color:'#25D366' },
]

const TYPE_COLOR = {
  start:'#25D366', message:'#3b82f6', media:'#ec4899',
  question:'#8b5cf6', input:'#f59e0b', condition:'#ef4444', end:'#25D366'
}

export default function BotEditor({ bot, onBack }) {
  const { updateBot, bots } = useStore()
  const liveBot = bots.find(b => b.id === bot.id) || bot

  const [nodes, setNodes] = useState(liveBot.nodes || [])
  const [edges, setEdges] = useState(liveBot.edges || [])
  const [selected, setSelected] = useState(null)
  const [botName, setBotName] = useState(liveBot.name)
  const [waNumber, setWaNumber] = useState(liveBot.whatsappNumber || '')
  const [saved, setSaved] = useState(false)

  const selectedNode = nodes.find(n => n.id === selected)

  const addNode = (type) => {
    const newNode = {
      id: `n${Date.now()}`, type,
      label: NODE_TYPES.find(t => t.type === type)?.label || type,
      x: 60 + Math.random() * 200, y: nodes.length * 120 + 60,
      message: '',
      options: type === 'question'
        ? [{ text: 'Вариант 1', nextId: '' }, { text: 'Вариант 2', nextId: '' }]
        : undefined,
      media: type === 'media' ? { url: '', mediaType: 'image', caption: '' } : undefined,
    }
    setNodes(p => [...p, newNode])
    setSelected(newNode.id)
  }

  const updateNode = (id, data) => setNodes(p => p.map(n => n.id === id ? { ...n, ...data } : n))

  const deleteNode = (id) => {
    setNodes(p => p.filter(n => n.id !== id))
    setEdges(p => p.filter(e => e.from !== id && e.to !== id))
    setSelected(null)
  }

  // Связь для НЕ-вопросов
  const connectNodes = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return
    setEdges(p => {
      const filtered = p.filter(e => !(e.from === fromId && !e.optionIndex))
      return [...filtered, { from: fromId, to: toId }]
    })
  }

  // Связь для конкретного варианта вопроса
  const connectOption = (fromId, optionIndex, toId) => {
    setEdges(p => {
      const filtered = p.filter(e => !(e.from === fromId && e.optionIndex === optionIndex))
      if (!toId) return filtered
      return [...filtered, { from: fromId, to: toId, optionIndex, label: selectedNode?.options?.[optionIndex]?.text }]
    })
    // Обновляем nextId в самом варианте
    if (selectedNode?.options) {
      const opts = selectedNode.options.map((o, i) => i === optionIndex ? { ...o, nextId: toId } : o)
      updateNode(fromId, { options: opts })
    }
  }

  const getOptionEdge = (nodeId, optionIndex) =>
    edges.find(e => e.from === nodeId && e.optionIndex === optionIndex)

  const getNextEdge = (nodeId) =>
    edges.find(e => e.from === nodeId && e.optionIndex === undefined)

  const save = () => {
    updateBot(liveBot.id, { nodes, edges, name: botName, whatsappNumber: waNumber })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ height: 'calc(100vh - 104px)', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', marginBottom: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Назад</button>
        <input value={botName} onChange={e => setBotName(e.target.value)}
          style={{ fontWeight: 600, fontSize: 15, background: 'transparent', border: '1px solid transparent', padding: '4px 8px', borderRadius: 6, color: 'var(--text)', width: 260 }}
          onFocus={e => e.target.style.borderColor = 'var(--border)'}
          onBlur={e => e.target.style.borderColor = 'transparent'} />
        <div style={{ flex: 1 }} />
        <input value={waNumber} onChange={e => setWaNumber(e.target.value)}
          placeholder="📱 +7700XXXXXX" style={{ width: 160, fontSize: 12 }} />
        <button className="btn btn-primary btn-sm" onClick={save}>
          {saved ? '✅ Сохранено' : '💾 Сохранить'}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 16, overflow: 'hidden' }}>
        {/* Palette */}
        <div style={{ width: 180, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Добавить блок</p>
          {NODE_TYPES.map(nt => (
            <button key={nt.type} onClick={() => addNode(nt.type)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                background: 'var(--surface)', border: `1px solid ${nt.color}33`,
                borderRadius: 8, cursor: 'pointer', color: 'var(--text)', fontSize: 12, textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = nt.color + '22'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}>
              <span style={{ fontSize: 16 }}>{nt.icon}</span>
              <span>{nt.label}</span>
            </button>
          ))}

          <div style={{ marginTop: 8, padding: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Статистика</p>
            <p style={{ fontSize: 11, color: 'var(--text2)' }}>Блоков: <b style={{ color: 'var(--text)' }}>{nodes.length}</b></p>
            <p style={{ fontSize: 11, color: 'var(--text2)' }}>Связей: <b style={{ color: 'var(--text)' }}>{edges.length}</b></p>
          </div>
        </div>

        {/* Canvas + Props */}
        <div style={{ flex: 1, display: 'flex', gap: 16, overflow: 'hidden' }}>
          {/* Canvas */}
          <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, position: 'relative', overflow: 'auto' }}>
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              <defs>
                <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="var(--accent)" />
                </marker>
              </defs>
              {edges.map((e, i) => {
                const from = nodes.find(n => n.id === e.from)
                const to = nodes.find(n => n.id === e.to)
                if (!from || !to) return null
                const x1 = from.x + 110, y1 = from.y + 30
                const x2 = to.x, y2 = to.y + 30
                const mx = (x1 + x2) / 2
                const color = e.optionIndex !== undefined ? '#8b5cf6' : 'var(--accent)'
                return (
                  <g key={i}>
                    <path d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                      fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4,2"
                      markerEnd="url(#arr)" opacity="0.8" />
                    {e.label && (
                      <text x={mx} y={(y1 + y2) / 2} textAnchor="middle"
                        style={{ fontSize: 9, fill: color, fontFamily: 'Inter' }}>
                        {e.label.slice(0, 12)}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>

            <div style={{ position: 'relative', zIndex: 2, minWidth: 700, minHeight: 600, padding: 20 }}>
              {nodes.length === 0 && (
                <div className="empty-state" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                  <p>Добавьте блоки из панели слева</p>
                </div>
              )}
              {nodes.map(node => (
                <NodeBlock key={node.id} node={node} selected={selected === node.id}
                  onClick={() => setSelected(node.id)}
                  onDrag={(dx, dy) => updateNode(node.id, { x: node.x + dx, y: node.y + dy })} />
              ))}
            </div>
          </div>

          {/* Properties */}
          {selectedNode && (
            <div style={{ width: 300, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, overflowY: 'auto', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h4 style={{ fontWeight: 600, fontSize: 14 }}>Настройки блока</h4>
                <button onClick={() => deleteNode(selected)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16 }}>🗑</button>
              </div>

              <div className="form-group">
                <label>Название</label>
                <input value={selectedNode.label} onChange={e => updateNode(selected, { label: e.target.value })} />
              </div>

              {/* Media block */}
              {selectedNode.type === 'media' && (
                <MediaUploadField
                  media={selectedNode.media || { url: '', mediaType: 'image', caption: '' }}
                  onChange={media => updateNode(selected, { media })}
                />
              )}

              {/* Text message */}
              {selectedNode.type !== 'start' && selectedNode.type !== 'media' && (
                <div className="form-group">
                  <label>Текст сообщения</label>
                  <textarea rows={3} value={selectedNode.message || ''}
                    onChange={e => updateNode(selected, { message: e.target.value })}
                    placeholder="Введите текст..." style={{ resize: 'vertical' }} />
                </div>
              )}

              {/* QUESTION — варианты с выбором следующего блока */}
              {selectedNode.type === 'question' && (
                <div className="form-group">
                  <label style={{ marginBottom: 8, display: 'block' }}>
                    Варианты ответов и переходы
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(selectedNode.options || []).map((opt, i) => (
                      <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 700, flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <input
                            value={opt.text || opt}
                            onChange={e => {
                              const opts = [...(selectedNode.options || [])]
                              opts[i] = { ...(typeof opt === 'object' ? opt : { text: opt, nextId: '' }), text: e.target.value }
                              updateNode(selected, { options: opts })
                            }}
                            placeholder={`Вариант ${i + 1}`}
                            style={{ flex: 1, fontSize: 12 }}
                          />
                          <button onClick={() => {
                            const opts = (selectedNode.options || []).filter((_, j) => j !== i)
                            updateNode(selected, { options: opts })
                            setEdges(p => p.filter(e => !(e.from === selected && e.optionIndex === i)))
                          }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 3 }}>→ Перейти к блоку:</label>
                          <select
                            value={getOptionEdge(selected, i)?.to || ''}
                            onChange={e => connectOption(selected, i, e.target.value)}
                            style={{ fontSize: 12 }}>
                            <option value="">Выберите блок...</option>
                            {nodes.filter(n => n.id !== selected).map(n => (
                              <option key={n.id} value={n.id}>{n.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                    onClick={() => updateNode(selected, { options: [...(selectedNode.options || []), { text: `Вариант ${(selectedNode.options || []).length + 1}`, nextId: '' }] })}>
                    + Добавить вариант
                  </button>
                </div>
              )}

              {/* Next block (для НЕ-вопросов) */}
              {selectedNode.type !== 'question' && selectedNode.type !== 'end' && selectedNode.type !== 'start' && (
                <div className="form-group">
                  <label>→ Следующий блок</label>
                  <select
                    value={getNextEdge(selected)?.to || ''}
                    onChange={e => connectNodes(selected, e.target.value)}>
                    <option value="">Выберите блок...</option>
                    {nodes.filter(n => n.id !== selected).map(n => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedNode.type === 'start' && (
                <div className="form-group">
                  <label>→ Первый блок</label>
                  <select
                    value={getNextEdge(selected)?.to || ''}
                    onChange={e => connectNodes(selected, e.target.value)}>
                    <option value="">Выберите блок...</option>
                    {nodes.filter(n => n.id !== selected).map(n => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: TYPE_COLOR[selectedNode.type] + '22', color: TYPE_COLOR[selectedNode.type] }}>
                  {NODE_TYPES.find(t => t.type === selectedNode.type)?.label || selectedNode.type}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MediaUploadField({ media, onChange }) {
  const fileRef = useRef()
  const [preview, setPreview] = useState(media.url || '')

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target.result
      setPreview(url)
      onChange({ ...media, url, mediaType: isVideo ? 'video' : 'image', fileName: file.name })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="form-group">
      <label>Фото или видео</label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {['image', 'video'].map(t => (
          <button key={t} onClick={() => onChange({ ...media, mediaType: t })}
            style={{
              flex: 1, padding: '6px', borderRadius: 6,
              border: `1px solid ${media.mediaType === t ? 'var(--accent)' : 'var(--border)'}`,
              background: media.mediaType === t ? 'rgba(37,211,102,0.12)' : 'var(--surface2)',
              color: media.mediaType === t ? 'var(--accent)' : 'var(--text2)',
              cursor: 'pointer', fontSize: 12,
            }}>
            {t === 'image' ? '🖼️ Фото' : '🎥 Видео'}
          </button>
        ))}
      </div>
      <div onClick={() => fileRef.current.click()}
        style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: preview ? '8px' : '20px 12px', textAlign: 'center', cursor: 'pointer', background: 'var(--surface2)' }}>
        {preview && media.mediaType === 'image' && (
          <img src={preview} alt="" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 6, objectFit: 'cover' }} />
        )}
        {preview && media.mediaType === 'video' && (
          <video src={preview} controls style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 6 }} />
        )}
        {!preview && <p style={{ fontSize: 12, color: 'var(--text2)' }}>📁 Нажмите для загрузки</p>}
        <input ref={fileRef} type="file"
          accept={media.mediaType === 'video' ? 'video/*' : 'image/*'}
          style={{ display: 'none' }} onChange={handleFile} />
      </div>
      {preview && (
        <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 6, color: 'var(--danger)' }}
          onClick={() => { setPreview(''); onChange({ ...media, url: '', fileName: '' }) }}>
          🗑 Удалить
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 4px' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 10, color: 'var(--text2)' }}>или ссылка</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>
      <input value={media.url?.startsWith('data:') ? '' : (media.url || '')}
        onChange={e => { setPreview(e.target.value); onChange({ ...media, url: e.target.value }) }}
        placeholder="https://example.com/image.jpg" style={{ fontSize: 12 }} />
    </div>
  )
}

function NodeBlock({ node, selected, onClick, onDrag }) {
  const color = TYPE_COLOR[node.type] || '#8899aa'

  const handleMouseDown = (e) => {
    e.stopPropagation()
    onClick()
    const origin = { x: e.clientX, y: e.clientY }
    const move = (ev) => {
      onDrag(ev.clientX - origin.x, ev.clientY - origin.y)
      origin.x = ev.clientX
      origin.y = ev.clientY
    }
    const up = () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }

  return (
    <div onMouseDown={handleMouseDown}
      style={{
        position: 'absolute', left: node.x, top: node.y, width: 220,
        background: 'var(--surface2)',
        border: `2px solid ${selected ? color : 'var(--border)'}`,
        borderRadius: 10, cursor: 'grab', userSelect: 'none',
        boxShadow: selected ? `0 0 0 3px ${color}33` : '0 2px 8px rgba(0,0,0,0.3)',
      }}>
      <div style={{ padding: '8px 12px', background: color + '22', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${color}44` }}>
        <span style={{ fontSize: 14 }}>{NODE_TYPES.find(t => t.type === node.type)?.icon || '📦'}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{NODE_TYPES.find(t => t.type === node.type)?.label || node.type}</span>
      </div>
      <div style={{ padding: '8px 12px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{node.label}</p>
        {node.type === 'media' && node.media?.url && (
          <img src={node.media.url} alt="" style={{ width: '100%', height: 50, objectFit: 'cover', borderRadius: 6, marginBottom: 4 }} />
        )}
        {node.message && node.type !== 'media' && (
          <p style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{node.message}</p>
        )}
        {node.type === 'question' && node.options && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
            {node.options.slice(0, 3).map((o, i) => (
              <span key={i} className="tag" style={{ fontSize: 9 }}>{typeof o === 'object' ? o.text : o}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
