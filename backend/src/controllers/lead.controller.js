import { query } from '../config/database.js';

export const getLeads = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, source, assignedAgent, search } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (source) {
      conditions.push('source = ?');
      params.push(source);
    }
    if (assignedAgent) {
      conditions.push('assigned_agent_id = ?');
      params.push(assignedAgent);
    }
    if (search) {
      conditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await query(`SELECT COUNT(*) as total FROM leads ${whereClause}`, params);
    const total = countResult[0].total;

    const leads = await query(
      `SELECT l.*, u.first_name as agent_first_name, u.last_name as agent_last_name
       FROM leads l
       LEFT JOIN users u ON l.assigned_agent_id = u.id
       ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.status(200).json({
      success: true,
      data: {
        leads: leads.map(l => ({
          id: l.id,
          firstName: l.first_name,
          lastName: l.last_name,
          email: l.email,
          phone: l.phone,
          source: l.source,
          status: l.status,
          interest: l.interest,
          score: l.score,
          notes: l.notes,
          assignedAgent: l.assigned_agent_id ? {
            id: l.assigned_agent_id,
            firstName: l.agent_first_name,
            lastName: l.agent_last_name
          } : null,
          createdAt: l.created_at,
          contactedAt: l.contacted_at,
          convertedAt: l.converted_at
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          pageSize: parseInt(limit),
          totalRecords: total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leads = await query('SELECT * FROM leads WHERE id = ?', [id]);

    if (leads.length === 0) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.status(200).json({ success: true, data: leads[0] });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, source, interest, notes } = req.body;

    const result = await query(
      `INSERT INTO leads (first_name, last_name, email, phone, source, interest, notes, assigned_agent_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, phone, source, interest, notes, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];

    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'status', 'interest', 'score', 'notes', 'assignedAgentId'];
    const fieldMap = {
      firstName: 'first_name',
      lastName: 'last_name',
      assignedAgentId: 'assigned_agent_id'
    };

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        const dbField = fieldMap[key] || key.toLowerCase();
        updates.push(`${dbField} = ?`);
        values.push(req.body[key]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    values.push(id);
    await query(`UPDATE leads SET ${updates.join(', ')} WHERE id = ?`, values);

    res.status(200).json({ success: true, message: 'Lead updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM leads WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const convertLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customerData } = req.body;

    // Get lead data
    const leads = await query('SELECT * FROM leads WHERE id = ?', [id]);
    if (leads.length === 0) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const lead = leads[0];

    // Create customer
    const customerResult = await query(
      `INSERT INTO customers (first_name, last_name, email, phone, assigned_agent_id, customer_since)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        customerData.firstName || lead.first_name,
        customerData.lastName || lead.last_name,
        customerData.email || lead.email,
        customerData.phone || lead.phone,
        lead.assigned_agent_id
      ]
    );

    // Update lead
    await query(
      'UPDATE leads SET status = ?, converted_customer_id = ?, converted_at = NOW() WHERE id = ?',
      ['converted', customerResult.insertId, id]
    );

    res.status(200).json({
      success: true,
      message: 'Lead converted to customer successfully',
      data: { customerId: customerResult.insertId }
    });
  } catch (error) {
    next(error);
  }
};
