import * as SecureStore from 'expo-secure-store';
import { clearToken, getToken, setToken } from '../token';

jest.mock('expo-secure-store');

const mockGet = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
const mockSet = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;
const mockDel = SecureStore.deleteItemAsync as jest.MockedFunction<typeof SecureStore.deleteItemAsync>;

describe('token storage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getToken returns null when nothing stored', async () => {
    mockGet.mockResolvedValue(null);
    expect(await getToken()).toBeNull();
    expect(mockGet).toHaveBeenCalledWith('auth_token');
  });

  it('setToken writes to SecureStore', async () => {
    mockSet.mockResolvedValue();
    await setToken('abc123');
    expect(mockSet).toHaveBeenCalledWith('auth_token', 'abc123');
  });

  it('clearToken deletes from SecureStore', async () => {
    mockDel.mockResolvedValue();
    await clearToken();
    expect(mockDel).toHaveBeenCalledWith('auth_token');
  });
});
