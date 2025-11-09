import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import PostPreview from '../components/composer/PostPreview';
import TemplateSelector from '../components/composer/TemplateSelector';
import CharacterCount from '../components/composer/CharacterCount';

const MAX_CHARS = 280; // Standard limit for platforms like X

const SocialComposer: React.FC = () => {
    const { t } = useLocalization();
    const [postContent, setPostContent] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [scheduleDate, setScheduleDate] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const characterCount = postContent.length;
    const isCharLimitExceeded = characterCount > MAX_CHARS;
    const isPostEmpty = postContent.trim() === '';

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPostContent(e.target.value);
        if (error) setError(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const applyTemplate = (content: string) => {
        setPostContent(content);
    };

    const isSchedulingValid = useMemo(() => {
        if (!scheduleDate) return false;
        return new Date(scheduleDate).getTime() > new Date().getTime();
    }, [scheduleDate]);

    const handleSubmit = (isScheduled: boolean) => {
        // Reset messages
        setError(null);
        setSuccessMessage(null);

        // Validation
        if (isPostEmpty) {
            setError(t('socialComposer.errorContentRequired'));
            return;
        }
        if (isCharLimitExceeded) {
            setError(t('socialComposer.errorCharLimit'));
            return;
        }
        if (isScheduled && !isSchedulingValid) {
            setError(t('socialComposer.errorFutureDate'));
            return;
        }

        // Simulate API call
        if (isScheduled) {
            const formattedDate = new Date(scheduleDate).toLocaleString();
            setSuccessMessage(`${t('socialComposer.postScheduled')} ${formattedDate}`);
        } else {
            setSuccessMessage(t('socialComposer.postPublished'));
        }
        
        // Reset form
        setPostContent('');
        setImage(null);
        setScheduleDate('');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('socialComposer.title')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Composer and Controls */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
                    {/* Text Area */}
                    <div className="relative">
                        <textarea
                            value={postContent}
                            onChange={handleContentChange}
                            placeholder={t('socialComposer.placeholder')}
                            className={`w-full p-3 border rounded-md bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 min-h-[150px] ${isCharLimitExceeded ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        <CharacterCount current={characterCount} max={MAX_CHARS} />
                    </div>

                    {/* Image Upload and Scheduling */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <input type="file" id="imageUpload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <label htmlFor="imageUpload" className="cursor-pointer px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition">
                            {t('socialComposer.uploadImage')}
                        </label>
                        {image && (
                            <button onClick={() => setImage(null)} className="text-sm text-red-500 hover:underline">
                                {t('socialComposer.removeImage')}
                            </button>
                        )}
                        <input
                            type="datetime-local"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 sm:ml-auto"
                        />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 border-t dark:border-gray-700 pt-4">
                        <button 
                            onClick={() => handleSubmit(true)}
                            disabled={isPostEmpty || isCharLimitExceeded || !scheduleDate}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {t('socialComposer.schedulePost')}
                        </button>
                        <button 
                            onClick={() => handleSubmit(false)}
                            disabled={isPostEmpty || isCharLimitExceeded}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {t('socialComposer.postNow')}
                        </button>
                    </div>

                     {/* Feedback Messages */}
                    {error && <p className="text-sm text-red-500 text-right -mt-2">{error}</p>}
                    {successMessage && <p className="text-sm text-green-500 text-right -mt-2">{successMessage}</p>}

                    {/* Templates */}
                    <div className="border-t dark:border-gray-700 pt-4">
                        <TemplateSelector onSelectTemplate={applyTemplate} />
                    </div>
                </div>

                {/* Preview */}
                <div className="lg:col-span-1">
                     <h2 className="text-xl font-semibold mb-4">{t('socialComposer.preview')}</h2>
                     <PostPreview content={postContent} image={image} />
                </div>
            </div>
        </div>
    );
};

export default SocialComposer;
