import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationsUiState {
  activeFilter: 'all' | 'unread' | 'read';
}

const initialState: NotificationsUiState = {
  activeFilter: 'all',
};

const notificationsUiSlice = createSlice({
  name: 'notificationsUi',
  initialState,
  reducers: {
    setNotificationFilter(state, action: PayloadAction<'all' | 'unread' | 'read'>) {
      state.activeFilter = action.payload;
    },
  },
});

export const { setNotificationFilter } = notificationsUiSlice.actions;
export default notificationsUiSlice.reducer;
