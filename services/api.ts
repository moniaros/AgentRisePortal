import { MOCK_DASHBOARD_DATA, MOCK_PARSED_POLICY, MOCK_ANALYTICS_DATA, MOCK_USERS, MOCK_AUDIT_LOGS } from '../data/mockData';
import { DetailedPolicy, AnalyticsData, User, AuditLog } from '../types';

const simulateNetworkRequest = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise(resolve => {
    // Deep copy to prevent mutations affecting the mock source
    const response = JSON.parse(JSON.stringify(data));
    setTimeout(() => {
      resolve(response);
    }, delay);
  });
};

export const fetchDashboardData = () => {
    return simulateNetworkRequest({
        newLeadsCount: MOCK_DASHBOARD_DATA.newLeadsCount,
        monthlyRevenue: MOCK_DASHBOARD_DATA.monthlyRevenue,
        policyDistribution: MOCK_DASHBOARD_DATA.policyDistribution,
    }, 800);
};

export const fetchParsedPolicy = (): Promise<DetailedPolicy> => {
    return simulateNetworkRequest(MOCK_PARSED_POLICY, 1000);
};

export const fetchAnalyticsData = (): Promise<AnalyticsData> => {
    return simulateNetworkRequest(MOCK_ANALYTICS_DATA, 1200);
};

export const fetchUsers = (): Promise<User[]> => {
    return simulateNetworkRequest(MOCK_USERS, 600);
};

export const fetchAuditLogs = (): Promise<AuditLog[]> => {
    return simulateNetworkRequest(MOCK_AUDIT_LOGS, 700);
};
