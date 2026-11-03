import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { AuthProvider } from './lib/auth'
import Home from './pages/Home'
import Login from './pages/Login'
import MyPage from './pages/MyPage'
import News from './pages/News'
import PostDetail from './pages/PostDetail'
import PostList from './pages/PostList'
import PostWrite from './pages/PostWrite'

// GitHub Pages에서는 서버 라우팅이 없으므로 HashRouter 사용
export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<PostList />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/write" element={<PostWrite />} />
            <Route path="/news" element={<News />} />
            <Route path="/me" element={<MyPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
