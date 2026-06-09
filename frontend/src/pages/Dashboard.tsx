import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store';
import { useBookmarks } from '../features/bookmarks/bookmarksApi';
import { Helmet } from 'react-helmet-async';
import ArticleGrid from '../components/articles/ArticleGrid';

export default function Dashboard() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: bookmarks, isLoading: bookmarksLoading } = useBookmarks();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Map bookmarks to the shape ArticleGrid expects
  const bookmarkedArticles = bookmarks?.map((b: any) => b.article) || [];

  return (
    <div>
      <Helmet><title>Dashboard | Dispatch</title></Helmet>

      <div className="mb-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl font-bold uppercase">
          {user?.username?.[0] || '?'}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Hi, {user?.username}</h1>
          <p className="text-slate-500">{user?.email}</p>
          <div className="mt-3 inline-block px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider">
            {user?.subscriptionTier || 'Free'} Plan
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Saved Articles</h2>
          </div>
          
          {bookmarksLoading ? (
            <div className="h-64 flex items-center justify-center">Loading...</div>
          ) : bookmarkedArticles.length > 0 ? (
            <ArticleGrid articles={bookmarkedArticles} columns={3} />
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 mb-4">You haven't saved any articles yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
