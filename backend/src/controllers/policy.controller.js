import { query } from '../config/database.js';

export const getPolicies = async (req, res, next) => {
  try {
    const { customerId, policyType, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (customerId) {
      conditions.push('customer_id = ?');
      params.push(customerId);
    }
    if (policyType) {
      conditions.push('policy_type = ?');
      params.push(policyType);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const policies = await query(
      `SELECT p.*, c.first_name, c.last_name, c.email
       FROM policies p
       JOIN customers c ON p.customer_id = c.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.status(200).json({ success: true, data: { policies } });
  } catch (error) {
    next(error);
  }
};

export const getPolicyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const policies = await query(
      `SELECT p.*, c.first_name, c.last_name, c.email
       FROM policies p
       JOIN customers c ON p.customer_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (policies.length === 0) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    // Get coverages
    const coverages = await query('SELECT * FROM policy_coverages WHERE policy_id = ?', [id]);

    res.status(200).json({
      success: true,
      data: {
        ...policies[0],
        coverages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createPolicy = async (req, res, next) => {
  try {
    const {
      customerId,
      policyNumber,
      policyType,
      insurer,
      effectiveDate,
      expirationDate,
      premiumAmount,
      premiumFrequency,
      coverageAmount,
      deductible,
      policyDetails,
      acordData,
      coverages
    } = req.body;

    const result = await query(
      `INSERT INTO policies (
        customer_id, policy_number, policy_type, insurer, status,
        effective_date, expiration_date, premium_amount, premium_frequency,
        coverage_amount, deductible, policy_details, acord_data
      ) VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId, policyNumber, policyType, insurer,
        effectiveDate, expirationDate, premiumAmount, premiumFrequency,
        coverageAmount, deductible,
        policyDetails ? JSON.stringify(policyDetails) : null,
        acordData ? JSON.stringify(acordData) : null
      ]
    );

    const policyId = result.insertId;

    // Add coverages if provided
    if (coverages && Array.isArray(coverages)) {
      for (const coverage of coverages) {
        await query(
          `INSERT INTO policy_coverages (policy_id, coverage_type, coverage_limit, deductible, description)
           VALUES (?, ?, ?, ?, ?)`,
          [policyId, coverage.type, coverage.limit, coverage.deductible, coverage.description]
        );
      }
    }

    // Create timeline entry for customer
    await query(
      `INSERT INTO timeline_entries (customer_id, entry_type, title, description, created_by_user_id)
       VALUES (?, 'policy_change', 'New Policy Added', ?, ?)`,
      [customerId, `Policy ${policyNumber} (${policyType}) added`, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: { id: policyId }
    });
  } catch (error) {
    next(error);
  }
};

export const updatePolicy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];

    const allowedFields = {
      status: 'status',
      premiumAmount: 'premium_amount',
      expirationDate: 'expiration_date',
      coverageAmount: 'coverage_amount',
      deductible: 'deductible',
      policyDetails: 'policy_details',
      acordData: 'acord_data'
    };

    Object.keys(req.body).forEach(key => {
      if (allowedFields[key]) {
        updates.push(`${allowedFields[key]} = ?`);
        let value = req.body[key];
        if (key === 'policyDetails' || key === 'acordData') {
          value = JSON.stringify(value);
        }
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    values.push(id);
    await query(`UPDATE policies SET ${updates.join(', ')} WHERE id = ?`, values);

    res.status(200).json({ success: true, message: 'Policy updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deletePolicy = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM policies WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Policy deleted successfully' });
  } catch (error) {
    next(error);
  }
};
