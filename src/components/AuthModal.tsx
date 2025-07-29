import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithEmail(email);
    if (!error) {
      setSubmitted(true);
    }
    setLoading(false);
  };

  const handleClose = () => {
    onClose();
    // Reset state after a delay to allow for exit animation
    setTimeout(() => {
      setEmail('');
      setSubmitted(false);
      setLoading(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Acessar Sistema
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-8 text-center">
            <Logo className="justify-center mb-6" />

            {submitted ? (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Verifique seu e-mail!</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Enviamos um link mágico de login para <strong>{email}</strong>. Clique no link para acessar o sistema.
                </p>
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-2 mt-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-gray-600 dark:text-gray-300">
                  Para editar, adicionar ou remover tarefas, você precisa estar logado. Insira seu e-mail para receber um link de acesso.
                </p>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    autoFocus
                    placeholder="seu.email@exemplo.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <LogIn size={18} />
                  {loading ? 'Enviando...' : 'Enviar Link Mágico'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
