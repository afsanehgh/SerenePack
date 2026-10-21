import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { ApiError } from '../auth/authTypes';
import { apiRequest, normalizeApiError } from '../../services/api';
import type { Pet, PetInput, PetsState } from './petTypes';

interface ThunkState {
  state: RootState;
  rejectValue: ApiError;
}

const initialState: PetsState = {
  pets: [],
  status: 'idle',
  error: null,
};

export const fetchPets = createAsyncThunk<Pet[], void, ThunkState>(
  'pets/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      return await apiRequest<Pet[]>('/pet', {
        token: getState().auth.token,
      });
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const createPet = createAsyncThunk<Pet, PetInput, ThunkState>(
  'pets/create',
  async (pet, { getState, rejectWithValue }) => {
    try {
      return await apiRequest<Pet>('/pet', {
        method: 'POST',
        token: getState().auth.token,
        body: JSON.stringify(pet),
      });
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const updatePet = createAsyncThunk<
  Pet,
  { id: string; changes: PetInput },
  ThunkState
>('pets/update', async ({ id, changes }, { getState, rejectWithValue }) => {
  try {
    return await apiRequest<Pet>(`/pet/${encodeURIComponent(id)}`, {
      method: 'PUT',
      token: getState().auth.token,
      body: JSON.stringify(changes),
    });
  } catch (error) {
    return rejectWithValue(normalizeApiError(error));
  }
});

export const deletePet = createAsyncThunk<string, string, ThunkState>(
  'pets/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      await apiRequest<{ message: string }>(`/pet/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        token: getState().auth.token,
      });
      return id;
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

const petsSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    clearPetsError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPets.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPets.fulfilled, (state, action) => {
        state.status = 'idle';
        state.pets = action.payload;
      })
      .addCase(fetchPets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message ?? 'Unable to load pets.';
      })
      .addCase(createPet.pending, (state) => {
        state.status = 'saving';
        state.error = null;
      })
      .addCase(createPet.fulfilled, (state, action) => {
        state.status = 'idle';
        state.pets.unshift(action.payload);
      })
      .addCase(createPet.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload?.message ?? 'Unable to register this pet.';
      })
      .addCase(updatePet.pending, (state) => {
        state.status = 'saving';
        state.error = null;
      })
      .addCase(updatePet.fulfilled, (state, action) => {
        state.status = 'idle';
        state.pets = state.pets.map((pet) =>
          pet._id === action.payload._id ? action.payload : pet,
        );
      })
      .addCase(updatePet.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload?.message ?? 'Unable to update this pet.';
      })
      .addCase(deletePet.pending, (state) => {
        state.status = 'saving';
        state.error = null;
      })
      .addCase(deletePet.fulfilled, (state, action) => {
        state.status = 'idle';
        state.pets = state.pets.filter((pet) => pet._id !== action.payload);
      })
      .addCase(deletePet.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload?.message ?? 'Unable to delete this pet.';
      });
  },
});

export const { clearPetsError } = petsSlice.actions;
export const selectPets = (state: RootState) => state.pets.pets;
export const selectPetsStatus = (state: RootState) => state.pets.status;
export const selectPetsError = (state: RootState) => state.pets.error;
export default petsSlice.reducer;
