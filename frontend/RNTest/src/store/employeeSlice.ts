import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../services/apiClient';

export interface EmployeeProfile {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  designation?: string;
  department?: string;
  experience?: number;
  location?: string;
  profile_image?: string;
  status: string;
  profile_metadata?: {
    about_me?: string;
    address?: string;
    emergency_contact?: string;
    linkedin_url?: string;
    github_url?: string;
    twitter_url?: string;
    portfolio_url?: string;
  };
}

interface EmployeeState {
  profile: EmployeeProfile | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  updateError: string | null;
}

const initialState: EmployeeState = {
  profile: null,
  loading: false,
  error: null,
  updating: false,
  updateError: null,
};

export const fetchEmployeeProfile = createAsyncThunk(
  'employee/fetchProfile',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/employees/${id}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEmployeeProfile = createAsyncThunk(
  'employee/updateProfile',
  async ({ id, data }: { id: string; data: Partial<EmployeeProfile> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/employees/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearEmployeeError: (state) => {
      state.error = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchEmployeeProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateEmployeeProfile.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateEmployeeProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
      })
      .addCase(updateEmployeeProfile.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload as string;
      });
  },
});

export const { clearEmployeeError, clearUpdateError } = employeeSlice.actions;
export default employeeSlice.reducer;
