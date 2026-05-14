import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const state = await Network.getNetworkStateAsync();
      if (!cancelled) {
        setIsConnected(state.isConnected ?? true);
      }
    }

    check();

    const interval = setInterval(check, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { isConnected };
}
