'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@/lib/supabase/types';
import { useGameStore } from '@/lib/store/gameStore';

// Single supabase instance for the browser
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const setStoreUser = useGameStore((state) => state.setUser);

  // Load user profile from database
  const loadProfile = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profile) {
      setUser(profile);
      setStoreUser(profile);
    }
    return profile;
  }, [setStoreUser]);

  // Check session on mount
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadProfile(session.user.id);
      }
      setLoading(false);
    };

    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setStoreUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile, setStoreUser]);

  const signUp = useCallback(async (email: string, password: string, username: string): Promise<{ error?: string }> => {
    // Check if username is taken
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();
    
    if (existingUser) {
      return { error: 'Username is already taken' };
    }

    // Sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      // Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load profile
      let profile = await loadProfile(data.user.id);
      
      // If trigger didn't create it, create manually
      if (!profile) {
        await supabase.from('users').insert({ id: data.user.id, username });
        await loadProfile(data.user.id);
      }
    }

    return {};
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      await loadProfile(data.user.id);
    }

    return {};
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStoreUser(null);
  }, [setStoreUser]);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
