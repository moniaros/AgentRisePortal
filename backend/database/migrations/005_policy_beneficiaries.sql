-- Migration 005: Policy Beneficiaries and Enhanced ACORD Support
-- Adds beneficiary management for policies and enhances ACORD data structure

-- Create contacts/beneficiaries table
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL COMMENT 'e.g., spouse, child, parent, sibling, trust, estate',
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    ssn_last_four VARCHAR(4) COMMENT 'Last 4 digits for identification',
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zip VARCHAR(10),
    contact_type ENUM('beneficiary', 'dependent', 'emergency', 'other') DEFAULT 'beneficiary',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_contact_type (contact_type),
    INDEX idx_relationship (relationship)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create policy_beneficiaries junction table
CREATE TABLE IF NOT EXISTS policy_beneficiaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    contact_id INT NOT NULL,
    beneficiary_type ENUM('primary', 'contingent') DEFAULT 'primary',
    allocation_percentage DECIMAL(5, 2) NOT NULL DEFAULT 100.00 COMMENT 'Percentage of benefit allocation',
    relationship VARCHAR(50) NOT NULL COMMENT 'Relationship to policy holder',
    is_revocable BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_policy_contact (policy_id, contact_id),
    INDEX idx_policy_id (policy_id),
    INDEX idx_contact_id (contact_id),
    INDEX idx_beneficiary_type (beneficiary_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create policy_documents table to track uploaded documents
CREATE TABLE IF NOT EXISTS policy_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    document_type VARCHAR(50) NOT NULL COMMENT 'e.g., declaration_page, full_policy, endorsement, claim_form',
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT COMMENT 'File size in bytes',
    mime_type VARCHAR(100),
    uploaded_by_user_id INT,
    extraction_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    extraction_data JSON COMMENT 'AI-extracted data from document',
    extraction_completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_policy_id (policy_id),
    INDEX idx_document_type (document_type),
    INDEX idx_extraction_status (extraction_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add additional ACORD-specific fields to policy_coverages
-- These align with ACORD forms (e.g., ACORD 25, ACORD 27)
ALTER TABLE policy_coverages
ADD COLUMN coverage_code VARCHAR(20) COMMENT 'ACORD standard coverage code',
ADD COLUMN premium_amount DECIMAL(10, 2) COMMENT 'Premium for this specific coverage',
ADD COLUMN coverage_details JSON COMMENT 'Additional ACORD coverage details';

-- Create indexes for better query performance
CREATE INDEX idx_policies_acord_data ON policies((CAST(acord_data AS CHAR(255)) COLLATE utf8mb4_unicode_ci));
CREATE INDEX idx_policy_coverages_code ON policy_coverages(coverage_code);
