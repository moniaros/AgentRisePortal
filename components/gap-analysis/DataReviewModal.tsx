import React from 'react';
import { useForm } from 'react-hook-form';
import { DetailedPolicy } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { usePolicyCrmSync } from '../../hooks/usePolicyCrmSync';
import { useNotification } from '../../hooks/useNotification';
import PolicyholderSection from './form-sections/PolicyholderSection';
import PolicyDetailsSection from './form-sections/PolicyDetailsSection';
import CoveragesSection from './form-sections/CoveragesSection';
import BeneficiariesSection from './form-sections/BeneficiariesSection';

interface DataReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    policyData: DetailedPolicy;
    onApprove: (approvedData: DetailedPolicy) => void;
}

const DataReviewModal: React.FC<DataReviewModalProps> = ({ isOpen, onClose, policyData, onApprove }) => {
    const { t } = useLocalization();
    const { addNotification } = useNotification();
    const { isSyncing, syncPolicyDataToCrm } = usePolicyCrmSync();

    const { control, register, handleSubmit, formState: { errors } } = useForm<DetailedPolicy>({
        defaultValues: policyData,
    });

    const onSubmit = async (data: DetailedPolicy) => {
        const success = await syncPolicyDataToCrm(data);
        if (success) {
            addNotification(t('gapAnalysis.dataReviewModal.saveSuccess'), 'success');
            onApprove(data);
        } else {
            addNotification(t('gapAnalysis.dataReviewModal.saveError'), 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{t('gapAnalysis.dataReviewModal.title')}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('gapAnalysis.dataReviewModal.description')}</p>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <PolicyholderSection register={register} errors={errors} />
                    <PolicyDetailsSection register={register} errors={errors} />
                    <CoveragesSection control={control} register={register} errors={errors} />
                    {/* Beneficiaries section would go here if needed in the future */}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                        {t('common.cancel')}
                    </button>
                    <button type="submit" disabled={isSyncing} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                        {isSyncing ? t('common.loading') : t('gapAnalysis.dataReviewModal.approveAndSave')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DataReviewModal;