import { act, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { useIap } from '../../hooks/useIap';

function Harness({ config }: { config: any }) {
  const { ready, mode } = useIap('iap', config);
  return <Text>{ready ? `ready:${mode?.id}` : 'loading'}</Text>;
}

describe('useIap', () => {
  it('initialises the strategy and reports ready', async () => {
    const { findByText } = render(<Harness config={{ ios_sku: 's', android_sku: 's' }} />);
    await findByText('ready:iap');
  });
});
