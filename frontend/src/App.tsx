import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Serie } from './pages/Serie';
import { Mouvement } from './pages/Mouvement';
import { ECHOLink } from './pages/ECHOLink';
import { ECHOsystem } from './pages/ECHOsystem';

import { Events } from './pages/Events';
import { Resources } from './pages/Resources';
import { Support } from './pages/Support';
import { Contact } from './pages/Contact';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/serie" element={<Serie />} />
          <Route path="/mouvement" element={<Mouvement />} />
          <Route path="/echolink" element={<ECHOLink />} />
          <Route path="/partenaires" element={<ECHOsystem />} />
          <Route path="/agenda" element={<Events />} />
          <Route path="/ressources" element={<Resources />} />
          <Route path="/soutenir" element={<Support />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
