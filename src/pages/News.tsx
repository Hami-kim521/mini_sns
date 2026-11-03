import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { formatDate, supabase, type News as NewsItem } from '../lib/supabase'

export default function News() {
  const [items, setItems] = useState<NewsItem[] | null>(null)

  useEffect(() => {
    supabase.from('ai_news').select('*').order('published_at', { ascending: false })
      .then(({ data }) => setItems(data ?? []))
  }, [])

  return (
    <>
      <TopBar title="AI 핫이슈" />
      <div className="page">
        {items === null ? <p className="empty">불러오는 중…</p> : items.map((n) => {
          const body = (
            <>
              <span className="chip">{n.category}</span>
              <h3>{n.title}</h3>
              <p>{n.summary}</p>
              <div className="foot"><span>{n.source}</span><span>{formatDate(n.published_at)}</span></div>
            </>
          )
          // 연결된 게시물이 있으면 앱 내 이동, 아니면 뉴스 링크로 이동
          return n.post_id ? (
            <Link key={n.id} to={`/posts/${n.post_id}`} className="card news-card">{body}</Link>
          ) : (
            <a key={n.id} href={n.url ?? '#'} target="_blank" rel="noreferrer" className="card news-card">{body}</a>
          )
        })}
      </div>
    </>
  )
}
