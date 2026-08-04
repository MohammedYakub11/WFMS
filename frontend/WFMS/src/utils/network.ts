import { Platform } from 'react-native';
import { API_URL } from '@env';

/**
 * Returns the appropriate base URL for API requests.
 * API_URL (from .env, via react-native-dotenv) always wins — set it to the host
 * machine's LAN IP for a physical device. Platform fallbacks only apply when
 * API_URL is unset, since "localhost" means something different per runtime:
 * - Android emulator: 10.0.2.2 is the AVD's alias for the host loopback.
 * - iOS simulator / web: localhost correctly reaches the host machine.
 */
// export const getBaseUrl = (): string => {
//   if (API_URL) return API_URL;

//   if (Platform.OS === 'android') {
//     return 'http://10.0.2.2:3000/api/v1';
//   }
//   return 'http://localhost:3000/api/v1';
// };

export const getBaseUrl = (): string => {
  console.log('========================');
  console.log('API_URL:', API_URL);

  if (API_URL) {
    console.log('Using ENV URL:', API_URL);
    return API_URL;
  }

  console.log('Using fallback URL');
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';
};
