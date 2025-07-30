import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import MainPage from './pages/MainPage';

const App: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-2xl font-semibold text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/" />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/historico" element={<MainPage />} />
        <Route path="/profile" element={session ? <ProfilePage /> : <Navigate to="/auth" />} />
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </>
  );
};

export default App;
