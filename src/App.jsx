import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ListePage from './pages/ListePage';
import FichePage from './pages/FichePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/residents">
        <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<ListePage />} />
          <Route path="/fiche/:id" element={<FichePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
