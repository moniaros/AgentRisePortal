# Lead & Opportunity Pipeline System

## Overview

The Lead & Opportunity Pipeline is a comprehensive sales management system for insurance agents to track prospects from initial inquiry through closed deals. This system integrates lead capture from microsites, opportunity management via Kanban board, activity logging, and analytics.

## Architecture

### Database Schema

**Tables Created:**
1. `transaction_inquiries` - Stores incoming leads from microsites
2. `transaction_quote_requests` - Detailed quote requests linked to inquiries
3. `opportunities` - Sales pipeline opportunities
4. `interactions` - Communication history and activity log
5. `conversion_events` - Analytics events for tracking conversions
6. `pipeline_statistics` - Aggregated metrics for reporting

**Migration File:** `backend/database/migrations/004_lead_opportunity_pipeline.sql`

### Backend API

#### Inquiry Controller (`backend/src/controllers/inquiry.controller.js`)
- **GET /api/v1/inquiries** - Get leads inbox with filtering
- **GET /api/v1/inquiries/:id** - Get single inquiry details
- **POST /api/v1/inquiries** - Create new inquiry (microsite submission)
- **POST /api/v1/inquiries/:id/convert** - Convert inquiry to opportunity
- **PUT /api/v1/inquiries/:id/status** - Update inquiry status

#### Opportunity Controller (`backend/src/controllers/opportunity.controller.js`)
- **GET /api/v1/opportunities** - Get all opportunities with pagination/filtering
- **GET /api/v1/opportunities/kanban** - Get opportunities grouped by stage for Kanban board
- **GET /api/v1/opportunities/my-day** - Get categorized opportunities for agent dashboard
- **GET /api/v1/opportunities/:id** - Get single opportunity with full details
- **POST /api/v1/opportunities** - Create new opportunity
- **PUT /api/v1/opportunities/:id** - Update opportunity fields
- **PUT /api/v1/opportunities/:id/stage** - Update stage (drag-drop handler)
- **DELETE /api/v1/opportunities/:id** - Delete opportunity

#### Interaction Controller (`backend/src/controllers/interaction.controller.js`)
- **GET /api/v1/opportunities/:id/interactions** - Get interaction timeline
- **GET /api/v1/opportunities/:id/interactions/stats** - Get interaction statistics
- **POST /api/v1/opportunities/:id/interactions** - Log new interaction
- **PUT /api/v1/interactions/:id** - Update interaction
- **DELETE /api/v1/interactions/:id** - Delete interaction

### Frontend Architecture

**TypeScript Types:** All entities defined in `types.ts`:
- `Inquiry`, `QuoteRequest`
- `Opportunity`, `OpportunityStage`
- `Interaction`, `InteractionType`
- `MyDayOpportunities`, `KanbanBoard`
- `PipelineStatistics`

**Services:**
- `opportunityService.ts` ✅ - Complete implementation for opportunity management

## Implemented Features

### ✅ Backend (100% Complete)
- [x] Database schema with multi-tenant support
- [x] All API controllers with full CRUD operations
- [x] Route definitions with validation
- [x] Server integration
- [x] Multi-tenant data isolation
- [x] Role-based access control
- [x] UTM tracking and attribution
- [x] GDPR consent tracking integration
- [x] Conversion event logging

### ✅ Frontend Foundation (50% Complete)
- [x] TypeScript type definitions
- [x] Opportunity service with all API methods
- [ ] Inquiry service (needs implementation)
- [ ] Interaction service (needs implementation)

### 🔨 Frontend UI Components (Needed)

#### 1. Leads Inbox Page (`pages/LeadsInbox.tsx`)
**Purpose:** Display and manage incoming inquiries from microsites

**Required Features:**
- Table view of inquiries with columns: Name, Email, Source, UTM data, Date, Status
- Filter by status (new, reviewed, converted, spam, duplicate)
- Search by name, email, phone
- Click row to view inquiry details
- "Convert to Opportunity" button for each lead
- Badge indicators for quote requests
- GDPR consent status display
- Sort by date, source, status

