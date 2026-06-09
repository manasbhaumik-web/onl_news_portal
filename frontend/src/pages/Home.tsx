import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import axios from '../lib/axios';

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['articles', 'home'],
    queryFn: async () => {
      const res = await axios.get('/api/articles');
      return res.data.data;
    }
  });

  return (
    <div>
      <Helmet><title>Dispatch News Portal | Home</title></Helmet>
      
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-6 tracking-tight">Top Stories</h1>
        
        {isLoading ? (
          <div className="animate-pulse bg-slate-200 dark:bg-slate-800 h-96 rounded-xl"></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.map((article: any) => (
              <div key={article._id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer border border-slate-200 dark:border-slate-700">
                <div className="aspect-video bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  {article.featuredImage?.url && (
                    <img src={article.featuredImage.url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">{article.category?.name}</span>
                  <h3 className="text-lg font-bold mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">{article.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
