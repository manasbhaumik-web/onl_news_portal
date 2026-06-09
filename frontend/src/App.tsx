import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageLayout from './components/layout/PageLayout';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import AdminPage from './pages/AdminPage';
import BreakingNewsBanner from './components/home/BreakingNewsBanner';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200">
        <BreakingNewsBanner />
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/article/:slug" element={<ArticleDetail />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </div>
            <div className="w-full lg:w-80 shrink-0 hidden lg:block">
              <Sidebar />
            </div>
          </div>
        </main>
      </div>
    </Router>
  );
}
