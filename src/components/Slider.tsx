import { Children, useEffect, useRef, useState, type ReactNode } from 'react'

// 한 장씩 스냅되는 슬라이드. 자동으로 넘어가고, 터치 중에는 멈춥니다.
export default function Slider({ children, interval = 4000 }: { children: ReactNode; interval?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const paused = useRef(false)
  const [index, setIndex] = useState(0)
  const count = Children.count(children)

  useEffect(() => {
    if (count < 2) return
    const timer = setInterval(() => {
      const el = ref.current
      if (!el || paused.current) return
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % count
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
    }, interval)
    return () => clearInterval(timer)
  }, [count, interval])

  return (
    <>
      <div
        ref={ref}
        className="slider"
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        onPointerDown={() => { paused.current = true }}
        onPointerUp={() => { paused.current = false }}
        onPointerCancel={() => { paused.current = false }}
        onMouseEnter={() => { paused.current = true }}
        onMouseLeave={() => { paused.current = false }}
      >
        {Children.map(children, (c) => <div className="slide">{c}</div>)}
      </div>
      {count > 1 && (
        <div className="dots">
          {Array.from({ length: count }, (_, i) => <i key={i} className={i === index ? 'on' : ''} />)}
        </div>
      )}
    </>
  )
}
