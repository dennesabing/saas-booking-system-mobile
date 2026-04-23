import { renderHook, waitFor } from '@testing-library/react-native';
import { TestWrapper } from '../../__tests__/test-utils';
import { useMyBookings } from '../useMyBookings';

jest.mock('../../lib/api', () => ({ __esModule: true, default: { get: jest.fn() } }));
const mockApi = require('../../lib/api').default;

describe('useMyBookings', () => {
  it('calls correct endpoint', async () => {
    mockApi.get.mockResolvedValue({
      data: { data: [{ uuid: 'b1', booking_code: 'XYZ', status: 'confirmed' }] },
    });

    const { result } = renderHook(() => useMyBookings(), { wrapper: TestWrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/bookings', { params: {} });
  });
});
