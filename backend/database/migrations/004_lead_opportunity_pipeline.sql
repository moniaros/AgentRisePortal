-- Migration: Lead & Opportunity Pipeline System
-- Created: 2025-11-12
-- Description: Creates tables for lead ingestion, opportunity management, and interaction logging

-- Transaction Inquiries (Lead Inbox)
CREATE TABLE IF NOT EXISTS transaction_inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    agent_id INT NULL,

    -- Contact Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),

    -- Inquiry Details
    inquiry_type ENUM('general', 'quote_request', 'policy_question', 'claim', 'other') DEFAULT 'general',
    policy_interest VARCHAR(100),
    message TEXT,

    -- Source Tracking (UTM parameters)
    source VARCHAR(100),
    medium VARCHAR(100),
    campaign VARCHAR(100),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    referrer_url VARCHAR(500),
    landing_page_url VARCHAR(500),

    -- GDPR Consent
    gdpr_consent_provided BOOLEAN DEFAULT FALSE,
    gdpr_consent_date TIMESTAMP NULL,
    marketing_consent_provided BOOLEAN DEFAULT FALSE,
    marketing_consent_date TIMESTAMP NULL,

    -- Status
    status ENUM('new', 'reviewed', 'converted', 'spam', 'duplicate') DEFAULT 'new',
    converted_to_opportunity_id INT NULL,
    converted_at TIMESTAMP NULL,
    converted_by_user_id INT NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_tenant_agent (tenant_id, agent_id),
    INDEX idx_status (status),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (converted_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quote Requests (linked to inquiries)
CREATE TABLE IF NOT EXISTS transaction_quote_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inquiry_id INT NOT NULL,
    tenant_id INT NOT NULL,

    -- Quote Details
    policy_type ENUM('auto', 'home', 'life', 'health', 'business', 'other') NOT NULL,
    coverage_amount DECIMAL(12, 2),
    requested_start_date DATE,

    -- Auto Insurance Specific
    vehicle_make VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_year INT,
    vehicle_vin VARCHAR(17),

    -- Home Insurance Specific
    property_address VARCHAR(255),
    property_value DECIMAL(12, 2),
    property_type VARCHAR(50),

    -- Life Insurance Specific
    date_of_birth DATE,
    smoker BOOLEAN,
    health_conditions TEXT,

    -- Additional Information
    current_insurer VARCHAR(100),
    current_premium DECIMAL(10, 2),
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_inquiry (inquiry_id),
    INDEX idx_tenant (tenant_id),
    INDEX idx_policy_type (policy_type),
    FOREIGN KEY (inquiry_id) REFERENCES transaction_inquiries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Opportunities (Sales Pipeline)
CREATE TABLE IF NOT EXISTS opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    agent_id INT NOT NULL,

    -- Opportunity Details
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Prospect Information
    prospect_id INT NULL, -- Links to customers or leads
    prospect_type ENUM('customer', 'inquiry') DEFAULT 'inquiry',
    prospect_name VARCHAR(255) NOT NULL,
    prospect_email VARCHAR(255),
    prospect_phone VARCHAR(20),

    -- Financial
    estimated_value DECIMAL(12, 2) DEFAULT 0.00, -- Expected annual premium
    probability INT DEFAULT 50, -- Win probability percentage

    -- Pipeline Stage
    stage ENUM('new', 'contacted', 'proposal', 'won', 'lost') DEFAULT 'new',
    stage_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    previous_stage ENUM('new', 'contacted', 'proposal', 'won', 'lost') NULL,

    -- Follow-up Management
    next_follow_up_date DATE NULL,
    last_contact_date DATE NULL,

    -- Closure Information
    won_date DATE NULL,
    lost_date DATE NULL,
    lost_reason VARCHAR(255) NULL,
    closed_by_user_id INT NULL,

    -- Policy Information (for won deals)
    policy_id INT NULL,
    policy_type VARCHAR(50),
    actual_premium DECIMAL(12, 2) NULL,

    -- Source Tracking
    source_inquiry_id INT NULL,
    source_campaign_id INT NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_tenant_agent (tenant_id, agent_id),
    INDEX idx_stage (stage),
    INDEX idx_prospect (prospect_id, prospect_type),
    INDEX idx_next_follow_up (next_follow_up_date),
    INDEX idx_source_inquiry (source_inquiry_id),
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (source_inquiry_id) REFERENCES transaction_inquiries(id) ON DELETE SET NULL,
    FOREIGN KEY (closed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Interactions (Communication Log)
CREATE TABLE IF NOT EXISTS interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    opportunity_id INT NOT NULL,
    user_id INT NOT NULL,

    -- Interaction Details
    interaction_type ENUM('email', 'sms', 'phone', 'meeting', 'viber', 'whatsapp', 'note') NOT NULL,
    direction ENUM('inbound', 'outbound') DEFAULT 'outbound',
    subject VARCHAR(255),
    content TEXT,

    -- Communication Metadata
    recipient VARCHAR(255),
    sent_via VARCHAR(50), -- Email provider, SMS gateway, etc.
    delivery_status ENUM('pending', 'sent', 'delivered', 'failed', 'bounced') DEFAULT 'sent',

    -- Scheduling (for future interactions)
    scheduled_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,

    -- Attachments
    attachments JSON,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_opportunity (opportunity_id),
    INDEX idx_tenant (tenant_id),
    INDEX idx_user (user_id),
    INDEX idx_type (interaction_type),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversion Events (Analytics)
CREATE TABLE IF NOT EXISTS conversion_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    opportunity_id INT NOT NULL,
    agent_id INT NOT NULL,

    -- Conversion Details
    conversion_type ENUM('lead_to_opportunity', 'opportunity_to_policy') NOT NULL,
    conversion_value DECIMAL(12, 2) DEFAULT 0.00,

    -- Attribution
    source_inquiry_id INT NULL,
    source_campaign_id INT NULL,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),

    -- Policy Information
    policy_id INT NULL,
    policy_type VARCHAR(50),
    annual_premium DECIMAL(12, 2),

    -- Metadata
    conversion_data JSON,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_tenant (tenant_id),
    INDEX idx_opportunity (opportunity_id),
    INDEX idx_agent (agent_id),
    INDEX idx_conversion_type (conversion_type),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (source_inquiry_id) REFERENCES transaction_inquiries(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pipeline Statistics (for performance)
CREATE TABLE IF NOT EXISTS pipeline_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    agent_id INT NULL, -- NULL for tenant-wide stats
    date DATE NOT NULL,

    -- Lead Metrics
    total_leads INT DEFAULT 0,
    new_leads INT DEFAULT 0,
    converted_leads INT DEFAULT 0,

    -- Opportunity Metrics
    total_opportunities INT DEFAULT 0,
    new_opportunities INT DEFAULT 0,
    contacted_opportunities INT DEFAULT 0,
    proposal_opportunities INT DEFAULT 0,
    won_opportunities INT DEFAULT 0,
    lost_opportunities INT DEFAULT 0,

    -- Financial Metrics
    pipeline_value DECIMAL(15, 2) DEFAULT 0.00,
    won_value DECIMAL(15, 2) DEFAULT 0.00,
    lost_value DECIMAL(15, 2) DEFAULT 0.00,

    -- Conversion Rates
    lead_conversion_rate DECIMAL(5, 2) DEFAULT 0.00,
    opportunity_win_rate DECIMAL(5, 2) DEFAULT 0.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_stat (tenant_id, agent_id, date),
    INDEX idx_tenant_date (tenant_id, date),
    INDEX idx_agent_date (agent_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
