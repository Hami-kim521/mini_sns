import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate, isClosed, supabase, type News, type Post } from '../lib/supabase'

export default function Home() {
  const [banners, setBanners] = useState<Post[]>([])
  const [recent, setRecent] = useState<Post[]>([])
  const [news, setNews] = useState<News[]>([])

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    supabase.from('posts').select('*').eq('is_recruit', true).gte('deadline', today).order('deadline').limit(5)
      .then(({ data }) => setBanners(data ?? []))
    supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setRecent(data ?? []))
    supabase.from('ai_news').select('*').order('published_at', { ascending: false }).limit(4)
      .then(({ data }) => setNews(data ?? []))
  }, [])

  return (
    <>
      <header className="topbar"><span className="logo">Brainy</span></header>
      <div className="page">
        <div className="hero">
          <h1>함께 배우는 AI 🧠</h1>
          <p>AI 정보를 나누고, 스터디원을 모아 같이 성장해요.</p>
        </div>

        <h2 className="sec">진행 중인 스터디 <Link to="/posts?type=recruit">전체보기</Link></h2>
        {banners.length === 0 ? <p className="empty">모집 중인 스터디가 없어요</p> : (
          <div className="banner-row">
            {banners.map((p) => (
              <Link key={p.id} to={`/posts/${p.id}`} className="banner">
                <small>~ {formatDate(p.deadline!)} 마감</small>
                <strong>{p.title}</strong>
                <small>자세히 보기 →</small>
              </Link>
            ))}
          </div>
        )}

        <h2 className="sec">최근 게시글 <Link to="/posts">더보기</Link></h2>
        <div className="card row-list">
          {recent.map((p) => (
            <Link key={p.id} to={`/posts/${p.id}`} className="item">
              <span className="t">{isClosed(p) && '🔒 '}{p.title}</span>
              <span className="d">{formatDate(p.created_at)}</span>
            </Link>
          ))}
        </div>

        <h2 className="sec">요즘 AI 핫이슈 <Link to="/news">더보기</Link></h2>
        <div className="news-mini">
          {news.map((n) => (
            <a key={n.id} href={n.url ?? '#'} target="_blank" rel="noreferrer">
              <span className="chip">{n.category}</span>
              <p style={{ marginTop: 8 }}>{n.title}</p>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
