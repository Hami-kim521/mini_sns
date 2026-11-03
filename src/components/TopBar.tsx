import { useNavigate } from 'react-router-dom'

export default function TopBar({ title, back }: { title: string; back?: boolean }) {
  const nav = useNavigate()
  return (
    <header className="topbar">
      {back && <button className="back" onClick={() => nav(-1)} aria-label="뒤로">‹</button>}
      <span>{title}</span>
    </header>
  )
}
