import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
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

export interface AuthContextType {
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (user: User | null) => {
    if (!user?.id) {
      setProfile(null);
      return;
    }
    
    try {
      // Timeout para evitar travamento no profile
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
      });
      
      const profilePromise = supabase
        .from('profiles')
        .select(`*`)
        .eq('id', user.id)
        .single();
      
      const { data, error, status } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;
        
      if (error && status !== 406) {
        throw error;
      }
      
      setProfile(data || null);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      
      // Define um perfil básico baseado nos dados do usuário como fallback
      const basicProfile = {
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'Usuário',
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: user.created_at,
        updated_at: new Date().toISOString()
      };
      
      setProfile(basicProfile as Profile);
    }
  }, []);

  useEffect(() => {
    let isInitialLoad = true;
    
    const initializeSession = async () => {
      try {
        // Timeout para sessão inicial
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session timeout')), 5000);
        });
        
        const sessionPromise = supabase.auth.getSession();
        
        let currentSession = null;
        let sessionError = null;
        
        try {
          const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
          currentSession = result.data?.session;
          sessionError = result.error;
        } catch (timeoutError) {
          // Silenciosamente ignora timeout - auth listener vai lidar
        }
        
        if (sessionError) {
          throw sessionError;
        }
        
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        
        // Busca perfil de forma não-bloqueante apenas se há usuário
        if (currentUser && isInitialLoad) {
          fetchProfile(currentUser).catch(() => {
            // Silenciosamente ignora erros de perfil
          });
        }
      } catch (error: any) {
        console.error("Error initializing session:", error);
        if (error.message !== 'Session timeout') {
          toast.error("Problema na verificação da sessão.");
        }
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        // Sempre remove loading após inicialização
        setTimeout(() => {
          setLoading(false);
        }, 100);
      }
    };

    if (!supabase) {
      console.error('Supabase client is not initialized');
      setLoading(false);
      return;
    }

    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // Evita reprocessamento da sessão inicial
        if (event === 'INITIAL_SESSION' && isInitialLoad) {
          isInitialLoad = false;
          return;
        }
        
        setSession(newSession);
        const currentUser = newSession?.user ?? null;
        setUser(currentUser);
        
        // Sempre remove loading em mudanças de estado
        setLoading(false);
        
        // Busca perfil apenas para novos logins/mudanças reais
        if (currentUser && event !== 'INITIAL_SESSION') {
          fetchProfile(currentUser).catch(() => {
            // Silenciosamente ignora erros de perfil
          });
        } else if (!currentUser) {
          setProfile(null);
        }
        
        if (event === 'PASSWORD_RECOVERY') {
          toast.success('Você já pode definir uma nova senha!');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(translateSupabaseError(error.message));
        throw error;
      }
    } catch (error: any) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string): Promise<{ success: boolean }> => {
    try {
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
      
      if (data.user) {
        toast.success('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error('Erro inesperado durante o cadastro.');
      return { success: false };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Erro ao fazer logout.');
        throw error;
      } else {
        toast.success('Logout realizado com sucesso!');
      }
    } catch (error: any) {
      console.error('Signout error:', error);
      throw error;
    }
  };
  
  const sendPasswordResetEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/profile`,
      });
      
      if (error) {
        toast.error(translateSupabaseError(error.message));
        throw error;
      } else {
        toast.success('Link de redefinição de senha enviado para o seu e-mail.');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: { username?: string; avatar_url?: string }) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado.');
      return;
    }
    
    try {
      const profileUpdates = {
        ...updates,
        id: user.id,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase.from('profiles').upsert(profileUpdates);
      
      if (error) {
        throw error;
      }
      
      setProfile(prev => prev ? { ...prev, ...profileUpdates } : null);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Erro ao atualizar o perfil.');
      throw error;
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