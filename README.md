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

## AI Policy Analysis Display

### Overview

The AI Policy Analysis Display feature presents AI-generated policy analysis results (coverage gaps, upsell opportunities, and cross-sell offers) directly in the customer profile page. This feature enables agents to review, verify, and act on AI recommendations with a user-friendly interface.

### Features

- **Organized Display**: Analysis results grouped into three categories
  - Coverage Gaps (with severity levels)
  - Upsell Opportunities (with priority levels)
  - Cross-Sell Opportunities (with priority levels)
- **Agent Verification Workflow**: Mark findings as Confirmed, Rejected, or Needs Review
- **Inline Notes**: Add agent comments to each finding
- **Persistent Storage**: Verification status saved to localStorage
- **Visual Indicators**: Color-coded severity/priority badges
- **Summary Statistics**: Quick overview of total findings and unverified items
- **Responsive Design**: Tab-based interface adapts to mobile and desktop
- **Accessibility**: ARIA labels and keyboard navigation support

### localStorage Data Schema

AI policy analysis data is stored per customer using the key format: `ai_policy_analysis_{customerId}`

**Data Structure:**
```typescript
{
  customerId: string;
  analyzedAt: string;  // ISO timestamp
  source: "ai_policy_analysis";
  gaps: [
    {
      id: string;
      area: string;
      current: string;
      recommended: string;
      reason: string;
      severity: "high" | "medium" | "low";
      verified?: "confirmed" | "rejected" | "review";
      agentNotes?: string;
      verifiedAt?: string;  // ISO timestamp
      verifiedBy?: string;  // Agent name
    }
  ];
  upsellOpportunities: [
    {
      id: string;
      product: string;
      recommendation: string;
      benefit: string;
      estimatedPremium?: number;
      priority: "high" | "medium" | "low";
      verified?: "confirmed" | "rejected" | "review";
      agentNotes?: string;
      verifiedAt?: string;
      verifiedBy?: string;
    }
  ];
  crossSellOpportunities: [
    {
      id: string;
      product: string;
      recommendation: string;
      benefit: string;
      estimatedPremium?: number;
      priority: "high" | "medium" | "low";
      verified?: "confirmed" | "rejected" | "review";
      agentNotes?: string;
      verifiedAt?: string;
      verifiedBy?: string;
    }
  ];
}
```

### Storage Utility Functions

**File:** `src/utils/policyAnalysisStorage.ts`

#### savePolicyAnalysis(customerId, analysis)
Saves policy analysis to localStorage for a specific customer.

**Parameters:**
- `customerId` (string): Unique customer identifier
- `analysis` (object): Analysis data (without customerId)

**Returns:** boolean - Success status

**Example:**
```typescript
import { savePolicyAnalysis } from '../utils/policyAnalysisStorage';

const analysis = {
  analyzedAt: new Date().toISOString(),
  source: 'ai_policy_analysis',
  gaps: [{
    id: 'gap-1',
    area: 'Liability Coverage',
    current: '$100,000',
    recommended: '$300,000',
    reason: 'Industry standard for similar risk profile',
    severity: 'high'
  }],
  upsellOpportunities: [],
  crossSellOpportunities: []
};

savePolicyAnalysis('customer-123', analysis);
```

#### getPolicyAnalysis(customerId)
Retrieves policy analysis from localStorage.

**Parameters:**
- `customerId` (string): Unique customer identifier

**Returns:** PolicyAnalysis | null

**Error Handling:**
- Returns null if data not found
- Returns null if JSON parsing fails
- Returns null if data structure is invalid
- Logs errors to console

#### updateFindingVerification(customerId, findingType, findingId, verification)
Updates verification status for a specific finding.

**Parameters:**
- `customerId` (string): Customer ID
- `findingType` ('gap' | 'upsell' | 'crossSell'): Type of finding
- `findingId` (string): Unique finding ID
- `verification` (object):
  - `verified`: 'confirmed' | 'rejected' | 'review'
  - `agentNotes?`: string
  - `verifiedBy`: string (agent name)

**Returns:** boolean - Success status

**Example:**
```typescript
updateFindingVerification('customer-123', 'gap', 'gap-1', {
  verified: 'confirmed',
  agentNotes: 'Customer agreed to increase coverage',
  verifiedBy: 'John Smith'
});
```

#### getAnalysisSummary(customerId)
Gets summary statistics for customer's policy analysis.

**Returns:** object with counts:
- `totalGaps`: number
- `highSeverityGaps`: number
- `totalUpsells`: number
- `totalCrossSells`: number
- `unverifiedCount`: number

