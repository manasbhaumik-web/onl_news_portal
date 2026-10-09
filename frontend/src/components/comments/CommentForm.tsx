import { useState } from 'react';
import { useCreateComment } from '../../features/comments/commentsApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../ui/Button';

interface CommentFormProps {
  articleId: string;
  parentCommentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CommentForm({ articleId, parentCommentId, onSuccess, onCancel }: CommentFormProps) {
  const [content, setContent] = useState('');
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const createComment = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    await createComment.mutateAsync({ articleId, content, parentCommentId });
    setContent('');
    if (onSuccess) onSuccess();
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg text-center border border-slate-200 dark:border-slate-700">
        <p className="text-slate-600 dark:text-slate-400 mb-4">You must be logged in to post a comment.</p>
        <Button onClick={() => window.location.href = '/login'}>Log In to Comment</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
        rows={4}
        placeholder="What are your thoughts?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={createComment.isPending}
      />
      <div className="flex justify-end gap-3 mt-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={!content.trim() || createComment.isPending}>
          {createComment.isPending ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </form>
  );
}
