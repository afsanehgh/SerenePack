import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import authReducer from './authSlice';
import AuthPage from './AuthPage';
import App from '../../app/App';
import petsReducer from '../pets/petsSlice';

function renderAuthPage(register = false) {
  const store = configureStore({ reducer: { auth: authReducer } });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <AuthPage register={register} />
      </MemoryRouter>
    </Provider>,
  );
}

function renderApplication() {
  const store = configureStore({
    reducer: { auth: authReducer, pets: petsReducer },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    </Provider>,
  );
}

describe('AuthPage', () => {
  it('shows a friendly API error after an unsuccessful sign in', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Invalid email or password.' }),
      }),
    );
    renderAuthPage();

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'person@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'incorrect-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid email or password.',
    );
  });

  it('saves the successful session for the current browser tab', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            token: 'signed-token',
            user: { id: 'user-1', email: 'person@example.com' },
          }),
        })
        .mockResolvedValueOnce({ ok: true, json: async () => [] }),
    );
    renderApplication();

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'person@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'correct-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(
        JSON.parse(sessionStorage.getItem('petregister-session') ?? '{}'),
      ).toMatchObject({
        token: 'signed-token',
        user: { id: 'user-1', email: 'person@example.com' },
      });
    });
    expect(
      await screen.findByRole('heading', { name: 'Your little crew' }),
    ).toBeInTheDocument();
  });

  it('explains the registration password requirement', () => {
    renderAuthPage(true);

    expect(
      screen.getByText(
        'Use at least 12 characters to help protect your account.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create your account' }),
    ).toBeEnabled();
  });
});
