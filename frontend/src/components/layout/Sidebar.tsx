import React from 'react';
import { TrendingWidget } from '../articles/TrendingWidget';
import NewsletterWidget from '../home/NewsletterWidget';
import { useCategories } from '../../features/categories/categoriesApi';
import { Link } from 'react-router-dom';
import { Hash } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];

  return (
    <aside className="space-y-6 sticky top-24">
      {/* Trending Widget */}
      <TrendingWidget />

      {/* Newsletter Widget */}
      <NewsletterWidget compact />

      {/* Categories */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-gradient-to-b from-brand-500 to-violet-500" />
          Browse Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat: any) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:text-white transition-all"
              style={{
                '--cat-color': cat.color,
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = cat.color;
                (e.currentTarget as HTMLAnchorElement).style.color = 'white';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '';
                (e.currentTarget as HTMLAnchorElement).style.color = '';
              }}
            >
              <Hash size={10} />
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Social Follow */}
      <div className="bg-gradient-to-br from-brand-600 to-violet-700 rounded-2xl p-5 text-white">
        <h3 className="font-semibold text-sm uppercase tracking-widest mb-1 text-brand-200">Follow Us</h3>
        <p className="text-white font-bold text-lg mb-4">Stay connected on social media</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Twitter', handle: '@dispatch', bg: 'bg-sky-500' },
            { name: 'Facebook', handle: '/dispatch', bg: 'bg-blue-600' },
            { name: 'Instagram', handle: '@dispatch', bg: 'bg-pink-600' },
            { name: 'LinkedIn', handle: '/dispatch', bg: 'bg-blue-700' },
          ].map(({ name, handle, bg }) => (
            <a
              key={name}
              href="#"
              className={`flex flex-col items-center justify-center py-2.5 rounded-xl ${bg} hover:opacity-90 transition-opacity text-center`}
            >
              <span className="text-xs font-bold">{name}</span>
              <span className="text-xs text-white/70">{handle}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
};
