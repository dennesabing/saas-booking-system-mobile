import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useOrgSetupStatus } from '../../hooks/useOrgSetupStatus';
import { TestWrapper } from '../test-utils';

jest.mock('../../lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), patch: jest.fn() },
}));
const mockApi = require('../../lib/api').default;

describe('useOrgSetupStatus', () => {
  beforeEach(() => jest.resetAllMocks());

  it('fetches setup status from the API', async () => {
    const mockData = {
      items: { has_bookable: false, has_availability: false, has_team_member: false, booking_link_shared: false },
      completed_count: 0,
      total_count: 4,
      setup_completed_at: null,
    };
    mockApi.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useOrgSetupStatus(), { wrapper: TestWrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.completed_count).toBe(0);
    expect(result.current.data?.items?.has_bookable).toBe(false);
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/org/setup-status');
  });

  it('returns setup_completed_at when setup is done', async () => {
    mockApi.get.mockResolvedValue({ data: { setup_completed_at: '2026-05-19T10:00:00Z' } });

    const { result } = renderHook(() => useOrgSetupStatus(), { wrapper: TestWrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.setup_completed_at).toBe('2026-05-19T10:00:00Z');
  });

  it('useMarkBookingLinkShared calls PATCH and invalidates org-setup-status', async () => {
    mockApi.patch.mockResolvedValue({ data: { booking_link_shared: true } });

    // Import the mutation hook
    const { useMarkBookingLinkShared } = require('../../hooks/useOrgSetupStatus');
    const { result } = renderHook(() => useMarkBookingLinkShared(), { wrapper: TestWrapper });

    act(() => { result.current.mutate(); });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.patch).toHaveBeenCalledWith('/api/v1/org/setup-status', { booking_link_shared: true });
  });
});
