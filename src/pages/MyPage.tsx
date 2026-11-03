import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useAuth } from '../lib/auth'
import { supabase, type Post } from '../lib/supabase'

export default function MyPage() {
  const { profile, loading, signOut, refresh } = useAuth()
  const [postCount, setPostCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [studies, setStudies] = useState<Post[]>([])
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!profile) return
    setName(profile.display_name)
    setBio(profile.bio ?? '')
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', profile.id)
      .then(({ count }) => setPostCount(count ?? 0))
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('user_id', profile.id)
      .then(({ count }) => setCommentCount(count ?? 0))
    supabase.from('study_members').select('posts(*)').eq('user_id', profile.id)
      .then(({ data }) => setStudies((data ?? []).map((r) => r.posts as unknown as Post).filter(Boolean)))
  }, [profile])

  if (loading) return null
  if (!profile) return <Navigate to="/login" replace />

  const save = async () => {
    const { error } = await supabase.from('users').update({ display_name: name.trim() || profile.display_name, bio }).eq('id', profile.id)
    if (error) return setMsg(error.message)
    await refresh()
    setEditing(false)
    setMsg('')
  }

  return (
    <>
      <TopBar title="마이페이지" />
      <div className="page">
        <div className="profile">
          <div className="avatar">{profile.display_name.slice(0, 1).toUpperCase()}</div>
          {editing ? (
            <>
              <input className="input" style={{ marginBottom: 8, textAlign: 'center' }} value={name} onChange={(e) => setName(e.target.value)} placeholder="표시 이름" />
              <input className="input" style={{ marginBottom: 8, textAlign: 'center' }} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="소개글" />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => setEditing(false)}>취소</button>
                <button className="btn sm" style={{ flex: 1 }} onClick={save}>저장</button>
              </div>
              {msg && <p className="err">{msg}</p>}
            </>
          ) : (
            <>
              <h2>{profile.display_name}</h2>
              <p style={{ color: 'var(--sub)', fontSize: 13, margin: '4px 0' }}>@{profile.username} · {profile.email}</p>
              <p style={{ fontSize: 14, margin: '8px 0 14px' }}>{profile.bio || '소개글을 작성해 보세요'}</p>
              <button className="btn ghost sm" onClick={() => setEditing(true)}>프로필 수정</button>
            </>
          )}
        </div>

        <div className="card stats">
          <div><b>{postCount}</b><span>게시글</span></div>
          <div><b>{commentCount}</b><span>댓글</span></div>
          <div><b>{studies.length}</b><span>참여 스터디</span></div>
        </div>

        <h2 className="sec">참여 중인 스터디</h2>
        {studies.length === 0 ? <p className="empty">아직 참여한 스터디가 없어요</p> : (
          <div className="card row-list">
            {studies.map((p) => (
              <Link key={p.id} to={`/posts/${p.id}`} className="item"><span className="t">{p.title}</span><span className="d">›</span></Link>
            ))}
          </div>
        )}

        <button className="btn ghost" style={{ marginTop: 28 }} onClick={signOut}>로그아웃</button>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--sub)', marginTop: 14 }}>
          가입일 {profile.created_at.slice(0, 10)}
        </p>
      </div>
    </>
  )
}
