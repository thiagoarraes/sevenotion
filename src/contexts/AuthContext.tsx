import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { Profile } from '../types/Task';

const translateSupabaseError = (message: string): string => {
  if (message.includes('Invalid login credentials')) {
    return 'Credenciais de login inválidas. Verifique seu e-mail e senha.';
  }
  if (message.includes('User already registered')) {
    return 'Este e-mail já foi registrado. Tente fazer login.';
  }
  if (message.includes('Password should be at least 6 characters')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (message.includes('Unable to validate email address: invalid format')) {
    return 'O formato do e-mail é inválido.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada.';
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<{ success: boolean }>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateProfile: (updates: { username?: string; avatar_url?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', user.id)
        .single();
      if (error && status !== 406) throw error;
      setProfile(data || null);
    } catch (error: any) {
      toast.error('Erro ao carregar perfil do usuário.');
      console.error(error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await fetchProfile(currentUser);
      } catch (e) {
        console.error("Erro ao obter a sessão:", e);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await fetchProfile(currentUser);
        if (_event === 'PASSWORD_RECOVERY') {
          toast.success('Você já pode definir uma nova senha!');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(translateSupabaseError(error.message));
  };

  const signUp = async (email: string, password: string, username: string): Promise<{ success: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
    if (error) {
      toast.error(translateSupabaseError(error.message));
      return { success: false };
    }
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      toast.success('Usuário já registrado. Enviamos um novo e-mail de confirmação.');
      return { success: true };
    }
    
    return { success: true };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Erro ao fazer logout.');
    } else {
      setSession(null);
      setUser(null);
      setProfile(null);
      toast.success('Logout realizado com sucesso!');
    }
  };
  
  const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/profile`,
    });
    if (error) toast.error(translateSupabaseError(error.message));
    else toast.success('Link de redefinição de senha enviado para o seu e-mail.');
  };

  const updateProfile = async (updates: { username?: string; avatar_url?: string }) => {
    if (!user) return;
    try {
      const profileUpdates = {
        ...updates,
        id: user.id,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('profiles').upsert(profileUpdates);
      if (error) throw error;
      setProfile(prev => prev ? { ...prev, ...profileUpdates } : null);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar o perfil.');
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signInWithPassword,
    signUp,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
