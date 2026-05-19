import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useFirstServiceSetup } from '../../hooks/useFirstServiceSetup';
import { TestWrapper } from '../test-utils';

jest.mock('../../lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));
const mockApi = require('../../lib/api').default;

describe('useFirstServiceSetup', () => {
  beforeEach(() => jest.resetAllMocks());

  it('calls POST /bookables then POST /availability-schedules', async () => {
    const bookable = { id: 'uuid-123', name: 'Haircut', duration_minutes: 30, price: 2500 };
    mockApi.post
      .mockResolvedValueOnce({ data: { data: bookable } })
      .mockResolvedValueOnce({ data: { bookable_id: 'uuid-123', days: [] } });

    const { result } = renderHook(() => useFirstServiceSetup(), { wrapper: TestWrapper });

    act(() => {
      result.current.mutate({
        details: { name: 'Haircut', duration_minutes: 30, price: 2500 },
        days: [{ day: 'mon', open: true, open_time: '09:00', close_time: '17:00' }],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.post).toHaveBeenCalledTimes(2);
    expect(mockApi.post).toHaveBeenNthCalledWith(1, '/api/v1/bookables', {
      name: 'Haircut', duration_minutes: 30, price: 2500, kind: 'slot',
    });
    expect(mockApi.post).toHaveBeenNthCalledWith(2, '/api/v1/bookables/uuid-123/availability-schedules', {
      days: [{ day: 'mon', open: true, open_time: '09:00', close_time: '17:00' }],
    });
  });
});
