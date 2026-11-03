import { useState } from 'react'

interface Props {
  start: string | null
  end: string | null
  onChange: (start: string | null, end: string | null) => void
}

const pad = (n: number) => String(n).padStart(2, '0')
const key = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

// 모집 시작일·마감일을 고르는 범위 선택 달력
export default function RangeCalendar({ start, end, onChange }: Props) {
  const now = new Date()
  const [y, setY] = useState(now.getFullYear())
  const [m, setM] = useState(now.getMonth())
  const today = key(now.getFullYear(), now.getMonth(), now.getDate())

  const move = (delta: number) => {
    const d = new Date(y, m + delta, 1)
    setY(d.getFullYear())
    setM(d.getMonth())
  }

  const pick = (k: string) => {
    if (!start || (start && end)) onChange(k, null)
    else if (k < start) onChange(k, null)
    else onChange(start, k)
  }

  const blanks = new Date(y, m, 1).getDay()
  const days = new Date(y, m + 1, 0).getDate()

  return (
    <div className="cal">
      <div className="cal-head">
        <button type="button" onClick={() => move(-1)} aria-label="이전 달">‹</button>
        {y}년 {m + 1}월
        <button type="button" onClick={() => move(1)} aria-label="다음 달">›</button>
      </div>
      <div className="cal-grid">
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => <div key={d} className="dow">{d}</div>)}
        {Array.from({ length: blanks }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const k = key(y, m, i + 1)
          const edge = k === start || k === end
          const inside = !!start && !!end && k > start && k < end
          return (
            <button
              type="button"
              key={k}
              className={`${edge ? 'edge' : inside ? 'in' : ''}${k === today ? ' today' : ''}`}
              onClick={() => pick(k)}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
