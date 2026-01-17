import { Routes, Route, Link } from 'react-router-dom';
import TabNav from './components/TabNav';
import Footer from './components/Footer';
import GeneratorPage from './pages/GeneratorPage';
import SajuPage from './pages/SajuPage';
import AboutPage from './pages/AboutPage';
import ResultsPage from './pages/ResultsPage';
import StatsPage from './pages/StatsPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-title-link">
          <h1 className="app-title">로또메이커</h1>
        </Link>
        <p className="app-subtitle">행운의 번호를 뽑아보세요!</p>
      </header>

      <main className="app-main">
        <TabNav />

        <Routes>
          <Route path="/" element={<GeneratorPage />} />
          <Route path="/saju" element={<SajuPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
