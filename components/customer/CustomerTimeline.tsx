import React, { useState, useMemo } from 'react';
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
        <div className="relative flex items-start pl-10">
            <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 dark:bg-gray-700 text-slate-500 shadow-lg">
                <span className="text-lg">{getIconForType(event.type)}</span>
            </div>
            <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md ml-4">
                <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-gray-900 dark:text-white capitalize">{t(`timelineTypes.${event.type}`)}</div>
                    <time className="font-caveat font-medium text-xs text-blue-500">{new Date(event.date).toLocaleString()}</time>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{event.content}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">by {event.author}</p>
                
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
    const { t, language } = useLocalization();
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const groupedTimeline = useMemo(() => {
        const sortedTimeline = [...timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const groups = sortedTimeline.reduce((acc, event) => {
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
        }, {} as Record<string, { title: string, events: TimelineEvent[] }>);
        
        // Set the first group to be expanded by default
        const firstGroupKey = Object.keys(groups)[0];
        if (firstGroupKey) {
            setExpandedGroups({ [firstGroupKey]: true });
        }

        return Object.entries(groups);
    }, [timeline, language]);

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!timeline || timeline.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400">{t('customer.noTimeline')}</p>;
    }

    return (
        <div className="space-y-4">
            {groupedTimeline.map(([key, group], index) => (
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
                                <TimelineEventItem key={event.id} event={event} onAddAnnotation={onAddAnnotation} />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CustomerTimeline;