import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/api/authApi';
import { storage } from '@/utils/storage';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth.types';

interface AuthState {
  user:         AuthResponse | null;
  isLoading:    boolean;
  error:        string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user:          null,
  isLoading:     false,
  error:         null,
  isInitialized: false,
};

// ── Thunks ────────────────────────────────────────────────────────────
export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  const user = await storage.getUser<AuthResponse>();
  return user;
});

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      await storage.setAccessToken(data.accessToken);
      await storage.setRefreshToken(data.refreshToken);
      await storage.setUser(data);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message ?? 'Login failed');
    }
  },
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const result = await authApi.register(data);
      await storage.setAccessToken(result.accessToken);
      await storage.setRefreshToken(result.refreshToken);
      await storage.setUser(result);
      return result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message ?? 'Registration failed');
    }
  },
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try { await authApi.logout(); } catch {}
  await storage.clearAll();
});

// ── Slice ─────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    updateUser: (state, action: PayloadAction<Partial<AuthResponse>>) => {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // initialize
    builder.addCase(initializeAuth.fulfilled, (state, action) => {
      state.user          = action.payload;
      state.isInitialized = true;
    });
    builder.addCase(initializeAuth.rejected, (state) => {
      state.isInitialized = true;
    });

    // login
    builder.addCase(loginThunk.pending,    (state) => { state.isLoading = true; state.error = null; });
    builder.addCase(loginThunk.fulfilled,  (state, action) => { state.isLoading = false; state.user = action.payload; });
    builder.addCase(loginThunk.rejected,   (state, action) => { state.isLoading = false; state.error = action.payload as string; });

    // register
    builder.addCase(registerThunk.pending,   (state) => { state.isLoading = true; state.error = null; });
    builder.addCase(registerThunk.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload; });
    builder.addCase(registerThunk.rejected,  (state, action) => { state.isLoading = false; state.error = action.payload as string; });

    // logout
    builder.addCase(logoutThunk.fulfilled, (state) => { state.user = null; state.error = null; });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────
export const selectUser          = (state: { auth: AuthState }) => state.auth.user;
export const selectIsLoading     = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError     = (state: { auth: AuthState }) => state.auth.error;
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.user;
export const selectUserRoles     = (state: { auth: AuthState }) => state.auth.user?.roles ?? [];
export const selectIsCustomer    = (state: { auth: AuthState }) => state.auth.user?.roles?.includes('Customer') ?? false;
export const selectIsOwner       = (state: { auth: AuthState }) => state.auth.user?.roles?.includes('Owner') ?? false;
export const selectIsRider       = (state: { auth: AuthState }) => state.auth.user?.roles?.includes('Rider') ?? false;
export const selectIsAdmin       = (state: { auth: AuthState }) => state.auth.user?.roles?.includes('Admin') ?? false;
