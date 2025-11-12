import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract structured policy data from uploaded document using Google Gemini AI
 * Aligns with ACORD standard forms (ACORD 25, 27, 101, 126, etc.)
 *
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} Extracted policy data in ACORD-aligned structure
 */
export const extractPolicyData = async (file) => {
  try {
    // Read file content
    const fileBuffer = fs.readFileSync(file.path);
    const base64Data = fileBuffer.toString('base64');

    // Determine mime type
    const mimeType = file.mimetype || getMimeTypeFromExtension(file.originalname);

    // Initialize Gemini model (use vision model for document analysis)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Construct detailed extraction prompt aligned with ACORD standards
    const prompt = `You are an expert insurance document analyst. Analyze this insurance policy document and extract structured data in JSON format.

Extract the following information following ACORD (Association for Cooperative Operations Research and Development) standards:

**Policy Holder Information (ACORD fields):**
- firstName
- lastName
- middleName
- dateOfBirth
- ssn (last 4 digits only if visible)
- email
- phone
- address (object with: street, city, state, zip, country)
- occupation
- maritalStatus

**Policy Information:**
- policyNumber
- insurer (carrier/company name)
- policyType (one of: auto, home, life, health, commercial, umbrella, renters, disability, long_term_care, other)
- status (active, pending, expired, cancelled)
- effectiveDate (YYYY-MM-DD format)
- expirationDate (YYYY-MM-DD format)
- issueDate (YYYY-MM-DD format)
- premiumAmount (annual premium)
- premiumFrequency (monthly, quarterly, semi-annual, annual)
- deductible
- coverageAmount (total policy limit)
- policyTerm (term length in months/years)

**Beneficiaries (array of objects):**
For each beneficiary extract:
- firstName
- lastName
- relationship (spouse, child, parent, sibling, trust, estate, other)
- beneficiaryType (primary, contingent)
- allocationPercentage (percentage of benefit)
- dateOfBirth
- ssn (last 4 only)
- address (object with: street, city, state, zip)
- isRevocable (true/false)

**Coverages (array of objects):**
For each coverage/rider extract:
- coverageType (liability, collision, comprehensive, bodily_injury, property_damage, medical_payments, uninsured_motorist, etc.)
- coverageCode (ACORD standard code if visible)
- coverageLimit (dollar amount)
- deductible
- premiumAmount (if listed separately)
- description

**Vehicle Information (if auto policy):**
- make
- model
- year
- vin
- usage (personal, business, pleasure)

**Property Information (if home/property policy):**
- propertyType (single_family, condo, townhouse, mobile_home, commercial)
- yearBuilt
- squareFootage
- constructionType
- roofType
- numStories
- protectionClass
- distanceToFireStation

**Life Insurance Specific (if life policy):**
- faceAmount (death benefit)
- cashValue
- policyType (term, whole_life, universal_life, variable_life)
- termLength
- riders (array of rider names)

**ACORD Forms Referenced:**
- acordFormNumbers (array of form numbers found, e.g., ["ACORD 25", "ACORD 27"])

**Additional Fields:**
- notes (any important notes or special conditions)
- endorsements (array of endorsement descriptions)
- exclusions (array of exclusion descriptions)

Return ONLY valid JSON with no additional text. Use null for missing fields. Ensure all dates are in YYYY-MM-DD format. Ensure all currency amounts are numbers without currency symbols.

If this is not an insurance policy document, return: {"error": "Not a valid insurance policy document", "documentType": "detected type"}`;

    // Send to Gemini with the document
    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const extractedData = parseGeminiResponse(text);

    // Validate and structure the data
    const structuredData = validateAndStructureData(extractedData, file);

    return structuredData;

  } catch (error) {
    console.error('Policy extraction error:', error);
    throw new Error(`Failed to extract policy data: ${error.message}`);
  }
};

/**
 * Parse Gemini response and extract JSON
 * Handles various response formats (with/without markdown code blocks)
 */
