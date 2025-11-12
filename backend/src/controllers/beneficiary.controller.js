import { query } from '../config/database.js';

/**
 * Get all contacts/beneficiaries for a customer
 * GET /api/v1/customers/:customerId/beneficiaries
 */
export const getCustomerBeneficiaries = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { contactType } = req.query;

    let sql = 'SELECT * FROM contacts WHERE customer_id = ?';
    const params = [customerId];

    if (contactType) {
      sql += ' AND contact_type = ?';
      params.push(contactType);
    }

    sql += ' ORDER BY created_at DESC';

    const beneficiaries = await query(sql, params);

    // For each beneficiary, get linked policies
    for (const beneficiary of beneficiaries) {
      beneficiary.linkedPolicies = await query(
        `SELECT pb.*, p.policy_number, p.policy_type, p.insurer
         FROM policy_beneficiaries pb
         JOIN policies p ON pb.policy_id = p.id
         WHERE pb.contact_id = ?`,
        [beneficiary.id]
      );
    }

    res.status(200).json({
      success: true,
      data: beneficiaries
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get single beneficiary with details
 * GET /api/v1/beneficiaries/:id
 */
export const getBeneficiaryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const beneficiaries = await query(
      'SELECT * FROM contacts WHERE id = ?',
      [id]
    );

    if (beneficiaries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary not found'
      });
    }

    const beneficiary = beneficiaries[0];

    // Get linked policies
    beneficiary.linkedPolicies = await query(
      `SELECT pb.*, p.policy_number, p.policy_type, p.insurer, p.customer_id
       FROM policy_beneficiaries pb
       JOIN policies p ON pb.policy_id = p.id
       WHERE pb.contact_id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: beneficiary
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Create new beneficiary/contact
 * POST /api/v1/customers/:customerId/beneficiaries
 */
export const createBeneficiary = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const {
      firstName,
      lastName,
      relationship,
      email,
      phone,
      dateOfBirth,
      ssnLastFour,
      address,
      contactType,
      notes
    } = req.body;

    const result = await query(
      `INSERT INTO contacts (
        customer_id, first_name, last_name, relationship, email, phone,
        date_of_birth, ssn_last_four, address_street, address_city,
        address_state, address_zip, contact_type, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        firstName,
        lastName,
        relationship,
        email,
        phone,
        dateOfBirth,
        ssnLastFour,
        address?.street,
        address?.city,
        address?.state,
        address?.zip,
        contactType || 'beneficiary',
        notes
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Beneficiary created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Update beneficiary
 * PUT /api/v1/beneficiaries/:id
 */
export const updateBeneficiary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];

    const allowedFields = {
      firstName: 'first_name',
      lastName: 'last_name',
      relationship: 'relationship',
      email: 'email',
      phone: 'phone',
      dateOfBirth: 'date_of_birth',
      ssnLastFour: 'ssn_last_four',
      addressStreet: 'address_street',
      addressCity: 'address_city',
      addressState: 'address_state',
      addressZip: 'address_zip',
      contactType: 'contact_type',
      notes: 'notes'
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

    values.push(id);
    await query(`UPDATE contacts SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);

    res.status(200).json({
      success: true,
      message: 'Beneficiary updated successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Delete beneficiary
 * DELETE /api/v1/beneficiaries/:id
 */
export const deleteBeneficiary = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if beneficiary is linked to any policies
    const linkedPolicies = await query(
      'SELECT COUNT(*) as count FROM policy_beneficiaries WHERE contact_id = ?',
      [id]
    );

    if (linkedPolicies[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete beneficiary that is linked to policies. Remove policy links first.'
      });
    }

    await query('DELETE FROM contacts WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Beneficiary deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Link beneficiary to policy
 * POST /api/v1/policies/:policyId/beneficiaries
 */
export const linkBeneficiaryToPolicy = async (req, res, next) => {
  try {
    const { policyId } = req.params;
    const {
      contactId,
      beneficiaryType,
      allocationPercentage,
      relationship,
      isRevocable,
      notes
    } = req.body;

    // Check if link already exists
    const existing = await query(
      'SELECT id FROM policy_beneficiaries WHERE policy_id = ? AND contact_id = ?',
      [policyId, contactId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Beneficiary is already linked to this policy'
      });
    }

    // Verify allocation percentage doesn't exceed 100%
    const currentTotal = await query(
      `SELECT COALESCE(SUM(allocation_percentage), 0) as total
       FROM policy_beneficiaries
       WHERE policy_id = ? AND beneficiary_type = ?`,
      [policyId, beneficiaryType || 'primary']
    );

    const newTotal = parseFloat(currentTotal[0].total) + parseFloat(allocationPercentage);
    if (newTotal > 100) {
      return res.status(400).json({
        success: false,
        message: `Total allocation for ${beneficiaryType || 'primary'} beneficiaries would exceed 100% (current: ${currentTotal[0].total}%)`
      });
    }

    const result = await query(
      `INSERT INTO policy_beneficiaries (
        policy_id, contact_id, beneficiary_type, allocation_percentage,
        relationship, is_revocable, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        policyId,
        contactId,
        beneficiaryType || 'primary',
        allocationPercentage,
        relationship,
        isRevocable !== false,
        notes
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Beneficiary linked to policy successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Update beneficiary link (allocation, type, etc.)
 * PUT /api/v1/policies/:policyId/beneficiaries/:linkId
 */
export const updateBeneficiaryLink = async (req, res, next) => {
  try {
    const { policyId, linkId } = req.params;
    const {
      beneficiaryType,
      allocationPercentage,
      relationship,
      isRevocable,
      notes
    } = req.body;

    // Get current link
    const currentLink = await query(
      'SELECT * FROM policy_beneficiaries WHERE id = ? AND policy_id = ?',
      [linkId, policyId]
    );

    if (currentLink.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary link not found'
      });
    }

    // If allocation is being changed, verify it doesn't exceed 100%
    if (allocationPercentage) {
      const currentTotal = await query(
        `SELECT COALESCE(SUM(allocation_percentage), 0) as total
         FROM policy_beneficiaries
         WHERE policy_id = ? AND beneficiary_type = ? AND id != ?`,
        [policyId, beneficiaryType || currentLink[0].beneficiary_type, linkId]
      );

      const newTotal = parseFloat(currentTotal[0].total) + parseFloat(allocationPercentage);
      if (newTotal > 100) {
        return res.status(400).json({
          success: false,
          message: `Total allocation would exceed 100% (current: ${currentTotal[0].total}%)`
        });
      }
    }

    const updates = [];
    const values = [];

    const allowedFields = {
      beneficiaryType: 'beneficiary_type',
      allocationPercentage: 'allocation_percentage',
      relationship: 'relationship',
      isRevocable: 'is_revocable',
      notes: 'notes'
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

    values.push(linkId);
    await query(`UPDATE policy_beneficiaries SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);

    res.status(200).json({
      success: true,
      message: 'Beneficiary link updated successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Remove beneficiary from policy
 * DELETE /api/v1/policies/:policyId/beneficiaries/:linkId
 */
export const removeBeneficiaryFromPolicy = async (req, res, next) => {
  try {
    const { policyId, linkId } = req.params;

    const result = await query(
      'DELETE FROM policy_beneficiaries WHERE id = ? AND policy_id = ?',
      [linkId, policyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary link not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Beneficiary removed from policy successfully'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get all beneficiaries for a specific policy
 * GET /api/v1/policies/:policyId/beneficiaries
 */
export const getPolicyBeneficiaries = async (req, res, next) => {
  try {
    const { policyId } = req.params;

    const beneficiaries = await query(
      `SELECT pb.*, c.first_name, c.last_name, c.email, c.phone, c.relationship as contact_relationship,
              c.date_of_birth, c.address_street, c.address_city, c.address_state, c.address_zip
       FROM policy_beneficiaries pb
       JOIN contacts c ON pb.contact_id = c.id
       WHERE pb.policy_id = ?
       ORDER BY pb.beneficiary_type, pb.allocation_percentage DESC`,
      [policyId]
    );

    // Calculate totals by type
    const totals = {
      primary: 0,
      contingent: 0
    };

    beneficiaries.forEach(b => {
      if (b.beneficiary_type === 'primary') {
        totals.primary += parseFloat(b.allocation_percentage);
      } else if (b.beneficiary_type === 'contingent') {
        totals.contingent += parseFloat(b.allocation_percentage);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        beneficiaries,
        totals
      }
    });

  } catch (error) {
    next(error);
  }
};
