# AgentRise Insurance Portal

A comprehensive SaaS platform for insurance agencies built with React 19, TypeScript, Node.js, and MySQL.

## Features

- **CRM System**: Customer and lead management with complete customer profiles
- **Policy Management**: Track and manage insurance policies with ACORD standard support
- **Marketing Automation**: Create and manage marketing campaigns across social networks
- **AI-Powered Gap Analysis**: Analyze policies and identify coverage gaps
- **Marketing Campaign Management**: Create campaigns for Facebook, Instagram, LinkedIn, X (Twitter), TikTok, and YouTube
- **Automation Rules**: Automate customer communications and follow-ups
- **Microsite Builder**: Create custom microsites for agencies
- **GDPR Compliance**: Track and manage customer consent for data processing and marketing
- **Multi-language Support**: English and Greek with ACORD terminology
- **Dark Mode**: Full dark mode support across the application

## Technology Stack

### Frontend
- React 19.2.0 with TypeScript 5.8.2
- Vite 6.2.0 for fast development and building
- Tailwind CSS for styling
- React Router DOM 7.9.5 for routing
- Axios for API communication

### Backend
- Node.js 18 with ES Modules
- Express.js 4.18 web framework
- MySQL 8.0 database
- JWT authentication with refresh tokens
- bcryptjs for password hashing
- express-validator for input validation

### Deployment
- Docker & Docker Compose
- Nginx reverse proxy
- GitHub Actions CI/CD pipeline

## Getting Started

### Prerequisites
- Node.js 18 or higher
- MySQL 8.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AgentRisePortal.git
cd AgentRisePortal
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

4. Set up environment variables:

Create `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=AgentRise Insurance Portal
```

