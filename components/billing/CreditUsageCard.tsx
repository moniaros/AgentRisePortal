
import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { BillingUsage } from '../../types';
import ToggleSwitch from '../ui/ToggleSwitch';

interface CreditUsageCardProps {
    usage: BillingUsage;
    onUpdateOverage: (enabled: boolean, cap: number) => void;
}

const CreditUsageCard: React.FC<CreditUsageCardProps> = ({ usage, onUpdateOverage }) => {
    const { t } = useLocalization();
    const [isEditing, setIsEditing] = useState(false);
    const [tempCap, setTempCap] = useState(usage.overage.monthlyBudgetCap);

    const overagePercent = usage.overage.monthlyBudgetCap > 0 
        ? (usage.overage.currentUsageCost / usage.overage.monthlyBudgetCap) * 100 
        : 0;
    
    const isPaused = overagePercent >= 100 && usage.overage.isEnabled;

    const handleSave = () => {
        onUpdateOverage(usage.overage.isEnabled, tempCap);
        setIsEditing(false);
    };

    const handleToggle = (checked: boolean) => {
        onUpdateOverage(checked, usage.overage.monthlyBudgetCap);
    }

    return (
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border ${isPaused ? 'border-red-500 ring-2 ring-red-100 dark:ring-red-900/20' : 'border-slate-200 dark:border-gray-700'} lg:col-span-2 relative overflow-hidden transition-all`}>
            
            {isPaused && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Service Paused
                </div>
            )}

            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-6">
                {t('billing.overview.aiCredits')}
            </h3>

            <div className="space-y-6">
                {/* Base Plan Usage */}
                <div className={isPaused ? 'opacity-50 grayscale' : ''}>
                    <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-gray-700 dark:text-gray-200">Plan Allowance</span>
                        <span className="text-gray-500">{usage.aiCredits.used.toLocaleString()} / {usage.aiCredits.limit.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(usage.aiCredits.percent, 100)}%` }}></div>
                    </div>
                </div>

                {/* Overage Control Section */}
                <div className={`p-4 rounded-lg border transition-colors duration-300 ${isPaused ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800'}`}>
                    <div className="flex justify-between items-center mb-3">
                        <h4 className={`font-bold text-sm ${isPaused ? 'text-red-800 dark:text-red-300' : 'text-purple-900 dark:text-purple-200'}`}>
                            {t('billing.flexBudget.title')}
                        </h4>
                        <ToggleSwitch 
                            id="overage-toggle" 
                            checked={usage.overage.isEnabled} 
                            onChange={(e) => handleToggle(e.target.checked)}
                        />
                    </div>
                    <p className={`text-xs mb-4 ${isPaused ? 'text-red-700 dark:text-red-300' : 'text-purple-700 dark:text-purple-300'}`}>
                        {t('billing.flexBudget.description')}
                    </p>

                    {usage.overage.isEnabled && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <div className={`flex justify-between text-xs font-medium mb-1 ${isPaused ? 'text-red-800 dark:text-red-200' : 'text-purple-800 dark:text-purple-200'}`}>
                                    <span>{t('billing.flexBudget.currentUsage')}</span>
                                    <span>€{usage.overage.currentUsageCost.toFixed(2)} / €{usage.overage.monthlyBudgetCap.toFixed(2)}</span>
                                </div>
                                <div className={`w-full rounded-full h-2 ${isPaused ? 'bg-red-200 dark:bg-red-800' : 'bg-purple-200 dark:bg-purple-800'}`}>
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-500 ${overagePercent >= 100 ? 'bg-red-600 animate-pulse' : overagePercent > 80 ? 'bg-amber-500' : 'bg-green-500'}`} 
                                        style={{ width: `${Math.min(overagePercent, 100)}%` }}
                                    ></div>
                                </div>
                                {overagePercent >= 80 && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-bold">
                                        {overagePercent >= 100 
                                            ? t('billing.alerts.limitReached') 
                                            : t('billing.flexBudget.alert', { percent: overagePercent.toFixed(0) })
                                        }
                                    </p>
                                )}
                            </div>

                            <div className={`flex items-center gap-4 pt-2 border-t ${isPaused ? 'border-red-200 dark:border-red-800' : 'border-purple-200 dark:border-purple-800'}`}>
                                <div className="flex-grow">
                                    <label className={`block text-xs font-bold mb-1 ${isPaused ? 'text-red-900 dark:text-red-200' : 'text-purple-900 dark:text-purple-200'}`}>
                                        {t('billing.flexBudget.budgetCap')}
                                    </label>
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <span className="text-sm self-center font-mono">€</span>
                                            <input 
                                                type="number" 
                                                value={tempCap}
                                                onChange={(e) => setTempCap(parseFloat(e.target.value))}
                                                className="w-full p-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-lg font-mono font-bold text-gray-800 dark:text-white">
                                            €{usage.overage.monthlyBudgetCap.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <button 
                                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                                    className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-600 hover:bg-purple-50'}`}
                                >
                                    {isEditing ? t('common.save') : t('common.edit')}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {t('billing.flexBudget.budgetCapDesc')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreditUsageCard;
