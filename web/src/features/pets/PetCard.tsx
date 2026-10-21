import { useState } from 'react';
import { MoreHorizontal, PawPrint, Pencil, Trash2 } from 'lucide-react';
import type { Pet } from './petTypes';

interface PetCardProps {
  pet: Pet;
  index: number;
  onEdit: (pet: Pet) => void;
  onDelete: (pet: Pet) => void;
}

const cardTones = ['sage', 'peach', 'butter', 'lavender'];

export default function PetCard({
  pet,
  index,
  onEdit,
  onDelete,
}: PetCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tone = cardTones[index % cardTones.length];

  return (
    <article className="pet-card">
      <div className={`pet-card__art pet-card__art--${tone}`}>
        <span className="pet-card__art-label">A GOOD FRIEND</span>
        <PawPrint size={49} strokeWidth={1.25} aria-hidden="true" />
        <button
          aria-expanded={menuOpen}
          aria-label={`Actions for ${pet.petName}`}
          className="icon-button pet-card__menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <MoreHorizontal size={20} />
        </button>
        {menuOpen && (
          <div className="pet-card__menu">
            <button
              onClick={() => {
                setMenuOpen(false);
                onEdit(pet);
              }}
              type="button"
            >
              <Pencil size={15} /> Edit details
            </button>
            <button
              className="pet-card__menu-danger"
              onClick={() => {
                setMenuOpen(false);
                onDelete(pet);
              }}
              type="button"
            >
              <Trash2 size={15} /> Remove pet
            </button>
          </div>
        )}
      </div>
      <div className="pet-card__body">
        <div className="pet-card__heading">
          <div>
            <span className="eyebrow">IN YOUR CARE</span>
            <h3>{pet.petName}</h3>
          </div>
          <span className="pet-card__paw">
            <PawPrint size={16} />
          </span>
        </div>
        <p>{pet.description}</p>
        <button
          className="text-action"
          onClick={() => onEdit(pet)}
          type="button"
        >
          View details <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  );
}
