import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authReducer, { login, logout, register } from './authSlice';

function makeStore() {
  return configureStore({ reducer: { auth: authReducer } });
}

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: async () => body,
  };
}

describe('auth Redux slice', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('logs in and stores the authenticated session in Redux', async () => {
    const session = {
      token: 'signed-token',
      user: { id: 'user-1', email: 'person@example.com' },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(session)));
    const store = makeStore();

    await expect(
      store.dispatch(
        login({ email: 'person@example.com', password: 'correct-password' }),
      ),
    ).resolves.toMatchObject({ type: login.fulfilled.type });

    expect(store.getState().auth).toMatchObject({
      token: 'signed-token',
      user: session.user,
      status: 'idle',
      error: null,
    });
  });

  it('registers through the registration endpoint', async () => {
    const session = {
      token: 'new-token',
      user: { id: 'user-2', email: 'new@example.com' },
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(session));
    vi.stubGlobal('fetch', fetchMock);
    const store = makeStore();

    await store.dispatch(
      register({ email: 'new@example.com', password: 'long-enough-password' }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/auth/register',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(store.getState().auth.user).toEqual(session.user);
  });

  it('keeps API authentication errors available to the form', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ message: 'Invalid email or password.' }, false),
        ),
    );
    const store = makeStore();

    await store.dispatch(login({ email: 'bad@example.com', password: 'bad' }));

    expect(store.getState().auth).toMatchObject({
      token: null,
      status: 'failed',
      error: 'Invalid email or password.',
    });
  });

  it('clears authentication state on logout', async () => {
    const store = makeStore();

    store.dispatch(logout());

    expect(store.getState().auth).toMatchObject({
      token: null,
      user: null,
      status: 'idle',
    });
  });
});
