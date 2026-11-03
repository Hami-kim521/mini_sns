import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, type Profile } from './supabase'

interface AuthState {
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  profile: null,
  loading: true,
  signOut: async () => {},
  refresh: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async (uid: string | undefined) => {
    if (!uid) {
      setProfile(null)
    } else {
      const { data } = await supabase.from('users').select('*').eq('auth_id', uid).maybeSingle()
      setProfile(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => load(data.session?.user.id))
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      // 콜백 안에서 바로 supabase를 호출하면 교착될 수 있어 다음 틱으로 미룸
      setTimeout(() => load(session?.user.id), 0)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const refresh = async () => {
    const { data } = await supabase.auth.getSession()
    await load(data.session?.user.id)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return <AuthContext value={{ profile, loading, signOut, refresh }}>{children}</AuthContext>
}
