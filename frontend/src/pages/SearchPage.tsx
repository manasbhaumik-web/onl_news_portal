import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../features/search/searchApi';
import { Helmet } from 'react-helmet-async';
import ArticleGrid from '../components/articles/ArticleGrid';
import Pagination from '../components/ui/Pagination';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const { data, isLoading } = useSearch(q, page);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ q, page: newPage.toString() });
    window.scrollTo(0, 0);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Helmet><title>Search Results for "{q}" | Dispatch</title></Helmet>

      <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {data?.pagination?.total || 0} results for <span className="font-semibold text-slate-900 dark:text-white">"{q}"</span>
        </p>
      </div>

      <ArticleGrid articles={data?.data} isLoading={isLoading} columns={2} />

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination 
            currentPage={page} 
            totalPages={data.pagination.totalPages} 
            onPageChange={handlePageChange} 
          />
        </div>
      )}
    </div>
  );
}
