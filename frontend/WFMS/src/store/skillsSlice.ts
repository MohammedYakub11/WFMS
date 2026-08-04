import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SkillsState {
  searchQuery: string;
  selectedCategoryId: string | null;
  selectedProficiency: number | null;
  sortOption: string;
}

const initialState: SkillsState = {
  searchQuery: '',
  selectedCategoryId: null,
  selectedProficiency: null,
  sortOption: 'recently_updated',
};

const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSelectedCategoryId(state, action: PayloadAction<string | null>) {
      state.selectedCategoryId = action.payload;
    },
    setSelectedProficiency(state, action: PayloadAction<number | null>) {
      state.selectedProficiency = action.payload;
    },
    setSortOption(state, action: PayloadAction<string>) {
      state.sortOption = action.payload;
    },
    clearFilters(state) {
      state.searchQuery = '';
      state.selectedCategoryId = null;
      state.selectedProficiency = null;
      state.sortOption = 'recently_updated';
    },
  },
});

export const { setSearchQuery, setSelectedCategoryId, setSelectedProficiency, setSortOption, clearFilters } = skillsSlice.actions;
export default skillsSlice.reducer;
