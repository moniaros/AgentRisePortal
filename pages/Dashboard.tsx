
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLocalization } from '../hooks/useLocalization';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { fetchDashboardData } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard: React.FC = () => {
  const { t } = useLocalization();
  const { data, isLoading, error } = useOfflineSync('dashboardData', fetchDashboardData, {
      newLeadsCount: 0,
      monthlyRevenue: 0,
      policyDistribution: [],
  });
  
  const revenueData = [
    { name: t('dashboard.monthlyRevenue'), value: data?.monthlyRevenue || 0 },
  ];

  if (isLoading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="text-red-500 text-center">{error.message}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('dashboard.title')}</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.newLeads')}</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{data?.newLeadsCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.monthlyRevenue')}</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">€{data?.monthlyRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{t('dashboard.revenueTitle')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name={t('dashboard.monthlyRevenue')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{t('dashboard.policyTitle')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.policyDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${t(`policyTypes.${name}`)} ${(percent * 100).toFixed(0)}%`}
              >
                {data?.policyDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, t(`policyTypes.${name}`)]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
