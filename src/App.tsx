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
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import Register from './pages/Register'
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'
import AdminFab from './components/AdminFab'
import AdminLayout from './pages/admin/AdminLayout'
import AdminHome from './pages/admin/AdminHome'
import AdminCourses from './pages/admin/AdminCourses'
import AdminLessons from './pages/admin/AdminLessons'
import AdminLibrary from './pages/admin/AdminLibrary'
import AdminMentors from './pages/admin/AdminMentors'
import AdminRoster from './pages/admin/AdminRoster'
import AdminEnrollments from './pages/admin/AdminEnrollments'

function App() {
  return (
    <>
      <Routes>
        {/* Landing is now the public homepage. To put the site back into
            maintenance mode, swap this element back to <Maintenance />. */}
        <Route path="/" element={<Landing />} />
        <Route path="/files" element={<Files />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/login" element={<Login />} />
        <Route path="/activate" element={<Activate />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/confirm" element={<ResetPasswordConfirm />} />

        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<Profile />} />

          {/* Every signed-in user sees the full programme picker. Access is
              decided per course, inside CourseDetail/Library via
              can_access_course() — not by an account-wide gate. */}
          <Route path="/home" element={<Home />} />
          <Route path="/home/courses" element={<Courses />} />
          <Route path="/home/videos" element={<Videos />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          {/* The library is per-program, so it lives under the course. */}
          <Route path="/courses/:slug/library" element={<Library />} />

          {/* Admin panel. RequireAdmin is a convenience redirect — the actual
              authorization is the is_admin() RLS policy on every table. */}
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="courses/:courseId/lessons" element={<AdminLessons />} />
              <Route path="library" element={<AdminLibrary />} />
              <Route path="mentors" element={<AdminMentors />} />
              <Route path="roster" element={<AdminRoster />} />
              <Route path="enrollments" element={<AdminEnrollments />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all. Firebase rewrites every path to index.html, so unknown
            URLs arrive here with a 200 — without this they'd render blank. */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Renders only for signed-in admins; hides itself inside /admin. */}
      <AdminFab />
    </>
  )
}

export default App
