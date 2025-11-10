import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { useForm } from 'react-hook-form';
import { User } from '../types';
import { useNotification } from '../hooks/useNotification';

const Profile: React.FC = () => {
    const { currentUser } = useAuth();
    const { t } = useLocalization();
    const { markTaskCompleted } = useOnboardingStatus();
    const { addNotification } = useNotification();
    const { register, handleSubmit, formState: { errors, isDirty } } = useForm<User>({
        defaultValues: currentUser || {}
    });
    
    const onSubmit = (data: User) => {
        // In a real app, you would call an API to update the user profile
        console.log("Profile updated:", data);
        markTaskCompleted('profileCompleted');
        addNotification(t('profile.updateSuccess'), 'success');
    };

    const InputField = ({ label, name, requiredMessage, registerFn, error, ...props }: any) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <input
                {...registerFn(name, { required: requiredMessage })}
                className="mt-1 w-full p-2 border rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 focus:outline-none sm:text-sm border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                {...props}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error.message as string}</p>}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('profile.title') as string}</h1>
            
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-8">
                
                <fieldset>
                    <legend className="text-lg font-semibold border-b dark:border-gray-600 pb-2 mb-4 w-full">{t('profile.personalInfo')}</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField 
                            label={t('crm.name')}
                            name="name"
                            registerFn={register}
                            requiredMessage="Name is required"
                            error={errors.name}
                        />
                        <InputField 
                            label={t('profile.jobTitle')}
                            name="jobTitle"
                            registerFn={register}
                        />
                        <InputField 
                            label={t('profile.department')}
                            name="department"
                            registerFn={register}
                        />
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="text-lg font-semibold border-b dark:border-gray-600 pb-2 mb-4 w-full">{t('profile.contactDetails')}</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField 
                            label={t('crm.form.email')}
                            name="email"
                            type="email"
                            registerFn={register}
                            requiredMessage="Email is required"
                            error={errors.email}
                        />
                         <InputField 
                            label={t('profile.officeLocation')}
                            name="officeLocation"
                            registerFn={register}
                        />
                        <InputField 
                            label={t('profile.workPhone')}
                            name="contact.workPhone"
                            type="tel"
                            registerFn={register}
                        />
                        <InputField 
                            label={t('profile.mobilePhone')}
                            name="contact.mobilePhone"
                            type="tel"
                            registerFn={register}
                        />
                    </div>
                </fieldset>
                
                <div>
                    <button type="submit" disabled={!isDirty} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {t('crm.save') as string}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;