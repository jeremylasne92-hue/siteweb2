import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import { Serie } from './pages/Serie';
import { Mouvement } from './pages/Mouvement';
import { Events } from './pages/Events';
import { Resources } from './pages/Resources';
import { Support } from './pages/Support';
import { Contact } from './pages/Contact';
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
const MyPartnerAccount = lazy(() => import('./pages/MyPartnerAccount'));
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
