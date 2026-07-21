import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import CourseDetail from './pages/CourseDetail'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
    </Routes>
  )
}

export default App
