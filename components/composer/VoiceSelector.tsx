
import React from 'react';

export type BrandVoice = 'professional' | 'empathetic' | 'witty' | 'urgent' | 'educational';

interface VoiceSelectorProps {
    selectedVoice: BrandVoice;
    onChange: (voice: BrandVoice) => void;
}

const voices: { id: BrandVoice; label: string; icon: string }[] = [
    { id: 'professional', label: 'Professional', icon: '👔' },
    { id: 'empathetic', label: 'Empathetic', icon: '💙' },
    { id: 'educational', label: 'Educational', icon: '📚' },
    { id: 'witty', label: 'Witty', icon: '✨' },
    { id: 'urgent', label: 'Urgent', icon: '⏰' },
];

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onChange }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {voices.map((voice) => (
                <button
                    key={voice.id}
                    onClick={() => onChange(voice.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 flex items-center gap-1.5
                    ${selectedVoice === voice.id 
                        ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-700 ring-2 ring-purple-200 dark:ring-purple-900' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-purple-200 hover:bg-purple-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                    }`}
                >
                    <span>{voice.icon}</span>
                    {voice.label}
                </button>
            ))}
        </div>
    );
};

export default VoiceSelector;
