import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../../lib/axios';

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await axios.get('/api/analytics/dashboard');
      return res.data.data;
    },
  });
};

export const useSaveArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (articleData: any) => {
      if (articleData._id) {
        const res = await axios.put(`/api/articles/${articleData._id}`, articleData);
        return res.data.data;
      } else {
        const res = await axios.post('/api/articles', articleData);
        return res.data.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
  });
};
