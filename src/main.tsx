import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import IdentifyPage from './pages/IdentifyPage';
import { Toaster } from '@/components/ui/sonner';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/identify" element={<IdentifyPage />} />
        <Route path="*" element={<Navigate to="/identify" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </StrictMode>
);