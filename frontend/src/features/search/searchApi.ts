import { useQuery } from '@tanstack/react-query';
import axios from '../../lib/axios';

export const useSearch = (q: string, page = 1) => {
  return useQuery({
    queryKey: ['search', q, page],
    queryFn: async () => {
      if (!q) return { data: [], pagination: {} };
      const res = await axios.get(`/api/search?q=${encodeURIComponent(q)}&page=${page}`);
      return res.data;
    },
    enabled: !!q,
  });
};

export const useSearchSuggestions = (q: string) => {
  return useQuery({
    queryKey: ['searchSuggestions', q],
    queryFn: async () => {
      if (q.length < 2) return [];
      const res = await axios.get(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
      return res.data.data;
    },
    enabled: q.length >= 2,
    staleTime: 1000 * 60, // 1 min
  });
};