### UI Components

#### AIPolicyAnalysis Component

**File:** `components/customer/AIPolicyAnalysis.tsx`

**Props:**
- `customerId` (string, required): Customer ID to load analysis for
- `onRefresh?` (function, optional): Callback when data is refreshed

**Features:**
- Tab-based navigation between categories
- Summary cards showing counts
- Color-coded severity/priority indicators
- Verification buttons (Confirm, Review, Reject)
- Inline notes textarea
- Refresh button to reload data
- Empty states when no data available
- Loading skeleton while fetching

**Accessibility:**
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly role attributes
- Semantic HTML structure

**Usage:**
```tsx
import AIPolicyAnalysis from '../components/customer/AIPolicyAnalysis';

<AIPolicyAnalysis
  customerId={customer.id}
  onRefresh={() => console.log('Data refreshed')}
/>
```

### Agent Workflow

#### 1. View Analysis
- Navigate to customer profile page
- AI Policy Analysis section displays automatically if data exists
- View summary cards with counts
- Switch between tabs: Coverage Gaps, Upsell, Cross-Sell

#### 2. Review Findings
- Read finding details (current vs. recommended for gaps, or recommendation/benefit for opportunities)
- Check severity/priority level
- See estimated premium for opportunities

#### 3. Verify Findings
- Click "Verify Finding" button on any item
- Add optional agent notes in textarea
- Choose verification status:
  - **✓ Confirm**: Finding is accurate and actionable
  - **⚠ Review**: Needs further investigation
  - **✗ Reject**: Finding is not applicable or incorrect
- Click button to save

#### 4. Track Progress
- Verified items show colored badge (green/yellow/red)
- Agent name and verification date displayed
- Unverified count in summary updates automatically
- Notes persist and can be updated later

### Visual Design

**Color Coding:**

**Coverage Gaps (Severity):**
- High: Red background, red border
- Medium: Yellow background, yellow border
- Low: Blue background, blue border

**Upsell Opportunities (Priority):**
- High: Orange border
- Medium: Blue border
- Low: Gray border

**Cross-Sell Opportunities (Priority):**
- High: Purple border
- Medium: Indigo border
- Low: Gray border

**Verification Badges:**
- Confirmed: Green badge with checkmark
- Rejected: Red badge with X
- Needs Review: Yellow badge with warning icon

### Responsive Behavior

**Desktop (≥1024px):**
- Full-width tabs with all visible
- Summary cards in 4-column grid
- Larger fonts and spacing

**Tablet (768px - 1023px):**
- Full-width tabs
- Summary cards in 2-column grid
- Standard fonts

**Mobile (<768px):**
- Scrollable horizontal tabs
- Summary cards in 2-column grid (stacked on very small screens)
- Compact spacing
- Touch-friendly buttons

### Integration Points

#### 1. Customer Profile Page
Located at: `pages/CustomerMicrosite.tsx`

The AIPolicyAnalysis component is integrated between Consent Management and Policies sections:
```tsx
<ConsentManagement ... />
<AIPolicyAnalysis customerId={customer.id} />
<div>{/* Policies */}</div>
```

#### 2. Gap Analysis Integration
When the existing EmbeddedGapAnalysis component generates results, save them using:
```typescript
import { savePolicyAnalysis } from '../utils/policyAnalysisStorage';

// After AI analysis completes
const results = await analyzePolicy(customer);
savePolicyAnalysis(customer.id, {
  analyzedAt: new Date().toISOString(),
  source: 'ai_policy_analysis',
  gaps: results.gaps,
  upsellOpportunities: results.upsell_opportunities,
  crossSellOpportunities: results.cross_sell_opportunities
});
```

### Error Handling

**localStorage Errors:**
- Try-catch blocks around all storage operations
- Console logging for debugging
- Graceful fallbacks (return null/false)
- User-friendly error messages

**Data Validation:**
- Schema validation on retrieval
- Type checking for required fields
- Array validation for collections
- Corrupt data handling

**UI Error States:**
- "No analysis available" message when data missing
- Loading skeleton during data fetch
- Error boundary for component failures

### Testing Scenarios

#### Manual Testing:

