import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
// Static import (Landing page / Initial bundle)
import { Home } from './pages/Home';

// Lazy-loaded routes: public pages
const Serie = lazy(() => import('./pages/Serie').then(m => ({ default: m.Serie })));
const Mouvement = lazy(() => import('./pages/Mouvement').then(m => ({ default: m.Mouvement })));
const Events = lazy(() => import('./pages/Events').then(m => ({ default: m.Events })));
const Resources = lazy(() => import('./pages/Resources').then(m => ({ default: m.Resources })));
const Support = lazy(() => import('./pages/Support').then(m => ({ default: m.Support })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const LegalNotice = lazy(() => import('./pages/LegalNotice').then(m => ({ default: m.LegalNotice })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const FAQ = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { useAuthStore } from './features/auth/store';
import { usePageTracking } from './hooks/usePageTracking';

// Lazy-loaded routes: admin, auth, protected pages, partners (heavy map)
const Cognisphere = lazy(() => import('./pages/Cognisphere').then(m => ({ default: m.Cognisphere })));
const ECHOLink = lazy(() => import('./pages/ECHOLink').then(m => ({ default: m.ECHOLink })));
const PartnersPage = lazy(() => import('./pages/PartnersPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminPartners = lazy(() => import('./pages/AdminPartners'));
const AdminEvents = lazy(() => import('./pages/AdminEvents'));
const AdminExports = lazy(() => import('./pages/AdminExports'));
const AdminCandidatures = lazy(() => import('./pages/AdminCandidatures'));
const MyPartnerAccount = lazy(() => import('./pages/MyPartnerAccount'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));
const GoogleCallback = lazy(() => import('./pages/auth/GoogleCallback').then(m => ({ default: m.GoogleCallback })));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppRoutes() {
  usePageTracking();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/serie" element={<Serie />} />
      <Route path="/mouvement" element={<Mouvement />} />
      <Route path="/cognisphere" element={<Cognisphere />} />
      <Route path="/echolink" element={<ECHOLink />} />
      <Route path="/partenaires" element={<PartnersPage />} />
      <Route path="/agenda" element={<Events />} />
      <Route path="/ressources" element={<Resources />} />
      <Route path="/soutenir" element={<Support />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/politique-de-confidentialite" element={<PrivacyPolicy />} />
      <Route path="/mentions-legales" element={<LegalNotice />} />
      <Route path="/cgu" element={<TermsOfService />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/partenaires" element={<ProtectedRoute requiredRole="admin"><AdminPartners /></ProtectedRoute>} />
      <Route path="/admin/events" element={<ProtectedRoute requiredRole="admin"><AdminEvents /></ProtectedRoute>} />
      <Route path="/admin/exports" element={<ProtectedRoute requiredRole="admin"><AdminExports /></ProtectedRoute>} />
      <Route path="/admin/candidatures" element={<ProtectedRoute requiredRole="admin"><AdminCandidatures /></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/mon-compte/partenaire" element={<ProtectedRoute><MyPartnerAccount /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/auth/google/success" element={<GoogleCallback />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<RouteLoader />}>
            <AppRoutes />
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </Router>
  );
}

export default App;
