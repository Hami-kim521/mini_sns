import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function Login() {
  const { profile } = useAuth()
  const nav = useNavigate()
  const [signup, setSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [msg, setMsg] = useState('')
  const [isErr, setIsErr] = useState(false)
  const [busy, setBusy] = useState(false)

  if (profile) return <Navigate to="/" replace />

  const say = (m: string, err = true) => { setMsg(m); setIsErr(err) }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    say('')
    if (signup) {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { username, display_name: displayName || username } },
      })
      if (error) say(error.message)
      else if (!data.session) say('가입 확인 메일을 보냈어요. 메일의 링크를 눌러 인증한 뒤 로그인해 주세요.', false)
      else nav('/', { replace: true })
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) say('이메일 또는 비밀번호를 확인해 주세요.')
      else nav('/', { replace: true })
    }
    setBusy(false)
  }

  const oauth = async (provider: 'google' | 'github' | 'kakao') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
    })
    if (error) say(error.message)
  }

  return (
    <div className="login">
      <div className="brand">
        <h1>Brainy</h1>
        <p>AI를 함께 공부하는 스터디 커뮤니티</p>
      </div>

      <form onSubmit={submit}>
        {signup && (
          <>
            <input className="input" style={{ marginBottom: 10 }} placeholder="아이디 (영문/숫자, @로 표시)" required pattern="[A-Za-z0-9_]{3,20}" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input className="input" style={{ marginBottom: 10 }} placeholder="표시 이름" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </>
        )}
        <input className="input" style={{ marginBottom: 10 }} type="email" placeholder="이메일" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" style={{ marginBottom: 14 }} type="password" placeholder="비밀번호 (6자 이상)" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn" disabled={busy}>{signup ? '이메일로 회원가입' : '이메일로 로그인'}</button>
      </form>
      {msg && <p className={isErr ? 'err' : 'ok'}>{msg}</p>}
      <button className="link" onClick={() => { setSignup(!signup); say('') }}>
        {signup ? '이미 계정이 있어요 · 로그인' : '처음이신가요? 회원가입'}
      </button>

      <div className="divider">다른 방법으로 로그인</div>
      <div className="sns">
        <button onClick={() => oauth('google')}>Google로 계속하기</button>
        <button className="gh" onClick={() => oauth('github')}>GitHub로 계속하기</button>
        <button className="kk" onClick={() => oauth('kakao')}>카카오로 계속하기</button>
      </div>
      <button className="link" onClick={() => nav('/')}>둘러보기</button>
    </div>
  )
}
