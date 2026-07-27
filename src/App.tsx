import { Routes, Route } from 'react-router-dom'
import Maintenance from './pages/Maintenance'
import Files from './pages/Files'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Activate from './pages/Activate'
import ResetPassword from './pages/ResetPassword'
import ResetPasswordConfirm from './pages/ResetPasswordConfirm'
import Home from './pages/Home'
import Courses from './pages/Courses'
import Library from './pages/Library'
import Videos from './pages/Videos'
import CourseDetail from './pages/CourseDetail'
import RequireAuth from './components/RequireAuth'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Maintenance />} />
      <Route path="/files" element={<Files />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/activate" element={<Activate />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-password/confirm" element={<ResetPasswordConfirm />} />

      <Route element={<RequireAuth />}>
        <Route path="/home" element={<Home />} />
        <Route path="/home/courses" element={<Courses />} />
        <Route path="/home/library" element={<Library />} />
        <Route path="/home/videos" element={<Videos />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
      </Route>
    </Routes>
  )
}

export default App
