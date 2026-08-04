import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import themeReducer from './themeSlice';
import skillsReducer from './skillsSlice';
import searchReducer from './searchSlice';
import uiReducer from './uiSlice';
import employeeDirectoryReducer from './employeeDirectorySlice';
import skillAdminDirectoryReducer from './skillAdminDirectorySlice';
import notificationsUiReducer from './notificationsUiSlice';
import auditLogFiltersReducer from './auditLogFiltersSlice';
import reportFiltersReducer from './reportFiltersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    skills: skillsReducer,
    search: searchReducer,
    ui: uiReducer,
    employeeDirectory: employeeDirectoryReducer,
    skillAdminDirectory: skillAdminDirectoryReducer,
    notificationsUi: notificationsUiReducer,
    auditLogFilters: auditLogFiltersReducer,
    reportFilters: reportFiltersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
