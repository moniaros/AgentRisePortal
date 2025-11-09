import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

const Profile: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('header.profile')}</h1>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-8">
                    <img
                        className="h-24 w-24 rounded-full object-cover ring-4 ring-blue-500"
                        src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                        alt="User avatar"
                    />
                    <div className="mt-4 sm:mt-0 text-center sm:text-left">
                        <h2 className="text-2xl font-bold">Agent Smith</h2>
                        <p className="text-gray-500 dark:text-gray-400">agent.smith@example.com</p>
                    </div>
                </div>

                <div className="mt-8 border-t dark:border-gray-700 pt-6">
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <input type="text" id="fullName" defaultValue="Agent Smith" className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <input type="email" id="email" defaultValue="agent.smith@example.com" className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <input type="tel" id="phone" defaultValue="+1 234 567 890" className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                                {t('crm.save')} Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;