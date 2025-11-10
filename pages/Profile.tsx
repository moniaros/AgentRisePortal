import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { useForm } from 'react-hook-form';
import { User } from '../types';

const Profile: React.FC = () => {
    const { currentUser } = useAuth();
    const { t } = useLocalization();
    const { markTaskCompleted } = useOnboardingStatus();
    const { register, handleSubmit, formState: { errors, isDirty } } = useForm<User>({
        defaultValues: currentUser || {}
    });
    
    const onSubmit = (data: User) => {
        // In a real app, you would call an API to update the user profile
        console.log("Profile updated:", data);
        markTaskCompleted('profileCompleted');
        alert('Profile updated successfully! (Mock)');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('header.profile') as string}</h1>
            
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('crm.name') as string}</label>
                    <input
                        {...register("name", { required: "Name is required" })}
                        className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                     {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('crm.form.email') as string}</label>
                    <input
                        type="email"
                        {...register("email", { required: "Email is required" })}
                        className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
                </div>
                <div>
                    <button type="submit" disabled={!isDirty} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                        {t('crm.save') as string}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;