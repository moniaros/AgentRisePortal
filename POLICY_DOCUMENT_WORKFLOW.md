# Policy Document Upload & CRM Integration Workflow

Complete guide to the policy document extraction and CRM synchronization system.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Flow](#data-flow)
4. [Database Schema](#database-schema)
5. [Backend API](#backend-api)
6. [Frontend Services](#frontend-services)
7. [ACORD Standards](#acord-standards)
8. [Usage Guide](#usage-guide)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This system enables insurance agents to upload policy documents (PDF, images), have AI extract structured data aligned with ACORD standards, review and edit the extraction results, and sync the verified data to the CRM system.

### Key Features

- **AI-Powered Extraction**: Google Gemini 1.5 Flash analyzes policy documents
- **ACORD Alignment**: Data structures follow ACORD standard forms (25, 27, 101, 126)
- **Customer Matching**: Prevents duplicate customer records via email or name+DOB matching
- **Beneficiary Management**: Full beneficiary linking with allocation percentages
- **Coverage Tracking**: Detailed coverage breakdowns with ACORD codes
- **Transaction Safety**: Atomic operations ensure data consistency
- **Audit Trail**: Timeline entries track all policy changes
- **Multi-Format Support**: PDF, PNG, JPG, TIFF, WEBP

---

## Architecture

```
┌─────────────────┐
│  Agent Browser  │
│  /gap-analysis  │
└────────┬────────┘
         │
         │ 1. Upload Document
         ▼
┌─────────────────────────────┐
│  Frontend (React + TypeScript)│
│  - PolicyUpload Component    │
│  - localStorage Storage      │
│  - policyService API Client  │
└────────┬────────────────────┘
         │
         │ 2. POST /api/v1/policies/upload
         ▼
┌──────────────────────────────┐
│  Backend API (Node.js/Express)│
│  - Multer File Upload        │
│  - policyExtraction.service  │
│  - Google Gemini AI          │
└────────┬─────────────────────┘
         │
         │ 3. Extract Structured Data
         ▼
┌──────────────────────────────┐
│  AI Response (JSON)          │
│  - Policy Holder             │
│  - Policy Details            │
│  - Beneficiaries             │
│  - Coverages                 │
└────────┬─────────────────────┘
         │
         │ 4. Return to Frontend
         ▼
┌──────────────────────────────┐
│  localStorage (Temporary)    │
│  - Review & Edit Interface   │
│  - Validation                │
└────────┬─────────────────────┘
         │
         │ 5. POST /api/v1/policies/sync
         ▼
┌──────────────────────────────┐
│  CRM Sync Controller         │
│  - Find/Create Customer      │
│  - Create/Update Policy      │
│  - Link Beneficiaries        │
│  - Create Coverages          │
└────────┬─────────────────────┘
         │
         │ 6. Transaction Commit
         ▼
┌──────────────────────────────┐
│  MySQL Database              │
│  - customers                 │
│  - policies                  │
│  - contacts (beneficiaries)  │
│  - policy_beneficiaries      │
│  - policy_coverages          │
│  - policy_documents          │
│  - timeline_entries          │
└──────────────────────────────┘
```

---

## Data Flow

### Phase 1: Document Upload & Extraction

```
Agent uploads document → Frontend validates file type/size →
API receives file → Multer stores temporarily →
Gemini AI processes document → Structured JSON returned →
Frontend stores in localStorage → Display for review
```

### Phase 2: Review & Edit

```
Agent reviews extracted data →
Edits policy holder, policy details, beneficiaries, coverages →
localStorage updates in real-time →
Validation checks (required fields, allocation percentages) →
Agent confirms data accuracy
```

### Phase 3: CRM Synchronization

```
Agent clicks "Sync to CRM" →
Frontend sends extractedData + documentRecord →
Backend START TRANSACTION →
  1. Find customer by email OR (name + DOB)
  2. IF NOT FOUND: Create new customer with extracted data
  3. IF FOUND: Update customer with new information
  4. Find policy by policy_number
  5. IF NOT FOUND: Create new policy
  6. IF FOUND: Update policy with latest data
  7. Delete old coverages → Insert new coverages
  8. For each beneficiary:
     - Find contact by (customerId + name + relationship)
     - IF NOT FOUND: Create contact
     - Link contact to policy with allocation percentage
  9. Store document record with extraction metadata
 10. Create timeline entry for audit trail
Backend COMMIT TRANSACTION →
Return { customerId, policyId, policy } →
Frontend marks as synced → Clear localStorage →
Redirect to customer profile or show success
```

---

## Database Schema

### contacts Table
Stores beneficiaries, dependents, emergency contacts

```sql
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    ssn_last_four VARCHAR(4),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zip VARCHAR(10),
    contact_type ENUM('beneficiary', 'dependent', 'emergency', 'other'),
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

### policy_beneficiaries Table
Junction table linking policies to beneficiaries

```sql
CREATE TABLE policy_beneficiaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    contact_id INT NOT NULL,
    beneficiary_type ENUM('primary', 'contingent'),
    allocation_percentage DECIMAL(5, 2) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    is_revocable BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES policies(id),
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);
```

### policy_documents Table
Tracks uploaded documents and extraction status

```sql
CREATE TABLE policy_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_by_user_id INT,
    extraction_status ENUM('pending', 'processing', 'completed', 'failed'),
    extraction_data JSON,
    extraction_completed_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES policies(id)
);
```

### Enhanced policy_coverages Table

```sql
ALTER TABLE policy_coverages
ADD COLUMN coverage_code VARCHAR(20),
ADD COLUMN premium_amount DECIMAL(10, 2),
ADD COLUMN coverage_details JSON;
```

---

## Backend API

### Policy Extraction Endpoints

#### POST /api/v1/policies/upload
Upload policy document for AI extraction

**Request:**
```
Content-Type: multipart/form-data

policyDocument: <file>
```

**Response:**
```json
{
  "success": true,
  "message": "Policy document extracted successfully",
  "data": {
    "extractedData": {
      "extractionMetadata": {
        "fileName": "policy.pdf",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "extractedAt": "2025-01-15T10:30:00Z",
        "extractionVersion": "1.0"
      },
      "policyHolder": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "555-0100",
        "dateOfBirth": "1980-05-15",
        "address": {
          "street": "123 Main St",
          "city": "Los Angeles",
          "state": "CA",
          "zip": "90001"
        }
      },
      "policy": {
        "policyNumber": "AUTO-2024-12345",
        "insurer": "State Farm",
        "policyType": "auto",
        "status": "active",
        "effectiveDate": "2024-01-01",
        "expirationDate": "2025-01-01",
        "premiumAmount": 1200,
        "premiumFrequency": "annual",
        "deductible": 500,
        "coverageAmount": 100000
      },
      "beneficiaries": [
        {
          "firstName": "Jane",
          "lastName": "Doe",
          "relationship": "spouse",
          "beneficiaryType": "primary",
          "allocationPercentage": 100,
          "isRevocable": true
        }
      ],
      "coverages": [
        {
          "coverageType": "Liability",
          "coverageCode": "BI",
          "coverageLimit": 100000,
          "deductible": 0
        },
        {
          "coverageType": "Collision",
          "coverageCode": "COLL",
          "coverageLimit": 50000,
          "deductible": 500
        }
      ],
      "acordData": {
        "formNumbers": ["ACORD 25"],
        "endorsements": [],
        "exclusions": []
      }
    },
    "documentRecord": {
      "fileName": "policy.pdf",
      "filePath": "/uploads/policy-1234567890.pdf",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "extractionStatus": "completed"
    }
  }
}
```

#### POST /api/v1/policies/sync
Sync extracted policy data to CRM

**Request:**
```json
{
  "extractedData": { /* ... same as extractedData above */ },
  "documentRecord": { /* ... optional document metadata */ }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Policy synced to CRM successfully",
  "data": {
    "customerId": 123,
    "policyId": 456,
    "policy": {
      "id": 456,
      "customerId": 123,
      "policyNumber": "AUTO-2024-12345",
      "policyType": "auto",
      "insurer": "State Farm",
      "status": "active",
      "effectiveDate": "2024-01-01",
      "expirationDate": "2025-01-01",
      "premiumAmount": 1200,
      "coverageAmount": 100000,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "coverages": [ /* ... */ ],
      "beneficiaries": [ /* ... */ ]
    }
  }
}
```

### Beneficiary Endpoints

#### GET /api/v1/customers/:customerId/beneficiaries
Get all beneficiaries for a customer

#### POST /api/v1/customers/:customerId/beneficiaries
Create new beneficiary

#### GET /api/v1/policies/:policyId/beneficiaries
Get beneficiaries linked to a specific policy with allocation totals

#### POST /api/v1/policies/:policyId/beneficiaries
Link existing beneficiary to policy

#### PUT /api/v1/policies/:policyId/beneficiaries/:linkId
Update beneficiary link (allocation, type)

#### DELETE /api/v1/policies/:policyId/beneficiaries/:linkId
Remove beneficiary from policy

---

## Frontend Services

### policyService

```typescript
import { policyService } from './services/policyService';

// Upload document
const response = await policyService.uploadPolicyDocument(file);
const { extractedData, documentRecord } = response;

// Sync to CRM
const syncResult = await policyService.syncPolicyToCRM({
  extractedData,
  documentRecord
});
console.log('Customer ID:', syncResult.customerId);
console.log('Policy ID:', syncResult.policyId);

// Get customer policies
const policies = await policyService.getCustomerPolicies(customerId);
```

### beneficiaryService

```typescript
import { beneficiaryService } from './services/policyService';

// Get policy beneficiaries
const result = await beneficiaryService.getPolicyBeneficiaries(policyId);
console.log('Primary total:', result.totals.primary);
console.log('Contingent total:', result.totals.contingent);

// Link beneficiary
await beneficiaryService.linkBeneficiaryToPolicy(policyId, {
  contactId: 789,
  beneficiaryType: 'primary',
  allocationPercentage: 50,
  relationship: 'spouse',
  isRevocable: true
});
```

### LocalStorage Utility

```typescript
import {
  saveExtractionData,
  getCurrentExtraction,
  updatePolicyHolder,
  validateExtractionData,
  markAsSynced
} from './utils/policyExtractionStorage';

// Save extraction
saveExtractionData(extractedData, documentRecord);

// Get current
const current = getCurrentExtraction();

// Update fields
updatePolicyHolder({ email: 'newemail@example.com' });

// Validate
const validation = validateExtractionData();
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}

// Mark synced after successful API call
markAsSynced(customerId, policyId);
```

---

## ACORD Standards

### Supported ACORD Forms

- **ACORD 25**: Certificate of Liability Insurance
- **ACORD 27**: Evidence of Property Insurance
- **ACORD 101**: Additional Remarks Schedule
- **ACORD 126**: Commercial General Liability Section

### Field Mappings

| ACORD Field | Database Field | Type |
|-------------|----------------|------|
| Named Insured | customers.first_name, last_name | VARCHAR |
| Policy Number | policies.policy_number | VARCHAR(100) |
| Effective Date | policies.effective_date | DATE |
| Expiration Date | policies.expiration_date | DATE |
| Coverage Type | policy_coverages.coverage_type | VARCHAR |
| Coverage Limit | policy_coverages.coverage_limit | DECIMAL |
| Deductible | policy_coverages.deductible | DECIMAL |
| Premium | policies.premium_amount | DECIMAL |

### Coverage Codes

Common ACORD coverage codes extracted:

- **BI**: Bodily Injury
- **PD**: Property Damage
- **COLL**: Collision
- **COMP**: Comprehensive
- **UM**: Uninsured Motorist
- **UIM**: Underinsured Motorist
- **MED**: Medical Payments

---

## Usage Guide

### Step 1: Navigate to Gap Analysis Page

Agents access the policy upload feature at `/gap-analysis`.

### Step 2: Upload Policy Document

1. Click "Upload Policy Document" button
2. Select PDF or image file (max 10MB)
3. System uploads and sends to AI for extraction (may take 30-120 seconds)
4. Extracted data displays for review

### Step 3: Review & Edit Extracted Data

**Policy Holder Section:**
- Verify name, email, phone, date of birth
- Update address if incorrect
- Confirm SSN last 4 digits (if visible)

**Policy Information:**
- Verify policy number and insurer
- Check effective and expiration dates
- Confirm premium amount and frequency
- Update coverage amount and deductible if needed

**Beneficiaries:**
- Review each beneficiary's information
- Verify relationship (spouse, child, parent, etc.)
- Check allocation percentages total 100% per type
- Confirm primary vs. contingent designation

**Coverages:**
- Review all coverage types
- Verify coverage limits and deductibles
- Check for missing coverages

### Step 4: Validate & Sync to CRM

1. System validates:
   - Required fields (policy number, insurer, dates)
   - Beneficiary allocations total 100% per type
   - Valid dates and amounts
2. If validation passes, click "Sync to CRM"
3. System performs:
   - Customer matching/creation
   - Policy creation/update
   - Beneficiary linking
   - Coverage creation
4. Success message shows customer ID and policy ID
5. Link to customer profile to view complete data

### Step 5: Verify in CRM

Navigate to customer profile to verify:
- Customer information is correct
- Policy appears in policies list
- Beneficiaries are linked correctly
- Coverages are complete
- Timeline shows "Policy Added" entry

---

## Testing

### Unit Tests (Backend)

```javascript
// Test AI extraction service
describe('policyExtraction.service', () => {
  it('should extract policy holder from PDF', async () => {
    const file = { path: './test/samples/policy.pdf' };
    const data = await extractPolicyData(file);
    expect(data.policyHolder.firstName).toBe('John');
  });

  it('should validate beneficiary allocations', () => {
    const beneficiaries = [
      { beneficiaryType: 'primary', allocationPercentage: 60 },
      { beneficiaryType: 'primary', allocationPercentage: 40 }
    ];
    const total = beneficiaries.reduce((sum, b) => sum + b.allocationPercentage, 0);
    expect(total).toBe(100);
  });
});

// Test policy sync controller
describe('policy.controller syncPolicyToCRM', () => {
  it('should create new customer if not exists', async () => {
    const extractedData = { /* ... */ };
    const result = await syncPolicyToCRM({ body: { extractedData } });
    expect(result.customerId).toBeDefined();
  });

  it('should link beneficiaries with correct allocation', async () => {
    // Test beneficiary linking logic
  });
});
```

### Integration Tests

```javascript
// Test full workflow
describe('Policy Upload Workflow', () => {
  it('should complete upload → extract → sync flow', async () => {
    // 1. Upload document
    const uploadResponse = await request(app)
      .post('/api/v1/policies/upload')
      .attach('policyDocument', './test/samples/policy.pdf');

    expect(uploadResponse.body.success).toBe(true);

    // 2. Sync to CRM
    const syncResponse = await request(app)
      .post('/api/v1/policies/sync')
      .send({ extractedData: uploadResponse.body.data.extractedData });

    expect(syncResponse.body.data.policyId).toBeDefined();

    // 3. Verify in database
    const policy = await query('SELECT * FROM policies WHERE id = ?', [syncResponse.body.data.policyId]);
    expect(policy.length).toBe(1);
  });
});
```

### Frontend Tests

```typescript
// Test localStorage utility
describe('policyExtractionStorage', () => {
  it('should save and retrieve extraction data', () => {
    saveExtractionData(mockExtractedData, mockDocumentRecord);
    const retrieved = getCurrentExtraction();
    expect(retrieved).not.toBeNull();
    expect(retrieved!.extractedData.policy.policyNumber).toBe('AUTO-2024-12345');
  });

  it('should validate incomplete data', () => {
    saveExtractionData({ policy: { policyNumber: '' } }, {});
    const validation = validateExtractionData();
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Policy number is required');
  });
});
```

### Sample Test Data

```json
{
  "policyHolder": {
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "555-0100",
    "dateOfBirth": "1980-01-01"
  },
  "policy": {
    "policyNumber": "TEST-2024-001",
    "insurer": "Test Insurance Co.",
    "policyType": "auto",
    "status": "active",
    "effectiveDate": "2024-01-01",
    "expirationDate": "2025-01-01",
    "premiumAmount": 1000,
    "premiumFrequency": "annual",
    "deductible": 500,
    "coverageAmount": 100000
  },
  "beneficiaries": [],
  "coverages": [
    {
      "coverageType": "Liability",
      "coverageLimit": 100000,
      "deductible": 0
    }
  ]
}
```

---

## Troubleshooting

### Common Issues

**Issue: AI extraction fails with timeout**
- **Cause**: Large PDF files (>5MB) or complex documents
- **Solution**: Increase timeout in uploadPolicyDocument() to 180000ms (3 min)

**Issue: Customer duplicate created**
- **Cause**: Email or name+DOB doesn't match exactly
- **Solution**: Review customer matching logic, consider fuzzy matching

**Issue: Beneficiary allocation validation fails**
- **Cause**: Totals don't equal 100% due to rounding
- **Solution**: Use Math.abs(total - 100) > 0.01 threshold

**Issue: Policy sync fails mid-transaction**
- **Cause**: Foreign key constraint violation or validation error
- **Solution**: Check logs, ensure ROLLBACK is called, verify data integrity

**Issue: Extracted data missing fields**
- **Cause**: Document quality, OCR limitations, unsupported format
- **Solution**: Allow manual entry, improve Gemini prompt, pre-process images

### Error Codes

| Code | Message | Action |
|------|---------|--------|
| 400 | No file uploaded | Ensure file is attached in FormData |
| 400 | Invalid extracted data | Check extractedData.policy and policyHolder exist |
| 500 | Failed to extract policy data | Check Gemini API key, file format, network |
| 500 | Policy sync error | Check database connection, foreign keys, transaction logs |

### Debugging Tips

1. **Enable verbose logging**:
   ```javascript
   console.log('Extracting policy from:', file.originalname);
   console.log('AI response:', JSON.stringify(extractedData, null, 2));
   ```

2. **Check localStorage**:
   Open browser DevTools → Application → Local Storage → Look for `policy_extraction_current`

3. **Inspect database**:
   ```sql
   -- Check customer exists
   SELECT * FROM customers WHERE email = 'john.doe@example.com';

   -- Verify policy created
   SELECT * FROM policies WHERE policy_number = 'AUTO-2024-12345';

   -- Check beneficiary links
   SELECT pb.*, c.first_name, c.last_name
   FROM policy_beneficiaries pb
   JOIN contacts c ON pb.contact_id = c.id
   WHERE pb.policy_id = 456;
   ```

4. **Test AI extraction manually**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/policies/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "policyDocument=@./policy.pdf"
   ```

---

## Security Considerations

1. **File Upload Security**:
   - Validate file types (PDF, PNG, JPG only)
   - Limit file size to 10MB
   - Store uploaded files outside web root
   - Sanitize file names

2. **Data Privacy**:
   - SSN stored as last 4 digits only
   - Sensitive data in policy_details JSON encrypted at rest
   - Access control via JWT authentication
   - Audit trail for all policy changes

3. **API Security**:
   - All endpoints require authentication
   - Admin-only endpoints for delete operations
   - Rate limiting on upload endpoints
   - Input validation with express-validator

---

## Performance Optimization

1. **AI Processing**: Use Gemini 1.5 Flash (faster, cheaper than Pro)
2. **Database Queries**: Index on policy_number, customer email, contact relationships
3. **File Storage**: Store documents in S3/cloud storage, not database
4. **Caching**: Cache customer lookups during sync to reduce queries
5. **Batch Operations**: Use multi-row INSERT for coverages

---

## Future Enhancements

1. **OCR Pre-processing**: Enhance image quality before sending to AI
2. **Multi-document Upload**: Batch process multiple policies
3. **Document Comparison**: Compare old vs. new policy versions
4. **Automated Gap Analysis**: Run gap analysis on newly extracted policies
5. **Webhook Notifications**: Notify agents when extraction completes
6. **Export to ACORD XML**: Generate ACORD XML from extracted data
7. **Machine Learning**: Train custom model on historical extractions for better accuracy
8. **Mobile App**: Native mobile app for on-the-go policy uploads

---

## Support

For technical support or questions about the policy extraction workflow:

- **Documentation**: [POLICY_DOCUMENT_WORKFLOW.md](./POLICY_DOCUMENT_WORKFLOW.md)
- **API Reference**: [API.md](./API.md)
- **Database Schema**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- **GitHub Issues**: [Report a bug](https://github.com/youragency/agentrise/issues)

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
**Maintained By**: Engineering Team
