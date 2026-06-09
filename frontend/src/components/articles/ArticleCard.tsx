import React from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { Eye, Clock, Calendar } from 'lucide-react';
import type { Article } from '../../types';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { formatRelativeTime, formatReadingTime, formatNumber } from '../../utils/formatters';

interface ArticleCardProps {
  article: Article;
  className?: string;
  layout?: 'vertical' | 'horizontal';
  showExcerpt?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  className,
  layout = 'vertical',
  showExcerpt = true,
}) => {
  const category = article.category;
  const author = article.author;
  const imageUrl = article.featuredImage?.url;

  if (layout === 'horizontal') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className={clsx(
          'flex gap-4 group',
          className
        )}
      >
        {imageUrl && (
          <div className="flex-shrink-0 w-28 h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
            <img
              src={imageUrl}
              alt={article.featuredImage?.alt || article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {category && (
            <Badge variant="category" color={category.color} size="sm" className="mb-1">
              {category.name}
            </Badge>
          )}
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
            {article.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {formatRelativeTime(article.publishedAt)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <article
      className={clsx(
        'bg-white dark:bg-slate-800/70 rounded-2xl overflow-hidden',
        'border border-slate-100 dark:border-slate-700/50',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60',
        'group flex flex-col',
        className
      )}
    >
      {/* Category Accent Bar */}
      {category && (
        <div
          className="h-1 w-full"
          style={{ backgroundColor: category.color }}
        />
      )}

      {/* Featured Image */}
      <Link to={`/article/${article.slug}`} className="block overflow-hidden">
        <div className="relative h-48 bg-slate-200 dark:bg-slate-700">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={article.featuredImage?.alt || article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-100 to-violet-100 dark:from-brand-900/30 dark:to-violet-900/30 flex items-center justify-center">
              <span className="text-4xl opacity-20">📰</span>
            </div>
          )}
          {/* Breaking Badge overlay */}
          {article.isBreaking && (
            <div className="absolute top-3 left-3">
              <Badge variant="breaking" pulse>Breaking</Badge>
            </div>
          )}
          {/* Format badge */}
          {article.format && article.format !== 'news' && (
            <div className="absolute top-3 right-3">
              <Badge variant="format" size="sm">{article.format}</Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        {category && (
          <Link to={`/category/${category.slug}`} className="mb-2 inline-block">
            <Badge variant="category" color={category.color} size="sm">
              {category.name}
            </Badge>
          </Link>
        )}

        {/* Title */}
        <Link to={`/article/${article.slug}`}>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-snug line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-2">
            {article.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {showExcerpt && article.excerpt && (
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed flex-1">
            {article.excerpt}
          </p>
        )}

        {/* Footer Meta */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar
              src={author?.avatar}
              fallback={author?.name || 'Author'}
              size="xs"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                {author?.name || 'Staff Writer'}
              </p>
              <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                <Calendar size={10} />
                <span className="text-xs">{formatRelativeTime(article.publishedAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 flex-shrink-0">
            {article.estimatedReadingTime && (
              <div className="flex items-center gap-0.5">
                <Clock size={11} />
                <span className="text-xs">{formatReadingTime(article.estimatedReadingTime)}</span>
              </div>
            )}
            {article.viewCount !== undefined && (
              <div className="flex items-center gap-0.5">
                <Eye size={11} />
                <span className="text-xs">{formatNumber(article.viewCount)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
