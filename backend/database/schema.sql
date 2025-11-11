-- AgentRise Portal Database Schema
-- MySQL Database Schema for Insurance Agency Management System

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS timeline_entries;
DROP TABLE IF EXISTS policy_coverages;
DROP TABLE IF EXISTS policies;
DROP TABLE IF EXISTS campaign_leads;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS automation_rule_actions;
DROP TABLE IF EXISTS automation_rule_conditions;
DROP TABLE IF EXISTS automation_rules;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS news_articles;
DROP TABLE IF EXISTS microsite_blocks;
DROP TABLE IF EXISTS microsites;
DROP TABLE IF EXISTS gbp_reviews;
DROP TABLE IF EXISTS gbp_locations;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;

-- Users table (authentication and user management)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'agent') DEFAULT 'agent',
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    license_number VARCHAR(50),
    license_state VARCHAR(2),
    license_expiry DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User sessions (JWT token tracking)
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customers table (CRM)
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zip VARCHAR(10),
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    customer_since DATE,
    total_premium DECIMAL(10, 2) DEFAULT 0.00,
    lifetime_value DECIMAL(10, 2) DEFAULT 0.00,
    assigned_agent_id INT,
    communication_preference ENUM('email', 'phone', 'sms', 'none') DEFAULT 'email',
    attention_flag BOOLEAN DEFAULT FALSE,
    attention_reason VARCHAR(500),
    tags JSON,
    custom_fields JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_assigned_agent (assigned_agent_id),
    INDEX idx_customer_since (customer_since)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leads table
CREATE TABLE leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    source VARCHAR(100),
    status ENUM('new', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new',
    interest VARCHAR(100),
    assigned_agent_id INT,
    converted_customer_id INT,
    score INT DEFAULT 0,
    notes TEXT,
    custom_fields JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    contacted_at TIMESTAMP NULL,
    converted_at TIMESTAMP NULL,
    FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (converted_customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_source (source),
    INDEX idx_assigned_agent (assigned_agent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Policies table
CREATE TABLE policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    policy_number VARCHAR(100) UNIQUE NOT NULL,
    policy_type ENUM('auto', 'home', 'life', 'health', 'commercial', 'umbrella', 'renters', 'other') NOT NULL,
    insurer VARCHAR(100) NOT NULL,
    status ENUM('active', 'pending', 'expired', 'cancelled') DEFAULT 'active',
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    premium_amount DECIMAL(10, 2) NOT NULL,
    premium_frequency ENUM('monthly', 'quarterly', 'semi-annual', 'annual') DEFAULT 'annual',
    coverage_amount DECIMAL(12, 2),
    deductible DECIMAL(10, 2),
    policy_details JSON,
    acord_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_policy_number (policy_number),
    INDEX idx_policy_type (policy_type),
    INDEX idx_status (status),
    INDEX idx_expiration_date (expiration_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Policy coverages table (for detailed coverage breakdowns)
CREATE TABLE policy_coverages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    coverage_type VARCHAR(100) NOT NULL,
    coverage_limit DECIMAL(12, 2),
    deductible DECIMAL(10, 2),
    description TEXT,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    INDEX idx_policy_id (policy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Timeline entries (notes, calls, emails, meetings)
CREATE TABLE timeline_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    entry_type ENUM('note', 'call', 'email', 'meeting', 'claim', 'policy_change', 'payment') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by_user_id INT,
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_customer_id (customer_id),
    INDEX idx_entry_type (entry_type),
    INDEX idx_entry_date (entry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Campaigns table
CREATE TABLE campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    objective VARCHAR(100),
    status ENUM('draft', 'active', 'paused', 'completed') DEFAULT 'draft',
    platforms JSON,
    target_audience JSON,
    budget DECIMAL(10, 2),
    budget_type ENUM('daily', 'total') DEFAULT 'total',
    start_date DATE,
    end_date DATE,
    creative_data JSON,
    lead_form_data JSON,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    spend DECIMAL(10, 2) DEFAULT 0.00,
    created_by_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_created_by (created_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Campaign leads (leads generated from campaigns)
CREATE TABLE campaign_leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    lead_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    UNIQUE KEY unique_campaign_lead (campaign_id, lead_id),
    INDEX idx_campaign_id (campaign_id),
    INDEX idx_lead_id (lead_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Automation rules table
CREATE TABLE automation_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    execution_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    last_executed_at TIMESTAMP NULL,
    created_by_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_trigger_type (trigger_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Automation rule conditions
CREATE TABLE automation_rule_conditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_id INT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    operator VARCHAR(20) NOT NULL,
    value VARCHAR(255),
    condition_order INT DEFAULT 0,
    FOREIGN KEY (rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE,
    INDEX idx_rule_id (rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Automation rule actions
CREATE TABLE automation_rule_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_config JSON,
    action_order INT DEFAULT 0,
    FOREIGN KEY (rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE,
    INDEX idx_rule_id (rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Google Business Profile locations
CREATE TABLE gbp_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    rating DECIMAL(2, 1),
    review_count INT DEFAULT 0,
    category VARCHAR(100),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location_id (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Google Business Profile reviews
CREATE TABLE gbp_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    review_id VARCHAR(255) UNIQUE NOT NULL,
    reviewer_name VARCHAR(255),
    reviewer_photo_url VARCHAR(500),
    rating INT NOT NULL,
    review_text TEXT,
    review_reply TEXT,
    review_date TIMESTAMP NOT NULL,
    replied_at TIMESTAMP NULL,
    FOREIGN KEY (location_id) REFERENCES gbp_locations(id) ON DELETE CASCADE,
    INDEX idx_location_id (location_id),
    INDEX idx_review_id (review_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Microsites table
CREATE TABLE microsites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    site_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    theme_config JSON,
    seo_config JSON,
    is_published BOOLEAN DEFAULT FALSE,
    created_by_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_customer_id (customer_id),
    INDEX idx_subdomain (subdomain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Microsite blocks
CREATE TABLE microsite_blocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    microsite_id INT NOT NULL,
    block_type VARCHAR(50) NOT NULL,
    block_order INT DEFAULT 0,
    content JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (microsite_id) REFERENCES microsites(id) ON DELETE CASCADE,
    INDEX idx_microsite_id (microsite_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- News articles
CREATE TABLE news_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    author_id INT,
    featured_image_url VARCHAR(500),
    tags JSON,
    seo_title VARCHAR(255),
    seo_description TEXT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Testimonials
CREATE TABLE testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    customer_name VARCHAR(255) NOT NULL,
    customer_title VARCHAR(255),
    testimonial_text TEXT NOT NULL,
    rating INT,
    photo_url VARCHAR(500),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit logs
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
