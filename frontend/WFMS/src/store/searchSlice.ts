import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
  keyword: string;
  department: string | null;
  designation: string | null;
  location: string | null;
  category: string | null;
  skill: string | null;
  proficiency: number | null;
  certified: boolean | null;
  experienceMin: number | null;
  experienceMax: number | null;
  isFilterDrawerOpen: boolean;
}

const initialState: SearchState = {
  keyword: '',
  department: null,
  designation: null,
  location: null,
  category: null,
  skill: null,
  proficiency: null,
  certified: null,
  experienceMin: null,
  experienceMax: null,
  isFilterDrawerOpen: false,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setKeyword(state, action: PayloadAction<string>) {
      state.keyword = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<SearchState>>) {
      Object.assign(state, action.payload);
    },
    resetFilters(state) {
      return {
        ...initialState,
        keyword: state.keyword, // Preserve keyword on reset
        isFilterDrawerOpen: state.isFilterDrawerOpen, // Preserve drawer state
      };
    },
    toggleFilterDrawer(state) {
      state.isFilterDrawerOpen = !state.isFilterDrawerOpen;
    },
    setFilterDrawerOpen(state, action: PayloadAction<boolean>) {
      state.isFilterDrawerOpen = action.payload;
    }
  },
});

export const { setKeyword, setFilters, resetFilters, toggleFilterDrawer, setFilterDrawerOpen } = searchSlice.actions;
export default searchSlice.reducer;
