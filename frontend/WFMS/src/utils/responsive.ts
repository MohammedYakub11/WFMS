import { useWindowDimensions } from 'react-native';

const WIDE_LAYOUT_BREAKPOINT = 768;

// Drives tablet/landscape layout switches (2-column grids, page-number pagination)
// across the new Phase 4.1/4.2 screens. Built on RN's core API — no new dependency.
export const useIsWideLayout = (): boolean => {
  const { width } = useWindowDimensions();
  return width >= WIDE_LAYOUT_BREAKPOINT;
};
