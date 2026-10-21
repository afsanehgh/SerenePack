import { Check, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export default function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div className="toast" role="status">
      <span className="toast__icon">
        <Check size={17} aria-hidden="true" />
      </span>
      <span>{message}</span>
      <button
        aria-label="Dismiss notification"
        className="icon-button"
        onClick={onDismiss}
        type="button"
      >
        <X size={17} aria-hidden="true" />
      </button>
    </div>
  );
}
