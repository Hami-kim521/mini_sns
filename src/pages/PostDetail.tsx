import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useAuth } from '../lib/auth'
import { formatDate, isClosed, supabase, type Comment, type Post } from '../lib/supabase'

export default function PostDetail() {
  const { id } = useParams()
  const postId = Number(id)
  const { profile } = useAuth()
  const nav = useNavigate()
  const [post, setPost] = useState<Post | null | undefined>(undefined)
  const [comments, setComments] = useState<Comment[]>([])
  const [liked, setLiked] = useState(false)
  const [joined, setJoined] = useState(false)
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([
      supabase.from('posts').select('*, users(username, display_name)').eq('id', postId).maybeSingle(),
      supabase.from('comments').select('*, users(username, display_name)').eq('post_id', postId).order('id'),
    ])
    setPost((p.data as Post) ?? null)
    setComments((c.data as Comment[]) ?? [])
    if (profile) {
      const [l, j] = await Promise.all([
        supabase.from('post_likes').select('post_id').eq('post_id', postId).eq('user_id', profile.id).maybeSingle(),
        supabase.from('study_members').select('post_id').eq('post_id', postId).eq('user_id', profile.id).maybeSingle(),
      ])
      setLiked(!!l.data)
      setJoined(!!j.data)
    }
  }, [postId, profile])

  useEffect(() => { load() }, [load])

  const needLogin = () => { nav('/login'); return true }

  const toggleLike = async () => {
    if (!profile) return needLogin()
    const q = liked
      ? supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', profile.id)
      : supabase.from('post_likes').insert({ post_id: postId, user_id: profile.id })
    const { error } = await q
    if (error) setMsg(error.message)
    load()
  }

  const toggleJoin = async () => {
    if (!profile) return needLogin()
    const q = joined
      ? supabase.from('study_members').delete().eq('post_id', postId).eq('user_id', profile.id)
      : supabase.from('study_members').insert({ post_id: postId, user_id: profile.id })
    const { error } = await q
    if (error) setMsg(error.message)
    load()
  }

  const addComment = async (e: FormEvent) => {
    e.preventDefault()
    if (!profile) return needLogin()
    if (!text.trim()) return
    const { error } = await supabase.from('comments').insert({ content: text.trim(), post_id: postId, user_id: profile.id })
    if (error) return setMsg(error.message)
    setText('')
    load()
  }

  const removeComment = async (cid: number) => {
    await supabase.from('comments').delete().eq('id', cid)
    load()
  }

  const removePost = async () => {
    if (!confirm('이 게시글을 삭제할까요?')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) return setMsg(error.message)
    nav('/posts', { replace: true })
  }

  if (post === undefined) return <><TopBar title="게시글" back /><p className="empty">불러오는 중…</p></>
  if (post === null) return <><TopBar title="게시글" back /><p className="empty">존재하지 않는 게시글이에요</p></>

  const closed = isClosed(post)
  const mine = profile?.id === post.user_id

  return (
    <>
      <TopBar title="게시글" back />
      <div className="page white detail" style={{ minHeight: 'auto' }}>
        {post.is_recruit && <span className={`chip ${closed ? 'closed' : 'open'}`}>{closed ? '모집 마감' : '모집중'}</span>}
        <h1 style={{ marginTop: 8 }}>{post.title}</h1>
        <div className="by">{post.users?.display_name} · @{post.users?.username} · {formatDate(post.created_at)}</div>

        {post.is_recruit && (
          <div className="recruit-box">
            <b>📅 모집 기간</b>
            <span>{formatDate(post.schedule_start!)} ~ {formatDate(post.deadline!)}{closed && ' (마감됨)'}</span>
          </div>
        )}
        <div className="body">{post.caption}</div>
        {post.image_url && <img className="photo" src={post.image_url} alt="첨부 사진" />}

        <div className="actions">
          <button className={`like${liked ? ' on' : ''}`} onClick={toggleLike}>{liked ? '❤️' : '🤍'} 좋아요 {post.likes_count}</button>
          {post.is_recruit && (
            <button className="btn sm" style={{ flex: 1 }} disabled={closed && !joined} onClick={toggleJoin}>
              {joined ? '참여 취소' : closed ? '마감됨' : '스터디 참여'}
            </button>
          )}
        </div>
        {msg && <p className="err">{msg}</p>}
        {mine && <button className="link" style={{ color: 'var(--danger)', marginTop: 0 }} onClick={removePost}>게시글 삭제</button>}

        <h2 className="sec" style={{ marginTop: 10 }}>댓글 {comments.length}</h2>
        {comments.map((c) => (
          <div key={c.id} className="cmt">
            <b>{c.users?.display_name}</b><time>{formatDate(c.created_at)}</time>
            {profile?.id === c.user_id && <button style={{ float: 'right', color: 'var(--sub)', fontSize: 12, minHeight: 32 }} onClick={() => removeComment(c.id)}>삭제</button>}
            <div>{c.content}</div>
          </div>
        ))}
        {profile ? (
          <form className="cmt-form" onSubmit={addComment}>
            <input className="input" placeholder="댓글을 입력하세요" value={text} onChange={(e) => setText(e.target.value)} />
            <button className="btn sm">등록</button>
          </form>
        ) : (
          <p className="empty" style={{ padding: 20 }}><Link to="/login" style={{ color: 'var(--primary)' }}>로그인</Link> 후 댓글을 남길 수 있어요</p>
        )}
      </div>
    </>
  )
}
