export interface Pet {
  _id: string;
  petName: string;
  description: string;
  owner: string;
}

export interface PetInput {
  petName: string;
  description: string;
}

export interface PetsState {
  pets: Pet[];
  status: 'idle' | 'loading' | 'saving' | 'failed';
  error: string | null;
}