Create `backend/.env` file:
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agentrise_db
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret
CORS_ORIGIN=http://localhost:5173
```

5. Set up the database:
```bash
cd backend
npm run db:setup
npm run db:seed
```

6. Start the development servers:

Backend (from backend directory):
```bash
npm run dev
```

Frontend (from root directory):
```bash
npm run dev
```

The application will be available at http://localhost:5173

## GDPR Consent Management

### Overview

The AgentRise Portal includes a comprehensive GDPR consent management system that helps agencies track and manage customer consent for data processing and marketing communications. This feature ensures compliance with GDPR regulations and provides clear audit trails.

### Features

- **Dual Consent Tracking**: Separate tracking for GDPR consent (data processing) and Marketing consent
- **Detailed Metadata**: Track consent date and acquisition channel for each consent type
- **Expiration Warnings**: Automatic warnings when consent is older than 6 months
- **Role-Based Access**: Only admin and agent roles can edit consent status
- **Audit Trail**: All consent updates are logged in the customer timeline
- **Responsive Design**: Fully responsive interface works on desktop and mobile devices

### Database Schema

The consent data is stored in the `customers` table with the following fields:

```sql
gdpr_consent_provided BOOLEAN DEFAULT FALSE
gdpr_consent_date TIMESTAMP NULL
gdpr_consent_channel ENUM('email', 'sms', 'phone', 'web_form', 'in_person', 'other')
marketing_consent_provided BOOLEAN DEFAULT FALSE
marketing_consent_date TIMESTAMP NULL
marketing_consent_channel ENUM('email', 'sms', 'phone', 'web_form', 'in_person', 'other')
```

**Indexes:**
- `idx_customers_gdpr_consent` on `(gdpr_consent_provided, gdpr_consent_date)`
- `idx_customers_marketing_consent` on `(marketing_consent_provided, marketing_consent_date)`

### API Endpoints

#### Get Customer with Consent Data
```
GET /api/v1/customers/:id
```

Response includes:
```json
{
  "gdprConsent": {
    "provided": true,
    "date": "2025-01-15T10:30:00Z",
    "channel": "web_form"
  },
  "marketingConsent": {
    "provided": false,
    "date": null,
    "channel": null
  }
}
```

#### Update Customer Consent
```
PUT /api/v1/customers/:id
```

Request body:
```json
{
  "gdprConsent": {
    "provided": true,
    "date": "2025-01-15T10:30:00Z",
    "channel": "web_form"
  },
  "marketingConsent": {
    "provided": true,
    "date": "2025-01-15T10:30:00Z",
    "channel": "email"
  }
}
```

### UI Components

#### Consent Management Component

Located at: `components/customer/ConsentManagement.tsx`

**Props:**
- `gdprConsent`: Current GDPR consent status
- `marketingConsent`: Current marketing consent status
- `onUpdateConsent`: Callback function when consent is updated
- `readOnly`: (optional) Disable editing

**Features:**
- Checkbox for each consent type
- Date picker for consent date
- Dropdown for acquisition channel
- Automatic expiration warning (6 months)
- Edit/Save/Cancel workflow
- Responsive grid layout

#### Consent Channels

Available acquisition channels:
- **Email**: Consent obtained via email
- **SMS**: Consent obtained via SMS message
- **Phone**: Consent obtained during phone call
- **Web Form**: Consent obtained through web form submission
- **In Person**: Consent obtained during in-person meeting
- **Other**: Other acquisition methods

### Expiration Warning Logic

The system automatically checks if consent is older than 6 months and displays a prominent warning:

```typescript
const isConsentExpired = (consentDate: string | null): boolean => {
  if (!consentDate) return false;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return new Date(consentDate) < sixMonthsAgo;
};
```

**Warning Display:**
- Yellow badge next to consent status
- Detailed warning message below consent details
- Prompts user to verify and update consent with customer

### User Workflow

1. **View Consent Status**:
   - Navigate to customer profile page (`/customer/:customerId`)
   - Consent section appears below customer header and above policies
   - Shows current status, date, and channel for both consent types

2. **Edit Consent**:
   - Click "Edit" button in consent section
   - Check/uncheck consent checkboxes
   - Select consent date (defaults to current date if newly granted)
   - Select acquisition channel from dropdown
   - Click "Save" to persist changes or "Cancel" to discard

3. **View Audit Trail**:
   - Consent updates are automatically logged in customer timeline
   - Timeline entry includes both GDPR and marketing consent status
   - Shows who made the change and when

### Role-Based Access

- **Admin**: Full access to view and edit consent
- **Agent**: Full access to view and edit consent
- **Others**: Read-only access (if implemented)

### Best Practices

1. **Regular Reviews**: Review consent status during customer interactions
2. **Update Promptly**: Update consent immediately after customer provides/revokes it
3. **Document Channel**: Always record the channel through which consent was obtained
4. **Respond to Warnings**: Address expired consent warnings promptly
5. **Train Staff**: Ensure all agents understand GDPR compliance requirements

### Migration

To add consent fields to an existing database:

```bash
cd backend
mysql -u root -p agentrise_db < database/migrations/003_gdpr_consent.sql
```

This migration:
- Adds 6 new columns to the customers table
- Creates indexes for efficient querying
- Sets default values for existing customers

### Screenshots

#### Consent Section - View Mode
The consent section displays current status with clear indicators:
- ✅ Green checkmark for granted consent
- 📅 Date when consent was granted
- 📱 Channel through which consent was obtained
- ⚠️ Warning badge if consent is older than 6 months

#### Consent Section - Edit Mode
When editing, users can:
- Toggle consent checkboxes
- Select date using date picker
- Choose channel from dropdown menu
- Save or cancel changes

#### Expiration Warning
When consent is older than 6 months:
- Yellow warning badge appears next to consent status
- Detailed warning message explains the issue
- Prompts user to verify consent with customer

### Compliance Notes

This feature is designed to help agencies comply with:
- **GDPR (General Data Protection Regulation)**: EU regulation on data protection
- **ePrivacy Directive**: EU directive on privacy in electronic communications
- **Insurance Industry Standards**: Best practices for customer data management

**Important**: This tool assists with compliance but does not guarantee it. Agencies should:
- Consult with legal counsel regarding GDPR compliance
- Implement proper data protection policies
- Train staff on data privacy requirements
- Conduct regular compliance audits

### Future Enhancements

Planned improvements for the consent management system:
- Email notifications for expiring consent
- Bulk consent update capabilities
- Consent history tracking with full audit log
- Integration with automated marketing systems
- Consent withdrawal workflow
- Multiple language support for consent forms
- Digital signature collection
- Consent reminder scheduling

## License

Proprietary - All rights reserved

## Support

For support and questions, please contact the development team or open an issue in the repository.
