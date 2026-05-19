import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { SetupChecklist } from '../../../components/setup/SetupChecklist';
import { TestWrapper } from '../../test-utils';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

// We'll override this mock per test
jest.mock('../../../hooks/useOrgSetupStatus');
const { useOrgSetupStatus } = require('../../../hooks/useOrgSetupStatus');

const incompleteStatus = {
  data: {
    items: { has_bookable: false, has_availability: false, has_team_member: false, booking_link_shared: false },
    completed_count: 0,
    total_count: 4,
    setup_completed_at: null,
  },
  isLoading: false,
};

describe('SetupChecklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the checklist when setup is incomplete', () => {
    useOrgSetupStatus.mockReturnValue(incompleteStatus);
    const { getByText } = render(<SetupChecklist />, { wrapper: TestWrapper });
    expect(getByText(/Get ready to accept bookings/i)).toBeTruthy();
  });

  it('shows "0 of 4" when nothing is complete', () => {
    useOrgSetupStatus.mockReturnValue(incompleteStatus);
    const { getByText } = render(<SetupChecklist />, { wrapper: TestWrapper });
    expect(getByText('0 of 4')).toBeTruthy();
  });

  it('renders nothing when setup_completed_at is set', () => {
    useOrgSetupStatus.mockReturnValue({
      data: { setup_completed_at: '2026-05-19T10:00:00Z' },
      isLoading: false,
    });
    const { queryByText } = render(<SetupChecklist />, { wrapper: TestWrapper });
    expect(queryByText(/Get ready/i)).toBeNull();
  });

  it('renders nothing while loading', () => {
    useOrgSetupStatus.mockReturnValue({ data: undefined, isLoading: true });
    const { queryByText } = render(<SetupChecklist />, { wrapper: TestWrapper });
    expect(queryByText(/Get ready/i)).toBeNull();
  });

  it('tapping "Add your first service" navigates to setup modal', () => {
    useOrgSetupStatus.mockReturnValue(incompleteStatus);
    const { getByText } = render(<SetupChecklist />, { wrapper: TestWrapper });
    fireEvent.press(getByText('Add your first service'));
    const { router } = require('expo-router');
    expect(router.push).toHaveBeenCalledWith('/(staff)/setup/first-service');
  });
});