function parseGeminiResponse(text) {
  try {
    // Remove markdown code blocks if present
    let jsonText = text.trim();

    // Remove ```json and ``` markers
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    // Parse JSON
    const parsed = JSON.parse(jsonText);

    // Check for error response
    if (parsed.error) {
      throw new Error(parsed.error);
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse Gemini response:', text);
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * Validate and structure extracted data
 * Ensures required fields and proper data types
 */
function validateAndStructureData(data, file) {
  const structured = {
    // Extraction metadata
    extractionMetadata: {
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      extractedAt: new Date().toISOString(),
      extractionVersion: '1.0'
    },

    // Policy holder
    policyHolder: {
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      middleName: data.middleName || null,
      dateOfBirth: data.dateOfBirth || null,
      ssnLastFour: data.ssn || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      occupation: data.occupation || null,
      maritalStatus: data.maritalStatus || null
    },

    // Policy information
    policy: {
      policyNumber: data.policyNumber || null,
      insurer: data.insurer || null,
      policyType: normalizePolicyType(data.policyType),
      status: normalizeStatus(data.status),
      effectiveDate: data.effectiveDate || null,
      expirationDate: data.expirationDate || null,
      issueDate: data.issueDate || null,
      premiumAmount: parseFloat(data.premiumAmount) || 0,
      premiumFrequency: data.premiumFrequency || 'annual',
      deductible: parseFloat(data.deductible) || 0,
      coverageAmount: parseFloat(data.coverageAmount) || 0,
      policyTerm: data.policyTerm || null,
      notes: data.notes || null
    },

    // Beneficiaries
    beneficiaries: Array.isArray(data.beneficiaries)
      ? data.beneficiaries.map(b => ({
          firstName: b.firstName || null,
          lastName: b.lastName || null,
          relationship: b.relationship || null,
          beneficiaryType: b.beneficiaryType || 'primary',
          allocationPercentage: parseFloat(b.allocationPercentage) || 100,
          dateOfBirth: b.dateOfBirth || null,
          ssnLastFour: b.ssn || null,
          address: b.address || null,
          isRevocable: b.isRevocable !== false
        }))
      : [],

    // Coverages
    coverages: Array.isArray(data.coverages)
      ? data.coverages.map(c => ({
          coverageType: c.coverageType || null,
          coverageCode: c.coverageCode || null,
          coverageLimit: parseFloat(c.coverageLimit) || 0,
          deductible: parseFloat(c.deductible) || 0,
          premiumAmount: parseFloat(c.premiumAmount) || 0,
          description: c.description || null
        }))
      : [],

    // Vehicle information (if applicable)
    vehicle: data.make || data.model || data.vin ? {
      make: data.make || null,
      model: data.model || null,
      year: data.year || null,
      vin: data.vin || null,
      usage: data.usage || null
    } : null,

    // Property information (if applicable)
    property: data.propertyType || data.yearBuilt ? {
      propertyType: data.propertyType || null,
      yearBuilt: data.yearBuilt || null,
      squareFootage: data.squareFootage || null,
      constructionType: data.constructionType || null,
      roofType: data.roofType || null,
      numStories: data.numStories || null,
      protectionClass: data.protectionClass || null,
      distanceToFireStation: data.distanceToFireStation || null
    } : null,

    // Life insurance specific (if applicable)
    lifeInsurance: data.faceAmount || data.cashValue ? {
      faceAmount: parseFloat(data.faceAmount) || 0,
      cashValue: parseFloat(data.cashValue) || 0,
      policyType: data.policyType || null,
      termLength: data.termLength || null,
      riders: Array.isArray(data.riders) ? data.riders : []
    } : null,

    // ACORD data
    acordData: {
      formNumbers: Array.isArray(data.acordFormNumbers) ? data.acordFormNumbers : [],
      endorsements: Array.isArray(data.endorsements) ? data.endorsements : [],
      exclusions: Array.isArray(data.exclusions) ? data.exclusions : []
    }
  };

  return structured;
}

/**
 * Normalize policy type to match database enum
 */
function normalizePolicyType(type) {
  if (!type) return 'other';

  const normalized = type.toLowerCase().replace(/[_\s-]/g, '');
  const typeMap = {
    'auto': 'auto',
    'automobile': 'auto',
    'car': 'auto',
    'vehicle': 'auto',
    'home': 'home',
    'homeowners': 'home',
    'house': 'home',
    'life': 'life',
    'lifeinsurance': 'life',
    'health': 'health',
    'medical': 'health',
    'commercial': 'commercial',
    'business': 'commercial',
    'umbrella': 'umbrella',
    'renters': 'renters',
    'rental': 'renters',
    'disability': 'other',
    'longtermcare': 'other'
  };

  return typeMap[normalized] || 'other';
}

/**
 * Normalize status to match database enum
 */
function normalizeStatus(status) {
  if (!status) return 'active';

  const normalized = status.toLowerCase();
  const statusMap = {
    'active': 'active',
    'inforce': 'active',
    'in-force': 'active',
    'pending': 'pending',
    'expired': 'expired',
    'cancelled': 'cancelled',
    'canceled': 'cancelled',
    'terminated': 'cancelled'
  };

  return statusMap[normalized] || 'active';
}

/**
 * Get MIME type from file extension
 */
function getMimeTypeFromExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff'
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Clean up uploaded file
 */
export const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
};
