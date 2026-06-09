import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useBookmarks, useToggleBookmark } from '../../features/bookmarks/bookmarksApi';
import { BookmarkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookmarkButton({ articleId }: { articleId: string }) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { data: bookmarks } = useBookmarks();
  const toggleBookmark = useToggleBookmark();
  
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (bookmarks) {
      setIsBookmarked(bookmarks.some((b: any) => b.articleId === articleId));
    }
  }, [bookmarks, articleId]);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save articles.');
      return;
    }
    
    // Optimistic UI
    setIsBookmarked(!isBookmarked);
    
    try {
      await toggleBookmark.mutateAsync({ articleId, isBookmarked });
      toast.success(isBookmarked ? 'Article removed from bookmarks' : 'Article saved!');
    } catch {
      // Revert on error
      setIsBookmarked(isBookmarked);
      toast.error('Failed to update bookmark');
    }
  };

  return (
    <button 
      onClick={handleToggle}
      className={`p-2 rounded-full transition-colors ${
        isBookmarked 
          ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
      }`}
      title="Save article"
    >
      <BookmarkIcon className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
    </button>
  );
}
