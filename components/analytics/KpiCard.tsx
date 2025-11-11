import React from 'react';

interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    variant?: 'default' | 'danger';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, variant = 'default' }) => {
  
  const baseClasses = "p-4 rounded-lg shadow-md";
  const variantClasses = {
    default: "bg-white dark:bg-gray-800",
    danger: "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800",
  };
  
  const titleClasses = {
      default: "text-gray-500 dark:text-gray-400",
      danger: "text-red-600 dark:text-red-300",
  };
  
  const valueClasses = {
      default: "text-gray-900 dark:text-white",
      danger: "text-red-800 dark:text-red-200",
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
        <h3 className={`text-sm font-medium truncate ${titleClasses[variant]}`}>{title}</h3>
        <p className={`mt-1 text-3xl font-semibold ${valueClasses[variant]}`}>{value}</p>
        {subtitle && <p className={`text-xs mt-2 ${titleClasses[variant]}`}>{subtitle}</p>}
    </div>
  );
};

export default KpiCard;