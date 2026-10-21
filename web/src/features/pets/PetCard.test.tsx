import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PetCard from './PetCard';

const pet = {
  _id: 'pet-1',
  owner: 'user-1',
  petName: 'Snowy',
  description: 'A friendly pet who loves long walks and sunny afternoons.',
};

describe('PetCard', () => {
  it('shows the pet record and opens the edit action', () => {
    const onEdit = vi.fn();
    render(<PetCard index={0} onDelete={vi.fn()} onEdit={onEdit} pet={pet} />);

    expect(screen.getByRole('heading', { name: 'Snowy' })).toBeInTheDocument();
    expect(screen.getByText(pet.description)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View details' }));
    expect(onEdit).toHaveBeenCalledWith(pet);
  });

  it('exposes edit and remove actions from the card menu', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<PetCard index={1} onDelete={onDelete} onEdit={onEdit} pet={pet} />);

    fireEvent.click(screen.getByRole('button', { name: 'Actions for Snowy' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit details' }));
    expect(onEdit).toHaveBeenCalledWith(pet);

    fireEvent.click(screen.getByRole('button', { name: 'Actions for Snowy' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove pet' }));
    expect(onDelete).toHaveBeenCalledWith(pet);
  });
});
