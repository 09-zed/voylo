import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { locale } from '@/i18n';
import { supabase, supabaseConfigured } from './supabase';

export type Profile = {
  id: string;
  first_name: string;
  avatar_url: string | null;
};

type AuthState = {
  /** True until the stored session (and profile) have been read. */
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  sendCode: (email: string) => Promise<string | null>;
  verifyCode: (email: string, code: string) => Promise<string | null>;
  saveFirstName: (firstName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id, first_name, avatar_url')
    .eq('id', userId)
    .maybeSingle<Profile>();
  return data ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(supabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) return;

    let active = true;

    const apply = async (next: Session | null) => {
      const nextProfile = next ? await fetchProfile(next.user.id) : null;
      if (!active) return;
      setSession(next);
      setProfile(nextProfile);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((event, next) => {
      // Token refreshes don't change who is signed in: keep the profile we have.
      if (event === 'TOKEN_REFRESHED') {
        setSession(next);
        return;
      }
      // Supabase advises against awaiting other calls inside this callback.
      setTimeout(() => apply(next), 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const sendCode = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    return error ? error.message : null;
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    return error ? error.message : null;
  }, []);

  const saveFirstName = useCallback(
    async (firstName: string) => {
      if (!session) return 'not-signed-in';
      const row = { id: session.user.id, first_name: firstName.trim(), locale };
      const { data, error } = await supabase
        .from('profiles')
        .upsert(row)
        .select('id, first_name, avatar_url')
        .single<Profile>();
      if (error) return error.message;
      setProfile(data);
      return null;
    },
    [session],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ loading, session, profile, sendCode, verifyCode, saveFirstName, signOut }),
    [loading, session, profile, sendCode, verifyCode, saveFirstName, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
