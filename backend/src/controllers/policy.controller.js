import { query } from '../config/database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { extractPolicyData, cleanupFile } from '../services/policyExtraction.service.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'policy-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|png|jpg|jpeg|tiff|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only policy documents (PDF, PNG, JPG, TIFF) are allowed'));
    }
  }
});

export const uploadHandler = upload.single('policyDocument');

/**
 * Upload and extract policy document using AI
 * POST /api/v1/policies/upload
 */
export const uploadAndExtractPolicy = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log('Processing policy document:', req.file.originalname);

    // Extract data using AI service
    const extractedData = await extractPolicyData(req.file);

    // Store document metadata
    const documentRecord = {
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      extractionStatus: 'completed',
      extractionData: JSON.stringify(extractedData)
    };

    // Return extracted data for client-side processing
    res.status(200).json({
      success: true,
      message: 'Policy document extracted successfully',
      data: {
        extractedData,
        documentRecord
      }
    });

  } catch (error) {
    // Clean up file on error
    if (req.file && req.file.path) {
      cleanupFile(req.file.path);
    }

    console.error('Policy extraction error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to extract policy data'
    });
  }
};

/**
 * Sync extracted policy data to CRM
 * Creates/updates customer, policy, beneficiaries, and coverages
 * POST /api/v1/policies/sync
 */
export const syncPolicyToCRM = async (req, res, next) => {
  try {
    const { extractedData, documentRecord } = req.body;

    if (!extractedData || !extractedData.policy) {
      return res.status(400).json({
        success: false,
        message: 'Invalid extracted data'
      });
    }

    await query('START TRANSACTION');

    // Step 1: Find or create customer (policy holder)
    const customerId = await findOrCreateCustomer(extractedData.policyHolder, req.user);

    // Step 2: Create or update policy
    const policyId = await createOrUpdatePolicy(
      customerId,
      extractedData.policy,
      extractedData.acordData,
      extractedData.vehicle,
      extractedData.property,
      extractedData.lifeInsurance,
      req.user
    );

    // Step 3: Create policy coverages
    if (extractedData.coverages && extractedData.coverages.length > 0) {
      await createPolicyCoverages(policyId, extractedData.coverages);
    }

    // Step 4: Create beneficiaries and link to policy
    if (extractedData.beneficiaries && extractedData.beneficiaries.length > 0) {
      await createAndLinkBeneficiaries(customerId, policyId, extractedData.beneficiaries);
    }

    // Step 5: Store document record if provided
    if (documentRecord && documentRecord.filePath) {
      await createPolicyDocument(policyId, documentRecord, req.user.id);
    }

    await query('COMMIT');

    // Fetch complete policy data
    const completePolicy = await getPolicyWithDetails(policyId);

    res.status(201).json({
      success: true,
      message: 'Policy synced to CRM successfully',
      data: {
        customerId,
        policyId,
        policy: completePolicy
      }
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Policy sync error:', error);
    next(error);
  }
};

/**
 * Get all policies for a customer
 * GET /api/v1/customers/:customerId/policies
 */
export const getCustomerPolicies = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    const policies = await query(
      `SELECT * FROM policies WHERE customer_id = ? ORDER BY created_at DESC`,
      [customerId]
    );

    // Get coverages and beneficiaries for each policy
    for (const policy of policies) {
      policy.coverages = await query(
        'SELECT * FROM policy_coverages WHERE policy_id = ?',
        [policy.id]
      );

      policy.beneficiaries = await query(
        `SELECT pb.*, c.first_name, c.last_name, c.email, c.relationship
         FROM policy_beneficiaries pb
         JOIN contacts c ON pb.contact_id = c.id
         WHERE pb.policy_id = ?`,
        [policy.id]
      );
    }

    res.status(200).json({
      success: true,
      data: policies
    });

  } catch (error) {
    next(error);
  }
};

// Helper functions

/**
 * Find or create customer from extracted policy holder data
 */
