import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { DetailedPolicy } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';

interface Props {
    register: UseFormRegister<DetailedPolicy>;
    errors: FieldErrors<DetailedPolicy>;
}

const PolicyholderSection: React.FC<Props> = ({ register, errors }) => {
    const { t } = useLocalization();
    return (
        <fieldset>
            <legend className="text-lg font-semibold border-b dark:border-gray-600 pb-2 mb-4 w-full">{t('gapAnalysis.dataReviewModal.sections.policyholder')}</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">{t('gapAnalysis.dataReviewModal.fields.policyholderName')}</label>
                    <input
                        {...register("policyholder.name", { required: "Policyholder name is required" })}
                        className={`mt-1 w-full p-2 border rounded dark:bg-gray-700 ${errors.policyholder?.name ? 'border-red-500' : 'dark:border-gray-600'}`}
                    />
                    {errors.policyholder?.name && <p className="text-red-500 text-xs mt-1">{errors.policyholder.name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">{t('gapAnalysis.dataReviewModal.fields.address')}</label>
                    <input
                        {...register("policyholder.address")}
                        className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
            </div>
        </fieldset>
    );
};

export default PolicyholderSection;