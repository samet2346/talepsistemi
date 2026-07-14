export default function Spinner({ className = '' }) {
  return (
    <div 
      className={`border-2 border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
    >
      <span className="sr-only">Yükleniyor...</span>
    </div>
  );
}