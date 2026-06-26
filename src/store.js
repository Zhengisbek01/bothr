import { create } from 'zustand'

// Mock users
const USERS = [
  { id: 1, role: 'admin', email: 'admin@bothr.kz', password: '123', name: 'Администратор' },
  { id: 2, role: 'hr', email: 'hr@bothr.kz', password: '123', name: 'Айгерим Сатыбалды' },
  { id: 3, role: 'employee', email: 'emp@bothr.kz', password: '123', name: 'Нурлан Ахметов' },
]

const INITIAL_BOTS = [
  {
    id: 'bot-1', name: 'Онбординг новых сотрудников', status: 'active',
    template: 'onboarding', whatsappNumber: '+7700XXXXXX',
    createdBy: 2, assignedTo: [3],
    stats: { sent: 47, completed: 38, pending: 9 },
    nodes: [
      { id: 'n1', type: 'start', label: 'Старт', x: 60, y: 60, message: '' },
      { id: 'n2', type: 'message', label: 'Приветствие', x: 60, y: 180, message: 'Добро пожаловать в компанию! 🎉 Я ваш HR-помощник. Давайте начнём онбординг.' },
      { id: 'n3', type: 'question', label: 'Получили ноутбук?', x: 60, y: 300, message: 'Вы уже получили рабочий ноутбук и пропуск?', options: ['✅ Да', '❌ Нет, не получил'] },
      { id: 'n4', type: 'message', label: 'Ознакомление с политиками', x: 60, y: 420, message: 'Отлично! Пожалуйста, ознакомьтесь с политикой компании: [ссылка]. После прочтения нажмите "Готово".' },
      { id: 'n5', type: 'end', label: 'Завершение', x: 60, y: 540, message: 'Онбординг завершён! Ваш HR-менеджер свяжется с вами в течение 24 часов. Удачи! 💪' },
    ],
    edges: [
      { from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' },
      { from: 'n3', to: 'n4' }, { from: 'n4', to: 'n5' },
    ]
  },
  {
    id: 'bot-2', name: 'Опрос удовлетворённости', status: 'draft',
    template: 'survey', whatsappNumber: '',
    createdBy: 2, assignedTo: [],
    stats: { sent: 0, completed: 0, pending: 0 },
    nodes: [
      { id: 'n1', type: 'start', label: 'Старт', x: 60, y: 60, message: '' },
      { id: 'n2', type: 'question', label: 'Оценка работы', x: 60, y: 180, message: 'Оцените вашу удовлетворённость работой от 1 до 5:', options: ['⭐1', '⭐⭐2', '⭐⭐⭐3', '⭐⭐⭐⭐4', '⭐⭐⭐⭐⭐5'] },
      { id: 'n3', type: 'end', label: 'Спасибо', x: 60, y: 300, message: 'Спасибо за обратную связь! Ваше мнение важно для нас.' },
    ],
    edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }]
  }
]

const INITIAL_EMPLOYEES = [
  { id: 3, name: 'Нурлан Ахметов', email: 'emp@bothr.kz', dept: 'IT', status: 'active', phone: '+77012345678', onboardingStep: 3 },
  { id: 4, name: 'Дина Сейткали', email: 'dina@bothr.kz', dept: 'Финансы', status: 'active', phone: '+77087654321', onboardingStep: 5 },
  { id: 5, name: 'Арман Бекенов', email: 'arman@bothr.kz', dept: 'Продажи', status: 'pending', phone: '+77019876543', onboardingStep: 1 },
]

export const useStore = create((set, get) => ({
  currentUser: null,
  bots: INITIAL_BOTS,
  employees: INITIAL_EMPLOYEES,
  logs: [],
  apiConfig: { provider: '360dialog', apiKey: '', wabaId: '' },

  login: (email, password) => {
    const user = USERS.find(u => u.email === email && u.password === password)
    if (user) { set({ currentUser: user }); return true }
    return false
  },
  logout: () => set({ currentUser: null }),

  addBot: (bot) => set(s => ({ bots: [...s.bots, { ...bot, id: `bot-${Date.now()}`, stats: { sent: 0, completed: 0, pending: 0 }, createdBy: s.currentUser?.id }] })),
  updateBot: (id, data) => set(s => ({ bots: s.bots.map(b => b.id === id ? { ...b, ...data } : b) })),
  deleteBot: (id) => set(s => ({ bots: s.bots.filter(b => b.id !== id) })),

  addEmployee: (emp) => set(s => ({ employees: [...s.employees, { ...emp, id: Date.now() }] })),
  updateEmployee: (id, data) => set(s => ({ employees: s.employees.map(e => e.id === id ? { ...e, ...data } : e) })),

  setApiConfig: (cfg) => set({ apiConfig: cfg }),

  addLog: (msg) => set(s => ({ logs: [{ msg, time: new Date().toLocaleTimeString('ru') }, ...s.logs.slice(0, 99)] })),
}))
