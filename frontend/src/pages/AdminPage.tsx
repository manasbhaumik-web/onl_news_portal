import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store';
import ArticleEditor from '../components/admin/ArticleEditor';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import { useSaveArticle } from '../features/admin/hooks/useAdmin';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const saveArticle = useSaveArticle();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'editor' | 'comments' | 'users'>('dashboard');

  if (!isAuthenticated || !['admin', 'editor'].includes(user?.role || '')) {
    return <Navigate to="/" replace />;
  }

  const handleSaveArticle = async (content: string, title: string) => {
    try {
      await saveArticle.mutateAsync({ title, content, status: 'draft', categoryId: 'TODO_ADD_CATEGORY_PICKER' });
      toast.success('Draft saved successfully');
    } catch {
      toast.error('Failed to save draft');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Helmet><title>Admin Panel | Dispatch</title></Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Portal</h1>
        <p className="text-slate-500">Manage content, users, and view analytics.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard Overview' },
              { id: 'editor', label: 'New Article' },
              { id: 'comments', label: 'Moderation Queue' },
              { id: 'users', label: 'User Management' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'dashboard' && <AnalyticsDashboard />}
          {activeTab === 'editor' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Create New Article</h2>
              <ArticleEditor onSave={handleSaveArticle} isSaving={saveArticle.isPending} />
            </div>
          )}
          {activeTab === 'comments' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center text-slate-500 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Moderation Queue</h3>
              <p>No comments pending review.</p>
            </div>
          )}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center text-slate-500 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">User Management</h3>
              <p>User directory and role assignment tools go here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
