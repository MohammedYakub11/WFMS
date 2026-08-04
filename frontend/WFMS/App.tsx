import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { SnackbarProvider } from './src/components/providers/SnackbarProvider';
import axios from 'axios';

const queryClient = new QueryClient();

function App(): React.JSX.Element {
  useEffect(() => {
    console.log('=== AXIOS TEST START ===');

    axios
      .get('http://10.0.2.2:3000/api/v1')
      .then(res => {
        console.log('SUCCESS');
        console.log(res.status);
        console.log(res.data);
      })
      .catch(err => {
        console.log('FAILED');
        console.log('MESSAGE:', err.message);
        console.log('CODE:', err.code);
      });
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <SafeAreaProvider>
            <ErrorBoundary>
              <SnackbarProvider>
                <AppNavigator />
              </SnackbarProvider>
            </ErrorBoundary>
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;