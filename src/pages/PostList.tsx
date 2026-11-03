import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { formatDate, isClosed, supabase, type Post } from '../lib/supabase'

export default function PostList() {
  const [params, setParams] = useSearchParams()
  const recruitOnly = params.get('type') === 'recruit'
  const [posts, setPosts] = useState<Post[] | null>(null)

  useEffect(() => {
    let q = supabase.from('posts').select('*, users(username, display_name)').order('id', { ascending: false })
    if (recruitOnly) q = q.eq('is_recruit', true)
    q.then(({ data }) => setPosts((data as Post[]) ?? []))
  }, [recruitOnly])

  return (
    <>
      <TopBar title="게시판" />
      <div className="filters">
        <button className={recruitOnly ? '' : 'on'} onClick={() => setParams({})}>전체</button>
        <button className={recruitOnly ? 'on' : ''} onClick={() => setParams({ type: 'recruit' })}>스터디 모집</button>
      </div>
      {posts === null ? <p className="empty">불러오는 중…</p> : posts.length === 0 ? <p className="empty">게시글이 없어요</p> : (
        posts.map((p) => (
          <Link key={p.id} to={`/posts/${p.id}`} className="post-row">
            <span className="no">{p.id}</span>
            <div>
              <div className="ti">{p.title}</div>
              <div className="meta">
                <span>{p.users?.display_name ?? '알 수 없음'}</span>
                <span>{formatDate(p.created_at)}</span>
                {p.is_recruit && (
                  <>
                    <span className={`chip ${isClosed(p) ? 'closed' : 'open'}`}>{isClosed(p) ? '마감' : '모집중'}</span>
                    <span>모집 {formatDate(p.schedule_start!)} ~ {formatDate(p.deadline!)}</span>
                  </>
                )}
              </div>
            </div>
          </Link>
        ))
      )}
    </>
  )
}
