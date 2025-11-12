import { query } from '../config/database.js';

/**
 * Get all inquiries (leads inbox)
 */
export const getInquiries = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      status = 'new',
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = ['i.status != ?']; // Exclude converted by default unless specified
    const params = ['converted'];

    // Filter by status if provided
    if (status && status !== 'all') {
      conditions.push('i.status = ?');
      params.push(status);
    }

    // Search functionality
    if (search) {
      conditions.push('(i.first_name LIKE ? OR i.last_name LIKE ? OR i.email LIKE ? OR i.phone LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Multi-tenant filter - only for current user's tenant
    conditions.push('i.tenant_id = ?');
    params.push(req.user.tenantId || 1); // Default to 1 for demo

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM transaction_inquiries i ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = countResult[0].total;

    // Get inquiries with quote request info
    const inquiriesQuery = `
      SELECT
        i.*,
        qr.id as quote_request_id,
        qr.policy_type,
        qr.coverage_amount,
        u.first_name as agent_first_name,
        u.last_name as agent_last_name
      FROM transaction_inquiries i
      LEFT JOIN transaction_quote_requests qr ON i.id = qr.inquiry_id
      LEFT JOIN users u ON i.agent_id = u.id
      ${whereClause}
      ORDER BY i.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const inquiries = await query(inquiriesQuery, [...params, parseInt(limit), offset]);

    // Format response
    const formattedInquiries = inquiries.map(inq => ({
      id: inq.id,
      firstName: inq.first_name,
      lastName: inq.last_name,
      email: inq.email,
      phone: inq.phone,
      inquiryType: inq.inquiry_type,
      policyInterest: inq.policy_interest,
      message: inq.message,
      source: inq.source,
      medium: inq.medium,
      campaign: inq.campaign,
      utmSource: inq.utm_source,
      utmMedium: inq.utm_medium,
      utmCampaign: inq.utm_campaign,
      utmTerm: inq.utm_term,
      utmContent: inq.utm_content,
      referrerUrl: inq.referrer_url,
      landingPageUrl: inq.landing_page_url,
      gdprConsentProvided: Boolean(inq.gdpr_consent_provided),
      gdprConsentDate: inq.gdpr_consent_date,
      marketingConsentProvided: Boolean(inq.marketing_consent_provided),
      marketingConsentDate: inq.marketing_consent_date,
      status: inq.status,
      hasQuoteRequest: Boolean(inq.quote_request_id),
      quoteRequest: inq.quote_request_id ? {
        id: inq.quote_request_id,
        policyType: inq.policy_type,
        coverageAmount: parseFloat(inq.coverage_amount || 0)
      } : null,
      assignedAgent: inq.agent_id ? {
        id: inq.agent_id,
        firstName: inq.agent_first_name,
        lastName: inq.agent_last_name
      } : null,
      createdAt: inq.created_at,
      updatedAt: inq.updated_at
    }));

    res.status(200).json({
      success: true,
      data: {
        inquiries: formattedInquiries,
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
 * Get single inquiry by ID
 */
export const getInquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inquiries = await query(
      `SELECT
        i.*,
        qr.*,
        u.first_name as agent_first_name,
        u.last_name as agent_last_name
      FROM transaction_inquiries i
      LEFT JOIN transaction_quote_requests qr ON i.id = qr.inquiry_id
      LEFT JOIN users u ON i.agent_id = u.id
      WHERE i.id = ? AND i.tenant_id = ?`,
      [id, req.user.tenantId || 1]
    );

    if (inquiries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    const inq = inquiries[0];

    res.status(200).json({
      success: true,
      data: {
        id: inq.id,
        firstName: inq.first_name,
        lastName: inq.last_name,
        email: inq.email,
        phone: inq.phone,
        inquiryType: inq.inquiry_type,
        policyInterest: inq.policy_interest,
        message: inq.message,
        source: inq.source,
        utmData: {
          source: inq.utm_source,
          medium: inq.utm_medium,
          campaign: inq.utm_campaign,
          term: inq.utm_term,
          content: inq.utm_content
        },
        referrerUrl: inq.referrer_url,
        landingPageUrl: inq.landing_page_url,
        gdprConsent: {
          provided: Boolean(inq.gdpr_consent_provided),
          date: inq.gdpr_consent_date
        },
        marketingConsent: {
          provided: Boolean(inq.marketing_consent_provided),
          date: inq.marketing_consent_date
        },
        status: inq.status,
        assignedAgent: inq.agent_id ? {
          id: inq.agent_id,
          firstName: inq.agent_first_name,
          lastName: inq.agent_last_name
        } : null,
        createdAt: inq.created_at,
        updatedAt: inq.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new inquiry (from microsite form)
 */
export const createInquiry = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      inquiryType,
      policyInterest,
      message,
      source,
      medium,
      campaign,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      referrerUrl,
      landingPageUrl,
      gdprConsentProvided,
      marketingConsentProvided,
      quoteRequest
    } = req.body;

    const tenantId = req.user?.tenantId || 1;

    // Create inquiry
    const result = await query(
      `INSERT INTO transaction_inquiries (
        tenant_id, first_name, last_name, email, phone,
        inquiry_type, policy_interest, message,
        source, medium, campaign,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        referrer_url, landing_page_url,
        gdpr_consent_provided, gdpr_consent_date,
        marketing_consent_provided, marketing_consent_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tenantId,
        firstName,
        lastName,
        email,
        phone,
        inquiryType || 'general',
        policyInterest,
        message,
        source,
        medium,
        campaign,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        referrerUrl,
        landingPageUrl,
        gdprConsentProvided ? 1 : 0,
        gdprConsentProvided ? new Date() : null,
        marketingConsentProvided ? 1 : 0,
        marketingConsentProvided ? new Date() : null
      ]
    );

    const inquiryId = result.insertId;

    // Create quote request if provided
    if (quoteRequest && inquiryType === 'quote_request') {
      await query(
        `INSERT INTO transaction_quote_requests (
          inquiry_id, tenant_id, policy_type, coverage_amount,
          requested_start_date, vehicle_make, vehicle_model, vehicle_year,
          vehicle_vin, property_address, property_value, property_type,
          date_of_birth, smoker, health_conditions,
          current_insurer, current_premium, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          inquiryId,
          tenantId,
          quoteRequest.policyType,
          quoteRequest.coverageAmount,
          quoteRequest.requestedStartDate,
          quoteRequest.vehicleMake,
          quoteRequest.vehicleModel,
          quoteRequest.vehicleYear,
          quoteRequest.vehicleVin,
          quoteRequest.propertyAddress,
          quoteRequest.propertyValue,
          quoteRequest.propertyType,
          quoteRequest.dateOfBirth,
          quoteRequest.smoker,
          quoteRequest.healthConditions,
          quoteRequest.currentInsurer,
          quoteRequest.currentPremium,
          quoteRequest.notes
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry created successfully',
      data: {
        id: inquiryId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Convert inquiry to opportunity
 */
export const convertToOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, estimatedValue, policyType } = req.body;

    // Get inquiry details
    const inquiries = await query(
      'SELECT * FROM transaction_inquiries WHERE id = ? AND tenant_id = ?',
      [id, req.user.tenantId || 1]
    );

    if (inquiries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    const inquiry = inquiries[0];

    // Create opportunity
    const result = await query(
      `INSERT INTO opportunities (
        tenant_id, agent_id, title, prospect_type, prospect_id,
        prospect_name, prospect_email, prospect_phone,
        estimated_value, policy_type, source_inquiry_id, stage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.tenantId || 1,
        req.user.id,
        title || `${inquiry.first_name} ${inquiry.last_name} - ${policyType || inquiry.policy_interest}`,
        'inquiry',
        inquiry.id,
        `${inquiry.first_name} ${inquiry.last_name}`,
        inquiry.email,
        inquiry.phone,
        estimatedValue || 0,
        policyType || inquiry.policy_interest,
        inquiry.id,
        'new'
      ]
    );

    // Update inquiry status
    await query(
      `UPDATE transaction_inquiries
       SET status = ?, converted_to_opportunity_id = ?, converted_at = ?, converted_by_user_id = ?
       WHERE id = ?`,
      ['converted', result.insertId, new Date(), req.user.id, id]
    );

    res.status(201).json({
      success: true,
      message: 'Inquiry converted to opportunity successfully',
      data: {
        opportunityId: result.insertId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update inquiry status
 */
export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await query(
      'UPDATE transaction_inquiries SET status = ? WHERE id = ? AND tenant_id = ?',
      [status, id, req.user.tenantId || 1]
    );

    res.status(200).json({
      success: true,
      message: 'Inquiry status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
