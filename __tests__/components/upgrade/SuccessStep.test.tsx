import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import SuccessStep from '../../../components/upgrade/SuccessStep';

jest.mock('expo-router', () => ({ router: { replace: jest.fn(), push: jest.fn() } }));
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

const { router } = require('expo-router') as { router: { replace: jest.Mock; push: jest.Mock } };

describe('SuccessStep', () => {
  beforeEach(() => jest.resetAllMocks());

  it('renders primary CTA "Set up your first service"', () => {
    const { getAllByText } = render(<SuccessStep orgName="Maria's Business" />);
    expect(getAllByText(/Set up your first service/i).length).toBeGreaterThan(0);
  });

  it('primary CTA navigates to setup modal', () => {
    const { getByRole } = render(<SuccessStep orgName="Maria's Business" />);
    fireEvent.press(getByRole('button', { name: /Set up your first service/i }));
    expect(router.push).toHaveBeenCalledWith('/(staff)/setup/first-service');
  });

  it('secondary "Go to dashboard" link navigates to bookings tab', () => {
    const { getByText } = render(<SuccessStep orgName="Maria's Business" />);
    fireEvent.press(getByText(/Go to dashboard/i));
    expect(router.replace).toHaveBeenCalledWith('/(staff)/(tabs)/bookings');
  });
});
