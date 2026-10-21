import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { apiRequest, normalizeApiError } from '../../services/api';
import type {
  ApiError,
  AuthResponse,
  AuthState,
  Credentials,
} from './authTypes';

const STORAGE_KEY = 'petregister-session';

function restoreSession(): Pick<AuthState, 'token' | 'user'> {
  try {
    const rawSession = sessionStorage.getItem(STORAGE_KEY);
    if (!rawSession) return { token: null, user: null };
    const session = JSON.parse(rawSession) as AuthResponse;
    if (!session.token || !session.user?.id || !session.user.email) {
      sessionStorage.removeItem(STORAGE_KEY);
      return { token: null, user: null };
    }
    return { token: session.token, user: session.user };
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return { token: null, user: null };
  }
}

const restoredSession = restoreSession();

const initialState: AuthState = {
  ...restoredSession,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk<
  AuthResponse,
  Credentials,
  { rejectValue: ApiError }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  } catch (error) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const register = createAsyncThunk<
  AuthResponse,
  Credentials,
  { rejectValue: ApiError }
>('auth/register', async (credentials, { rejectWithValue }) => {
  try {
    return await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  } catch (error) {
    return rejectWithValue(normalizeApiError(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addMatcher(isAnyOf(login.pending, register.pending), (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(
        isAnyOf(login.fulfilled, register.fulfilled),
        (state, action) => {
          state.status = 'idle';
          state.token = action.payload.token;
          state.user = action.payload.user;
        },
      )
      .addMatcher(
        isAnyOf(login.rejected, register.rejected),
        (state, action) => {
          state.status = 'failed';
          state.error =
            action.payload?.message ?? 'Unable to authenticate right now.';
        },
      );
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export default authSlice.reducer;
