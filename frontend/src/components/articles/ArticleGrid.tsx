import React from 'react';
import { clsx } from 'clsx';
import type { Article } from '../../types';
import { ArticleCard } from './ArticleCard';
import { ArticleCardSkeleton } from '../ui/Skeleton';

interface ArticleGridProps {
  articles?: Article[];
  isLoading?: boolean;
  skeletonCount?: number;
  columns?: 1 | 2 | 3 | 4;
  showExcerpt?: boolean;
  className?: string;
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles = [],
  isLoading = false,
  skeletonCount = 6,
  columns = 3,
  showExcerpt = true,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={clsx('grid gap-6', columnClasses[columns], className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">📰</div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No articles found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Check back later for the latest news and stories.
        </p>
      </div>
    );
  }

  return (
    <div className={clsx('grid gap-6', columnClasses[columns], className)}>
      {articles.map((article) => (
        <ArticleCard
          key={article._id}
          article={article}
          showExcerpt={showExcerpt}
        />
      ))}
    </div>
  );
};
export default ArticleGrid;
