import { NavLink, Outlet, Link } from 'react-router-dom'
import Logo from '../../components/Logo'
import ThemeToggle from '../../components/ThemeToggle'
import './Admin.css'

const links = [
  { to: '/admin', end: true, label: 'نظرة عامة' },
  { to: '/admin/courses', label: 'الدورات والدروس' },
  { to: '/admin/library', label: 'مكتبة تلاد' },
  { to: '/admin/mentors', label: 'المرشدون' },
  { to: '/admin/roster', label: 'الطلاب' },
  { to: '/admin/enrollments', label: 'الاشتراكات' },
]

function AdminLayout() {
  return (
    <div className="tld-admin">
      {/* Sidebar sits on the inline-start edge, which is the right in RTL. */}
      <aside className="tld-admin__sidebar">
        <div className="tld-admin__brand">
          <Logo variant="white" />
          <span>لوحة التحكم</span>
        </div>

        <nav className="tld-admin__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `tld-admin__link${isActive ? ' tld-admin__link--active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="tld-admin__sidebar-footer">
          <ThemeToggle />
          <Link to="/home" className="tld-admin__exit">
            العودة للمنصة
          </Link>
        </div>
      </aside>

      <main className="tld-admin__main">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
