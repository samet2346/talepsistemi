import Button from './Button';

export default function EmptyState({ title, description, actionText, onAction, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 ${className}`}>
      <div className="w-16 h-16 mb-4 bg-gray-200 rounded-full flex items-center justify-center">
        <span className="text-gray-500 text-2xl">📁</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="outline">{actionText}</Button>
      )}
    </div>
  );
}