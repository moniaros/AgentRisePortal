import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';

const Logout: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
             <svg className="w-24 h-24 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">You've been logged out.</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                Thank you for using AgentOS. You have been securely logged out.
            </p>
            <Link to="/" className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Return to Dashboard
            </Link>
        </div>
    );
};

export default Logout;
