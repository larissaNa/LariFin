import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, isLoading: true });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, isLoading: false });
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, isLoading: false });
    });

    return () => subscription.unsubscribe();
  }, []);

  // Seed default categories for new users
  useEffect(() => {
    if (!state.user) return;
    const seedCategories = async () => {
      const { data } = await supabase.from('categories').select('id').eq('user_id', state.user!.id).limit(1);
      if (data && data.length > 0) return;
      const defaults = [
        { name: 'Moradia', type: 'fixed', color: '#3b82f6' },
        { name: 'Alimentação', type: 'variable', color: '#10b981' },
        { name: 'Transporte', type: 'variable', color: '#f59e0b' },
        { name: 'Saúde', type: 'variable', color: '#ef4444' },
        { name: 'Lazer', type: 'variable', color: '#8b5cf6' },
        { name: 'Educação', type: 'investment', color: '#06b6d4' },
        { name: 'Investimentos', type: 'investment', color: '#22c55e' },
        { name: 'Dívidas', type: 'debt', color: '#f97316' },
        { name: 'Vestuário', type: 'variable', color: '#ec4899' },
        { name: 'Outros', type: 'variable', color: '#6b7280' },
      ];
      await supabase.from('categories').insert(defaults.map(c => ({ ...c, user_id: state.user!.id })));
    };
    seedCategories();
  }, [state.user]);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