async function findOrCreateCustomer(policyHolder, user) {
  if (!policyHolder || !policyHolder.lastName) {
    throw new Error('Policy holder information is incomplete');
  }

  // Try to find existing customer by email or name + DOB
  let customer = null;

  if (policyHolder.email) {
    const results = await query(
      'SELECT id FROM customers WHERE email = ? LIMIT 1',
      [policyHolder.email]
    );
    if (results.length > 0) {
      customer = results[0];
    }
  }

  // If not found by email, try name + DOB
  if (!customer && policyHolder.dateOfBirth) {
    const results = await query(
      'SELECT id FROM customers WHERE first_name = ? AND last_name = ? AND date_of_birth = ? LIMIT 1',
      [policyHolder.firstName, policyHolder.lastName, policyHolder.dateOfBirth]
    );
    if (results.length > 0) {
      customer = results[0];
    }
  }

  if (customer) {
    console.log('Found existing customer:', customer.id);

    // Update customer with any new information
    await query(
      `UPDATE customers SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        date_of_birth = COALESCE(?, date_of_birth),
        address_street = COALESCE(?, address_street),
        address_city = COALESCE(?, address_city),
        address_state = COALESCE(?, address_state),
        address_zip = COALESCE(?, address_zip),
        updated_at = NOW()
      WHERE id = ?`,
      [
        policyHolder.firstName,
        policyHolder.lastName,
        policyHolder.email,
        policyHolder.phone,
        policyHolder.dateOfBirth,
        policyHolder.address?.street,
        policyHolder.address?.city,
        policyHolder.address?.state,
        policyHolder.address?.zip,
        customer.id
      ]
    );

    return customer.id;
  }

  // Create new customer
  console.log('Creating new customer');
  const result = await query(
    `INSERT INTO customers (
      first_name, last_name, email, phone, date_of_birth,
      address_street, address_city, address_state, address_zip,
      status, customer_since, assigned_agent_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      policyHolder.firstName,
      policyHolder.lastName,
      policyHolder.email,
      policyHolder.phone,
      policyHolder.dateOfBirth,
      policyHolder.address?.street,
      policyHolder.address?.city,
      policyHolder.address?.state,
      policyHolder.address?.zip,
      'active',
      new Date().toISOString().split('T')[0],
      user.id
    ]
  );

  return result.insertId;
}

/**
 * Create or update policy
 */
async function createOrUpdatePolicy(customerId, policyData, acordData, vehicle, property, lifeInsurance, user) {
  if (!policyData.policyNumber) {
    throw new Error('Policy number is required');
  }

  // Check if policy exists
  const existing = await query(
    'SELECT id FROM policies WHERE policy_number = ? LIMIT 1',
    [policyData.policyNumber]
  );

  // Build policy details JSON
  const policyDetails = {
    notes: policyData.notes,
    policyTerm: policyData.policyTerm,
    ...(vehicle && { vehicle }),
    ...(property && { property }),
    ...(lifeInsurance && { lifeInsurance })
  };

  // Build ACORD data JSON
  const acordDataJson = {
    formNumbers: acordData?.formNumbers || [],
    endorsements: acordData?.endorsements || [],
    exclusions: acordData?.exclusions || []
  };

  if (existing.length > 0) {
    // Update existing policy
    console.log('Updating existing policy:', existing[0].id);
    await query(
      `UPDATE policies SET
        customer_id = ?,
        insurer = ?,
        policy_type = ?,
        status = ?,
        effective_date = ?,
        expiration_date = ?,
        premium_amount = ?,
        premium_frequency = ?,
        coverage_amount = ?,
        deductible = ?,
        policy_details = ?,
        acord_data = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        customerId,
        policyData.insurer,
        policyData.policyType,
        policyData.status,
        policyData.effectiveDate,
        policyData.expirationDate,
        policyData.premiumAmount,
        policyData.premiumFrequency,
        policyData.coverageAmount,
        policyData.deductible,
        JSON.stringify(policyDetails),
        JSON.stringify(acordDataJson),
        existing[0].id
      ]
    );

    // Add timeline entry
    await query(
      `INSERT INTO timeline_entries (customer_id, entry_type, title, description, created_by_user_id)
       VALUES (?, 'policy_change', 'Policy Updated', ?, ?)`,
      [customerId, `Policy ${policyData.policyNumber} updated from document upload`, user.id]
    );

    return existing[0].id;
  }

  // Create new policy
  console.log('Creating new policy');
  const result = await query(
    `INSERT INTO policies (
      customer_id, policy_number, policy_type, insurer, status,
      effective_date, expiration_date, premium_amount, premium_frequency,
      coverage_amount, deductible, policy_details, acord_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      customerId,
      policyData.policyNumber,
      policyData.policyType,
      policyData.insurer,
      policyData.status,
      policyData.effectiveDate,
      policyData.expirationDate,
      policyData.premiumAmount,
      policyData.premiumFrequency,
      policyData.coverageAmount,
      policyData.deductible,
      JSON.stringify(policyDetails),
      JSON.stringify(acordDataJson)
    ]
  );

  // Add timeline entry
  await query(
    `INSERT INTO timeline_entries (customer_id, entry_type, title, description, created_by_user_id)
     VALUES (?, 'policy_change', 'New Policy Added', ?, ?)`,
    [customerId, `Policy ${policyData.policyNumber} (${policyData.policyType}) added from document upload`, user.id]
  );

  return result.insertId;
}

/**
 * Create policy coverages
 */
async function createPolicyCoverages(policyId, coverages) {
  // Delete existing coverages for this policy
  await query('DELETE FROM policy_coverages WHERE policy_id = ?', [policyId]);

  // Insert new coverages
  for (const coverage of coverages) {
    await query(
      `INSERT INTO policy_coverages (
        policy_id, coverage_type, coverage_code, coverage_limit,
        deductible, premium_amount, description, coverage_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        policyId,
        coverage.coverageType,
        coverage.coverageCode,
        coverage.coverageLimit,
        coverage.deductible,
        coverage.premiumAmount,
        coverage.description,
        JSON.stringify({ extracted: true })
      ]
    );
  }

  console.log(`Created ${coverages.length} coverages for policy ${policyId}`);
}