1. **Create Sample Data:**
```typescript
// In browser console
const sampleAnalysis = {
  analyzedAt: new Date().toISOString(),
  source: 'ai_policy_analysis',
  gaps: [
    {
      id: 'gap-1',
      area: 'Liability Coverage',
      current: '$100,000',
      recommended: '$300,000',
      reason: 'Increased asset value requires higher liability protection',
      severity: 'high'
    },
    {
      id: 'gap-2',
      area: 'Flood Insurance',
      current: 'None',
      recommended: '$250,000',
      reason: 'Property located in flood zone',
      severity: 'medium'
    }
  ],
  upsellOpportunities: [
    {
      id: 'upsell-1',
      product: 'Umbrella Policy',
      recommendation: 'Add $2M umbrella coverage',
      benefit: 'Extended liability protection beyond primary policies',
      estimatedPremium: 450,
      priority: 'high'
    }
  ],
  crossSellOpportunities: [
    {
      id: 'cross-1',
      product: 'Life Insurance',
      recommendation: 'Term life policy for $500K',
      benefit: 'Financial protection for dependents',
      estimatedPremium: 600,
      priority: 'medium'
    }
  ]
};

localStorage.setItem('ai_policy_analysis_customer-123', JSON.stringify({
  customerId: 'customer-123',
  ...sampleAnalysis
}));
```

2. **Navigate to customer profile with ID matching the sample data**
3. **Verify all sections display correctly**
4. **Test verification workflow**
5. **Check localStorage updates persist**

#### Automated Testing (Future):
- Unit tests for storage utility functions
- Component tests for AIPolicyAnalysis
- Integration tests for customer profile
- Accessibility tests with jest-axe

### Localization Support

Current implementation uses English labels. For bilingual support (Greek/English), add to localization files:

```json
{
  "aiAnalysis": {
    "title": "AI Policy Analysis / Ανάλυση Πολιτικής AI",
    "source": "Source: AI Policy Analysis / Πηγή: Ανάλυση AI",
    "coverageGaps": "Coverage Gaps / Κενά Κάλυψης",
    "upsellOpportunities": "Upsell Opportunities / Ευκαιρίες Αναβάθμισης",
    "crossSellOpportunities": "Cross-Sell Opportunities / Ευκαιρίες Διασταυρούμενης Πώλησης",
    "severity": {
      "high": "High / Υψηλή",
      "medium": "Medium / Μέτρια",
      "low": "Low / Χαμηλή"
    },
    "verified": {
      "confirmed": "Confirmed / Επιβεβαιωμένο",
      "rejected": "Rejected / Απορρίφθηκε",
      "review": "Needs Review / Απαιτεί Έλεγχο"
    },
    "verifyFinding": "Verify Finding / Επαλήθευση Ευρήματος",
    "agentNotes": "Agent Notes / Σημειώσεις Πράκτορα",
    "noAnalysis": "No AI Policy Analysis Available / Δεν Υπάρχει Διαθέσιμη Ανάλυση AI"
  }
}
```

### Performance Considerations

- **localStorage Size**: Maximum 5-10MB per domain
- **Data Retention**: Analysis persists until manually deleted
- **Load Time**: Synchronous localStorage reads (~1ms)
- **Memory**: Parsed JSON held in component state
- **Updates**: Only modified findings re-saved

**Optimization Tips:**
- Limit analysis history per customer (e.g., keep only last 3)
- Compress data if analysis objects become very large
- Consider moving to IndexedDB for larger datasets

### Security & Privacy

- **Data Location**: Client-side localStorage only
- **Access**: No server transmission of analysis data
- **Encryption**: Consider encrypting sensitive findings
- **Audit Trail**: Verification includes agent name and timestamp
- **GDPR**: Analysis data should be cleared when customer data is deleted

### Future Enhancements

- Real-time AI analysis triggered from customer profile
- Export analysis to PDF for customer sharing
- Integration with opportunity pipeline (create opportunities from findings)
- Analytics dashboard showing verification rates
- Automated follow-up reminders for unverified items
- Historical trend analysis (track changes over time)
- Bulk verification for multiple customers
- Mobile app support with offline sync

### Troubleshooting

**Issue: Analysis not displaying**
- Check browser console for errors
- Verify localStorage key format: `ai_policy_analysis_{customerId}`
- Confirm customerId matches between storage and component prop
- Check if data structure matches schema

**Issue: Verification not saving**
- Check browser console for storage errors
- Verify localStorage is enabled
- Check available storage space
- Confirm user is logged in (for agent name)

**Issue: Data corrupted**
- Use `deletePolicyAnalysis(customerId)` to clear corrupt data
- Re-analyze policy to generate fresh data
- Check for JSON parsing errors in console

## License

Proprietary - All rights reserved

## Support

For support and questions, please contact the development team or open an issue in the repository.