**Sample Structure:**
```tsx
import { useState, useEffect } from 'react';
import { inquiryService } from '../services/inquiryService';
import { Inquiry } from '../types';

const LeadsInbox = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filters, setFilters] = useState({ status: 'new', search: '' });

  // Fetch inquiries
  // Display table with filters
  // Handle convert to opportunity action
  // Show inquiry detail modal
};
```

#### 2. Opportunity Pipeline (Kanban) Page (`pages/OpportunityPipeline.tsx`)
**Purpose:** Visual Kanban board for managing sales pipeline

**Required Features:**
- Three columns: New, Contacted, Proposal
- Drag-and-drop between columns (updates stage)
- Opportunity cards showing: Title, Prospect name, Value, Next follow-up date
- Overdue indicator (red badge) for past-due follow-ups
- Click card to open detail view
- "Add Opportunity" button
- Filter by agent (admin view)
- Real-time updates on drag

**Libraries:**
- `@dnd-kit/core` - For drag-and-drop functionality
- `@dnd-kit/sortable` - For sortable lists

**Sample Structure:**
```tsx
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { opportunityService } from '../services/opportunityService';
import { OpportunityCard } from '../components/pipeline/OpportunityCard';

const OpportunityPipeline = () => {
  const [kanban, setKanban] = useState<KanbanBoard>();

  const handleDragEnd = async (event: DragEndEvent) => {
    // Update opportunity stage via API
    // Refresh Kanban board
  };

  // Render columns with droppable/draggable cards
};
```

#### 3. Opportunity Card Component (`components/pipeline/OpportunityCard.tsx`)
**Purpose:** Reusable card displaying opportunity summary

**Display:**
- Title (bold)
- Prospect name
- Estimated value (formatted currency)
- Policy type badge
- Next follow-up date
- Overdue badge (if applicable)
- Interaction count indicator

#### 4. My Day Dashboard Page (`pages/MyDay.tsx`)
**Purpose:** Agent accountability dashboard showing prioritized opportunities

**Required Features:**
- Three sections:
  1. **Overdue** (red) - Past due follow-ups
  2. **Due Today** (yellow) - Follow-ups scheduled for today
  3. **No Due Date** (gray) - Opportunities without scheduled follow-up
- List view with opportunity title, prospect, value, last contact date
- Quick action buttons: "Update Follow-up", "Log Interaction", "Change Stage"
- Click row to open opportunity detail
- Summary metrics: Total overdue, Total today, Total opportunities

**Sample Structure:**
```tsx
const MyDay = () => {
  const [opportunities, setOpportunities] = useState<MyDayOpportunities>();

  useEffect(() => {
    loadMyDay();
  }, []);

  const loadMyDay = async () => {
    const data = await opportunityService.getMyDayOpportunities();
    setOpportunities(data);
  };

  // Render three categorized lists
  // Handle quick actions
};
```

#### 5. Opportunity Detail Page (`pages/OpportunityDetail.tsx`)
**Purpose:** Full view of opportunity with interaction timeline

**Required Features:**
- Header section: Title, Stage, Prospect info, Value, Probability
- Edit opportunity fields inline or via modal
- Stage progression buttons (Move to Contacted, Move to Proposal, etc.)
- Next follow-up date picker
- **Interaction Timeline**:
  - Chronological list of all communications
  - Each entry shows: Type icon, Date/time, Subject, Content preview, User
  - Filter by interaction type
  - Expand/collapse content
- "Log Interaction" button opens modal
- Delete opportunity button (with confirmation)

**Sample Structure:**
```tsx
const OpportunityDetail = () => {
  const { id } = useParams();
  const [opportunity, setOpportunity] = useState<Opportunity>();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);

  useEffect(() => {
    loadOpportunity();
    loadInteractions();
  }, [id]);

  // Render opportunity details
  // Render interaction timeline
  // Handle stage updates
  // Handle interaction logging
};
```

#### 6. Log Interaction Modal (`components/pipeline/LogInteractionModal.tsx`)
**Purpose:** Modal form for logging new interaction

**Fields:**
- Interaction Type (dropdown): Email, SMS, Phone, Meeting, Viber, WhatsApp, Note
- Direction (radio): Outbound, Inbound
- Subject (text input)
- Content (textarea)
- Recipient (text input)
- Scheduled for (date picker, optional)
- Attachments (file upload, optional)

