import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Serie } from './pages/Serie';
import { Mouvement } from './pages/Mouvement';
import { Cognisphere } from './pages/Cognisphere';
import { ECHOLink } from './pages/ECHOLink';
import PartnersPage from './pages/PartnersPage';

import { Events } from './pages/Events';
import { Resources } from './pages/Resources';
import { Support } from './pages/Support';
import { Contact } from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import AdminPartners from './pages/AdminPartners';
import AdminEvents from './pages/AdminEvents';
import AdminExports from './pages/AdminExports';
import MyPartnerAccount from './pages/MyPartnerAccount';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { GoogleCallback } from './pages/auth/GoogleCallback';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { useAuthStore } from './features/auth/store';

function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/serie" element={<Serie />} />
          <Route path="/mouvement" element={<Mouvement />} />
          <Route path="/cognisphere" element={<ProtectedRoute><Cognisphere /></ProtectedRoute>} />
          <Route path="/echolink" element={<ProtectedRoute><ECHOLink /></ProtectedRoute>} />
          <Route path="/partenaires" element={<PartnersPage />} />
          <Route path="/agenda" element={<Events />} />
          <Route path="/ressources" element={<Resources />} />
          <Route path="/soutenir" element={<Support />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/partenaires" element={<ProtectedRoute requiredRole="admin"><AdminPartners /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute requiredRole="admin"><AdminEvents /></ProtectedRoute>} />
          <Route path="/admin/exports" element={<ProtectedRoute requiredRole="admin"><AdminExports /></ProtectedRoute>} />
          <Route path="/mon-compte/partenaire" element={<ProtectedRoute><MyPartnerAccount /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/auth/google/success" element={<GoogleCallback />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
