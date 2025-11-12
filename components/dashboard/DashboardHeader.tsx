import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';

const AgencyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const DashboardHeader: React.FC = () => {
    const { currentUser } = useAuth();
    const { language } = useLocalization();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const formattedDate = new Date().toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    if (!currentUser) {
        return null;
    }

    const { firstName } = currentUser.party.partyName;
    const agencyBranch = currentUser.party.addressInfo?.fullAddress;

    return (
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {getGreeting()}, {firstName}!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{formattedDate}</p>
            </div>
            {agencyBranch && (
                 <div className="hidden sm:flex items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border dark:border-gray-700">
                    <AgencyIcon />
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Agency</p>
                        <p className="font-semibold text-sm">{agencyBranch}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardHeader;