import { useState, type FormEvent } from 'react';
import { PawPrint } from 'lucide-react';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import TextField from '../../components/ui/TextField';
import type { Pet, PetInput } from './petTypes';

interface PetFormDialogProps {
  pet?: Pet | null;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (pet: PetInput) => void;
}

export default function PetFormDialog({
  pet,
  busy,
  error,
  onClose,
  onSave,
}: PetFormDialogProps) {
  const [petName, setPetName] = useState(pet?.petName ?? '');
  const [description, setDescription] = useState(pet?.description ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = petName.trim();
    const trimmedDescription = description.trim();
    if (trimmedName.length < 2 || trimmedName.length > 30) {
      setValidationError('Pet names need to be between 2 and 30 characters.');
      return;
    }
    if (trimmedDescription.length < 50 || trimmedDescription.length > 200) {
      setValidationError(
        'Descriptions need to be between 50 and 200 characters.',
      );
      return;
    }
    setValidationError(null);
    onSave({ petName: trimmedName, description: trimmedDescription });
  }

  return (
    <Modal
      onClose={onClose}
      title={pet ? 'A little update' : 'Add a new friend'}
    >
      <div className="modal__intro">
        <span className="modal__intro-icon">
          <PawPrint size={19} />
        </span>
        <p>
          {pet
            ? 'Keep their details current, all in one place.'
            : 'Add the details you want to remember.'}
        </p>
      </div>
      {(error || validationError) && (
        <Alert message={validationError ?? error ?? ''} />
      )}
      <form className="form-stack" onSubmit={submit}>
        <TextField
          autoFocus
          label="Pet name"
          maxLength={30}
          minLength={2}
          name="petName"
          onChange={(event) => setPetName(event.target.value)}
          placeholder="What do you call them?"
          required
          value={petName}
        />
        <div className="field">
          <label htmlFor="pet-description">A little about them</label>
          <textarea
            id="pet-description"
            maxLength={200}
            minLength={50}
            name="description"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Share the little details that make them special…"
            required
            rows={4}
            value={description}
          />
          <span className="field__counter">{description.length}/200</span>
        </div>
        <div className="modal__actions">
          <Button onClick={onClose} type="button" variant="quiet">
            Cancel
          </Button>
          <Button disabled={busy} type="submit">
            {busy ? 'Saving…' : pet ? 'Save changes' : 'Add pet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