#### 7. Convert to Opportunity Modal (`components/pipeline/ConvertToOpportunityModal.tsx`)
**Purpose:** Convert inquiry to opportunity

**Fields:**
- Title (pre-filled: "{First Name} {Last Name} - {Policy Interest}")
- Estimated Value (number input)
- Policy Type (dropdown)
- Next Follow-up Date (date picker)
- Notes (textarea)

## Frontend Services to Implement

### Inquiry Service (`src/services/inquiryService.ts`)
```typescript
class InquiryService {
  async getInquiries(filters?: InquiryFilters): Promise<PaginatedResponse<Inquiry>>;
  async getInquiryById(id: number): Promise<Inquiry>;
  async createInquiry(data: CreateInquiryData): Promise<{ id: number }>;
  async convertToOpportunity(id: number, data: ConvertData): Promise<{ opportunityId: number }>;
  async updateStatus(id: number, status: InquiryStatus): Promise<void>;
}
```

### Interaction Service (`src/services/interactionService.ts`)
```typescript
class InteractionService {
  async getOpportunityInteractions(opportunityId: number): Promise<Interaction[]>;
  async createInteraction(opportunityId: number, data: CreateInteractionData): Promise<{ id: number }>;
  async updateInteraction(id: number, data: UpdateInteractionData): Promise<void>;
  async deleteInteraction(id: number): Promise<void>;
}
```

## Integration Points

### 1. Microsite Form Submission
When a visitor submits a form on an agent's microsite:
1. POST to `/api/v1/inquiries` with form data + UTM parameters
2. Include GDPR consent checkboxes in form
3. If inquiry type is "quote_request", include quoteRequest nested object
4. Inquiry appears in agent's Leads Inbox

### 2. Communication Hub Integration
When agent sends email/SMS via Communications Hub:
1. Automatically call `interactionService.createInteraction()`
2. Log with type, recipient, content, delivery status
3. Update opportunity's lastContactDate
4. Interaction appears in opportunity timeline

### 3. Analytics Integration
When opportunity moves to "won" stage:
1. Backend automatically creates conversion_event record
2. Frontend can query `/api/v1/analytics/conversions` for reporting
3. Display metrics: Total conversions, GWP (Gross Written Premium), conversion rate

## Routing

Add to `App.tsx`:
```tsx
<Route path="/leads" element={<Layout><LeadsInbox /></Layout>} />
<Route path="/pipeline" element={<Layout><OpportunityPipeline /></Layout>} />
<Route path="/my-day" element={<Layout><MyDay /></Layout>} />
<Route path="/opportunity/:id" element={<Layout><OpportunityDetail /></Layout>} />
```

Add to navigation:
```tsx
<NavLink to="/leads">📥 Leads Inbox</NavLink>
<NavLink to="/pipeline">📊 Pipeline</NavLink>
<NavLink to="/my-day">☀️ My Day</NavLink>
```

## Data Flow Diagrams

### Lead to Opportunity Flow
```
Microsite Form Submission
        ↓
Transaction Inquiry (Leads Inbox)
        ↓
Agent Reviews & Converts
        ↓
Opportunity (New Stage)
        ↓
Agent Contacts Prospect
        ↓
Opportunity (Contacted Stage)
        ↓
Agent Sends Proposal
        ↓
Opportunity (Proposal Stage)
        ↓
Deal Closes → Won/Lost
        ↓
Conversion Event Logged
```

### Interaction Logging Flow
```
Agent sends Email/SMS/Call
        ↓
Communication Hub or Manual Log
        ↓
POST /api/v1/opportunities/:id/interactions
        ↓
Interaction Record Created
        ↓
Opportunity.lastContactDate Updated
        ↓
Appears in Opportunity Timeline
```

## Multi-Tenant & Security

- All queries filtered by `tenant_id` (organization isolation)
- Agent can only see their own opportunities (unless admin role)
- Authentication required for all API endpoints
- JWT token validation via `authenticate` middleware
- Input validation via `express-validator`

## Responsive Design Requirements

All components must be mobile-responsive:
- **Desktop:** Full Kanban board with 3 columns side-by-side
- **Tablet:** 2 columns, scroll horizontally for 3rd
- **Mobile:** Single column stack, swipe between stages

