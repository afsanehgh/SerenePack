import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it, vi } from 'vitest';
import authReducer from '../auth/authSlice';
import petsReducer, {
  createPet,
  deletePet,
  fetchPets,
  updatePet,
} from './petsSlice';

const initialState = {
  auth: {
    token: 'signed-token',
    user: { id: 'user-1', email: 'person@example.com' },
    status: 'idle' as const,
    error: null,
  },
  pets: { pets: [], status: 'idle' as const, error: null },
};

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer, pets: petsReducer },
    preloadedState: initialState,
  });
}

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: async () => body,
  };
}

describe('pets Redux slice', () => {
  it('loads pets with the authenticated bearer token', async () => {
    const pets = [
      {
        _id: 'pet-1',
        owner: 'user-1',
        petName: 'Snowy',
        description: 'A friendly pet with a long and useful description.',
      },
    ];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(pets));
    vi.stubGlobal('fetch', fetchMock);
    const store = makeStore();

    await store.dispatch(fetchPets());

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/pet',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer signed-token',
        }),
      }),
    );
    expect(store.getState().pets).toMatchObject({ pets, status: 'idle' });
  });

  it('adds, updates, and removes pets in state after successful API calls', async () => {
    const created = {
      _id: 'pet-1',
      owner: 'user-1',
      petName: 'Snowy',
      description: 'A friendly pet with a long and useful description.',
    };
    const updated = { ...created, petName: 'Snowball' };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(created))
      .mockResolvedValueOnce(jsonResponse(updated))
      .mockResolvedValueOnce(
        jsonResponse({ message: 'Pet successfully deleted.' }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const store = makeStore();
    const petInput = {
      petName: created.petName,
      description: created.description,
    };

    await store.dispatch(createPet(petInput));
    expect(store.getState().pets.pets).toEqual([created]);

    await store.dispatch(
      updatePet({ id: 'pet-1', changes: { ...petInput, petName: 'Snowball' } }),
    );
    expect(store.getState().pets.pets).toEqual([updated]);

    await store.dispatch(deletePet('pet-1'));
    expect(store.getState().pets.pets).toEqual([]);
  });

  it('turns failed requests into an actionable slice error', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ message: 'The pet list is unavailable.' }, false),
        ),
    );
    const store = makeStore();

    await store.dispatch(fetchPets());

    expect(store.getState().pets).toMatchObject({
      status: 'failed',
      error: 'The pet list is unavailable.',
    });
  });
});
