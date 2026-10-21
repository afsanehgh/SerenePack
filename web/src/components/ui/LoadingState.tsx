export default function LoadingState() {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>Gathering your pet records…</span>
    </div>
  );
}
