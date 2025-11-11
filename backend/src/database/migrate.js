import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const runMigration = async () => {
  let connection;

  try {
    console.log('🔄 Starting database migration...\n');

    // Connect to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'agentrise_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' ready`);

    // Switch to the database
    await connection.query(`USE \`${dbName}\``);

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split SQL file by semicolons and execute each statement
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`\n📋 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      try {
        await connection.query(statements[i]);
        // Log progress for CREATE TABLE statements
        if (statements[i].toUpperCase().includes('CREATE TABLE')) {
          const tableName = statements[i].match(/CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?/i);
          if (tableName) {
            console.log(`  ✓ Created table: ${tableName[1]}`);
          }
        }
      } catch (error) {
        console.error(`  ✗ Error executing statement ${i + 1}:`, error.message);
        // Continue with other statements
      }
    }

    console.log('\n✅ Database migration completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run migration
runMigration();
