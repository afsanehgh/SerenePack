import { Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

interface ConfirmDeleteDialogProps {
  petName: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteDialog({
  petName,
  busy,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Modal onClose={onCancel} size="compact" title="Remove this pet?">
      <div className="confirm-content">
        <span className="confirm-content__icon">
          <Trash2 size={22} />
        </span>
        <p>
          <strong>{petName}</strong> will be removed from your records. This
          can’t be undone.
        </p>
        <div className="modal__actions">
          <Button onClick={onCancel} type="button" variant="quiet">
            Keep pet
          </Button>
          <Button
            disabled={busy}
            icon={<Trash2 size={16} />}
            onClick={onConfirm}
            type="button"
            variant="danger"
          >
            {busy ? 'Removing…' : 'Remove pet'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
