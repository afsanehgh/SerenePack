import { useCallback, useEffect, useMemo, useState } from 'react';
import { LogOut, PawPrint, Plus, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import Toast from '../../components/ui/Toast';
import { logout, selectCurrentUser } from '../auth/authSlice';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import PetCard from './PetCard';
import PetFormDialog from './PetFormDialog';
import {
  clearPetsError,
  createPet,
  deletePet,
  fetchPets,
  selectPets,
  selectPetsError,
  selectPetsStatus,
  updatePet,
} from './petsSlice';
import type { Pet, PetInput } from './petTypes';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const pets = useAppSelector(selectPets);
  const status = useAppSelector(selectPetsStatus);
  const error = useAppSelector(selectPetsError);
  const user = useAppSelector(selectCurrentUser);
  const [query, setQuery] = useState('');
  const [editingPet, setEditingPet] = useState<Pet | null | undefined>();
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    void dispatch(fetchPets());
  }, [dispatch]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const visiblePets = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return pets;
    return pets.filter(
      (pet) =>
        pet.petName.toLocaleLowerCase().includes(normalizedQuery) ||
        pet.description.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [pets, query]);

  const dismissPetDialog = useCallback(() => {
    setEditingPet(undefined);
    dispatch(clearPetsError());
  }, [dispatch]);

  async function savePet(input: PetInput) {
    try {
      if (editingPet) {
        await dispatch(
          updatePet({ id: editingPet._id, changes: input }),
        ).unwrap();
        setToast(`${input.petName}’s details are up to date.`);
      } else {
        await dispatch(createPet(input)).unwrap();
        setToast(`${input.petName} has been added to your care list.`);
      }
      dismissPetDialog();
    } catch {
      // The rejected thunk exposes a safe message through the pets slice.
    }
  }

  async function removePet() {
    if (!deletingPet) return;
    try {
      await dispatch(deletePet(deletingPet._id)).unwrap();
      setToast(`${deletingPet.petName} was removed from your records.`);
      setDeletingPet(null);
    } catch {
      setDeletingPet(null);
    }
  }

  return (
    <div className="dashboard">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="PetRegister home">
          <span className="brand__mark">
            <PawPrint size={21} />
          </span>
          <span>PetRegister</span>
        </Link>
        <div className="topbar__right">
          <span className="topbar__user">
            <span className="avatar">
              {user?.email.charAt(0).toUpperCase() ?? 'P'}
            </span>
            <span>{user?.email}</span>
          </span>
          <button
            className="signout-button"
            onClick={() => dispatch(logout())}
            type="button"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-row">
          <div>
            <span className="eyebrow">
              <Sparkles size={14} /> YOUR LITTLE CORNER
            </span>
            <h1>
              Your pets, <em>in good hands.</em>
            </h1>
            <p className="welcome-row__copy">
              A thoughtful place for the little details that matter.
            </p>
          </div>
          <Button
            icon={<Plus size={18} />}
            onClick={() => {
              dispatch(clearPetsError());
              setEditingPet(null);
            }}
          >
            Add a pet
          </Button>
        </section>

        <section className="overview-strip" aria-label="Pet record overview">
          <div className="overview-strip__icon">
            <PawPrint size={21} />
          </div>
          <div className="overview-strip__text">
            <strong>{pets.length}</strong>
            <span>
              {pets.length === 1 ? 'pet in your care' : 'pets in your care'}
            </span>
          </div>
          <span className="overview-strip__divider" />
          <p>All their important details, together in one calm place.</p>
          <span className="overview-strip__sparkle" aria-hidden="true">
            ✳
          </span>
        </section>

        <section className="records-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE IMPORTANT ONES</span>
              <h2>Your little crew</h2>
            </div>
            {pets.length > 0 && (
              <label className="search-field">
                <Search size={17} aria-hidden="true" />
                <span className="sr-only">Search your pets</span>
                <input
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Find a friend"
                  type="search"
                  value={query}
                />
                {query && (
                  <button
                    aria-label="Clear search"
                    className="search-field__clear"
                    onClick={() => setQuery('')}
                    type="button"
                  >
                    ×
                  </button>
                )}
              </label>
            )}
          </div>

          {error && (
            <div className="dashboard-error">
              <Alert message={error} />
              <Button
                onClick={() => {
                  dispatch(clearPetsError());
                  void dispatch(fetchPets());
                }}
                variant="secondary"
              >
                Try again
              </Button>
            </div>
          )}

          {status === 'loading' && pets.length === 0 ? (
            <LoadingState />
          ) : error && pets.length === 0 ? null : visiblePets.length > 0 ? (
            <div className="pet-grid">
              {visiblePets.map((pet, index) => (
                <PetCard
                  index={index}
                  key={pet._id}
                  onDelete={setDeletingPet}
                  onEdit={(selected) => {
                    dispatch(clearPetsError());
                    setEditingPet(selected);
                  }}
                  pet={pet}
                />
              ))}
            </div>
          ) : (
            <section className="empty-state">
              <span className="empty-state__art">
                <PawPrint size={34} />
              </span>
              <span className="eyebrow">
                {query ? 'NO MATCHES JUST YET' : 'A FRESH LITTLE START'}
              </span>
              <h3>{query ? 'No friends found.' : 'Your crew starts here.'}</h3>
              <p>
                {query
                  ? 'Try another name or a different detail.'
                  : 'Add your first pet and keep their important details close.'}
              </p>
              {!query && (
                <Button
                  icon={<Plus size={17} />}
                  onClick={() => setEditingPet(null)}
                >
                  Add your first pet
                </Button>
              )}
              {query && (
                <Button onClick={() => setQuery('')} variant="quiet">
                  Clear search
                </Button>
              )}
            </section>
          )}
        </section>

        <footer className="dashboard-footer">
          <span>Made with care for the ones who care.</span>
          <span className="footer-paw">
            <PawPrint size={14} /> PetRegister
          </span>
        </footer>
      </main>

      {editingPet !== undefined && (
        <PetFormDialog
          busy={status === 'saving'}
          error={error}
          onClose={dismissPetDialog}
          onSave={(input) => void savePet(input)}
          pet={editingPet}
        />
      )}
      {deletingPet && (
        <ConfirmDeleteDialog
          busy={status === 'saving'}
          onCancel={() => setDeletingPet(null)}
          onConfirm={() => void removePet()}
          petName={deletingPet.petName}
        />
      )}
      {toast && <Toast message={toast} onDismiss={() => setToast('')} />}
    </div>
  );
}
