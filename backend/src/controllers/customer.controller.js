import { query, transaction } from '../config/database.js';

/**
 * Get all customers with filtering and pagination
 */
export const getCustomers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      assignedAgent,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    // Build WHERE clause
    if (status) {
      conditions.push('c.status = ?');
      params.push(status);
    }

    if (assignedAgent) {
      conditions.push('c.assigned_agent_id = ?');
      params.push(assignedAgent);
    }

    if (search) {
      conditions.push('(c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM customers c ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = countResult[0].total;

    // Get customers
    const customersQuery = `
      SELECT
        c.*,
        u.first_name as agent_first_name,
        u.last_name as agent_last_name,
        u.email as agent_email,
        COUNT(DISTINCT p.id) as policy_count
      FROM customers c
      LEFT JOIN users u ON c.assigned_agent_id = u.id
      LEFT JOIN policies p ON c.id = p.customer_id AND p.status = 'active'
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const customers = await query(customersQuery, [...params, parseInt(limit), offset]);

    // Format response
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      dateOfBirth: customer.date_of_birth,
      address: {
        street: customer.address_street,
        city: customer.address_city,
        state: customer.address_state,
        zip: customer.address_zip
      },
      status: customer.status,
      customerSince: customer.customer_since,
      totalPremium: parseFloat(customer.total_premium),
      lifetimeValue: parseFloat(customer.lifetime_value),
      policyCount: customer.policy_count,
      assignedAgent: customer.assigned_agent_id ? {
        id: customer.assigned_agent_id,
        firstName: customer.agent_first_name,
        lastName: customer.agent_last_name,
        email: customer.agent_email
      } : null,
      communicationPreference: customer.communication_preference,
      attentionFlag: Boolean(customer.attention_flag),
      attentionReason: customer.attention_reason,
      tags: customer.tags ? JSON.parse(customer.tags) : [],
      customFields: customer.custom_fields ? JSON.parse(customer.custom_fields) : {},
      gdprConsent: {
        provided: Boolean(customer.gdpr_consent_provided),
        date: customer.gdpr_consent_date,
        channel: customer.gdpr_consent_channel
      },
      marketingConsent: {
        provided: Boolean(customer.marketing_consent_provided),
        date: customer.marketing_consent_date,
        channel: customer.marketing_consent_channel
      },
      createdAt: customer.created_at,
      updatedAt: customer.updated_at
    }));

    res.status(200).json({
      success: true,
      data: {
        customers: formattedCustomers,
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

/**
 * Get single customer by ID with full details
 */
export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customers = await query(
      `SELECT
        c.*,
        u.first_name as agent_first_name,
        u.last_name as agent_last_name,
        u.email as agent_email
      FROM customers c
      LEFT JOIN users u ON c.assigned_agent_id = u.id
      WHERE c.id = ?`,
      [id]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const customer = customers[0];

    // Get policies
    const policies = await query(
      'SELECT * FROM policies WHERE customer_id = ? ORDER BY created_at DESC',
      [id]
    );

    // Get timeline entries
    const timeline = await query(
      `SELECT
        t.*,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name
      FROM timeline_entries t
      LEFT JOIN users u ON t.created_by_user_id = u.id
      WHERE t.customer_id = ?
      ORDER BY t.entry_date DESC
      LIMIT 50`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        dateOfBirth: customer.date_of_birth,
        address: {
          street: customer.address_street,
          city: customer.address_city,
          state: customer.address_state,
          zip: customer.address_zip
        },
        status: customer.status,
        customerSince: customer.customer_since,
        totalPremium: parseFloat(customer.total_premium),
        lifetimeValue: parseFloat(customer.lifetime_value),
        assignedAgent: customer.assigned_agent_id ? {
          id: customer.assigned_agent_id,
          firstName: customer.agent_first_name,
          lastName: customer.agent_last_name,
          email: customer.agent_email
        } : null,
        communicationPreference: customer.communication_preference,
        attentionFlag: Boolean(customer.attention_flag),
        attentionReason: customer.attention_reason,
        tags: customer.tags ? JSON.parse(customer.tags) : [],
        customFields: customer.custom_fields ? JSON.parse(customer.custom_fields) : {},
        gdprConsent: {
          provided: Boolean(customer.gdpr_consent_provided),
          date: customer.gdpr_consent_date,
          channel: customer.gdpr_consent_channel
        },
        marketingConsent: {
          provided: Boolean(customer.marketing_consent_provided),
          date: customer.marketing_consent_date,
          channel: customer.marketing_consent_channel
        },
        policies: policies.map(p => ({
          id: p.id,
          policyNumber: p.policy_number,
          policyType: p.policy_type,
          insurer: p.insurer,
          status: p.status,
          effectiveDate: p.effective_date,
          expirationDate: p.expiration_date,
          premiumAmount: parseFloat(p.premium_amount),
          coverageAmount: parseFloat(p.coverage_amount)
        })),
        timeline: timeline.map(t => ({
          id: t.id,
          entryType: t.entry_type,
          title: t.title,
          description: t.description,
          entryDate: t.entry_date,
          createdBy: t.created_by_user_id ? {
            id: t.created_by_user_id,
            firstName: t.created_by_first_name,
            lastName: t.created_by_last_name
          } : null,
          metadata: t.metadata ? JSON.parse(t.metadata) : {}
        })),
        createdAt: customer.created_at,
        updatedAt: customer.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new customer
 */
export const createCustomer = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      customerSince,
      assignedAgentId,
      communicationPreference,
      tags,
      customFields
    } = req.body;

    const result = await query(
      `INSERT INTO customers (
        first_name, last_name, email, phone, date_of_birth,
        address_street, address_city, address_state, address_zip,
        customer_since, assigned_agent_id, communication_preference,
        tags, custom_fields
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        address?.street,
        address?.city,
        address?.state,
        address?.zip,
        customerSince || new Date(),
        assignedAgentId || req.user.id,
        communicationPreference || 'email',
        tags ? JSON.stringify(tags) : null,
        customFields ? JSON.stringify(customFields) : null
      ]
    );

    // Create timeline entry
    await query(
      `INSERT INTO timeline_entries (customer_id, entry_type, title, description, created_by_user_id)
       VALUES (?, 'note', 'Customer created', 'Customer record created in system', ?)`,
      [result.insertId, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update customer
 */
export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];

    // Build dynamic update query
    const allowedFields = {
      firstName: 'first_name',
      lastName: 'last_name',
      email: 'email',
      phone: 'phone',
      dateOfBirth: 'date_of_birth',
      status: 'status',
      assignedAgentId: 'assigned_agent_id',
      communicationPreference: 'communication_preference',
      attentionFlag: 'attention_flag',
      attentionReason: 'attention_reason',
      tags: 'tags',
      customFields: 'custom_fields',
      gdprConsentProvided: 'gdpr_consent_provided',
      gdprConsentDate: 'gdpr_consent_date',
      gdprConsentChannel: 'gdpr_consent_channel',
      marketingConsentProvided: 'marketing_consent_provided',
      marketingConsentDate: 'marketing_consent_date',
      marketingConsentChannel: 'marketing_consent_channel'
    };

    Object.keys(req.body).forEach(key => {
      if (allowedFields[key]) {
        updates.push(`${allowedFields[key]} = ?`);
        let value = req.body[key];
        if (key === 'tags' || key === 'customFields') {
          value = JSON.stringify(value);
        }
        values.push(value);
      }
    });

    // Handle address fields
    if (req.body.address) {
      if (req.body.address.street !== undefined) {
        updates.push('address_street = ?');
        values.push(req.body.address.street);
      }
      if (req.body.address.city !== undefined) {
        updates.push('address_city = ?');
        values.push(req.body.address.city);
      }
      if (req.body.address.state !== undefined) {
        updates.push('address_state = ?');
        values.push(req.body.address.state);
      }
      if (req.body.address.zip !== undefined) {
        updates.push('address_zip = ?');
        values.push(req.body.address.zip);
      }
    }

    // Handle GDPR consent fields
    if (req.body.gdprConsent) {
      if (req.body.gdprConsent.provided !== undefined) {
        updates.push('gdpr_consent_provided = ?');
        values.push(req.body.gdprConsent.provided);
      }
      if (req.body.gdprConsent.date !== undefined) {
        updates.push('gdpr_consent_date = ?');
        values.push(req.body.gdprConsent.date);
      }
      if (req.body.gdprConsent.channel !== undefined) {
        updates.push('gdpr_consent_channel = ?');
        values.push(req.body.gdprConsent.channel);
      }
    }

    // Handle marketing consent fields
    if (req.body.marketingConsent) {
      if (req.body.marketingConsent.provided !== undefined) {
        updates.push('marketing_consent_provided = ?');
        values.push(req.body.marketingConsent.provided);
      }
      if (req.body.marketingConsent.date !== undefined) {
        updates.push('marketing_consent_date = ?');
        values.push(req.body.marketingConsent.date);
      }
      if (req.body.marketingConsent.channel !== undefined) {
        updates.push('marketing_consent_channel = ?');
        values.push(req.body.marketingConsent.channel);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    values.push(id);

    await query(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete customer
 */
export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customers = await query('SELECT id FROM customers WHERE id = ?', [id]);

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Delete customer (cascades to policies and timeline)
    await query('DELETE FROM customers WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add timeline entry for customer
 */
export const addTimelineEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { entryType, title, description, metadata } = req.body;

    // Check if customer exists
    const customers = await query('SELECT id FROM customers WHERE id = ?', [id]);

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const result = await query(
      `INSERT INTO timeline_entries (customer_id, entry_type, title, description, created_by_user_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, entryType, title, description, req.user.id, metadata ? JSON.stringify(metadata) : null]
    );

    res.status(201).json({
      success: true,
      message: 'Timeline entry added successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    next(error);
  }
};
