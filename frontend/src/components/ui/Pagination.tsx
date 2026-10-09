import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { usePagination, DOTS } from '../../hooks/usePagination';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const pages = usePagination({ totalPages, currentPage });

  if (totalPages <= 1) return null;

  return (
    <nav
      className={clsx('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={clsx(
          'flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all',
          currentPage === 1
            ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
        )}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Pages */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === DOTS ? (
            <span
              key={`dots-${index}`}
              className="px-3 py-2 text-slate-400 dark:text-slate-600 text-sm"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className={clsx(
                'w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all',
                page === currentPage
                  ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={clsx(
          'flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all',
          currentPage === totalPages
            ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
        )}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};
export default Pagination;
