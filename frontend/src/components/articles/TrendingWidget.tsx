import { useQuery } from '@tanstack/react-query';
import axios from '../../lib/axios';
import { Link } from 'react-router-dom';

export function TrendingWidget() {
  const { data: trendingArticles, isLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      // Typically goes to /api/articles?isFeatured=true or a specific /api/trending endpoint
      const res = await axios.get('/api/articles?limit=5');
      return res.data.data;
    }
  });

  if (isLoading) {
    return <div className="animate-pulse bg-slate-200 dark:bg-slate-800 h-64 rounded-xl"></div>;
  }

  if (!trendingArticles || trendingArticles.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-gradient-to-b from-brand-500 to-violet-500" />
        Trending Now
      </h3>
      <div className="space-y-4">
        {trendingArticles.map((article: any, index: number) => (
          <Link key={article._id} to={`/article/${article.slug}`} className="flex gap-3 group">
            <div className="text-2xl font-black text-slate-200 dark:text-slate-700 group-hover:text-brand-500 transition-colors">
              {index + 1}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 line-clamp-2 leading-snug">
                {article.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1">{article.category?.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