/**
 * Create beneficiaries and link to policy
 */
async function createAndLinkBeneficiaries(customerId, policyId, beneficiaries) {
  for (const beneficiary of beneficiaries) {
    // Check if contact/beneficiary already exists
    let contactId;

    const existing = await query(
      `SELECT id FROM contacts
       WHERE customer_id = ? AND first_name = ? AND last_name = ? AND relationship = ?
       LIMIT 1`,
      [customerId, beneficiary.firstName, beneficiary.lastName, beneficiary.relationship]
    );

    if (existing.length > 0) {
      contactId = existing[0].id;
      console.log('Found existing beneficiary:', contactId);
    } else {
      // Create new contact/beneficiary
      const result = await query(
        `INSERT INTO contacts (
          customer_id, first_name, last_name, relationship, email, phone,
          date_of_birth, ssn_last_four, address_street, address_city,
          address_state, address_zip, contact_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          beneficiary.firstName,
          beneficiary.lastName,
          beneficiary.relationship,
          beneficiary.email || null,
          beneficiary.phone || null,
          beneficiary.dateOfBirth,
          beneficiary.ssnLastFour,
          beneficiary.address?.street,
          beneficiary.address?.city,
          beneficiary.address?.state,
          beneficiary.address?.zip,
          'beneficiary'
        ]
      );
      contactId = result.insertId;
      console.log('Created new beneficiary:', contactId);
    }

    // Link beneficiary to policy
    const linkExists = await query(
      'SELECT id FROM policy_beneficiaries WHERE policy_id = ? AND contact_id = ?',
      [policyId, contactId]
    );

    if (linkExists.length === 0) {
      await query(
        `INSERT INTO policy_beneficiaries (
          policy_id, contact_id, beneficiary_type, allocation_percentage,
          relationship, is_revocable
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          policyId,
          contactId,
          beneficiary.beneficiaryType,
          beneficiary.allocationPercentage,
          beneficiary.relationship,
          beneficiary.isRevocable
        ]
      );
      console.log(`Linked beneficiary ${contactId} to policy ${policyId}`);
    }
  }
}

/**
 * Create policy document record
 */
async function createPolicyDocument(policyId, documentRecord, userId) {
  await query(
    `INSERT INTO policy_documents (
      policy_id, document_type, file_name, file_path, file_size,
      mime_type, uploaded_by_user_id, extraction_status, extraction_data,
      extraction_completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      policyId,
      'full_policy',
      documentRecord.fileName,
      documentRecord.filePath,
      documentRecord.fileSize,
      documentRecord.mimeType,
      userId,
      documentRecord.extractionStatus,
      documentRecord.extractionData
    ]
  );
}

/**
 * Get policy with all details
 */
async function getPolicyWithDetails(policyId) {
  const policies = await query(
    `SELECT p.*, c.first_name, c.last_name, c.email, c.phone
     FROM policies p
     JOIN customers c ON p.customer_id = c.id
     WHERE p.id = ?`,
    [policyId]
  );

  if (policies.length === 0) {
    return null;
  }

  const policy = policies[0];

  // Get coverages
  const coverages = await query(
    'SELECT * FROM policy_coverages WHERE policy_id = ?',
    [policyId]
  );

  // Get beneficiaries
  const beneficiaries = await query(
    `SELECT pb.*, c.first_name, c.last_name, c.email, c.phone, c.relationship
     FROM policy_beneficiaries pb
     JOIN contacts c ON pb.contact_id = c.id
     WHERE pb.policy_id = ?`,
    [policyId]
  );

  return {
    ...policy,
    coverages,
    beneficiaries
  };
}

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
