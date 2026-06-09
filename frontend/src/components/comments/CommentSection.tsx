import { useComments } from '../../features/comments/commentsApi';
import CommentForm from './CommentForm';
import CommentThread from './CommentThread';
import Skeleton from '../ui/Skeleton';

export default function CommentSection({ articleId }: { articleId: string }) {
  const { data, isLoading } = useComments(articleId);

  return (
    <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
      <h3 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">
        Comments {data?.pagination?.total ? `(${data.pagination.total})` : ''}
      </h3>
      
      <CommentForm articleId={articleId} />

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {data?.data?.length === 0 ? (
            <p className="text-slate-500 italic text-center py-8">Be the first to share your thoughts!</p>
          ) : (
            data?.data?.map((comment: any) => (
              <CommentThread key={comment._id} comment={comment} articleId={articleId} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
