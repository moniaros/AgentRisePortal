import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  let connection;

  try {
    console.log('🌱 Starting database seeding...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'agentrise_db'
    });

    console.log('✅ Connected to database');

    // Hash password for demo users
    const password = await bcrypt.hash('password123', 12);

    // 1. Create demo users
    console.log('\n📝 Creating demo users...');
    const [adminResult] = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, phone, license_number, license_state, license_expiry)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['admin@agentrise.com', password, 'Admin', 'User', 'admin', '555-0100', 'INS-ADMIN-001', 'CA', '2026-12-31']
    );

    const [agentResult] = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, phone, license_number, license_state, license_expiry)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['agent@agentrise.com', password, 'John', 'Smith', 'agent', '555-0101', 'INS-AGENT-001', 'CA', '2025-12-31']
    );

    console.log('  ✓ Created admin user: admin@agentrise.com');
    console.log('  ✓ Created agent user: agent@agentrise.com');
    console.log('  📌 Password for both: password123');

    // 2. Create demo customers
    console.log('\n📝 Creating demo customers...');
    const customers = [
      ['John', 'Doe', 'john.doe@example.com', '555-1001', '1980-05-15', '123 Main St', 'Los Angeles', 'CA', '90001', agentResult.insertId],
      ['Jane', 'Smith', 'jane.smith@example.com', '555-1002', '1975-08-22', '456 Oak Ave', 'San Francisco', 'CA', '94102', agentResult.insertId],
      ['Robert', 'Johnson', 'robert.j@example.com', '555-1003', '1990-03-10', '789 Pine Rd', 'San Diego', 'CA', '92101', agentResult.insertId],
      ['Maria', 'Garcia', 'maria.g@example.com', '555-1004', '1985-11-30', '321 Elm St', 'Sacramento', 'CA', '95814', agentResult.insertId],
      ['David', 'Williams', 'david.w@example.com', '555-1005', '1978-07-18', '654 Maple Dr', 'San Jose', 'CA', '95113', agentResult.insertId]
    ];

    for (const customer of customers) {
      await connection.query(
        `INSERT INTO customers (first_name, last_name, email, phone, date_of_birth, address_street, address_city, address_state, address_zip, customer_since, assigned_agent_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY), ?, 'active')`,
        customer
      );
    }

    console.log(`  ✓ Created ${customers.length} demo customers`);

    // 3. Create demo leads
    console.log('\n📝 Creating demo leads...');
    const leads = [
      ['Michael', 'Brown', 'michael.b@example.com', '555-2001', 'Facebook Ad', 'auto', agentResult.insertId, 'new'],
      ['Sarah', 'Davis', 'sarah.d@example.com', '555-2002', 'Google Search', 'home', agentResult.insertId, 'contacted'],
      ['James', 'Miller', 'james.m@example.com', '555-2003', 'Referral', 'life', agentResult.insertId, 'qualified'],
      ['Emily', 'Wilson', 'emily.w@example.com', '555-2004', 'Website', 'health', agentResult.insertId, 'new']
    ];

    for (const lead of leads) {
      await connection.query(
        `INSERT INTO leads (first_name, last_name, email, phone, source, interest, assigned_agent_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        lead
      );
    }

    console.log(`  ✓ Created ${leads.length} demo leads`);

    // 4. Create demo policies
    console.log('\n📝 Creating demo policies...');
    const policies = [
      [1, 'AUTO-2024-001', 'auto', 'State Farm', '2024-01-01', '2025-01-01', 1200.00, 'annual', 100000, 500],
      [1, 'HOME-2024-001', 'home', 'Allstate', '2024-01-01', '2025-01-01', 1800.00, 'annual', 350000, 1000],
      [2, 'AUTO-2024-002', 'auto', 'Geico', '2024-02-15', '2025-02-15', 950.00, 'annual', 100000, 500],
      [2, 'LIFE-2024-001', 'life', 'MetLife', '2024-02-15', '2034-02-15', 2400.00, 'annual', 500000, 0],
      [3, 'AUTO-2024-003', 'auto', 'Progressive', '2024-03-01', '2025-03-01', 1100.00, 'annual', 100000, 500],
      [4, 'HOME-2024-002', 'home', 'Liberty Mutual', '2024-04-01', '2025-04-01', 2200.00, 'annual', 450000, 1500],
      [5, 'HEALTH-2024-001', 'health', 'Blue Cross', '2024-05-01', '2025-05-01', 6000.00, 'annual', 1000000, 2000]
    ];

    for (const policy of policies) {
      await connection.query(
        `INSERT INTO policies (customer_id, policy_number, policy_type, insurer, status, effective_date, expiration_date, premium_amount, premium_frequency, coverage_amount, deductible)
         VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)`,
        policy
      );
    }

    console.log(`  ✓ Created ${policies.length} demo policies`);

    // 5. Create demo campaigns
    console.log('\n📝 Creating demo campaigns...');
    await connection.query(
      `INSERT INTO campaigns (name, objective, status, platforms, budget, budget_type, start_date, end_date, impressions, clicks, conversions, spend, created_by_user_id)
       VALUES
       ('Spring Auto Insurance Sale', 'Lead Generation', 'active', '["Facebook", "Google"]', 5000.00, 'total', '2024-03-01', '2024-05-31', 125000, 3500, 145, 3250.00, ?),
       ('Home Insurance Awareness', 'Brand Awareness', 'completed', '["Facebook", "Instagram"]', 3000.00, 'total', '2024-01-01', '2024-02-28', 85000, 2100, 78, 2850.00, ?),
       ('Life Insurance Q2 Campaign', 'Lead Generation', 'active', '["Google", "LinkedIn"]', 7500.00, 'total', '2024-04-01', '2024-06-30', 95000, 2800, 102, 4200.00, ?)`,
      [agentResult.insertId, agentResult.insertId, agentResult.insertId]
    );

    console.log('  ✓ Created 3 demo campaigns');

    // 6. Create demo automation rules
    console.log('\n📝 Creating demo automation rules...');
    const [ruleResult] = await connection.query(
      `INSERT INTO automation_rules (name, description, trigger_type, is_active, created_by_user_id)
       VALUES ('Welcome New Leads', 'Send welcome email to new leads', 'lead_created', true, ?)`,
      [agentResult.insertId]
    );

    await connection.query(
      `INSERT INTO automation_rule_conditions (rule_id, field_name, operator, value, condition_order)
       VALUES (?, 'status', 'equals', 'new', 0)`,
      [ruleResult.insertId]
    );

    await connection.query(
      `INSERT INTO automation_rule_actions (rule_id, action_type, action_config, action_order)
       VALUES (?, 'send_email', '{"template": "welcome_lead", "subject": "Thank you for your interest"}', 0)`,
      [ruleResult.insertId]
    );

    console.log('  ✓ Created 1 demo automation rule');

    // 7. Create demo testimonials
    console.log('\n📝 Creating demo testimonials...');
    await connection.query(
      `INSERT INTO testimonials (customer_id, customer_name, customer_title, testimonial_text, rating, status)
       VALUES
       (1, 'John Doe', 'Business Owner', 'Excellent service! They helped me save 30%% on my auto insurance.', 5, 'approved'),
       (2, 'Jane Smith', 'Homeowner', 'Very professional and knowledgeable. Highly recommend!', 5, 'approved'),
       (3, 'Robert Johnson', 'IT Professional', 'Great experience. The team was very helpful in explaining all my options.', 4, 'approved')`
    );

    console.log('  ✓ Created 3 demo testimonials');

    // 8. Create demo news articles
    console.log('\n📝 Creating demo news articles...');
    await connection.query(
      `INSERT INTO news_articles (title, slug, excerpt, content, author_id, status, published_at)
       VALUES
       ('Understanding Auto Insurance Coverage', 'understanding-auto-insurance-coverage', 'Learn about the different types of auto insurance coverage and what you need.', '<p>Auto insurance can be confusing. This article breaks down the key coverage types...</p>', ?, 'published', NOW()),
       ('5 Tips to Lower Your Home Insurance Premium', '5-tips-lower-home-insurance-premium', 'Discover practical ways to reduce your home insurance costs.', '<p>Here are five proven strategies to lower your home insurance premium...</p>', ?, 'published', NOW())`,
      [adminResult.insertId, adminResult.insertId]
    );

    console.log('  ✓ Created 2 demo news articles');

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('═'.repeat(60));
    console.log('📋 DEMO CREDENTIALS:');
    console.log('═'.repeat(60));
    console.log('  Admin Login:');
    console.log('    Email:    admin@agentrise.com');
    console.log('    Password: password123');
    console.log('');
    console.log('  Agent Login:');
    console.log('    Email:    agent@agentrise.com');
    console.log('    Password: password123');
    console.log('═'.repeat(60));
    console.log('');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run seeding
seedDatabase();
