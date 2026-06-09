import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, XIcon } from 'lucide-react';
import { useSearchSuggestions } from '../../features/search/searchApi';
import useDebounce from '../../hooks/useDebounce';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const { data: suggestions } = useSearchSuggestions(debouncedQuery);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="Search articles, topics..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full focus:ring-2 focus:ring-indigo-500 text-sm outline-none transition-shadow text-slate-900 dark:text-white"
        />
        <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        {query && (
          <button 
            type="button" 
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </form>

      {isOpen && suggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
          <ul className="py-2">
            {suggestions.map((sug: any) => (
              <li key={sug.slug}>
                <button
                  onClick={() => {
                    setQuery('');
                    setIsOpen(false);
                    navigate(`/article/${sug.slug}`);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm flex items-center gap-2"
                >
                  <SearchIcon className="w-3 h-3 text-slate-400" />
                  <span className="truncate text-slate-700 dark:text-slate-300">{sug.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
