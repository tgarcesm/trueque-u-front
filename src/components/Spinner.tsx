type SpinnerProps = {
  className?: string;
};

export default function Spinner({ className = "h-10 w-10" }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-500 ${className}`}
      role="status"
      aria-label="Cargando"
    />
  );
}
