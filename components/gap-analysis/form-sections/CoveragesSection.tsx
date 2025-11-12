import React from 'react';
import { useFieldArray, Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { DetailedPolicy } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';

interface Props {
    control: Control<DetailedPolicy>;
    register: UseFormRegister<DetailedPolicy>;
    errors: FieldErrors<DetailedPolicy>;
}

const CoveragesSection: React.FC<Props> = ({ control, register, errors }) => {
    const { t } = useLocalization();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "insuredItems.0.coverages",
    });

    return (
        <fieldset>
            <legend className="text-lg font-semibold border-b dark:border-gray-600 pb-2 mb-4 w-full">{t('gapAnalysis.dataReviewModal.sections.coverages')}</legend>
            <div className="space-y-3">
                {fields.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                        <input
                            {...register(`insuredItems.0.coverages.${index}.type`)}
                            placeholder={t('gapAnalysis.dataReviewModal.fields.coverageType')}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 md:col-span-3"
                        />
                        <input
                            {...register(`insuredItems.0.coverages.${index}.limit`)}
                            placeholder={t('gapAnalysis.dataReviewModal.fields.coverageLimit')}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 md:col-span-2"
                        />
                        <button type="button" onClick={() => remove(index)} className="text-red-500 font-bold text-lg md:text-center">
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={() => append({ type: '', limit: '' })} className="mt-4 text-sm text-blue-600">
                + {t('gapAnalysis.dataReviewModal.fields.addCoverage')}
            </button>
        </fieldset>
    );
};

export default CoveragesSection;