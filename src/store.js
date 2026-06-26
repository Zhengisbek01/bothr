import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
      { id: 'n2', type: 'message', label: 'Приветствие', x: 60, y: 180, message: 'Добро пожаловать!' },
      { id: 'n3', type: 'question', label: 'Ноутбук?', x: 60, y: 300, message: 'Получили ноутбук?', options: ['Да', 'Нет'] },
      { id: 'n4', type: 'message', label: 'Политики', x: 60, y: 420, message: 'Ознакомьтесь с политикой.' },
      { id: 'n5', type: 'end', label: 'Завершение', x: 60, y: 540, message: 'Онбординг завершён!' },
    ],
    edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' }, { from: 'n4', to: 'n5' }]
  }
]

const INITIAL_EMPLOYEES = [
  { id: 3, name: 'Нурлан Ахметов', email: 'emp@bothr.kz', dept: 'IT', status: 'active', phone: '+77012345678', onboardingStep: 3 },
  { id: 4, name: 'Дина Сейткали', email: 'dina@bothr.kz', dept: 'Финансы', status: 'active', phone: '+77087654321', onboardingStep: 5 },
]

export const useStore = create(
  persist(
    function(set) {
      return {
        currentUser: null,
        bots: INITIAL_BOTS,
        employees: INITIAL_EMPLOYEES,
        apiConfig: { provider: '360dialog', apiKey: '', wabaId: '' },
        logs: [],

        login: function(email, password) {
          var user = USERS.find(function(u) { return u.email === email && u.password === password })
          if (user) { set({ currentUser: user }); return true }
          return false
        },

        logout: function() { set({ currentUser: null }) },

        addBot: function(bot) {
          set(function(s) {
            return { bots: s.bots.concat([Object.assign({}, bot, { id: 'bot-' + Date.now(), stats: { sent: 0, completed: 0, pending: 0 }, createdBy: s.currentUser ? s.currentUser.id : null })]) }
          })
        },

        updateBot: function(id, data) {
          set(function(s) {
            return { bots: s.bots.map(function(b) { return b.id === id ? Object.assign({}, b, data) : b }) }
          })
        },

        deleteBot: function(id) {
          set(function(s) { return { bots: s.bots.filter(function(b) { return b.id !== id }) } })
        },

        addEmployee: function(emp) {
          set(function(s) { return { employees: s.employees.concat([Object.assign({}, emp, { id: Date.now() })]) } })
        },

        updateEmployee: function(id, data) {
          set(function(s) {
            return { employees: s.employees.map(function(e) { return e.id === id ? Object.assign({}, e, data) : e }) }
          })
        },

        setApiConfig: function(cfg) { set({ apiConfig: cfg }) },

        addLog: function(msg) {
          set(function(s) {
            return { logs: [{ msg: msg, time: new Date().toLocaleTimeString('ru') }].concat(s.logs.slice(0, 99)) }
          })
        }
      }
    },
    {
      name: 'bothr-v2',
      partialize: function(state) {
        return { bots: state.bots, employees: state.employees, apiConfig: state.apiConfig }
      },
      merge: function(persisted, current) {
        return Object.assign({}, current, persisted, { currentUser: null })
      }
    }
  )
)
