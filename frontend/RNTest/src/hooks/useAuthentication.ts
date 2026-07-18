import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthTokens } from '../store/authSlice';
import apiClient from '../services/apiClient';

export const useAuthentication = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', data);
      const { accessToken, refreshToken, user } = response.data.data;
      dispatch(setAuthTokens({ accessToken, refreshToken, user }));
      return true;
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/forgot-password', data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/reset-password', data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, forgotPassword, resetPassword, isLoading, error };
};
