import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/', icon: '🏠', label: '홈', end: true },
  { to: '/posts', icon: '📋', label: '게시판' },
  { to: '/write', icon: '＋', label: '글쓰기', fab: true },
  { to: '/news', icon: '🔥', label: '핫이슈' },
  { to: '/me', icon: '👤', label: '마이' },
]

export default function Layout() {
  return (
    <div className="app">
      <Outlet />
      <nav className="tabbar">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab${isActive ? ' active' : ''}${t.fab ? ' write' : ''}`}>
            {t.fab ? <span className="fab">{t.icon}</span> : <span className="ico">{t.icon}</span>}
            {!t.fab && t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
