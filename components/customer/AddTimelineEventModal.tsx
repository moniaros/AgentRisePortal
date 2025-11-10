import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLocalization } from '../../hooks/useLocalization';
import { TimelineEvent, Attachment } from '../../types';

type TimelineEventFormData = Omit<TimelineEvent, 'id' | 'date' | 'author' | 'annotations'>;

interface AddTimelineEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TimelineEventFormData) => void;
}

const AddTimelineEventModal: React.FC<AddTimelineEventModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useLocalization();
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<TimelineEventFormData>({
      defaultValues: {
          type: 'note',
          content: '',
          attachments: [],
      }
  });

  const handleFormSubmit = (data: TimelineEventFormData) => {
    // Mock file handling
    const fileInput = document.getElementById('attachment-file') as HTMLInputElement;
    const files = fileInput?.files;
    const attachments: Attachment[] = [];
    if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            attachments.push({
                name: files[i].name,
                size: files[i].size,
                url: '#', // In a real app, this would be a URL from a file storage service
            });
        }
    }
    
    onSubmit({ ...data, attachments });
    reset();
  };
  
  const handleClose = () => {
      reset();
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold">{t('customer.addEventTitle') as string}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="eventType" className="block text-sm font-medium">{t('customer.eventType') as string}</label>
              <select
                id="eventType"
                {...register("type")}
                className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                {Object.keys(t('timelineTypes', {})).map(type => (
                   <option key={type} value={type}>{t(`timelineTypes.${type}`) as string}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="eventContent" className="block text-sm font-medium">{t('customer.eventDetails') as string}</label>
              <textarea
                id="eventContent"
                // Fix: Use replacement syntax for translations
                {...register("content", { required: t('validation.required', {fieldName: t('customer.eventDetails')}) as string })}
                rows={4}
                placeholder={t('customer.eventDetailsPlaceholder') as string}
                className={`mt-1 w-full p-2 border rounded dark:bg-gray-700 ${errors.content ? 'border-red-500' : 'dark:border-gray-600'}`}
              />
              {/* FIX: Ensure error message is a string before rendering. */}
              {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message as string}</p>}
            </div>
            
            <div>
                 <label htmlFor="attachment-file" className="block text-sm font-medium">{t('customer.attachments') as string}</label>
                 <input 
                    type="file"
                    id="attachment-file"
                    multiple
                    className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                 />
                 <p className="text-xs text-gray-500 mt-1">{t('customer.uploadAttachment') as string}</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
              {t('crm.cancel') as string}
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {t('crm.save') as string}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTimelineEventModal;
