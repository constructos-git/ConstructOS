import type { QuestionOption } from '../../domain/types';

interface ItemConfigurationModalProps {
  option: QuestionOption;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemConfigurationModal({ option, isOpen, onClose }: ItemConfigurationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Configure: {option.label}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {option.description || 'No additional configuration available.'}
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
