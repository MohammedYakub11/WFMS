declare module '@env' {
  export const API_URL: string | undefined;
}

declare module '@tanstack/react-query' {
  export const QueryClient: any;
  export const QueryClientProvider: any;
  export const useQuery: any;
  export const useMutation: any;
  export const useQueryClient: any;
}

declare module '@react-native-community/netinfo' {
  export const useNetInfo: () => {
    type: string;
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    details: any;
  };
  export const fetch: () => Promise<any>;
  export const addEventListener: (listener: (state: any) => void) => () => void;
  const NetInfo: {
    useNetInfo: typeof useNetInfo;
    fetch: typeof fetch;
    addEventListener: typeof addEventListener;
  };
  export default NetInfo;
}
