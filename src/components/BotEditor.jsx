import { useState, useRef } from 'react'
import { useStore } from '../store'

const NODE_TYPES = [
  { type:'message', label:'Сообщение', icon:'💬', color:'#3b82f6' },
  { type:'media', label:'Фото / Видео', icon:'🖼️', color:'#ec4899' },
  { type:'question', label:'Вопрос с кнопками', icon:'❓', color:'#8b5cf6' },
  { type:'input', label:'Ввод текста', icon:'✍️', color:'#f59e0b' },
  { type:'end', label:'Завершение', icon:'🏁', color:'#25D366' },
]

const TYPE_COLOR = {
  start:'#25D366', message:'#3b82f6', media:'#ec4899',
  question:'#8b5cf6', input:'#f59e0b', end:'#25D366'
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
  const [viewMode, setViewMode] = useState('canvas') // canvas | timeline

  const selectedNode = nodes.find(n => n.id === selected)

  const addNode = (type) => {
    const maxDay = nodes.reduce((m, n) => Math.max(m, n.sendDay || 1), 1)
    const newNode = {
      id: `n${Date.now()}`, type,
      label: NODE_TYPES.find(t => t.type === type)?.label || type,
      x: 60 + Math.random() * 200, y: nodes.length * 130 + 60,
      message: '',
      sendDay: maxDay + 1,
      sendTime: '09:00',
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

  const connectNodes = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return
    setEdges(p => [...p.filter(e => !(e.from === fromId && !e.optionIndex)), { from: fromId, to: toId }])
  }

  const connectOption = (fromId, optionIndex, toId) => {
    setEdges(p => {
      const filtered = p.filter(e => !(e.from === fromId && e.optionIndex === optionIndex))
      if (!toId) return filtered
      return [...filtered, { from: fromId, to: toId, optionIndex, label: selectedNode?.options?.[optionIndex]?.text }]
    })
    if (selectedNode?.options) {
      const opts = selectedNode.options.map((o, i) => i === optionIndex ? { ...o, nextId: toId } : o)
      updateNode(fromId, { options: opts })
    }
  }

  const getOptionEdge = (nodeId, i) => edges.find(e => e.from === nodeId && e.optionIndex === i)
  const getNextEdge = (nodeId) => edges.find(e => e.from === nodeId && e.optionIndex === undefined)

  const save = () => {
    updateBot(liveBot.id, { nodes, edges, name: botName, whatsappNumber: waNumber })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Sort nodes by sendDay for timeline
  const sortedNodes = [...nodes].filter(n => n.type !== 'start').sort((a, b) => (a.sendDay || 1) - (b.sendDay || 1))

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

        {/* View toggle */}
        <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {[['canvas','🗺️ Канвас'],['timeline','📅 По дням']].map(([v, l]) => (
            <button key={v} onClick={() => setViewMode(v)}
              style={{ padding: '6px 12px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === v ? 600 : 400, background: viewMode === v ? 'var(--accent)' : 'transparent', color: viewMode === v ? '#000' : 'var(--text2)' }}>
              {l}
            </button>
          ))}
        </div>

        <input value={waNumber} onChange={e => setWaNumber(e.target.value)}
          placeholder="📱 +7700XXXXXX" style={{ width: 150, fontSize: 12 }} />
        <button className="btn btn-primary btn-sm" onClick={save}>
          {saved ? '✅ Сохранено' : '💾 Сохранить'}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 16, overflow: 'hidden' }}>
        {/* Palette */}
        <div style={{ width: 175, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Добавить блок</p>
          {NODE_TYPES.map(nt => (
            <button key={nt.type} onClick={() => addNode(nt.type)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--surface)', border: `1px solid ${nt.color}33`, borderRadius: 8, cursor: 'pointer', color: 'var(--text)', fontSize: 12, textAlign: 'left', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = nt.color + '22'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}>
              <span style={{ fontSize: 16 }}>{nt.icon}</span> {nt.label}
            </button>
          ))}
          <div style={{ marginTop: 8, padding: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Блоков: <b style={{ color: 'var(--text)' }}>{nodes.length}</b></p>
            <p style={{ fontSize: 11, color: 'var(--text2)' }}>Связей: <b style={{ color: 'var(--text)' }}>{edges.length}</b></p>
          </div>
        </div>

        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', gap: 16, overflow: 'hidden' }}>

          {/* CANVAS VIEW */}
          {viewMode === 'canvas' && (
            <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, position: 'relative', overflow: 'auto' }}>
              {/* Grid background */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
                backgroundImage: 'radial-gradient(circle, #1e2d45 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                pointerEvents: 'none',
              }} />

              {/* Auto-align button */}
              <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-sm"
                  onClick={() => {
                    // Auto arrange nodes in a vertical flow
                    const startNode = nodes.find(n => n.type === 'start')
                    if (!startNode) return
                    const COL_W = 260
                    const ROW_H = 140
                    const arranged = new Map()
                    const visited = new Set()

                    const arrange = (nodeId, col, row) => {
                      if (visited.has(nodeId)) return row
                      visited.add(nodeId)
                      arranged.set(nodeId, { x: 40 + col * COL_W, y: 40 + row * ROW_H })
                      const outEdges = edges.filter(e => e.from === nodeId)
                      let nextRow = row + 1
                      outEdges.forEach((e, i) => {
                        nextRow = Math.max(nextRow, arrange(e.to, col + (i > 0 ? i : 0), row + 1))
                      })
                      return nextRow
                    }
                    arrange(startNode.id, 0, 0)
                    setNodes(prev => prev.map(n => arranged.has(n.id) ? { ...n, ...arranged.get(n.id) } : n))
                  }}>
                  ⚡ Выровнять
                </button>
              </div>
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
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
                        fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arr)" opacity="0.8" />
                      {e.label && <text x={mx} y={(y1 + y2) / 2} textAnchor="middle" style={{ fontSize: 9, fill: color, fontFamily: 'Inter' }}>{e.label.slice(0, 12)}</text>}
                    </g>
                  )
                })}
              </svg>
              <div style={{ position: 'relative', zIndex: 3, minWidth: 700, minHeight: 600, padding: 20 }}>
                {nodes.length === 0 && <div className="empty-state" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}><p>Добавьте блоки из панели слева</p></div>}
                {nodes.map(node => (
                  <NodeBlock key={node.id} node={node} selected={selected === node.id}
                    onClick={() => setSelected(node.id)}
                    onDrag={(dx, dy) => updateNode(node.id, { x: node.x + dx, y: node.y + dy })} />
                ))}
              </div>
            </div>
          )}

          {/* TIMELINE VIEW */}
          {viewMode === 'timeline' && (
            <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'auto', padding: 20 }}>
              <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 20 }}>
                Нажмите на блок чтобы изменить день и время отправки
              </p>

              {/* Group by day */}
              {(() => {
                const days = {}
                sortedNodes.forEach(n => {
                  const d = n.sendDay || 1
                  if (!days[d]) days[d] = []
                  days[d].push(n)
                })
                return Object.entries(days).map(([day, dayNodes]) => (
                  <div key={day} style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>Д{day}</span>
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>День {day}</p>
                        <p style={{ fontSize: 11, color: 'var(--text2)' }}>{dayNodes.length} {dayNodes.length === 1 ? 'блок' : 'блоков'}</p>
                      </div>
                    </div>
                    <div style={{ marginLeft: 52, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {dayNodes.map(node => (
                        <div key={node.id}
                          onClick={() => setSelected(node.id === selected ? null : node.id)}
                          style={{ padding: '12px 14px', background: selected === node.id ? 'rgba(37,211,102,0.08)' : 'var(--surface2)', border: `1px solid ${selected === node.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 16 }}>{NODE_TYPES.find(t => t.type === node.type)?.icon}</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 600, fontSize: 13 }}>{node.label}</p>
                              {node.message && <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 300 }}>{node.message}</p>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              <span style={{ fontSize: 11, color: 'var(--text2)' }}>🕐</span>
                              <input type="time" value={node.sendTime || '09:00'}
                                onClick={e => e.stopPropagation()}
                                onChange={e => updateNode(node.id, { sendTime: e.target.value })}
                                style={{ width: 90, fontSize: 12, padding: '4px 8px' }} />
                            </div>
                          </div>

                          {/* Day changer */}
                          {selected === node.id && (
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 12, color: 'var(--text2)' }}>День отправки:</span>
                                <button onClick={e => { e.stopPropagation(); updateNode(node.id, { sendDay: Math.max(1, (node.sendDay || 1) - 1) }) }}
                                  style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', fontSize: 16 }}>−</button>
                                <input type="number" min="1" max="365" value={node.sendDay || 1}
                                  onClick={e => e.stopPropagation()}
                                  onChange={e => updateNode(node.id, { sendDay: parseInt(e.target.value) || 1 })}
                                  style={{ width: 60, textAlign: 'center', fontWeight: 700, fontSize: 14 }} />
                                <button onClick={e => { e.stopPropagation(); updateNode(node.id, { sendDay: (node.sendDay || 1) + 1 }) }}
                                  style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', fontSize: 16 }}>+</button>
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                {[1, 3, 7, 14, 30].map(d => (
                                  <button key={d} onClick={e => { e.stopPropagation(); updateNode(node.id, { sendDay: d }) }}
                                    style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${(node.sendDay || 1) === d ? 'var(--accent)' : 'var(--border)'}`, background: (node.sendDay || 1) === d ? 'var(--accent)' : 'var(--surface)', color: (node.sendDay || 1) === d ? '#000' : 'var(--text2)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                                    Д{d}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Timeline connector */}
                    <div style={{ marginLeft: 71, marginTop: 8, width: 2, height: 16, background: 'var(--border)', borderRadius: 1 }} />
                  </div>
                ))
              })()}

              {sortedNodes.length === 0 && (
                <div className="empty-state">
                  <p>Добавьте блоки и переключитесь в режим "По дням"</p>
                </div>
              )}
            </div>
          )}

          {/* Properties panel */}
          {selectedNode && viewMode === 'canvas' && (
            <PropsPanel
              node={selectedNode}
              nodes={nodes}
              edges={edges}
              onUpdate={(data) => updateNode(selected, data)}
              onDelete={() => deleteNode(selected)}
              onConnect={connectNodes}
              onConnectOption={connectOption}
              getOptionEdge={getOptionEdge}
              getNextEdge={getNextEdge}
              selected={selected}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function PropsPanel({ node, nodes, edges, onUpdate, onDelete, onConnect, onConnectOption, getOptionEdge, getNextEdge, selected }) {
  const fileRef = useRef()

  return (
    <div style={{ width: 300, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, overflowY: 'auto', flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h4 style={{ fontWeight: 600, fontSize: 14 }}>Настройки блока</h4>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16 }}>🗑</button>
      </div>

      <div className="form-group">
        <label>Название</label>
        <input value={node.label} onChange={e => onUpdate({ label: e.target.value })} />
      </div>

      {/* Day + Time */}
      {node.type !== 'start' && (
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
          <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📅 Отправка</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label>День</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => onUpdate({ sendDay: Math.max(1, (node.sendDay || 1) - 1) })}
                  style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}>−</button>
                <input type="number" min="1" max="365" value={node.sendDay || 1}
                  onChange={e => onUpdate({ sendDay: parseInt(e.target.value) || 1 })}
                  style={{ textAlign: 'center', fontWeight: 700, padding: '4px 2px' }} />
                <button onClick={() => onUpdate({ sendDay: (node.sendDay || 1) + 1 })}
                  style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}>+</button>
              </div>
            </div>
            <div>
              <label>Время</label>
              <input type="time" value={node.sendTime || '09:00'} onChange={e => onUpdate({ sendTime: e.target.value })} style={{ fontSize: 12 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
            {[1, 3, 7, 14, 30].map(d => (
              <button key={d} onClick={() => onUpdate({ sendDay: d })}
                style={{ padding: '3px 7px', borderRadius: 5, border: `1px solid ${(node.sendDay || 1) === d ? 'var(--accent)' : 'var(--border)'}`, background: (node.sendDay || 1) === d ? 'var(--accent)' : 'var(--surface)', color: (node.sendDay || 1) === d ? '#000' : 'var(--text2)', cursor: 'pointer', fontSize: 11 }}>
                Д{d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Media */}
      {node.type === 'media' && (
        <MediaUploadField media={node.media || { url: '', mediaType: 'image', caption: '' }}
          onChange={media => onUpdate({ media })} />
      )}

      {/* Message */}
      {node.type !== 'start' && node.type !== 'media' && (
        <div className="form-group">
          <label>Текст сообщения</label>
          <textarea rows={3} value={node.message || ''} onChange={e => onUpdate({ message: e.target.value })}
            placeholder="Введите текст..." style={{ resize: 'vertical' }} />
        </div>
      )}

      {/* Question options */}
      {node.type === 'question' && (
        <div className="form-group">
          <label style={{ marginBottom: 8, display: 'block' }}>Варианты и переходы</label>
          {(node.options || []).map((opt, i) => (
            <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <input value={opt.text || opt} onChange={e => {
                  const opts = [...(node.options || [])]
                  opts[i] = { ...(typeof opt === 'object' ? opt : { text: opt, nextId: '' }), text: e.target.value }
                  onUpdate({ options: opts })
                }} placeholder={`Вариант ${i + 1}`} style={{ flex: 1, fontSize: 12 }} />
                <button onClick={() => {
                  const opts = (node.options || []).filter((_, j) => j !== i)
                  onUpdate({ options: opts })
                }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>✕</button>
              </div>
              <div>
                <label style={{ fontSize: 10 }}>→ Перейти к:</label>
                <select value={getOptionEdge(selected, i)?.to || ''}
                  onChange={e => onConnectOption(selected, i, e.target.value)} style={{ fontSize: 12 }}>
                  <option value="">Выберите блок...</option>
                  {nodes.filter(n => n.id !== selected).map(n => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => onUpdate({ options: [...(node.options || []), { text: `Вариант ${(node.options || []).length + 1}`, nextId: '' }] })}>
            + Добавить вариант
          </button>
        </div>
      )}

      {/* Next block */}
      {node.type !== 'question' && node.type !== 'end' && (
        <div className="form-group">
          <label>→ Следующий блок</label>
          <select value={getNextEdge(selected)?.to || ''} onChange={e => onConnect(selected, e.target.value)}>
            <option value="">Выберите блок...</option>
            {nodes.filter(n => n.id !== selected).map(n => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </select>
        </div>
      )}

      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: TYPE_COLOR[node.type] + '22', color: TYPE_COLOR[node.type] }}>
        {NODE_TYPES.find(t => t.type === node.type)?.label || node.type}
      </span>
    </div>
  )
}

function MediaUploadField({ media, onChange }) {
  const fileRef = useRef()
  const docRef = useRef()
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

  const handleDoc = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onChange({ ...media, url: ev.target.result, mediaType: 'document', fileName: file.name, fileSize: (file.size / 1024).toFixed(1) + ' KB' })
      setPreview('')
    }
    reader.readAsDataURL(file)
  }

  const isDoc = media.mediaType === 'document'

  return (
    <div className="form-group">
      <label>Фото, видео или файл</label>

      {/* Type selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {[['image','🖼️ Фото'],['video','🎥 Видео'],['document','📎 Файл']].map(([t, l]) => (
          <button key={t} onClick={() => { onChange({ ...media, mediaType: t, url: '', fileName: '' }); setPreview('') }}
            style={{
              flex: 1, padding: '6px', borderRadius: 6,
              border: `1px solid ${media.mediaType === t ? 'var(--accent)' : 'var(--border)'}`,
              background: media.mediaType === t ? 'rgba(37,211,102,0.12)' : 'var(--surface2)',
              color: media.mediaType === t ? 'var(--accent)' : 'var(--text2)',
              cursor: 'pointer', fontSize: 11, fontWeight: media.mediaType === t ? 600 : 400,
            }}>
            {l}
          </button>
        ))}
      </div>

      {/* Document upload */}
      {isDoc ? (
        <div>
          <div onClick={() => docRef.current.click()}
            style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '20px 12px', textAlign: 'center', cursor: 'pointer', background: 'var(--surface2)', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            {media.fileName && isDoc ? (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{media.fileName}</p>
                <p style={{ fontSize: 11, color: 'var(--text2)' }}>{media.fileSize}</p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
                <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>Нажмите для загрузки файла</p>
                <p style={{ fontSize: 11, color: 'var(--text2)' }}>PDF, DOCX, XLSX, PPT до 20MB</p>
              </div>
            )}
            <input ref={docRef} type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              style={{ display: 'none' }} onChange={handleDoc} />
          </div>
          {media.fileName && isDoc && (
            <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 6, color: 'var(--danger)' }}
              onClick={() => onChange({ ...media, url: '', fileName: '', fileSize: '' })}>
              🗑 Удалить файл
            </button>
          )}
        </div>
      ) : (
        <div>
          <div onClick={() => fileRef.current.click()}
            style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: preview ? '8px' : '20px 12px', textAlign: 'center', cursor: 'pointer', background: 'var(--surface2)', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            {preview && media.mediaType === 'image' && <img src={preview} alt="" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 6, objectFit: 'cover' }} />}
            {preview && media.mediaType === 'video' && <video src={preview} controls style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 6 }} />}
            {!preview && <p style={{ fontSize: 12, color: 'var(--text2)' }}>📁 Нажмите для загрузки</p>}
            <input ref={fileRef} type="file" accept={media.mediaType === 'video' ? 'video/*' : 'image/*'} style={{ display: 'none' }} onChange={handleFile} />
          </div>
          {preview && (
            <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 6, color: 'var(--danger)' }}
              onClick={() => { setPreview(''); onChange({ ...media, url: '', fileName: '' }) }}>
              🗑 Удалить
            </button>
          )}
        </div>
      )}

      {/* Caption */}
      <div style={{ marginTop: 10 }}>
        <label>Текст под медиафайлом</label>
        <textarea rows={3} value={media.caption || ''}
          onChange={e => onChange({ ...media, caption: e.target.value })}
          placeholder="Подпись под фото/видео/файлом..."
          style={{ resize: 'vertical', marginTop: 4 }} />
      </div>
    </div>
  )
}

function NodeBlock({ node, selected, onClick, onDrag }) {
  const color = TYPE_COLOR[node.type] || '#8899aa'
  const GRID = 20 // snap to 20px grid

  const handleMouseDown = (e) => {
    e.stopPropagation()
    onClick()
    const startX = e.clientX - node.x
    const startY = e.clientY - node.y

    const move = (ev) => {
      const rawX = ev.clientX - startX
      const rawY = ev.clientY - startY
      // Snap to grid
      const snappedX = Math.round(rawX / GRID) * GRID
      const snappedY = Math.round(rawY / GRID) * GRID
      onDrag(snappedX - node.x, snappedY - node.y)
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
      style={{ position: 'absolute', left: node.x, top: node.y, width: 230, background: 'var(--surface2)', border: `2px solid ${selected ? color : 'var(--border)'}`, borderRadius: 10, cursor: 'grab', userSelect: 'none', boxShadow: selected ? `0 0 0 3px ${color}33` : '0 2px 8px rgba(0,0,0,0.3)' }}>
      <div style={{ padding: '7px 12px', background: color + '22', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${color}44` }}>
        <span style={{ fontSize: 14 }}>{NODE_TYPES.find(t => t.type === node.type)?.icon || '📦'}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{NODE_TYPES.find(t => t.type === node.type)?.label || node.type}</span>
        {node.sendDay && node.type !== 'start' && (
          <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px', borderRadius: 10, background: 'var(--accent)', color: '#000', fontWeight: 700 }}>Д{node.sendDay} {node.sendTime || ''}</span>
        )}
      </div>
      <div style={{ padding: '8px 12px' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{node.label}</p>
        {node.type === 'media' && node.media?.url && (
          <div>
            {node.media.mediaType === 'video'
              ? <div style={{ background: '#ec489922', borderRadius: 6, padding: '4px 8px', fontSize: 10, color: '#ec4899', marginBottom: 4 }}>🎥 {node.media.fileName || 'Видео'}</div>
              : node.media.mediaType === 'document'
              ? <div style={{ background: 'rgba(59,130,246,0.15)', borderRadius: 6, padding: '6px 8px', fontSize: 10, color: 'var(--blue)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📄</span> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.media.fileName || 'Файл'}</span>
                </div>
              : <img src={node.media.url} alt="" style={{ width: '100%', height: 50, objectFit: 'cover', borderRadius: 6, marginBottom: 4 }} />
            }
            {node.media.caption && <p style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1.4, marginTop: 2 }}>{node.media.caption.slice(0, 60)}{node.media.caption.length > 60 ? '...' : ''}</p>}
          </div>
        )}
        {node.message && node.type !== 'media' && <p style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{node.message}</p>}
        {node.type === 'question' && node.options && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
            {node.options.slice(0, 3).map((o, i) => <span key={i} className="tag" style={{ fontSize: 9 }}>{typeof o === 'object' ? o.text : o}</span>)}
          </div>
        )}
      </div>
    </div>
  )
}
