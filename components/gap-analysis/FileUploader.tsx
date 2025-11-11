import React, { useState, useCallback } from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  error: string | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, error }) => {
  const { t } = useLocalization();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const borderColor = error ? 'border-red-500' : dragActive ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600';
  const ringColor = error ? 'ring-red-200' : dragActive ? 'ring-blue-200' : '';

  return (
    <form
      className={`relative p-8 border-2 ${dragActive ? 'border-solid' : 'border-dashed'} ${borderColor} rounded-lg text-center cursor-pointer transition-all duration-300 ring-4 ring-transparent ${ringColor}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleChange}
        accept=".pdf,.png,.jpg,.jpeg"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center justify-center">
           {dragActive ? (
            <>
              <svg className="w-16 h-16 text-blue-500 mb-3 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="font-semibold text-blue-500">Drop file to upload</p>
            </>
          ) : (
            <>
              <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              <p className="text-gray-600 dark:text-gray-400">
                {t('gapAnalysis.dragDrop')} <span className="text-blue-500 font-semibold">{t('gapAnalysis.browse')}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('gapAnalysis.fileTypes')}</p>
            </>
          )}
        </div>
      </label>
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </form>
  );
};

export default FileUploader;
