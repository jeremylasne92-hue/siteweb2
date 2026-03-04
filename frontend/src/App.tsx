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
import AdminPartners from './pages/AdminPartners';
import MyPartnerAccount from './pages/MyPartnerAccount';

function App() {
  return (
    <Router>
      <Layout>
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
          <Route path="/admin/partenaires" element={<AdminPartners />} />
          <Route path="/mon-compte/partenaire" element={<MyPartnerAccount />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
