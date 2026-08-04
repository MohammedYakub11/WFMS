import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EmployeeDirectoryState {
  keyword: string;
  department: string | null;
  designation: string | null;
  status: string | null;
  location: string | null;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  isFilterModalOpen: boolean;
}

const initialState: EmployeeDirectoryState = {
  keyword: '',
  department: null,
  designation: null,
  status: null,
  location: null,
  sortBy: 'created_at',
  sortOrder: 'DESC',
  isFilterModalOpen: false,
};

const employeeDirectorySlice = createSlice({
  name: 'employeeDirectory',
  initialState,
  reducers: {
    setKeyword(state, action: PayloadAction<string>) {
      state.keyword = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<EmployeeDirectoryState>>) {
      Object.assign(state, action.payload);
    },
    setSortBy(state, action: PayloadAction<string>) {
      state.sortBy = action.payload;
    },
    setSortOrder(state, action: PayloadAction<'ASC' | 'DESC'>) {
      state.sortOrder = action.payload;
    },
    setFilterModalOpen(state, action: PayloadAction<boolean>) {
      state.isFilterModalOpen = action.payload;
    },
    resetFilters(state) {
      state.department = null;
      state.designation = null;
      state.status = null;
      state.location = null;
      state.sortBy = 'created_at';
      state.sortOrder = 'DESC';
    },
  },
});

export const {
  setKeyword,
  setFilters,
  setSortBy,
  setSortOrder,
  setFilterModalOpen,
  resetFilters,
} = employeeDirectorySlice.actions;
export default employeeDirectorySlice.reducer;
