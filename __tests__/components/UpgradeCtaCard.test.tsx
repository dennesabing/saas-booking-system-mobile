import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import { router } from 'expo-router';
import UpgradeCtaCard from '../../components/upgrade/UpgradeCtaCard';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../../hooks/useProOwnerUpgrade', () => ({
  useOffer: () => ({ data: { display_price: '$399.99', trial_months: 3 }, isLoading: false }),
}));

describe('UpgradeCtaCard', () => {
  it('renders nothing when user already has an org', () => {
    const { queryByText } = render(<UpgradeCtaCard currentOrganizationId={42} />);
    expect(queryByText(/Become a Pro Owner/i)).toBeNull();
  });

  it('renders CTA for free user and navigates on press', async () => {
    const { getByText } = render(<UpgradeCtaCard currentOrganizationId={null} />);
    expect(getByText(/Become a Pro Owner/i)).toBeTruthy();
    fireEvent.press(getByText(/Learn more/i));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/(customer)/upgrade/pro-owner'));
  });
});
