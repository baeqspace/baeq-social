import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { useState, useEffect} from 'react'
import { IntlContext } from './contexts/IntlContext'
import { AuthContext } from './contexts/AuthContext'
import { LoginPage } from './pages/LoginPage'
import AuthService from './services/AuthService'
import Locales from './assets/Locales.json'
import { Main } from './pages/Main'

function App() {

  const [theme, setTheme] = useState('dark-theme')
  const [currentLocale, setCurrentLocale] = useState(Locales.ru)
  const [authUser, setAuthUser] = useState(null)

  async function checkAuth() {
    //if (!localStorage.getItem('token')) {setAuthUser('unauth');return}

    const data = await AuthService.checkAuth()
    if (!data?.user) {
      setAuthUser('unauth')
      localStorage.removeItem('token')
      return
    }
    setAuthUser(data.user)
  }

  useEffect(() => {
    checkAuth()
  },[])

  return (
    <div id="app" className={`${theme} app`}>
      <IntlContext.Provider value={[currentLocale, setCurrentLocale]}>
        <AuthContext.Provider value={[authUser, setAuthUser, checkAuth]}>
          <Routes>
            <Route path='/baeq-social/login' element={authUser === 'unauth' ? <LoginPage /> : <Navigate to={`/baeq-social/profile/${authUser?.id}`} />}/>
            <Route path='*' element={authUser !== 'unauth' || !authUser ? <Main/> : <Navigate to='/baeq-social/login'/>}/>
          </Routes>
          {authUser === 'unauth' && <Navigate to='/baeq-social/login'/>}
        </AuthContext.Provider>
      </IntlContext.Provider>
    </div>
  )
}

export default App