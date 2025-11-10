import React from 'react';

const FailedRulesTable: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold">Recently Failed Rules</h2>
        <p className="text-sm text-gray-500 mt-2">No failed rules in the last 24 hours.</p>
    </div>
);

export default FailedRulesTable;
