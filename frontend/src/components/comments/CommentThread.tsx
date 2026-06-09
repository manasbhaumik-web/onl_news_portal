import { useState } from 'react';
import { formatRelativeTime } from '../../utils/formatters';
import { useVoteComment } from '../../features/comments/commentsApi';
import CommentForm from './CommentForm';
import Avatar from '../ui/Avatar';

interface CommentThreadProps {
  comment: any;
  articleId: string;
}

export default function CommentThread({ comment, articleId }: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const voteComment = useVoteComment();
  const [votesUp, setVotesUp] = useState(comment.votesUp || 0);
  const [voted, setVoted] = useState(false);

  const handleVote = async () => {
    if (voted) return;
    setVotesUp(prev => prev + 1);
    setVoted(true);
    try {
      await voteComment.mutateAsync({ commentId: comment._id, type: 'up' });
    } catch {
      setVotesUp(prev => prev - 1);
      setVoted(false);
    }
  };

  return (
    <div className={`flex gap-4 ${comment.depth > 0 ? 'ml-8 md:ml-12 mt-4' : 'mt-8'}`}>
      <div className="shrink-0">
        <Avatar src={comment.user?.profile?.avatar} fallback={comment.user?.username?.charAt(0) || '?'} />
      </div>
      <div className="flex-1">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-slate-900 dark:text-slate-100">{comment.user?.username || 'Anonymous'}</span>
            <span className="text-xs text-slate-500">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{comment.content}</p>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
            <button onClick={handleVote} className={`flex items-center gap-1 hover:text-indigo-600 ${voted ? 'text-indigo-600' : ''}`}>
              <span>👍</span> {votesUp}
            </button>
            {comment.depth < 5 && (
              <button onClick={() => setIsReplying(!isReplying)} className="hover:text-indigo-600 font-medium">
                Reply
              </button>
            )}
          </div>
        </div>

        {isReplying && (
          <div className="mt-4">
            <CommentForm 
              articleId={articleId} 
              parentCommentId={comment._id} 
              onCancel={() => setIsReplying(false)}
              onSuccess={() => setIsReplying(false)} 
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 border-slate-100 dark:border-slate-800">
            {comment.replies.map((reply: any) => (
              <CommentThread key={reply._id} comment={reply} articleId={articleId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
