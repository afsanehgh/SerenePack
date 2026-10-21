import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppSelector } from './hooks';
import type { AuthResponse } from '../features/auth/authTypes';
import AuthPage from '../features/auth/AuthPage';
import DashboardPage from '../features/pets/DashboardPage';

const STORAGE_KEY = 'petregister-session';

export default function App() {
  const { token, user } = useAppSelector((state) => state.auth);
  const isAuthenticated = Boolean(token);

  useEffect(() => {
    if (token && user) {
      const session: AuthResponse = { token, user };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [token, user]);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <AuthPage register />
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
