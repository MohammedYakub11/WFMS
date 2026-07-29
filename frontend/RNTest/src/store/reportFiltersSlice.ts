import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReportFiltersState {
  dateFrom: string | null;
  dateTo: string | null;
  department: string | null;
  designation: string | null;
  employeeId: string | null;
  skillId: string | null;
  skillCategoryId: string | null;
  approvalStatus: string | null;
  certificationStatus: string | null;
  location: string | null;
  isFilterModalOpen: boolean;
}

const initialState: ReportFiltersState = {
  dateFrom: null,
  dateTo: null,
  department: null,
  designation: null,
  employeeId: null,
  skillId: null,
  skillCategoryId: null,
  approvalStatus: null,
  certificationStatus: null,
  location: null,
  isFilterModalOpen: false,
};

const reportFiltersSlice = createSlice({
  name: 'reportFilters',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<ReportFiltersState>>) {
      Object.assign(state, action.payload);
    },
    setFilterModalOpen(state, action: PayloadAction<boolean>) {
      state.isFilterModalOpen = action.payload;
    },
    resetFilters(state) {
      state.dateFrom = null;
      state.dateTo = null;
      state.department = null;
      state.designation = null;
      state.employeeId = null;
      state.skillId = null;
      state.skillCategoryId = null;
      state.approvalStatus = null;
      state.certificationStatus = null;
      state.location = null;
    },
  },
});

export const { setFilters, setFilterModalOpen, resetFilters } = reportFiltersSlice.actions;
export default reportFiltersSlice.reducer;
