import { useEffect, useMemo, useState } from 'react';
import { resolvePaymentMode } from './usePaymentMode';
import { PaymentMode } from '../payment/types';

export function useIap(modeId: string | undefined, config: unknown) {
  const mode: PaymentMode | null = useMemo(() => (modeId ? resolvePaymentMode(modeId) : null), [modeId]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mode || !config) return;
    let active = true;
    mode.initialize(config).then(() => { if (active) setReady(true); });
    return () => { active = false; mode.teardown(); };
  }, [mode, JSON.stringify(config)]);

  return { mode, ready };
}
