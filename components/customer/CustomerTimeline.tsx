import React, { useState, useMemo } from 'react';
// FIX: Correct import path
import { TimelineEvent } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface CustomerTimelineProps {
  timeline: TimelineEvent[];
  onAddAnnotation: (eventId: string, content: string) => void;
  onFlagEvent: (eventId: string) => void;
}

const TimelineEventItem: React.FC<{ event: TimelineEvent; onAddAnnotation: (eventId: string, content: string) => void; onFlagEvent: (eventId: string) => void; }> = ({ event, onAddAnnotation, onFlagEvent }) => {
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
    
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        return parseFloat((bytes / k).toFixed(1));
    };

    return (
        <div className="relative flex items-start pl-10">
            <div className={`absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full ${event.isFlagged ? 'bg-yellow-400' : 'bg-slate-300 dark:bg-gray-700'} text-slate-500 shadow-lg`}>
                <span className="text-lg">{getIconForType(event.type)}</span>
            </div>
            <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md ml-4">
                <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-gray-900 dark:text-white capitalize">{t(`timelineTypes.${event.type}`) as string}</div>
                    <time className="font-caveat font-medium text-xs text-blue-500">{new Date(event.date).toLocaleString()}</time>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{event.content}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">by {event.author}</p>
                
                {event.attachments && event.attachments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <h5 className="text-xs font-semibold mb-2">{t('customer.attachments') as string}</h5>
                        <div className="space-y-1">
                            {event.attachments.map((file, index) => (
                                <a href={file.url} key={index} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-2">
                                    📎 {file.name}
                                    {/* Fix: Use replacement syntax for translations */}
                                    <span className="text-gray-400">{t('customer.attachmentSize', {size: formatBytes(file.size)})}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
                
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

                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <form onSubmit={handleAnnotationSubmit} className="flex-grow">
                        <textarea
                            value={annotation}
                            onChange={(e) => setAnnotation(e.target.value)}
                            placeholder={t('customer.annotationPlaceholder') as string}
                            className="w-full text-xs p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            rows={2}
                        />
                        <button type="submit" className="mt-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400" disabled={!annotation.trim()}>
                            {t('customer.saveAnnotation') as string}
                        </button>
                    </form>
                    <button 
                        onClick={() => onFlagEvent(event.id)}
                        className={`px-3 py-1.5 text-xs rounded transition ${event.isFlagged ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                        {event.isFlagged ? `🚩 ${t('customer.unflagEvent')}` : `🏳️ ${t('customer.flagEvent')}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CustomerTimeline: React.FC<CustomerTimelineProps> = ({ timeline, onAddAnnotation, onFlagEvent }) => {
    const { t, language } = useLocalization();
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const groupedTimeline = useMemo(() => {
        const sortedTimeline = [...timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // FIX: Add explicit type for the accumulator in the reduce function to prevent type errors.
        const groups = sortedTimeline.reduce<Record<string, { title: string, events: TimelineEvent[] }>>((acc, event) => {
            const date = new Date(event.date);
            const groupKey = `${date.getFullYear()}-${date.getMonth()}`;
            if (!acc[groupKey]) {
                acc[groupKey] = {
                    title: date.toLocaleString(language, { month: 'long', year: 'numeric' }),
                    events: []
                };
            }
            acc[groupKey].events.push(event);
            return acc;
        }, {});
        
        // Set the first group to be expanded by default
        const firstGroupKey = Object.keys(groups)[0];
        if (firstGroupKey && Object.keys(expandedGroups).length === 0) {
            setExpandedGroups({ [firstGroupKey]: true });
        }

        return Object.entries(groups);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeline, language]);

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!timeline || timeline.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400">{t('customer.noTimeline') as string}</p>;
    }

    return (
        <div className="space-y-4">
            {groupedTimeline.map(([key, group]) => (
                <div key={key} className="relative pl-5 before:absolute before:top-0 before:left-5 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-gray-700">
                    <button 
                        onClick={() => toggleGroup(key)}
                        className="flex items-center gap-2 mb-4 w-full text-left"
                    >
                        <div className={`transition-transform duration-200 ${expandedGroups[key] ? 'rotate-90' : 'rotate-0'}`}>
                            ▶
                        </div>
                        <h3 className="font-semibold text-lg">{group.title}</h3>
                        <span className="text-sm text-gray-500">({group.events.length} events)</span>
                    </button>
                    {expandedGroups[key] && (
                        <div className="space-y-6 pl-4 border-l-2 border-transparent">
                            {group.events.map(event => (
                                <TimelineEventItem key={event.id} event={event} onAddAnnotation={onAddAnnotation} onFlagEvent={onFlagEvent} />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CustomerTimeline;