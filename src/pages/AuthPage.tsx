import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, LogIn, UserPlus, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Logo';
import { toast } from 'react-hot-toast';

const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { signInWithPassword, signUp, sendPasswordResetEmail } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signInWithPassword(email, password);
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) {
      toast.error('O nome de usuário deve ter pelo menos 3 caracteres.');
      return;
    }
    setLoading(true);
    setRegistrationSuccess(false);
    const { success } = await signUp(email, password, username);
    if (success) {
      setRegistrationSuccess(true);
    }
    setLoading(false);
  };
  
  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('Por favor, insira seu e-mail para redefinir a senha.');
      return;
    }
    setLoading(true);
    await sendPasswordResetEmail(email);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="justify-center" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          {registrationSuccess ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Registro Quase Completo!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Enviamos um link de confirmação para <b>{email}</b>. Por favor, verifique sua caixa de entrada (e a pasta de spam) para ativar sua conta.
              </p>
              <button
                onClick={() => {
                  setRegistrationSuccess(false);
                  setIsLoginView(true);
                }}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
              >
                Voltar para o Login
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                {isLoginView ? 'Bem-vindo de volta!' : 'Crie sua conta'}
              </h2>

              <form onSubmit={isLoginView ? handleLogin : handleRegister} className="space-y-6">
                {!isLoginView && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      placeholder="Nome de usuário"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    placeholder="seu.email@exemplo.com"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    placeholder="Senha"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  {isLoginView ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {loading ? 'Processando...' : (isLoginView ? 'Entrar' : 'Registrar')}
                </button>
              </form>

              <div className="text-center mt-6">
                <button
                  onClick={() => setIsLoginView(!isLoginView)}
                  className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                >
                  {isLoginView ? 'Não tem uma conta? Registre-se' : 'Já tem uma conta? Faça login'}
                </button>
              </div>
              
              {isLoginView && (
                <div className="text-center mt-4">
                  <button
                    onClick={handlePasswordReset}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
