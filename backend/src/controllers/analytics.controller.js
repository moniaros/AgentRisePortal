import { query } from '../config/database.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    // Get customer stats
    const customerStats = await query(
      'SELECT COUNT(*) as total, SUM(total_premium) as totalPremium FROM customers WHERE status = "active"'
    );

    // Get policy stats
    const policyStats = await query(
      'SELECT policy_type, COUNT(*) as count, SUM(premium_amount) as premium FROM policies WHERE status = "active" GROUP BY policy_type'
    );

    // Get lead stats
    const leadStats = await query(
      'SELECT status, COUNT(*) as count FROM leads GROUP BY status'
    );

    // Get campaign stats
    const campaignStats = await query(
      'SELECT SUM(impressions) as totalImpressions, SUM(clicks) as totalClicks, SUM(conversions) as totalConversions, SUM(spend) as totalSpend FROM campaigns WHERE status = "active"'
    );

    res.status(200).json({
      success: true,
      data: {
        customers: customerStats[0],
        policies: policyStats,
        leads: leadStats,
        campaigns: campaignStats[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const revenueData = await query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(premium_amount) as revenue
       FROM policies
       WHERE status = 'active' AND created_at BETWEEN ? AND ?
       GROUP BY month
       ORDER BY month`,
      [startDate || '2024-01-01', endDate || '2025-12-31']
    );

    res.status(200).json({ success: true, data: revenueData });
  } catch (error) {
    next(error);
  }
};

export const getLeadFunnelAnalytics = async (req, res, next) => {
  try {
    const funnelData = await query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted,
        SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified,
        SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted,
        SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost
       FROM leads`
    );

    res.status(200).json({ success: true, data: funnelData[0] });
  } catch (error) {
    next(error);
  }
};
