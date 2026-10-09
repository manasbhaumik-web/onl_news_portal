import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Linkedin, Rss, Zap } from 'lucide-react';
import { useCategories } from '../../features/categories/categoriesApi';

const navigation = {
  main: [
    { name: 'Home', to: '/' },
    { name: 'About', to: '/about' },
    { name: 'Contact', to: '/contact' },
    { name: 'Advertise', to: '/advertise' },
    { name: 'Privacy Policy', to: '/privacy' },
    { name: 'Terms of Service', to: '/terms' },
  ],
  social: [
    { name: 'Twitter', to: 'https://twitter.com', icon: Twitter },
    { name: 'Facebook', to: 'https://facebook.com', icon: Facebook },
    { name: 'Instagram', to: 'https://instagram.com', icon: Instagram },
    { name: 'LinkedIn', to: 'https://linkedin.com', icon: Linkedin },
    { name: 'RSS', to: '/rss.xml', icon: Rss },
  ],
};

export const Footer: React.FC = () => {
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];

  return (
    <footer className="bg-slate-950 text-slate-400 mt-20">
      {/* Top CTA Bar */}
      <div className="bg-gradient-to-r from-brand-600 via-violet-600 to-purple-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Stay Informed, Stay Ahead
          </h2>
          <p className="text-brand-200 text-sm mb-4">
            Subscribe to Dispatch for daily news briefings delivered to your inbox.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-700 rounded-xl font-semibold text-sm hover:bg-brand-50 transition-colors shadow-lg"
          >
            <Zap size={16} className="fill-current" />
            Subscribe Free
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 group mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600">
                <Zap size={18} className="text-white fill-current" />
              </div>
              <span className="font-display font-black text-2xl text-white">DISPATCH</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 text-slate-400">
              Breaking news, in-depth analysis, and world events. Stay informed with Dispatch — your trusted news source.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {navigation.social.map(({ name, to, icon: Icon }) => (
                <a
                  key={name}
                  href={to}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:bg-brand-600 hover:text-white transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.slice(0, 7).map((cat: any) => (
                <li key={cat._id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Company</h3>
            <ul className="space-y-2">
              {navigation.main.map(({ name, to }) => (
                <li key={name}>
                  <Link
                    to={to}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Mini */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Newsletter</h3>
            <p className="text-sm mb-4">Get the latest stories delivered to your inbox every morning.</p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 text-white text-sm font-semibold hover:from-brand-700 hover:to-violet-700 transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Dispatch News Portal. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-slate-300 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
