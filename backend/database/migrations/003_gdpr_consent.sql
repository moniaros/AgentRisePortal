-- Migration: Add GDPR consent tracking to customers table
-- Created: 2025-11-12
-- Description: Adds fields for tracking GDPR consent and marketing consent with dates and channels

-- Add GDPR consent fields to customers table
ALTER TABLE customers
ADD COLUMN gdpr_consent_provided BOOLEAN DEFAULT FALSE AFTER notes,
ADD COLUMN gdpr_consent_date TIMESTAMP NULL AFTER gdpr_consent_provided,
ADD COLUMN gdpr_consent_channel ENUM('email', 'sms', 'phone', 'web_form', 'in_person', 'other') NULL AFTER gdpr_consent_date,
ADD COLUMN marketing_consent_provided BOOLEAN DEFAULT FALSE AFTER gdpr_consent_channel,
ADD COLUMN marketing_consent_date TIMESTAMP NULL AFTER marketing_consent_provided,
ADD COLUMN marketing_consent_channel ENUM('email', 'sms', 'phone', 'web_form', 'in_person', 'other') NULL AFTER marketing_consent_date;

-- Add index for quick consent queries
CREATE INDEX idx_customers_gdpr_consent ON customers(gdpr_consent_provided, gdpr_consent_date);
CREATE INDEX idx_customers_marketing_consent ON customers(marketing_consent_provided, marketing_consent_date);

-- Update existing customers to have NULL consent dates (explicitly not consented yet)
UPDATE customers
SET gdpr_consent_provided = FALSE,
    marketing_consent_provided = FALSE
WHERE gdpr_consent_date IS NULL;
