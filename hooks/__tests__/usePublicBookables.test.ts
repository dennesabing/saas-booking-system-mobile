import { renderHook, waitFor } from '@testing-library/react-native';
import { TestWrapper } from '../../__tests__/test-utils';
import { usePublicBookables } from '../usePublicBookables';

jest.mock('../../lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockApi = require('../../lib/api').default;

describe('usePublicBookables', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls correct endpoint and returns bookables', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { data: [{ id: '123', name: 'Tennis Court', kind: 'resource', price: 1000, currency: 'USD', is_active: true }] },
    });

    const { result } = renderHook(
      () => usePublicBookables('my-org'),
      { wrapper: TestWrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/public/orgs/my-org/bookables');
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].name).toBe('Tennis Court');
  });

  it('does not fetch when orgSlug is empty', () => {
    const { result } = renderHook(
      () => usePublicBookables(''),
      { wrapper: TestWrapper }
    );
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.get).not.toHaveBeenCalled();
  });
});
