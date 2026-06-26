import { useState } from 'react'
import { useStore } from './store'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import BotBuilder from './pages/BotBuilder'
import Employees from './pages/Employees'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import EmployeePortal from './pages/EmployeePortal'

export default function App() {
  const currentUser = useStore(s => s.currentUser)
  const [page, setPage] = useState('dashboard')

  if (!currentUser) return <Login />

  const isEmployee = currentUser.role === 'employee'
  const defaultPage = isEmployee ? 'mychat' : 'dashboard'

  const currentPage = page

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <Dashboard />
      case 'bots': return <BotBuilder />
      case 'employees': return <Employees />
      case 'analytics': return <Analytics />
      case 'settings': return <Settings />
      case 'mychat': return <EmployeePortal />
      case 'profile': return <EmployeePortal />
      default: return <Dashboard />
    }
  }

  return (
    <Layout page={currentPage || defaultPage} setPage={setPage}>
      {renderPage()}
    </Layout>
  )
}
