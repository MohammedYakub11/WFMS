import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { holidayService, HolidayListQuery } from '../services/holiday.service';
import { CreateHolidayInput, UpdateHolidayInput } from '../types/organization';

export const useHolidays = (query: HolidayListQuery = {}, page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['holidays', query, page, limit],
    queryFn: () => holidayService.getHolidays(query, page, limit),
    keepPreviousData: true,
  });
};

export const useHoliday = (id: string) => {
  return useQuery({
    queryKey: ['holiday', id],
    queryFn: () => holidayService.getHoliday(id),
    enabled: !!id,
  });
};

export const useCreateHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHolidayInput) => holidayService.createHoliday(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['holidays'] }),
  });
};

export const useUpdateHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHolidayInput }) => holidayService.updateHoliday(id, data),
    onSuccess: (_data: unknown, variables: { id: string; data: UpdateHolidayInput }) => {
      queryClient.invalidateQueries({ queryKey: ['holiday', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => holidayService.deleteHoliday(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['holidays'] }),
  });
};
