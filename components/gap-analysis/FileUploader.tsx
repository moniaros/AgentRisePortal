import React, { useState, useCallback } from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, isLoading }) => {
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

  return (
    <form
      className={`p-8 border-2 ${dragActive ? 'border-blue-500' : 'border-dashed'} border-gray-300 dark:border-gray-600 rounded-lg text-center cursor-pointer transition-colors`}
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
        disabled={isLoading}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          <p className="text-gray-600 dark:text-gray-400">
            {t('gapAnalysis.dragDrop')} <span className="text-blue-500">{t('gapAnalysis.browse')}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('gapAnalysis.fileTypes')}</p>
        </div>
      </label>
    </form>
  );
};

export default FileUploader;