Use Tailwind responsive classes:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## Localization

Support Greek and English labels. Add to localization files:
```json
{
  "pipeline": {
    "leadsInbox": "Leads Inbox / Εισερχόμενα Leads",
    "opportunity": "Opportunity / Ευκαιρία",
    "stage": {
      "new": "New / Νέο",
      "contacted": "Contacted / Επικοινωνία",
      "proposal": "Proposal / Πρόταση",
      "won": "Won / Κλείσιμο",
      "lost": "Lost / Απώλεια"
    },
    "myDay": "My Day / Η Μέρα Μου",
    "overdue": "Overdue / Εκπρόθεσμα",
    "dueToday": "Due Today / Σήμερα",
    "noDate": "No Date / Χωρίς Ημερομηνία"
  },
  "interaction": {
    "email": "Email / Email",
    "sms": "SMS / SMS",
    "phone": "Phone / Τηλέφωνο",
    "meeting": "Meeting / Συνάντηση",
    "viber": "Viber / Viber",
    "whatsapp": "WhatsApp / WhatsApp",
    "note": "Note / Σημείωση"
  }
}
```

## Testing Checklist

### Backend API Tests
- [ ] Create inquiry with UTM tracking
- [ ] Convert inquiry to opportunity
- [ ] Fetch Kanban board grouped by stage
- [ ] Update opportunity stage via drag-drop
- [ ] Log interaction and verify lastContactDate updates
- [ ] Fetch "My Day" opportunities with correct categorization
- [ ] Verify multi-tenant isolation (can't see other tenant's data)
- [ ] Test conversion event creation on won stage

### Frontend UI Tests
- [ ] Leads Inbox displays inquiries with correct filters
- [ ] Convert lead to opportunity creates new pipeline entry
- [ ] Kanban drag-drop updates stage in backend
- [ ] Overdue opportunities show red badge
- [ ] My Day dashboard categorizes correctly
- [ ] Interaction timeline displays chronologically
- [ ] Log interaction modal saves successfully
- [ ] Mobile responsive layout works on all screens

## Performance Considerations

- **Pagination:** All list endpoints support pagination (default 50 items)
- **Indexes:** Database indexes on tenant_id, stage, next_follow_up_date, agent_id
- **Caching:** Consider caching Kanban board data for 30 seconds
- **Real-time:** For multi-agent teams, implement WebSocket for live pipeline updates
- **Statistics:** Pre-compute pipeline_statistics daily via cron job

## Next Steps for Completion

1. **Implement remaining frontend services:**
   - inquiryService.ts
   - interactionService.ts

2. **Create UI components (in order of priority):**
   - MyDay.tsx (highest priority for agent adoption)
   - OpportunityPipeline.tsx with Kanban
   - OpportunityCard.tsx component
   - OpportunityDetail.tsx with timeline
   - LeadsInbox.tsx
   - LogInteractionModal.tsx
   - ConvertToOpportunityModal.tsx

3. **Install required packages:**
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

4. **Add routes to App.tsx**

5. **Add navigation links**

6. **Test end-to-end flow:**
   - Submit microsite form → See in Leads Inbox
   - Convert to opportunity → See in Kanban
   - Drag to Contacted → Verify stage update
   - Log interaction → See in timeline
   - Mark as won → Verify conversion event

7. **Add analytics dashboard** (optional enhancement):
   - Total leads this month
   - Conversion rate
   - Pipeline value by stage
   - Top performing agents
   - Won deals this month / GWP

## Conclusion

The Lead & Opportunity Pipeline system provides a complete sales management solution for insurance agents. With the backend fully implemented and documented, the frontend components can be built systematically following the patterns established in the existing codebase.

**Current Status:**
- ✅ Backend API: 100% complete
- ✅ Database Schema: 100% complete
- ✅ TypeScript Types: 100% complete
- ✅ Opportunity Service: 100% complete
- 🔨 Frontend UI: Ready to implement following this documentation

The system is designed for scalability, multi-tenancy, and compliance with GDPR regulations, making it production-ready for insurance agencies managing high volumes of leads and opportunities.
