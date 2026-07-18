import { Platform } from 'react-native';

import { API_URL } from '@env';

/**
 * Returns the appropriate base URL for API requests.
 */
export const getBaseUrl = (): string => {
  if (API_URL) return API_URL;
  
  if (Platform.OS === 'android') {
    // Fallback if env variable is missing
    return `http://192.168.29.235:3000/api/v1`;
  }
  // For iOS simulator or web, localhost works.
  return 'http://10.0.2.2:3000/api/v1';
};
