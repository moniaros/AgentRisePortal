import { query } from '../config/database.js';

/**
 * Get all opportunities (for Kanban board)
 */
export const getOpportunities = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 100,
      stage,
      agentId,
      search,
      sortBy = 'updated_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    // Multi-tenant filter
    conditions.push('o.tenant_id = ?');
    params.push(req.user.tenantId || 1);

    // Filter by agent (default to current user unless admin viewing all)
    if (agentId) {
      conditions.push('o.agent_id = ?');
      params.push(agentId);
    } else if (req.user.role !== 'admin') {
      conditions.push('o.agent_id = ?');
      params.push(req.user.id);
    }

    // Filter by stage
    if (stage && stage !== 'all') {
      conditions.push('o.stage = ?');
      params.push(stage);
    }

    // Search
    if (search) {
      conditions.push('(o.title LIKE ? OR o.prospect_name LIKE ? OR o.prospect_email LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM opportunities o ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = countResult[0].total;

    // Get opportunities
    const opportunitiesQuery = `
      SELECT
        o.*,
        u.first_name as agent_first_name,
        u.last_name as agent_last_name,
        u.email as agent_email,
        (SELECT COUNT(*) FROM interactions WHERE opportunity_id = o.id) as interaction_count
      FROM opportunities o
      LEFT JOIN users u ON o.agent_id = u.id
      ${whereClause}
      ORDER BY o.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const opportunities = await query(opportunitiesQuery, [...params, parseInt(limit), offset]);

    // Format response
    const formattedOpportunities = opportunities.map(opp => ({
      id: opp.id,
      title: opp.title,
      description: opp.description,
      prospectName: opp.prospect_name,
      prospectEmail: opp.prospect_email,
      prospectPhone: opp.prospect_phone,
      prospectType: opp.prospect_type,
      prospectId: opp.prospect_id,
      estimatedValue: parseFloat(opp.estimated_value),
      probability: opp.probability,
      stage: opp.stage,
      stageChangedAt: opp.stage_changed_at,
      previousStage: opp.previous_stage,
      nextFollowUpDate: opp.next_follow_up_date,
      lastContactDate: opp.last_contact_date,
      isOverdue: opp.next_follow_up_date && new Date(opp.next_follow_up_date) < new Date(),
      wonDate: opp.won_date,
      lostDate: opp.lost_date,
      lostReason: opp.lost_reason,
      policyType: opp.policy_type,
      actualPremium: opp.actual_premium ? parseFloat(opp.actual_premium) : null,
      sourceInquiryId: opp.source_inquiry_id,
      sourceCampaignId: opp.source_campaign_id,
      assignedAgent: {
        id: opp.agent_id,
        firstName: opp.agent_first_name,
        lastName: opp.agent_last_name,
        email: opp.agent_email
      },
      interactionCount: opp.interaction_count,
      createdAt: opp.created_at,
      updatedAt: opp.updated_at
    }));

    res.status(200).json({
      success: true,
      data: {
        opportunities: formattedOpportunities,
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
 * Get opportunities grouped by stage (for Kanban)
 */
export const getOpportunitiesByStage = async (req, res, next) => {
  try {
    const { agentId } = req.query;

    const conditions = ['o.tenant_id = ?'];
    const params = [req.user.tenantId || 1];

    // Filter by agent
    if (agentId) {
      conditions.push('o.agent_id = ?');
      params.push(agentId);
    } else if (req.user.role !== 'admin') {
      conditions.push('o.agent_id = ?');
      params.push(req.user.id);
    }

    // Exclude won and lost from main pipeline view
    conditions.push('o.stage NOT IN (?, ?)');
    params.push('won', 'lost');

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const opportunitiesQuery = `
      SELECT
        o.*,
        u.first_name as agent_first_name,
        u.last_name as agent_last_name,
        (SELECT COUNT(*) FROM interactions WHERE opportunity_id = o.id) as interaction_count
      FROM opportunities o
      LEFT JOIN users u ON o.agent_id = u.id
      ${whereClause}
      ORDER BY o.next_follow_up_date ASC, o.updated_at DESC
    `;

    const opportunities = await query(opportunitiesQuery, params);

    // Group by stage
    const stages = {
      new: [],
      contacted: [],
      proposal: []
    };

    opportunities.forEach(opp => {
      const formattedOpp = {
        id: opp.id,
        title: opp.title,
        description: opp.description,
        prospectName: opp.prospect_name,
        prospectEmail: opp.prospect_email,
        prospectPhone: opp.prospect_phone,
        estimatedValue: parseFloat(opp.estimated_value),
        probability: opp.probability,
        stage: opp.stage,
        nextFollowUpDate: opp.next_follow_up_date,
        lastContactDate: opp.last_contact_date,
        isOverdue: opp.next_follow_up_date && new Date(opp.next_follow_up_date) < new Date(),
        policyType: opp.policy_type,
        assignedAgent: {
          id: opp.agent_id,
          firstName: opp.agent_first_name,
          lastName: opp.agent_last_name
        },
        interactionCount: opp.interaction_count,
        createdAt: opp.created_at,
        updatedAt: opp.updated_at
      };

      if (stages[opp.stage]) {
        stages[opp.stage].push(formattedOpp);
      }
    });

    res.status(200).json({
      success: true,
      data: stages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single opportunity with full details
 */
export const getOpportunityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const opportunities = await query(
      `SELECT
        o.*,
        u.first_name as agent_first_name,
        u.last_name as agent_last_name,
        u.email as agent_email,
        i.first_name as inquiry_first_name,
        i.last_name as inquiry_last_name,
        i.email as inquiry_email
      FROM opportunities o
      LEFT JOIN users u ON o.agent_id = u.id
      LEFT JOIN transaction_inquiries i ON o.source_inquiry_id = i.id
      WHERE o.id = ? AND o.tenant_id = ?`,
      [id, req.user.tenantId || 1]
    );

    if (opportunities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    const opp = opportunities[0];

    res.status(200).json({
      success: true,
      data: {
        id: opp.id,
        title: opp.title,
        description: opp.description,
        prospectName: opp.prospect_name,
        prospectEmail: opp.prospect_email,
        prospectPhone: opp.prospect_phone,
        prospectType: opp.prospect_type,
        prospectId: opp.prospect_id,
        estimatedValue: parseFloat(opp.estimated_value),
        probability: opp.probability,
        stage: opp.stage,
        stageChangedAt: opp.stage_changed_at,
        previousStage: opp.previous_stage,
        nextFollowUpDate: opp.next_follow_up_date,
        lastContactDate: opp.last_contact_date,
        wonDate: opp.won_date,
        lostDate: opp.lost_date,
        lostReason: opp.lost_reason,
        policyType: opp.policy_type,
        policyId: opp.policy_id,
        actualPremium: opp.actual_premium ? parseFloat(opp.actual_premium) : null,
        sourceInquiryId: opp.source_inquiry_id,
        sourceCampaignId: opp.source_campaign_id,
        sourceInquiry: opp.source_inquiry_id ? {
          id: opp.source_inquiry_id,
          firstName: opp.inquiry_first_name,
          lastName: opp.inquiry_last_name,
          email: opp.inquiry_email
        } : null,
        assignedAgent: {
          id: opp.agent_id,
          firstName: opp.agent_first_name,
          lastName: opp.agent_last_name,
          email: opp.agent_email
        },
        createdAt: opp.created_at,
        updatedAt: opp.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new opportunity
 */
export const createOpportunity = async (req, res, next) => {
  try {
    const {
      title,
      description,
      prospectName,
      prospectEmail,
      prospectPhone,
      prospectType,
      prospectId,
      estimatedValue,
      probability,
      policyType,
      nextFollowUpDate,
      sourceInquiryId,
      sourceCampaignId
    } = req.body;

    const result = await query(
      `INSERT INTO opportunities (
        tenant_id, agent_id, title, description,
        prospect_name, prospect_email, prospect_phone,
        prospect_type, prospect_id,
        estimated_value, probability, policy_type,
        next_follow_up_date, source_inquiry_id, source_campaign_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.tenantId || 1,
        req.user.id,
        title,
        description,
        prospectName,
        prospectEmail,
        prospectPhone,
        prospectType || 'inquiry',
        prospectId,
        estimatedValue || 0,
        probability || 50,
        policyType,
        nextFollowUpDate,
        sourceInquiryId,
        sourceCampaignId
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update opportunity
 */
export const updateOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];

    const allowedFields = {
      title: 'title',
      description: 'description',
      estimatedValue: 'estimated_value',
      probability: 'probability',
      nextFollowUpDate: 'next_follow_up_date',
      policyType: 'policy_type'
    };

    Object.keys(req.body).forEach(key => {
      if (allowedFields[key]) {
        updates.push(`${allowedFields[key]} = ?`);
        values.push(req.body[key]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    values.push(id, req.user.tenantId || 1);

    await query(
      `UPDATE opportunities SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`,
      values
    );

    res.status(200).json({
      success: true,
      message: 'Opportunity updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update opportunity stage (for Kanban drag-drop)
 */
export const updateOpportunityStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage, lostReason, actualPremium, policyId } = req.body;

    // Get current opportunity
    const opportunities = await query(
      'SELECT * FROM opportunities WHERE id = ? AND tenant_id = ?',
      [id, req.user.tenantId || 1]
    );

    if (opportunities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    const currentStage = opportunities[0].stage;
    const updateData = {
      stage,
      previous_stage: currentStage,
      stage_changed_at: new Date(),
      last_contact_date: new Date()
    };

    // Handle won stage
    if (stage === 'won') {
      updateData.won_date = new Date();
      updateData.closed_by_user_id = req.user.id;
      if (actualPremium) updateData.actual_premium = actualPremium;
      if (policyId) updateData.policy_id = policyId;

      // Create conversion event
      await query(
        `INSERT INTO conversion_events (
          tenant_id, opportunity_id, agent_id, conversion_type,
          conversion_value, policy_id, policy_type, annual_premium,
          source_inquiry_id, source_campaign_id
        ) SELECT
          tenant_id, id, agent_id, 'opportunity_to_policy',
          estimated_value, ?, policy_type, ?,
          source_inquiry_id, source_campaign_id
        FROM opportunities WHERE id = ?`,
        [policyId, actualPremium, id]
      );
    }

    // Handle lost stage
    if (stage === 'lost') {
      updateData.lost_date = new Date();
      updateData.lost_reason = lostReason;
      updateData.closed_by_user_id = req.user.id;
    }

    // Build update query
    const fields = Object.keys(updateData);
    const updateQuery = `
      UPDATE opportunities
      SET ${fields.map(f => `${f} = ?`).join(', ')}
      WHERE id = ? AND tenant_id = ?
    `;

    await query(updateQuery, [...Object.values(updateData), id, req.user.tenantId || 1]);

    res.status(200).json({
      success: true,
      message: 'Opportunity stage updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get "My Day" dashboard - opportunities by follow-up status
 */
export const getMyDayOpportunities = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const conditions = [
      'o.tenant_id = ?',
      'o.agent_id = ?',
      'o.stage NOT IN (?, ?)'
    ];
    const params = [
      req.user.tenantId || 1,
      req.user.id,
      'won',
      'lost'
    ];

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const opportunitiesQuery = `
      SELECT
        o.*,
        (SELECT COUNT(*) FROM interactions WHERE opportunity_id = o.id) as interaction_count,
        CASE
          WHEN o.next_follow_up_date < ? THEN 'overdue'
          WHEN o.next_follow_up_date = ? THEN 'today'
          WHEN o.next_follow_up_date IS NULL THEN 'no_date'
          ELSE 'future'
        END as follow_up_category
      FROM opportunities o
      ${whereClause}
      ORDER BY
        CASE
          WHEN o.next_follow_up_date < ? THEN 1
          WHEN o.next_follow_up_date = ? THEN 2
          WHEN o.next_follow_up_date IS NULL THEN 4
          ELSE 3
        END,
        o.next_follow_up_date ASC,
        o.updated_at DESC
    `;

    const opportunities = await query(opportunitiesQuery, [
      today, today, ...params, today, today
    ]);

    // Categorize opportunities
    const categorized = {
      overdue: [],
      today: [],
      noDate: [],
      future: []
    };

    opportunities.forEach(opp => {
      const formattedOpp = {
        id: opp.id,
        title: opp.title,
        prospectName: opp.prospect_name,
        estimatedValue: parseFloat(opp.estimated_value),
        stage: opp.stage,
        nextFollowUpDate: opp.next_follow_up_date,
        lastContactDate: opp.last_contact_date,
        policyType: opp.policy_type,
        interactionCount: opp.interaction_count
      };

      if (opp.follow_up_category === 'overdue') {
        categorized.overdue.push(formattedOpp);
      } else if (opp.follow_up_category === 'today') {
        categorized.today.push(formattedOpp);
      } else if (opp.follow_up_category === 'no_date') {
        categorized.noDate.push(formattedOpp);
      } else {
        categorized.future.push(formattedOpp);
      }
    });

    res.status(200).json({
      success: true,
      data: categorized
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete opportunity
 */
export const deleteOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;

    await query(
      'DELETE FROM opportunities WHERE id = ? AND tenant_id = ?',
      [id, req.user.tenantId || 1]
    );

    res.status(200).json({
      success: true,
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
