import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

interface SearchQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  department?: string | null;
  designation?: string | null;
  location?: string | null;
  category?: string | null;
  skill?: string | null;
  proficiency?: number | null;
  certified?: boolean | null;
  experienceMin?: number | null;
  experienceMax?: number | null;
}

export const useWorkforceSearch = (query: SearchQuery) => {
  return useQuery({
    queryKey: ['workforceSearch', query],
    queryFn: async () => {
      // Clean up nulls
      const params: Record<string, any> = {};
      Object.entries(query).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params[key] = value;
        }
      });
      
      const response = await apiClient.get('/search/workforce', { params });
      return response.data;
    },
    keepPreviousData: true,
  });
};

export const useSearchMetadata = () => {
  return useQuery({
    queryKey: ['searchMetadata'],
    queryFn: async () => {
      const response = await apiClient.get('/search/metadata');
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
