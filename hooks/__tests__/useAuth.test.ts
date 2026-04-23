import { act, renderHook, waitFor } from '@testing-library/react-native';
import { TestWrapper } from '../../__tests__/test-utils';
import { isStaff, useLogin } from '../useAuth';

jest.mock('../../lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('../../lib/token', () => ({
  __esModule: true,
  getToken: jest.fn(),
  setToken: jest.fn(),
  clearToken: jest.fn(),
}));

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

const mockApi = require('../../lib/api').default;
const mockToken = require('../../lib/token');

describe('isStaff', () => {
  it('returns false for undefined', () => {
    expect(isStaff(undefined)).toBe(false);
  });

  it('returns false when no relevant permissions', () => {
    expect(isStaff({ permissions: ['some.other'] } as any)).toBe(false);
  });

  it('returns true when user has bookings.manage', () => {
    expect(isStaff({ permissions: ['bookings.manage'] } as any)).toBe(true);
  });

  it('returns true when user has bookables.manage', () => {
    expect(isStaff({ permissions: ['bookables.manage'] } as any)).toBe(true);
  });
});

describe('useLogin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('stores token on success', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { data: { token: 'test-token-123', user: { id: 1 } } },
    });
    mockToken.setToken.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useLogin(), { wrapper: TestWrapper });

    await act(async () => {
      await result.current.mutateAsync({ email: 'test@example.com', password: 'password' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockToken.setToken).toHaveBeenCalledWith('test-token-123');
  });
});
