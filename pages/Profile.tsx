import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { useForm, UseFormSetValue } from 'react-hook-form';
import { User, License, LicenseStatus } from '../types';
import { useNotification } from '../hooks/useNotification';

// Helper component for Image Upload controls
interface ImageUploadControlProps {
    label: string;
    description?: string;
    currentImage?: string;
    setValue: UseFormSetValue<User>;
    fieldName: 'profilePhotoUrl' | 'signature';
    previewClassName?: string;
}

const ImageUploadControl: React.FC<ImageUploadControlProps> = ({ label, description, currentImage, setValue, fieldName, previewClassName = 'w-24 h-24 rounded-full' }) => {
    const { t } = useLocalization();
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                setValue(fieldName, result, { shouldDirty: true });
            };
            reader.readAsDataURL(file);
        }
    };

    const imageSrc = preview || currentImage || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent pixel

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="mt-2 flex items-center gap-4">
                <img
                    src={imageSrc}
                    alt={label}
                    className={`${previewClassName} object-cover bg-gray-100 dark:bg-gray-700 border dark:border-gray-600`}
                />
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label={`Upload ${label}`}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                    {t('profile.change')}
                </button>
            </div>
            {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{description}</p>}
        </div>
    );
};


const Profile: React.FC = () => {
    const { currentUser } = useAuth();
    const { t } = useLocalization();
    const { markTaskCompleted } = useOnboardingStatus();
    const { addNotification } = useNotification();
    const { register, handleSubmit, formState: { errors, isDirty }, setValue, watch } = useForm<User>({
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
    
    const ReadOnlyField = ({ label, value }: { label: string; value?: string }) => (
        <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">{label}</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize bg-gray-100 dark:bg-gray-700 p-2 rounded-md">{value || 'N/A'}</p>
        </div>
    );
    
    const LicenseStatusBadge: React.FC<{ status: LicenseStatus }> = ({ status }) => {
        const statusStyles = {
            valid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            pending_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        };
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
                {t(`licenseStatus.${status}`)}
            </span>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('profile.title') as string}</h1>
            
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-8">
                <fieldset>
                    <legend className="text-lg font-semibold border-b dark:border-gray-600 pb-2 mb-4 w-full">{t('profile.personalInfo')}</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="md:col-span-1">
                            <ImageUploadControl
                                label={t('profile.profilePhoto')}
                                currentImage={watch('profilePhotoUrl')}
                                setValue={setValue}
                                fieldName="profilePhotoUrl"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-6">
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

                <fieldset>
                    <legend className="text-lg font-semibold border-b dark:border-gray-600 pb-2 mb-4 w-full">{t('profile.digitalSignature')}</legend>
                    <ImageUploadControl
                        label={t('profile.digitalSignature')}
                        description={t('profile.signatureDescription')}
                        currentImage={watch('signature')}
                        setValue={setValue}
                        fieldName="signature"
                        previewClassName="w-48 h-16 rounded-md bg-white"
                    />
                </fieldset>
                
                {currentUser?.roleInfo && (
                    <fieldset>
                        <legend className="text-lg font-semibold border-b dark:border-gray-600 pb-2 mb-4 w-full">{t('profile.roleAndPermissions')}</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReadOnlyField label={t('profile.roleTitle')} value={currentUser.roleInfo.roleTitle} />
                            <ReadOnlyField label={t('profile.permissionsScope')} value={currentUser.roleInfo.permissionsScope} />
                        </div>
                    </fieldset>
                )}
                
                {currentUser?.licenses && currentUser.licenses.length > 0 && (
                    <fieldset>
                         <legend className="text-lg font-semibold border-b dark:border-gray-600 pb-2 mb-4 w-full">{t('profile.licensesAndCertifications')}</legend>
                         <div className="space-y-4">
                            {currentUser.licenses.map((license, index) => (
                                <div key={index} className="p-4 border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t('profile.licenseType')}</label>
                                            <p className="text-sm font-semibold">{license.type}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t('profile.licenseNumber')}</label>
                                            <p className="text-sm">{license.licenseNumber}</p>
                                        </div>
                                         <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t('profile.expirationDate')}</label>
                                            <p className="text-sm">{new Date(license.expirationDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">{t('profile.status')}</label>
                                            <LicenseStatusBadge status={license.status} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </fieldset>
                )}
                
                <div className="pt-4 border-t dark:border-gray-700">
                    <button type="submit" disabled={!isDirty} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {t('crm.save') as string}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;