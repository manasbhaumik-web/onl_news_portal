import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import DOMPurify from 'dompurify';
import socketService from '../lib/socket';
import { EyeIcon } from 'lucide-react';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [liveViewCount, setLiveViewCount] = useState<number | null>(null);
  
  const { data: article, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const res = await axios.get(`/api/articles/slug/${slug}`);
      return res.data.data;
    }
  });

  useEffect(() => {
    if (article && slug) {
      setLiveViewCount(article.viewCount);
      const socket = socketService.connect();

      // Join room and record view
      socket.emit('join:article', slug);
      socket.emit('view:article', slug);

      // Listen for updates
      const handleCountUpdate = (data: { slug: string; viewCount: number }) => {
        if (data.slug === slug) {
          setLiveViewCount(data.viewCount);
        }
      };
      
      socket.on('view:count', handleCountUpdate);

      return () => {
        socket.emit('leave:article', slug);
        socket.off('view:count', handleCountUpdate);
      };
    }
  }, [article, slug]);

  if (isLoading) return <div className="animate-pulse h-96 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>;
  if (!article) return <div>Article not found</div>;

  return (
    <article className="max-w-3xl mx-auto">
      <Helmet><title>{article.title} | Dispatch</title></Helmet>
      
      <header className="mb-8">
        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{article.category?.name}</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold mt-3 mb-4 leading-tight">{article.title}</h1>
        {article.subtitle && <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">{article.subtitle}</p>}
        
        <div className="flex items-center gap-4 text-sm text-slate-500 border-y border-slate-200 dark:border-slate-800 py-4">
          <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
            {article.author?.avatar ? (
              <img src={article.author.avatar} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                {article.author?.name?.charAt(0)}
              </div>
            )}
            <span>{article.author?.name}</span>
          </div>
          <span>•</span>
          <time>{new Date(article.publishedAt).toLocaleDateString()}</time>
          <span>•</span>
          <span>{article.estimatedReadingTime} min read</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
            <EyeIcon className="w-4 h-4" />
            {liveViewCount !== null ? liveViewCount : article.viewCount} views
          </span>
        </div>
      </header>

      {article.featuredImage?.url && (
        <figure className="mb-10">
          <img src={article.featuredImage.url} alt={article.title} className="w-full rounded-xl aspect-[21/9] object-cover" />
          {article.featuredImage.caption && <figcaption className="mt-3 text-sm text-center text-slate-500">{article.featuredImage.caption}</figcaption>}
        </figure>
      )}

      <div 
        className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
      />
    </article>
  );
}
