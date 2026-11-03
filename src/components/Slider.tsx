import { Children, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'

// 한 장씩 스냅되는 슬라이드. 터치 스와이프, 마우스 드래그, 자동 넘김을 지원합니다.
export default function Slider({ children, interval = 4000 }: { children: ReactNode; interval?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const paused = useRef(false)
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0 })
  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
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

  // 마우스만 직접 드래그 처리 (터치는 브라우저 기본 스크롤 + 스냅 사용)
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    paused.current = true
    if (e.pointerType !== 'mouse') return
    const el = ref.current!
    drag.current = { active: true, moved: false, startX: e.clientX, startLeft: el.scrollLeft }
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d.active) return
    const dx = e.clientX - d.startX
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true
      setDragging(true)
    }
    if (d.moved) ref.current!.scrollLeft = d.startLeft - dx
  }

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    paused.current = false
    const d = drag.current
    if (!d.active) return
    d.active = false
    if (!d.moved) return
    const el = ref.current!
    // 드래그 방향으로 임계값(너비의 15%)을 넘으면 다음/이전 장으로
    const dx = e.clientX - d.startX
    const base = Math.round(d.startLeft / el.clientWidth)
    const target = Math.max(0, Math.min(count - 1, base + (dx < -el.clientWidth * 0.15 ? 1 : dx > el.clientWidth * 0.15 ? -1 : 0)))
    setDragging(false)
    requestAnimationFrame(() => el.scrollTo({ left: target * el.clientWidth, behavior: 'smooth' }))
  }

  return (
    <>
      <div
        ref={ref}
        className={`slider${dragging ? ' dragging' : ''}`}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        // 드래그 직후에는 링크 클릭으로 이동하지 않도록 막음
        onClickCapture={(e) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false } }}
        onDragStart={(e) => e.preventDefault()}
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
