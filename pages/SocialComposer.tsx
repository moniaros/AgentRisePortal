import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import PostPreview from '../components/composer/PostPreview';
import TemplateSelector from '../components/composer/TemplateSelector';
import CharacterCount from '../components/composer/CharacterCount';
import { SOCIAL_PLATFORMS } from '../constants';
import { useCampaigns } from '../hooks/useCampaigns';
import { CampaignObjective, Language, Campaign } from '../types';
import { useAuth } from '../hooks/useAuth';

const MAX_CHARS = 280;

interface PostError {
    type: 'POST_FAILED' | 'AUTH_ERROR' | 'RATE_LIMIT' | 'UNSUPPORTED_FEATURE' | 'NOT_CONNECTED';
    platformName: string;
}

interface SuccessState {
    message: string;
    link?: string;
}

const SocialComposer: React.FC = () => {
    const { t, language } = useLocalization();
    const { addCampaign } = useCampaigns();
    const { currentUser } = useAuth();
    const [postContent, setPostContent] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [scheduleDate, setScheduleDate] = useState('');
    const [successState, setSuccessState] = useState<SuccessState | null>(null);
    const [attachLeadForm, setAttachLeadForm] = useState(false);
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    const [selectedPlatformKey, setSelectedPlatformKey] = useState(SOCIAL_PLATFORMS[0].key);
    const [connections, setConnections] = useState<{ [key: string]: boolean }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<PostError | null>(null);

    useEffect(() => {
        const storedConnections = localStorage.getItem('socialConnections');
        if (storedConnections) {
            setConnections(JSON.parse(storedConnections));
        }
    }, []);

    const characterCount = postContent.length;
    const isCharLimitExceeded = characterCount > MAX_CHARS;
    const isPostEmpty = postContent.trim() === '';
    const isPlatformConnected = connections[selectedPlatformKey] === true;

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPostContent(e.target.value);
        if (error) setError(null);
        if (successState) setSuccessState(null);
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
        setError(null);
        setSuccessState(null);
    };

    const isSchedulingValid = useMemo(() => {
        if (!scheduleDate) return false;
        return new Date(scheduleDate).getTime() > new Date().getTime();
    }, [scheduleDate]);

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setIsLinkCopied(true);
            setTimeout(() => setIsLinkCopied(false), 2000);
        });
    };

    const handleSubmit = (isScheduled: boolean) => {
        setError(null);
        setSuccessState(null);

        const platform = SOCIAL_PLATFORMS.find(p => p.key === selectedPlatformKey);
        if (!platform) return;

        if (!isPlatformConnected) {
            setError({ type: 'NOT_CONNECTED', platformName: platform.name });
            return;
        }
        if (isPostEmpty) {
            setError({ type: 'POST_FAILED', platformName: t('socialComposer.errorContentRequired') });
            return;
        }
        if (isCharLimitExceeded) {
             setError({ type: 'POST_FAILED', platformName: t('socialComposer.errorCharLimit') });
            return;
        }
        if (isScheduled && !isSchedulingValid) {
            setError({ type: 'POST_FAILED', platformName: t('socialComposer.errorFutureDate') });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const randomNumber = Math.random();

            if (isScheduled && selectedPlatformKey === 'instagram') {
                setError({ type: 'UNSUPPORTED_FEATURE', platformName: platform.name });
            } else if (randomNumber < 0.2) {
                setError({ type: 'AUTH_ERROR', platformName: platform.name });
            } else if (randomNumber < 0.4) {
                setError({ type: 'RATE_LIMIT', platformName: platform.name });
            } else if (randomNumber < 0.5) {
                setError({ type: 'POST_FAILED', platformName: platform.name });
            } else {
                // SUCCESS
                let link: string | undefined;
                if (attachLeadForm) {
                    // FIX: Add agencyId to satisfy the Campaign type.
                    if (!currentUser) {
                        setError({ type: 'AUTH_ERROR', platformName: 'Application' });
                        setIsLoading(false);
                        return;
                    }
                    const newCampaign: Omit<Campaign, 'id'> = {
                        name: `Social Post: ${postContent.substring(0, 30)}...`,
                        objective: CampaignObjective.LEAD_GENERATION,
                        network: selectedPlatformKey as 'facebook' | 'instagram' | 'linkedin' | 'x',
                        language: language,
                        status: 'active',
                        audience: { ageRange: [18, 65], interests: [] },
                        budget: 0,
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        creative: {
                            headline: t('leadCapture.title'),
                            body: postContent,
                            image: image || ''
                        },
                        leadCaptureForm: {
                            fields: [
                                { name: 'name', type: 'text', required: true },
                                { name: 'email', type: 'email', required: true },
                                { name: 'phone', type: 'tel', required: false },
                            ]
                        },
                        agencyId: currentUser.agencyId,
                    };
                    const campaignWithId = { ...newCampaign, id: `social_${Date.now()}`};
                    addCampaign(campaignWithId);
                    link = `${window.location.origin}${window.location.pathname}#/capture/${campaignWithId.id}`;
                    setSuccessState({ message: t('socialComposer.leadCaptureLinkSuccess'), link });
                } else if (isScheduled) {
                    const formattedDate = new Date(scheduleDate).toLocaleString();
                    setSuccessState({ message: `${t('socialComposer.postScheduled')} ${formattedDate}` });
                } else {
                    setSuccessState({ message: t('socialComposer.postPublished') });
                }

                setPostContent('');
                setImage(null);
                setScheduleDate('');
                setAttachLeadForm(false);
            }
            setIsLoading(false);
        }, 1200);
    };

    const ErrorAlert = () => {
        if (!error) return null;
        
        const messageKey = `socialComposer.errors.${error.type}_message`;
        const guidanceKey = `socialComposer.errors.${error.type}_guidance`;
        const message = t(messageKey).replace('{platform}', error.platformName);
        const guidance = t(guidanceKey).replace('{platform}', error.platformName);

        return (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-r-lg" role="alert">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold">{t('socialComposer.errors.title')}</p>
                        <p className="text-sm mt-1">{message}</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">{guidance}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {(error.type === 'POST_FAILED' || error.type === 'RATE_LIMIT') &&
                                <button onClick={() => handleSubmit(!!scheduleDate)} className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">{t('socialComposer.retry')}</button>
                            }
                            {(error.type === 'AUTH_ERROR' || error.type === 'NOT_CONNECTED') &&
                                <Link to="/settings" className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">{t('socialComposer.reauthenticate')}</Link>
                            }
                        </div>
                    </div>
                    <button onClick={() => setError(null)} className="font-bold text-xl ml-4" aria-label="Close alert">&times;</button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('socialComposer.title')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <label htmlFor="platform-selector" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">{t('socialComposer.selectPlatform')}:</label>
                        <select
                            id="platform-selector"
                            value={selectedPlatformKey}
                            onChange={(e) => setSelectedPlatformKey(e.target.value)}
                            className="w-full sm:w-auto p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {SOCIAL_PLATFORMS.map(p => <option key={p.key} value={p.key}>{p.name}</option>)}
                        </select>
                        {!isPlatformConnected && (
                            <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                                ({t('socialComposer.notConnected')})
                                <Link to="/settings" className="text-blue-500 hover:underline">{t('socialComposer.connectAccount')}</Link>
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        <textarea
                            value={postContent}
                            onChange={handleContentChange}
                            placeholder={t('socialComposer.placeholder')}
                            className={`w-full p-3 border rounded-md bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 min-h-[150px] ${isCharLimitExceeded ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        <CharacterCount current={characterCount} max={MAX_CHARS} />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <input type="file" id="imageUpload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            <label htmlFor="imageUpload" className="cursor-pointer px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition">
                                {t('socialComposer.uploadImage')}
                            </label>
                            {image && <button onClick={() => setImage(null)} className="text-sm text-red-500 hover:underline">{t('socialComposer.removeImage')}</button>}
                        </div>
                        <input
                            type="datetime-local"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    
                    <div className="flex items-center justify-between border-t dark:border-gray-700 pt-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="checkbox"
                                checked={attachLeadForm}
                                onChange={(e) => setAttachLeadForm(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            {t('socialComposer.attachLeadForm')}
                        </label>
                        <div className="flex justify-end gap-4">
                            <button 
                                onClick={() => handleSubmit(true)}
                                disabled={isLoading || isPostEmpty || isCharLimitExceeded || !scheduleDate}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {isLoading ? t('socialComposer.scheduling') : t('socialComposer.schedulePost')}
                            </button>
                            <button 
                                onClick={() => handleSubmit(false)}
                                disabled={isLoading || isPostEmpty || isCharLimitExceeded}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {isLoading ? t('socialComposer.posting') : t('socialComposer.postNow')}
                            </button>
                        </div>
                    </div>

                    {successState && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm">
                            <p>{successState.message}</p>
                            {successState.link && (
                                <div className="mt-2 flex items-center gap-2">
                                    <input type="text" readOnly value={successState.link} className="w-full p-1 text-xs bg-white dark:bg-gray-700 border rounded" />
                                    <button onClick={() => handleCopyToClipboard(successState.link!)} className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                                        {isLinkCopied ? t('socialComposer.copied') : t('socialComposer.copyLink')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <ErrorAlert />

                    <div className="border-t dark:border-gray-700 pt-4">
                        <TemplateSelector onSelectTemplate={applyTemplate} />
                    </div>
                </div>

                <div className="lg:col-span-1">
                     <h2 className="text-xl font-semibold mb-4">{t('socialComposer.preview')}</h2>
                     <PostPreview content={postContent} image={image} />
                </div>
            </div>
        </div>
    );
};

export default SocialComposer;