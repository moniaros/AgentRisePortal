import { query } from '../config/database.js';

/**
 * Get all interactions for an opportunity
 */
export const getOpportunityInteractions = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify opportunity belongs to user's tenant
    const opportunities = await query(
      'SELECT id FROM opportunities WHERE id = ? AND tenant_id = ?',
      [opportunityId, req.user.tenantId || 1]
    );

    if (opportunities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Get interactions
    const interactions = await query(
      `SELECT
        i.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email
      FROM interactions i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.opportunity_id = ?
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?`,
      [opportunityId, parseInt(limit), parseInt(offset)]
    );

    const formattedInteractions = interactions.map(int => ({
      id: int.id,
      interactionType: int.interaction_type,
      direction: int.direction,
      subject: int.subject,
      content: int.content,
      recipient: int.recipient,
      sentVia: int.sent_via,
      deliveryStatus: int.delivery_status,
      scheduledAt: int.scheduled_at,
      completedAt: int.completed_at,
      attachments: int.attachments ? JSON.parse(int.attachments) : [],
      user: {
        id: int.user_id,
        firstName: int.user_first_name,
        lastName: int.user_last_name,
        email: int.user_email
      },
      createdAt: int.created_at,
      updatedAt: int.updated_at
    }));

    res.status(200).json({
      success: true,
      data: formattedInteractions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new interaction (log communication)
 */
export const createInteraction = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;
    const {
      interactionType,
      direction,
      subject,
      content,
      recipient,
      sentVia,
      deliveryStatus,
      scheduledAt,
      completedAt,
      attachments
    } = req.body;

    // Verify opportunity exists and belongs to user's tenant
    const opportunities = await query(
      'SELECT id FROM opportunities WHERE id = ? AND tenant_id = ?',
      [opportunityId, req.user.tenantId || 1]
    );

    if (opportunities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Create interaction
    const result = await query(
      `INSERT INTO interactions (
        tenant_id, opportunity_id, user_id,
        interaction_type, direction, subject, content,
        recipient, sent_via, delivery_status,
        scheduled_at, completed_at, attachments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.tenantId || 1,
        opportunityId,
        req.user.id,
        interactionType,
        direction || 'outbound',
        subject,
        content,
        recipient,
        sentVia,
        deliveryStatus || 'sent',
        scheduledAt,
        completedAt || new Date(),
        attachments ? JSON.stringify(attachments) : null
      ]
    );

    // Update opportunity last contact date
    await query(
      'UPDATE opportunities SET last_contact_date = ? WHERE id = ?',
      [new Date(), opportunityId]
    );

    res.status(201).json({
      success: true,
      message: 'Interaction logged successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update interaction
 */
export const updateInteraction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];

    const allowedFields = {
      subject: 'subject',
      content: 'content',
      deliveryStatus: 'delivery_status',
      completedAt: 'completed_at'
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
      `UPDATE interactions SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`,
      values
    );

    res.status(200).json({
      success: true,
      message: 'Interaction updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete interaction
 */
export const deleteInteraction = async (req, res, next) => {
  try {
    const { id } = req.params;

    await query(
      'DELETE FROM interactions WHERE id = ? AND tenant_id = ?',
      [id, req.user.tenantId || 1]
    );

    res.status(200).json({
      success: true,
      message: 'Interaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get interaction statistics for an opportunity
 */
export const getInteractionStats = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;

    // Verify opportunity
    const opportunities = await query(
      'SELECT id FROM opportunities WHERE id = ? AND tenant_id = ?',
      [opportunityId, req.user.tenantId || 1]
    );

    if (opportunities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Get statistics
    const stats = await query(
      `SELECT
        interaction_type,
        COUNT(*) as count,
        MAX(created_at) as last_interaction
      FROM interactions
      WHERE opportunity_id = ?
      GROUP BY interaction_type`,
      [opportunityId]
    );

    const formattedStats = {
      total: stats.reduce((sum, stat) => sum + stat.count, 0),
      byType: {}
    };

    stats.forEach(stat => {
      formattedStats.byType[stat.interaction_type] = {
        count: stat.count,
        lastInteraction: stat.last_interaction
      };
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    next(error);
  }
};
