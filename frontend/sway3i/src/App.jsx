import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Discover from './pages/Discover'
import Dashboard from './pages/Dashboard'
import ManageListings from './pages/ManageListings'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-listings" element={<ManageListings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
