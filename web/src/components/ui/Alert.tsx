import { CircleAlert } from 'lucide-react';

export default function Alert({ message }: { message: string }) {
  return (
    <div className="alert" role="alert">
      <CircleAlert size={18} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
