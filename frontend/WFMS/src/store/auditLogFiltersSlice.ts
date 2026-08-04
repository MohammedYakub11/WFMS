import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuditLogFiltersState {
  module: string | null;
  entity: string | null;
  action: string | null;
  userId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  isFilterModalOpen: boolean;
}

const initialState: AuditLogFiltersState = {
  module: null,
  entity: null,
  action: null,
  userId: null,
  dateFrom: null,
  dateTo: null,
  isFilterModalOpen: false,
};

const auditLogFiltersSlice = createSlice({
  name: 'auditLogFilters',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<AuditLogFiltersState>>) {
      Object.assign(state, action.payload);
    },
    setFilterModalOpen(state, action: PayloadAction<boolean>) {
      state.isFilterModalOpen = action.payload;
    },
    resetFilters(state) {
      state.module = null;
      state.entity = null;
      state.action = null;
      state.userId = null;
      state.dateFrom = null;
      state.dateTo = null;
    },
  },
});

export const { setFilters, setFilterModalOpen, resetFilters } = auditLogFiltersSlice.actions;
export default auditLogFiltersSlice.reducer;
