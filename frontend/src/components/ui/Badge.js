export default function Badge({ text, status, className = '' }) {
  const variants = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    approved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  };

  const currentVariant = variants[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${currentVariant} ${className}`}>
      {text}
    </span>
  );
}