import { Routes, Route, Navigate } from 'react-router-dom'
import { SignIn } from './pages/SignIn/SignIn'
import { SignUp } from './pages/SignUp/SignUp'
import { Home } from './pages/Home/Home'
import { CollectionSettings } from './pages/CollectionSettings/CollectionSettings'
import { Landing } from './pages/Landing/Landing'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/home" replace /> : <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<GuestRoute><SignIn /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><SignUp /></GuestRoute>} />
      <Route path="/home" element={
        <ProtectedRoute><Home /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><CollectionSettings /></ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
