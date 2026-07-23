import authReducer, {
  clearError,
  updateUser,
  selectIsAuthenticated,
  selectIsCustomer,
  selectIsOwner,
  selectIsAdmin,
  selectAuthError,
} from '../store/slices/authSlice';
import type { AuthResponse } from '../types/auth.types';

const mockUser: AuthResponse = {
  userId:           1,
  firstName:        'John',
  lastName:         'Doe',
  email:            'john@test.com',
  profileImageUrl:  null,
  roles:            ['Customer'],
  accessToken:      'access-token',
  refreshToken:     'refresh-token',
  accessTokenExpiry:'2026-12-31T00:00:00Z',
};

describe('authSlice reducers', () => {
  it('returns initial state', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.isInitialized).toBe(false);
  });

  it('clearError sets error to null', () => {
    const initialState = {
      user: null, isLoading: false, error: 'some error', isInitialized: true,
    };
    const state = authReducer(initialState, clearError());
    expect(state.error).toBeNull();
  });

  it('updateUser merges partial user data', () => {
    const initialState = {
      user: mockUser, isLoading: false, error: null, isInitialized: true,
    };
    const state = authReducer(initialState, updateUser({ firstName: 'Jane' }));
    expect(state.user?.firstName).toBe('Jane');
    expect(state.user?.email).toBe('john@test.com'); // unchanged
  });

  it('updateUser does nothing if user is null', () => {
    const initialState = {
      user: null, isLoading: false, error: null, isInitialized: true,
    };
    const state = authReducer(initialState, updateUser({ firstName: 'Jane' }));
    expect(state.user).toBeNull();
  });
});

describe('authSlice selectors', () => {
  const makeState = (user: AuthResponse | null) => ({
    auth: { user, isLoading: false, error: null, isInitialized: true },
  });

  it('selectIsAuthenticated returns true when user is set', () => {
    expect(selectIsAuthenticated(makeState(mockUser))).toBe(true);
  });

  it('selectIsAuthenticated returns false when user is null', () => {
    expect(selectIsAuthenticated(makeState(null))).toBe(false);
  });

  it('selectIsCustomer returns true for Customer role', () => {
    expect(selectIsCustomer(makeState(mockUser))).toBe(true);
  });

  it('selectIsOwner returns false for Customer user', () => {
    expect(selectIsOwner(makeState(mockUser))).toBe(false);
  });

  it('selectIsAdmin returns true for Admin role', () => {
    const adminUser = { ...mockUser, roles: ['Admin'] };
    expect(selectIsAdmin(makeState(adminUser))).toBe(true);
  });

  it('selectAuthError returns error message', () => {
    const state = { auth: { user: null, isLoading: false, error: 'Login failed', isInitialized: true } };
    expect(selectAuthError(state)).toBe('Login failed');
  });
});
