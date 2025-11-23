import React from 'react';

interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    variant?: 'default' | 'danger' | 'info' | 'success';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, variant = 'default' }) => {
  
  const variantStyles = {
    default: {
        bg: "bg-white dark:bg-slate-800",
        border: "border-slate-200 dark:border-slate-700",
        iconBg: "bg-slate-100 dark:bg-slate-700",
        iconColor: "text-slate-600 dark:text-slate-400",
        titleColor: "text-slate-500 dark:text-slate-400",
        valueColor: "text-slate-900 dark:text-white",
        subColor: "text-slate-400 dark:text-slate-500",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        )
    },
    danger: {
        bg: "bg-white dark:bg-slate-800",
        border: "border-red-200 dark:border-red-900/50",
        iconBg: "bg-red-50 dark:bg-red-900/30",
        iconColor: "text-red-600 dark:text-red-400",
        titleColor: "text-slate-500 dark:text-slate-400",
        valueColor: "text-slate-900 dark:text-white",
        subColor: "text-red-500 dark:text-red-400",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    info: {
        bg: "bg-white dark:bg-slate-800",
        border: "border-blue-200 dark:border-blue-900/50",
        iconBg: "bg-blue-50 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        titleColor: "text-slate-500 dark:text-slate-400",
        valueColor: "text-slate-900 dark:text-white",
        subColor: "text-blue-500 dark:text-blue-400",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    success: {
        bg: "bg-white dark:bg-slate-800",
        border: "border-green-200 dark:border-green-900/50",
        iconBg: "bg-green-50 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
        titleColor: "text-slate-500 dark:text-slate-400",
        valueColor: "text-slate-900 dark:text-white",
        subColor: "text-green-600 dark:text-green-400",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
  };

  const style = variantStyles[variant];

  return (
    <div className={`${style.bg} rounded-xl border ${style.border} p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start justify-between`}>
        <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${style.titleColor}`}>{title}</h3>
            <p className={`text-2xl font-bold tracking-tight ${style.valueColor}`}>{value}</p>
            {subtitle && <p className={`text-xs font-medium mt-2 ${style.subColor}`}>{subtitle}</p>}
        </div>
        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${style.iconBg} ${style.iconColor} flex-shrink-0`}>
            {style.icon}
        </div>
    </div>
  );
};

export default KpiCard;