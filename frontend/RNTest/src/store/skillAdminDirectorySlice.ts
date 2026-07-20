import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SkillAdminDirectoryState {
  keyword: string;
  categoryId: string | null;
  status: 'active' | 'inactive' | null;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  isFilterModalOpen: boolean;
}

const initialState: SkillAdminDirectoryState = {
  keyword: '',
  categoryId: null,
  status: null,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
  isFilterModalOpen: false,
};

const skillAdminDirectorySlice = createSlice({
  name: 'skillAdminDirectory',
  initialState,
  reducers: {
    setKeyword(state, action: PayloadAction<string>) {
      state.keyword = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<SkillAdminDirectoryState>>) {
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
      state.categoryId = null;
      state.status = null;
      state.sortBy = 'createdAt';
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
} = skillAdminDirectorySlice.actions;
export default skillAdminDirectorySlice.reducer;
