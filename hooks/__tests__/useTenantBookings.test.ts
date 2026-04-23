import { renderHook, waitFor } from '@testing-library/react-native';
import { TestWrapper } from '../../__tests__/test-utils';
import { useTenantBookings } from '../useTenantBookings';

jest.mock('../../lib/api', () => ({ __esModule: true, default: { get: jest.fn() } }));
const mockApi = require('../../lib/api').default;

describe('useTenantBookings', () => {
  it('fetches from tenant bookings endpoint', async () => {
    mockApi.get.mockResolvedValue({
      data: { data: [{ uuid: 'b1', booking_code: 'XYZ', status: 'pending' }] },
    });

    const { result } = renderHook(() => useTenantBookings(), { wrapper: TestWrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/tenant/bookings', { params: {} });
  });
});
