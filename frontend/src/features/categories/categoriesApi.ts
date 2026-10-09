import { useQuery } from '@tanstack/react-query';
import axios from '../../lib/axios';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get('/api/categories');
      return res.data;
    },
  });
};
