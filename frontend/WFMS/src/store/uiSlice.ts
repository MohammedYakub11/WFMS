import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isDrawerOpen: boolean;
}

const initialState: UiState = {
  isDrawerOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isDrawerOpen = action.payload;
    },
  },
});

export const { toggleDrawer, setDrawerOpen } = uiSlice.actions;
export default uiSlice.reducer;
