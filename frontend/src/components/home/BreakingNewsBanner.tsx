import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MegaphoneIcon, XIcon } from 'lucide-react';
import socketService from '../../lib/socket';

export default function BreakingNewsBanner() {
  const [breakingNews, setBreakingNews] = useState<{ title: string; slug: string } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const socket = socketService.connect();

    const handleBreakingNews = (data: { title: string; slug: string }) => {
      setBreakingNews(data);
      setIsVisible(true);
    };

    socket.on('breaking:news', handleBreakingNews);

    return () => {
      socket.off('breaking:news', handleBreakingNews);
    };
  }, []);

  if (!isVisible || !breakingNews) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-3 shadow-md relative z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full animate-pulse">
            <MegaphoneIcon className="w-4 h-4 text-white" />
          </span>
          <p className="font-bold tracking-wide">
            <span className="uppercase text-xs mr-2 bg-white text-red-600 px-2 py-0.5 rounded-sm">Breaking</span>
            <Link to={`/article/${breakingNews.slug}`} className="hover:underline">
              {breakingNews.title}
            </Link>
          </p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
          title="Dismiss"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
