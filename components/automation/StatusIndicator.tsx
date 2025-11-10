import React from 'react';

interface StatusIndicatorProps {
    lastRun: Date;
    nextRun: Date;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ lastRun, nextRun }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Automation Status</h3>
        <div className="mt-2 flex items-center">
            <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
            <p className="text-green-600 font-semibold">Running</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">Last run: {lastRun.toLocaleTimeString()}</p>
        <p className="text-xs text-gray-500">Next run: {nextRun.toLocaleTimeString()}</p>
    </div>
);

export default StatusIndicator;
