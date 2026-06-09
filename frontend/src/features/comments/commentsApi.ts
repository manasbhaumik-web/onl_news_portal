import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../lib/axios';

export const useComments = (articleId: string, page = 1) => {
  return useQuery({
    queryKey: ['comments', articleId, page],
    queryFn: async () => {
      const res = await axios.get(`/api/articles/${articleId}/comments?page=${page}`);
      return res.data;
    },
    enabled: !!articleId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { articleId: string; content: string; parentCommentId?: string }) => {
      const res = await axios.post(`/api/articles/${data.articleId}/comments`, data);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.articleId] });
    },
  });
};

export const useVoteComment = () => {
  return useMutation({
    mutationFn: async ({ commentId, type }: { commentId: string; type: 'up' | 'down' }) => {
      const res = await axios.post(`/api/comments/${commentId}/vote`, { type });
      return res.data.data;
    },
  });
};
