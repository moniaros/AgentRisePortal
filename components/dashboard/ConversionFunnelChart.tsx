import React from 'react';
import { ResponsiveContainer, FunnelChart, Funnel, Tooltip, LabelList, Cell } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';

interface ConversionFunnelChartProps {
    data: {
        leads: number;
        quotesIssued: number;
        policiesBound: number;
    };
}

const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({ data }) => {
    const { t } = useLocalization();

    const chartData = [
        {
            value: data.leads,
            name: t('dashboard.newLeads'),
            fill: '#3b82f6',
        },
        {
            value: data.quotesIssued,
            name: t('dashboard.quotes'),
            fill: '#8b5cf6',
        },
        {
            value: data.policiesBound,
            name: t('dashboard.policies'),
            fill: '#10b981',
        },
    ];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const current = payload[0];
            const currentIndex = chartData.findIndex(d => d.name === current.payload.name);
            const previousValue = currentIndex > 0 ? chartData[currentIndex - 1].value : chartData[0].value;
            const conversionRate = previousValue > 0 ? ((current.value / previousValue) * 100).toFixed(1) : 100;

            return (
                <div className="bg-gray-800 bg-opacity-80 p-3 rounded-md border border-gray-600 text-white text-sm">
                    <p className="font-bold">{`${current.name}: ${current.value}`}</p>
                    {currentIndex > 0 && <p>{`Conversion: ${conversionRate}%`}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md h-96">
            <h3 className="text-lg font-semibold mb-4 text-center">{t('dashboard.leadToPolicyFunnel')}</h3>
            <ResponsiveContainer width="100%" height="85%">
                <FunnelChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Funnel
                        dataKey="value"
                        data={chartData}
                        isAnimationActive
                        lastShapeType="rectangle"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                         <LabelList
                            position="inside"
                            fill="#fff"
                            stroke="none"
                            dataKey="value"
                            formatter={(value: number, entry: any) => {
                                const currentIndex = chartData.findIndex(d => d.name === entry.name);
                                const previousValue = currentIndex > 0 ? chartData[currentIndex - 1].value : chartData[0].value;
                                const conversionRate = previousValue > 0 ? ((value / previousValue) * 100) : 100;
                                
                                let text = `${entry.name}: ${value}`;
                                if (currentIndex > 0) {
                                    text += ` (${conversionRate.toFixed(0)}%)`;
                                }
                                return text;
                            }}
                            className="font-bold text-base drop-shadow-md"
                        />
                    </Funnel>
                </FunnelChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ConversionFunnelChart;
