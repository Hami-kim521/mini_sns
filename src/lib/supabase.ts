import { createClient } from '@supabase/supabase-js'

// 공개(publishable) 키이므로 클라이언트에 포함되어도 안전합니다. 접근 제어는 RLS가 담당합니다.
const SUPABASE_URL = 'https://wrowohigcstqxstyohas.supabase.co'
const SUPABASE_KEY = 'sb_publishable_1L3csvYTPJRMimX1dK8O9w_1tDiDGs4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export interface Profile {
  id: number
  auth_id: string | null
  username: string
  email: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  created_at: string
}

export interface Post {
  id: number
  user_id: number
  title: string
  caption: string
  image_url: string | null
  is_recruit: boolean
  schedule_start: string | null
  deadline: string | null
  likes_count: number
  created_at: string
  users?: Pick<Profile, 'username' | 'display_name'> | null
}

export interface Comment {
  id: number
  content: string
  user_id: number
  post_id: number
  created_at: string
  users?: Pick<Profile, 'username' | 'display_name'> | null
}

export interface News {
  id: number
  title: string
  summary: string
  source: string
  url: string | null
  post_id: number | null
  category: string
  published_at: string
}

export const formatDate = (iso: string) => iso.slice(0, 10).replaceAll('-', '.')

export const isClosed = (p: Pick<Post, 'is_recruit' | 'deadline'>) =>
  p.is_recruit && !!p.deadline && p.deadline < new Date().toISOString().slice(0, 10)
