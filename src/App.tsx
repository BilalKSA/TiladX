import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Courses from './pages/Courses'
import Library from './pages/Library'
import Videos from './pages/Videos'
import CourseDetail from './pages/CourseDetail'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/home/courses" element={<Courses />} />
      <Route path="/home/library" element={<Library />} />
      <Route path="/home/videos" element={<Videos />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
    </Routes>
  )
}

export default App
