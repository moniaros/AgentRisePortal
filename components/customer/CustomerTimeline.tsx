import React, { useState } from 'react';
import { TimelineEvent } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface CustomerTimelineProps {
  timeline: TimelineEvent[];
  onAddAnnotation: (eventId: string, content: string) => void;
}

const TimelineEventItem: React.FC<{ event: TimelineEvent; onAddAnnotation: (eventId: string, content: string) => void; }> = ({ event, onAddAnnotation }) => {
    const { t } = useLocalization();
    const [annotation, setAnnotation] = useState('');

    const getIconForType = (type: TimelineEvent['type']) => {
        switch (type) {
            case 'note': return '📝';
            case 'call': return '📞';
            case 'email': return '✉️';
            case 'meeting': return '🤝';
            case 'policy_update': return '🔄';
            case 'claim': return '⚠️';
            case 'system': return '⚙️';
            default: return '📌';
        }
    };
    
    const handleAnnotationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (annotation.trim()) {
            onAddAnnotation(event.id, annotation);
            setAnnotation('');
        }
    };

    return (
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 dark:bg-gray-700 group-odd:order-1 group-odd:group-hover:translate-x-0.5 group-even:group-hover:-translate-x-0.5 text-slate-500 group-hover:text-blue-600 transition-all duration-300 shadow-lg">
                <span className="text-xl">{getIconForType(event.type)}</span>
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-gray-900 dark:text-white capitalize">{t(`timelineTypes.${event.type}`)}</div>
                    <time className="font-caveat font-medium text-xs text-blue-500">{new Date(event.date).toLocaleString()}</time>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{event.content}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">by {event.author}</p>
                
                {/* Annotations */}
                {event.annotations && event.annotations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                        {event.annotations.map(ann => (
                            <div key={ann.id} className="text-xs bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                <p className="text-gray-700 dark:text-gray-300">{ann.content}</p>
                                <p className="text-gray-400 dark:text-gray-500 text-right">- {ann.author}, {new Date(ann.date).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Annotation Form */}
                <form onSubmit={handleAnnotationSubmit} className="mt-3">
                    <textarea
                        value={annotation}
                        onChange={(e) => setAnnotation(e.target.value)}
                        placeholder={t('customer.annotationPlaceholder')}
                        className="w-full text-xs p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        rows={2}
                    />
                    <button type="submit" className="mt-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400" disabled={!annotation.trim()}>
                        {t('customer.saveAnnotation')}
                    </button>
                </form>
            </div>
        </div>
    );
};


const CustomerTimeline: React.FC<CustomerTimelineProps> = ({ timeline, onAddAnnotation }) => {
    const { t } = useLocalization();

    if (!timeline || timeline.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400">{t('customer.noTimeline')}</p>;
    }
    
    // Sort timeline events by date, most recent first
    const sortedTimeline = [...timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {sortedTimeline.map(event => (
                <TimelineEventItem key={event.id} event={event} onAddAnnotation={onAddAnnotation} />
            ))}
        </div>
    );
};

export default CustomerTimeline;