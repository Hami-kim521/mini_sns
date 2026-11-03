import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import RangeCalendar from '../components/RangeCalendar'
import TopBar from '../components/TopBar'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

const DRAFT_KEY = 'brainy:draft'

interface Draft {
  title: string
  caption: string
  isRecruit: boolean
  start: string | null
  end: string | null
}

export default function PostWrite() {
  const { profile, loading } = useAuth()
  const nav = useNavigate()
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [isRecruit, setIsRecruit] = useState(false)
  const [start, setStart] = useState<string | null>(null)
  const [end, setEnd] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // 임시저장된 글 복원
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    const d: Draft = JSON.parse(raw)
    setTitle(d.title); setCaption(d.caption); setIsRecruit(d.isRecruit); setStart(d.start); setEnd(d.end)
    setMsg('임시저장된 글을 불러왔어요 (사진은 다시 첨부해 주세요)')
  }, [])

  if (loading) return null
  if (!profile) return <Navigate to="/login" replace />

  const saveDraft = () => {
    const d: Draft = { title, caption, isRecruit, start, end }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d))
    setMsg('임시저장했어요 ✓')
  }

  const onFile = (f: File | null) => {
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  const next = () => {
    if (!title.trim() || !caption.trim()) return setMsg('제목과 내용을 입력해 주세요')
    setMsg('')
    setStep(2)
  }

  const submit = async () => {
    if (isRecruit && (!start || !end)) return setMsg('모집 시작일과 마감일을 달력에서 선택해 주세요')
    setBusy(true)
    setMsg('')
    let image_url: string | null = null
    if (file) {
      const { data: auth } = await supabase.auth.getUser()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${auth.user!.id}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('post-images').upload(path, file)
      if (error) { setBusy(false); return setMsg(`사진 업로드 실패: ${error.message}`) }
      image_url = supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl
    }
    const { data, error } = await supabase.from('posts').insert({
      user_id: profile.id,
      title: title.trim(),
      caption: caption.trim(),
      image_url,
      is_recruit: isRecruit,
      schedule_start: isRecruit ? start : null,
      deadline: isRecruit ? end : null,
    }).select('id').single()
    setBusy(false)
    if (error) return setMsg(error.message)
    localStorage.removeItem(DRAFT_KEY)
    nav(`/posts/${data.id}`, { replace: true })
  }

  return (
    <>
      <TopBar title="글쓰기" back />
      <div className="page">
        <div className="steps"><i className="on" /><i className={step === 2 ? 'on' : ''} /></div>

        {step === 1 ? (
          <>
            <label className="field"><span>제목</span>
              <input className="input" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" />
            </label>
            <label className="field"><span>내용</span>
              <textarea className="input" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="AI 정보나 스터디 소개를 자유롭게 적어 주세요" />
            </label>
            <div className="field"><span>사진 (선택)</span>
              <button type="button" className="photo-up" style={{ width: '100%' }} onClick={() => fileRef.current?.click()}>
                {preview ? <img src={preview} alt="미리보기" /> : '📷 사진 추가하기'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
              {preview && <button type="button" className="link" onClick={() => onFile(null)}>사진 제거</button>}
            </div>
          </>
        ) : (
          <>
            <button type="button" className={`switch${isRecruit ? ' on' : ''}`} onClick={() => setIsRecruit(!isRecruit)}>
              <span>👥 스터디원을 구하는 글이에요</span><span className="knob" />
            </button>
            {isRecruit && (
              <>
                <p style={{ fontSize: 14, margin: '4px 2px 10px', color: 'var(--sub)' }}>
                  {!start ? '모집 시작일을 선택하세요' : !end ? '마감일을 선택하세요' : `${start} ~ ${end}`}
                </p>
                <RangeCalendar start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e) }} />
              </>
            )}
          </>
        )}

        {msg && <p className={msg.includes('✓') || msg.includes('불러왔') ? 'ok' : 'err'}>{msg}</p>}

        <div className="btn-row">
          {step === 1 ? (
            <>
              <button className="btn ghost" onClick={saveDraft}>임시저장</button>
              <button className="btn" onClick={next}>다음</button>
            </>
          ) : (
            <>
              <button className="btn ghost" onClick={() => setStep(1)}>이전</button>
              <button className="btn" disabled={busy} onClick={submit}>{busy ? '등록 중…' : '등록하기'}</button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
