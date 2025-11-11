import { query } from '../config/database.js';

export const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await query('SELECT * FROM campaigns ORDER BY created_at DESC');
    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
};

export const getCampaignById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const campaigns = await query('SELECT * FROM campaigns WHERE id = ?', [id]);
    if (campaigns.length === 0) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    res.status(200).json({ success: true, data: campaigns[0] });
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const { name, objective, platforms, targetAudience, budget, budgetType, startDate, endDate, creativeData, leadFormData } = req.body;
    const result = await query(
      `INSERT INTO campaigns (name, objective, platforms, target_audience, budget, budget_type, start_date, end_date, creative_data, lead_form_data, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, objective, JSON.stringify(platforms), JSON.stringify(targetAudience), budget, budgetType, startDate, endDate, JSON.stringify(creativeData), JSON.stringify(leadFormData), req.user.id]
    );
    res.status(201).json({ success: true, message: 'Campaign created', data: { id: result.insertId } });
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowedFields = ['name', 'objective', 'status', 'platforms', 'budget', 'startDate', 'endDate'];
    const updates = [];
    const values = [];

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        const dbField = key === 'startDate' ? 'start_date' : key === 'endDate' ? 'end_date' : key;
        updates.push(`${dbField} = ?`);
        values.push(typeof req.body[key] === 'object' ? JSON.stringify(req.body[key]) : req.body[key]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    values.push(id);
    await query(`UPDATE campaigns SET ${updates.join(', ')} WHERE id = ?`, values);
    res.status(200).json({ success: true, message: 'Campaign updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM campaigns WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    next(error);
  }
};
