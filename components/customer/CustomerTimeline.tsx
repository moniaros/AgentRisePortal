import React from 'react';
import { TimelineEvent } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface CustomerTimelineProps {
  events: TimelineEvent[];
}

const getIconForType = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'call': return '📞';
    case 'email': return '📧';
    case 'meeting': return '🤝';
    case 'policy_update': return '📄';
    case 'policy_renewal': return '🔄';
    case 'premium_reminder': return '🔔';
    case 'address_change': return '🏠';
    case 'ai_review': return '🤖';
    case 'note':
    default: return '📝';
  }
};

const CustomerTimeline: React.FC<CustomerTimelineProps> = ({ events }) => {
  const { t } = useLocalization();

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {t('customer.noTimelineEvents')}
      </div>
    );
  }
  
  // Sort events by date, most recent first
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      {sortedEvents.map((event, index) => (
        <div key={event.id} className="relative flex items-start">
          {/* Timeline Line */}
          {index < sortedEvents.length - 1 && (
            <div className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
          )}

          {/* Icon */}
          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center z-10">
            <span className="text-xl" role="img" aria-label={event.type}>{getIconForType(event.type)}</span>
          </div>

          {/* Content */}
          <div className="ml-4 flex-grow">
            <h4 className="font-bold text-gray-900 dark:text-white">{event.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(event.date).toLocaleString()} by {event.author}
            </p>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{event.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerTimeline;