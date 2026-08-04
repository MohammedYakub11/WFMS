import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useSnackbar } from '../components/providers/SnackbarProvider';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      const connected = state.isConnected ?? false;
      if (isConnected && !connected) {
        showSnackbar('You are offline. Some features may be unavailable.', 'error');
      } else if (!isConnected && connected) {
        showSnackbar('Back online!', 'success');
      }
      setIsConnected(connected);
    });

    return () => unsubscribe();
  }, [isConnected, showSnackbar]);

  return isConnected;
};
