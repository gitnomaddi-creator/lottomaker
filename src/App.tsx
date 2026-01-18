import { lazy, Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import TabNav from './components/TabNav';
import Footer from './components/Footer';
import GeneratorPage from './pages/GeneratorPage';
import './App.css';

// Lazy loading for non-critical pages
const SajuPage = lazy(() => import('./pages/SajuPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

// Loading fallback
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', color: '#888' }}>
    로딩 중...
  </div>
);

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

        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;
