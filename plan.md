# AgentRise / AgentOS — Master Platform Architecture, Component Inventory, Data Graph & Unicorn Roadmap

> **Purpose of this Document**
> This master blueprint documents the complete architecture of the **AgentRise / AgentOS Insurance Portal**:
> 1. **All 10 Functional Platforms & Every Component** in the codebase.
> 2. **Exact Features & Capabilities** of each page, UI component, hook, and service.
> 3. **State & Data Residency** (local component state, React Contexts, `localStorage`/`sessionStorage` keys, JSON seed fixtures, and backend proxy routes).
> 4. **Inter-Component Connections & Reactive Flows** (how actions in one module propagate across the portal).
> 5. **Data Model Topology & Transformation Pipelines** (entity relationships, foreign keys, ACORD mappings, and current split-store gaps).
> 6. **Unicorn Service Upgrade Blueprint** — concrete features and engineering upgrades required in every component to evolve AgentOS into a category-defining, multi-billion-dollar InsurTech Operating System.

---

## 1. High-Level System Architecture & Ecosystem Topology

AgentOS is organized as a **full-stack TypeScript web application** combining a React 19 single-page frontend (`HashRouter`, Context providers, offline-capable custom hooks, and ACORD-aligned domain mappers) with an Express 5 server (`server.ts`) that proxies multimodal AI operations (`@google/genai`) and serves static/Vite assets on port `3000`.

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  CLIENT SHELL (React 19 SPA)                                  │
│  ErrorBoundary ─► ThemeProvider ─► LanguageProvider ─► AuthProvider ─► NotificationProvider   │
│                ─► OnboardingProvider ─► GTMProvider ─► HashRouter + RouteAnalyticsTracker     │
├───────────────┬───────────────┬───────────────┬───────────────┬───────────────┬───────────────┤
│  Platform 2   │  Platform 3   │  Platform 4   │  Platform 5   │  Platform 6   │  Platform 7   │
│  Command Ctr  │ Sales Pipeline│  Micro-CRM &  │  AI Policy &  │  Omnichannel  │  Microsite &  │
│  & Exec BI    │ & Daily Exec  │ 360° Customer │ Gap Analyzer  │  Marketing    │  Marketplace  │
├───────────────┴───────────────┴───────────────┴───────────────┴───────────────┴───────────────┤
│                 Platform 8: CRM Automation & Rule Engine  │  Platform 9: Admin, Billing, Ops  │
├───────────────────────────────────────────────────────────┴───────────────────────────────────┤
│                        CUSTOM HOOKS & REACTIVE DATA SYNCHRONIZATION LAYER                     │
│  useCrmData │ usePipelineData │ useOfflineSync │ usePolicySync │ useFindingsData │ useTasks   │
│  useCampaigns│ useAnalyticsData│ useAutomation* │ useTemplates  │ useNewsData     │ useAuth   │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│                         CLIENT PERSISTENCE & DOMAIN MAPPING SERVICES                          │
│  sessionStorage['currentUser']             │ localStorage['customers_data' / 'leads_data']    │
│  localStorage['agentos_db_*'] (MockRepo)   │ localStorage['agentos_acord_policies']           │
│  localStorage['agentos_findings_<agency>'] │ localStorage['agentos_gap_analyses']             │
│  localStorage['transaction_inquiries'...]  │ acordMapper.ts / policyValidator.ts / ruleEngine │
└──────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                               │ HTTP JSON (/api/gemini/*, /api/health)
                                               ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND RUNTIME (Express 5 Server — server.ts)                         │
│  • POST /api/gemini/generate        (Structured/unstructured text & multimodal extraction)    │
│  • POST /api/gemini/generate-image  (Ad creatives, social visuals, profile photo studio)      │
│  • POST /api/gemini/parse-policy    (Strict JSON schema extraction -> DetailedPolicy)         │
│  • POST /api/gemini/analyze-gaps    (Actuarial gap/upsell/cross-sell -> GapAnalysisResult)    │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Platform & Component Inventory

The application comprises **10 distinct platforms/subsystems**, **35 route pages**, **120+ specialized components**, **5 React Contexts**, **34 custom hooks**, and **12 domain/service modules**.

---

### Platform 1: Core Application Shell, Authentication, Localization & Shared UI

#### 1.1 Context Providers & Global Shell Components

| Component / Module | Current Features | Residing Data & Storage Keys | Connections & Reactive Behavior | Unicorn Service Upgrades Needed |
| :--- | :--- | :--- | :--- | :--- |
| **`App.tsx`** | Root provider composition tree, `ProtectedRoute` wrapper, public vs. authenticated route table, `HashRouter` setup. | Reads `useAuth().currentUser`. | Mounts all 35 pages; redirects unauthenticated traffic to `/login` while keeping `/campaign/lead/:campaignId` public. | Migrate to `BrowserRouter` with SSR/edge route preloading, code-split lazy route bundles (`React.lazy`), tenant subdomain resolution (`agency.agentos.com`), and role-based route guards with granular permission scopes. |
| **`context/AuthContext.tsx`** (`useAuth`) | Role-based demo login (`admin` vs `agent`), logout, session hydration. | `currentUser: User \| null` stored in `sessionStorage['currentUser']`; seeded from `MOCK_USERS` (`data/mockData.ts`). | Consumed by `Sidebar`, `Header`, `Dashboard`, `AutomationRules`, `Billing`, `UserManagement`, `FindingsStorage`, `MicrositeBuilder`. | Replace `sessionStorage` mock auth with OIDC/SAML 2.0 Enterprise SSO, WebAuthn Passkeys, short-lived JWT access tokens + HttpOnly refresh cookies, MFA enforcement, and live agency-switching for broker networks. |
| **`context/LanguageContext.tsx`** (`useLocalization`) | Instant bilingual switching (`en` English / `el` Greek), nested dot-key lookup (`t('nav.dashboard')`), variable interpolation (`{{count}}`). | `language: 'en' \| 'el'` in `localStorage['language']`; static translation trees `data/locales/en.json` & `el.json`. | Triggers synchronous re-render of every localized component and switches AI prompt output language across Gemini calls. | Namespace-chunked i18n bundles (ICU MessageFormat for plurals/gender/currency), automated locale detection, agency-customizable terminology overrides, and 15+ European insurance market locales. |
| **`context/ThemeContext.tsx`** (`useTheme`) | Light/Dark theme toggle; toggles `.dark` class on `document.documentElement`. | `theme: 'light' \| 'dark'` in `localStorage['theme']`. | Consumed by `Header`, `Settings`, and charts (`recharts` theme adaptation). | Design-token CSS variable engine supporting white-label agency brand themes, high-contrast accessibility mode (WCAG AAA), and OS `prefers-color-scheme` sync. |
| **`context/NotificationContext.tsx`** (`useNotification` + `services/notificationService.ts`) | In-app toast stack (`success`, `error`, `warning`, `info`), auto-dismiss timers, Web `Notification` API desktop alerts, Base64 WAV chime playback (`constants/sounds.ts`). | Ephemeral `notifications[]` state; reads `localStorage['notifications_enabled']` & `localStorage['individual_notification_settings']`. | Invoked across CRUD actions, policy parsing, rule saves, and social publishing; respects per-event mute settings configured in `Settings`. | Persistent real-time notification center (WebSocket/SSE), unread inbox drawer, Web Push Service Worker subscriptions (offline push), and Slack/Teams/Mobile push routing. |
| **`context/OnboardingContext.tsx`** (`useOnboardingStatus`) | Tracks agency setup checklist completion (`profile`, `team`, `data`, `integrations`) and dismissal state. | `progress: OnboardingProgress` persisted in `localStorage['onboarding_progress_<userId>']`. | Drives `OnboardingWidget` on `Dashboard` and `/onboarding` (`OnboardingGuide`). | Interactive product tours (spotlight step-throughs), automated checklist verification triggered by real events (e.g., first policy uploaded, first carrier connected), and personalized role-based onboarding tracks. |
| **`components/Layout.tsx`** | Responsive authenticated frame combining `Sidebar`, `Header`, `Breadcrumbs`, and scrollable `<main><Outlet /></main>`. | `sidebarOpen: boolean` mobile drawer state. | Wraps all protected routes; passes mobile toggle callbacks between `Header` and `Sidebar`. | Global `Cmd+K` / `Ctrl+K` omnibar command palette (instant search across policies, customers, leads, claims, and AI actions), split-screen contextual copilot drawer, and persistent VoIP softphone bar. |
| **`components/Sidebar.tsx`** | Categorized collapsible navigation menu (`CRM`, `Pipeline`, `Marketing`, `Agency`, `Admin`), role-filtered links (`UserSystemRole.ADMIN` check). | Local `openMenus` accordion state; reads `currentUser` and `useLocalization`. | Highlights active `NavLink`; dynamically hides `UserManagement`, `Billing`, and `AutomationRules` from non-admin agents. | Live badge counters on nav items (unread inbox leads, overdue tasks, pending AI findings), customizable pinned favorites, and keyboard shortcut navigation (`G` then `D`, `G` then `P`). |
| **`components/Header.tsx`** | Top bar with agency context, online/offline indicator (`useOnlineStatus`), language toggle, dark mode button, user avatar menu. | `dropdownOpen` local state; reads `useOnlineStatus()`, `useAuth()`, `useTheme()`, `useLocalization()`. | Links to `/profile`, `/settings`, `/billing`, and `/logout`. | Real-time presence avatars (colleagues viewing the same record), global quick-create `+` menu (New Lead, Scan Policy, Log Call, Create Task), and live AI credit meter pill. |
| **`components/GTMProvider.tsx` & `RouteAnalyticsTracker.tsx`** | Injects Google Tag Manager `<script>` dynamically and pushes SPA route changes to `window.dataLayer`. | Reads `localStorage['gtmContainerId']`; tracks `useLocation()`. | Fires `pageview` telemetry on every route transition via `services/analytics.ts`. | Server-side event forwarding (Segment/PostHog/RudderStack), PII-redacted product telemetry, and funnel drop-off heatmaps compliant with EU GDPR consent state. |
| **`components/ErrorBoundary.tsx`** | Class error boundary catching render crashes with recovery UI. | `hasError: boolean`, `error: Error \| null`. | Wraps entire `App` tree. | Automatic source-mapped crash reporting (Sentry/OpenTelemetry), component-level granular boundaries so a single widget crash never unmounts the workspace, and one-click session replay attachment. |
| **Auth & Utility Pages** (`Login.tsx`, `Logout.tsx`, `Onboarding.tsx`, `OnboardingGuide.tsx`, `Sitemap.tsx`) | Demo role switcher login, session teardown, 4-step agency setup wizard, full route directory. | `Login` writes `sessionStorage['currentUser']`; `Logout` clears it. | Entry/exit gates of the authenticated shell. | Magic-link login, Google/Microsoft Workspace OAuth login, agency workspace creation wizard with VAT/chamber-of-commerce lookup (GEMI/Solon in Greece). |
| **Shared UI Primitives (`components/ui/*`)** | `Breadcrumbs`, `ConfirmationModal`, `EditableField`, `ErrorMessage`, `Pagination`, `SkeletonLoader`, `StarRating`, `ToggleSwitch` (`forwardRef`). | Controlled props + transient editing state in `EditableField`. | Reused across CRM tables, ACORD policy inline editors, `AutomationSettings`, `ReviewCard`, and `UserManagement`. | Full accessible headless primitive system (Radix/Aria compliant), virtualized data grids (`@tanstack/react-virtual`) for 100k+ policy rows, and optimistic inline save indicators. |

---

### Platform 2: Command Center & Executive Business Intelligence

| Component / Module | Current Features | Residing Data & Storage Keys | Connections & Reactive Behavior | Unicorn Service Upgrades Needed |
| :--- | :--- | :--- | :--- | :--- |
| **`pages/Dashboard.tsx`** (`/`) | Daily operational command center with 8 real-time KPI cards: New Inquiries Today, Overdue Follow-ups, Unread Messages, Portal Submissions (FNOL + Service Requests), Ad CPL Today, Active Portal Users, Verified Upsells, Verified Cross-sells; plus GBP Review management. | Consumes 10 hooks: `useInquiriesData`, `useOpportunitiesData`, `useInteractionsData`, `useFtnolData`, `useServiceRequestsData`, `usePerformanceData`, `usePortalAccountsData`, `useKpiSnapshotsData`, `useAllVerifiedOpportunities`, plus `localStorage['gbp_location_name']` and `data/gbp_reviews.json`. | Clicking Upsell/Cross-sell KPI cards navigates to `/opportunities-hub`; verifying a finding in `CustomerProfile` immediately increments `Dashboard` counters via `findingsStorage`. | Customizable drag-and-drop widget grid per role, live WebSocket streaming KPIs, anomaly detection alerts (e.g., CPL spike or renewal retention dip), and morning AI audio/text daily briefing. |
| **`DashboardHeader.tsx` & `OnboardingWidget.tsx`** | Personalized greeting, date/shift summary, and dismissible progress bar for agency setup tasks. | Props from `Dashboard` + `useOnboardingStatus`. | Deep-links incomplete steps to `/onboarding`, `/settings`, `/user-management`, and `/micro-crm`. | Goal pacing tracker (monthly GWP commission target vs. actuals) and team leaderboard widget. |
| **`BusinessHeader.tsx`, `ReviewFeed.tsx`, `ReviewCard.tsx`** | Displays Google Business Profile rating summary, review list, star ratings, and **1-click AI Review Reply drafting** via `/api/gemini/generate`. | `reviews: GbpReview[]` state in `Dashboard`; per-card `replyText`, `isGenerating` state in `ReviewCard`. | Reads GBP connection status set in `Settings.tsx`; calls `geminiClient.generateContent` to craft empathetic bilingual responses. | Live bi-directional Google Business Profile REST API sync (auto-fetch new reviews via webhook, publish replies directly to Google), sentiment trend NLP, and automated 5-star review request SMS/WhatsApp triggers post-claim or post-bind. |
| **`pages/ExecutiveDashboard.tsx`** (`/executive-dashboard`) | C-level agency intelligence view with timeframe filters and macro financial/risk visualizations. | `useExecutiveData` (`data/analytics.json` / `ExecutiveData`), timeframe filter state (`6m`, `1y`, `ytd`). | Aggregates macro agency metrics across policies, claims, leads, and marketing campaigns. | Drill-down from any chart segment into underlying policies/customers, cohort retention curves, LTV:CAC unit economics, carrier commission reconciliation, and board-ready PDF/XLSX export. |
| **Executive Charts (`components/executive/*`)** | `AgencyGrowthChart` (GWP vs Policies area/line), `ProductMixDonutChart` (Auto/Home/Life/Health/Commercial share), `ClaimsTrendChart` (Loss ratio & claim frequency), `LeadFunnelChart` (stage conversion rates), `CampaignRoiTable` (spend, leads, GWP, ROI%), `RiskExposureChart` (insured value vs max probable loss by perils). | Receive typed slices of `ExecutiveData` (`growth`, `productMix`, `claims`, `funnel`, `campaignRoi`, `riskExposure`). | Pure reactive Recharts visualizers responding to `ExecutiveDashboard` filter state. | Predictive ML forecasting (90-day GWP & churn forecast), carrier concentration risk warnings, and reinsurance/catastrophe map overlays (wildfire/flood/seismic zip-code exposure). |

---

### Platform 3: Sales Pipeline, Leads Inbox, Kanban & Daily Execution Engine

| Component / Module | Current Features | Residing Data & Storage Keys | Connections & Reactive Behavior | Unicorn Service Upgrades Needed |
| :--- | :--- | :--- | :--- | :--- |
| **`hooks/usePipelineData.ts` & `hooks/useOfflineSync.ts`** | Unified reactive data store for pipeline entities with online/offline cache-first synchronization and cross-entity mutations (`createOpportunity`, `updateOpportunityStage`, `logInteraction`). | Syncs 6 `localStorage` keys seeded from `/data/*.json`: `transaction_inquiries`, `transaction_quoterequests`, `opportunities_ext`, `prospects`, `pipeline_interactions`, `pipeline_conversions`. | Shared state backbone connecting `LeadsInbox`, `OpportunityPipeline`, `MyDayDashboard`, and `Dashboard`. | IndexedDB + CRDT / GraphQL Subscriptions or Cloud SQL + Redis pub/sub so multi-agent stage moves update across all browsers in <100ms with offline mutation queue replay. |
| **`pages/LeadsInbox.tsx`** (`/pipeline/inbox`) | High-velocity triage inbox for raw inbound inquiries (`TransactionInquiry`), search/source filtering, slide-over quick view, 1-click conversion into `Opportunity__EXT`. | Consumes `usePipelineData` (`inquiries`, `createOpportunity`) and `useCrmData` (`customers` for household matching); local `selectedInquiry`, `filterSource`, `searchTerm`. | Converting an inquiry creates both a `Prospect` and an `Opportunity__EXT` (`stage: 'new'`) which immediately populates `OpportunityPipeline` and `MyDayDashboard`. | Real-time webhook ingestion from Meta Lead Ads, Google Ads, TikTok, aggregator APIs, and microsite forms; round-robin / skill-based auto-routing with SLA countdown timers (speed-to-lead < 2 mins). |
| **`LeadRow.tsx` & `LeadQuickView.tsx`** (`components/pipeline/LeadsInbox/*`) | Freshness SLA badge, heuristic lead score (50–100), **Family Bundle detection** (matches inquiry surname against existing `Customer` records), deep-links (`tel:`, `whatsapp://`, `viber://`), **AI Ice-Breaker** & **Greek-market Objection Scripts** (ENFIA 10%–20% discount, bank mortgage coercion law, monthly installments, KTEO). | `LeadQuickView` holds `aiScript`, `activeObjection`, `isGenerating` local state; calls `/api/gemini/generate`. | Cross-references `useCrmData().customers` to surface household cross-sell context before first call; logs `Interaction` dispositions. | Embedded WebRTC click-to-dial with live real-time call transcription & live AI battlecards popping up automatically when the prospect mentions a competitor or price objection. |
| **`pages/OpportunityPipeline.tsx`** (`/pipeline/board`) | Drag-and-drop (`react-dnd` HTML5 backend) Kanban board across 5 stages (`new`, `contacted`, `proposal`, `won`, `lost`), agent/product filters, weighted revenue header (`KpiBar`). | Consumes `usePipelineData`; local `selectedOpportunity`, `searchQuery`, `productFilter`. | Dropping a card calls `updateOpportunityStage(id, newStage)`; moving to `'won'` automatically creates a `Conversion` attribution record (`pipeline_conversions`). | Customizable multi-pipeline stages (New Business vs. Renewals vs. Commercial Lines), automated stage-gate validations (e.g., require quote PDF before `proposal`), and **automatic `Customer` + `Policy` creation in CRM upon `'won'`**. |
| **`PipelineColumn.tsx`, `OpportunityCard.tsx`, `KpiBar.tsx`, `OpportunityDetailModal.tsx`** | Weighted stage probabilities (`10%`, `30%`, `60%`, `100%`, `0%`), stale deal badge (`>7 days` idle), overdue follow-up warning, hover **AI Smart Pitch**, modal activity timeline & next follow-up scheduler. | Drop/drag refs (`useDrop`, `useDrag`), local `smartPitch` state on card/modal. | Edits to `nextFollowUpTs` or `value` persist to `opportunities_ext` and immediately re-bucket items in `MyDayDashboard`. | Multi-quote comparison matrix inside `OpportunityDetailModal`, e-signature dispatch (DocuSign/PandaDoc), and payment link generation (Stripe/Viva Wallet/IRIS). |
| **`pages/MyDayDashboard.tsx`** (`/pipeline/my-day`), **`MyDayList.tsx`**, **`MyDayTasks.tsx`** | Agent daily focus cockpit bucketing opportunities into **Overdue**, **Due Today**, and **Unscheduled**, paired with personal task checklist. | Consumes `usePipelineData` (`opportunities`) and `useTasks` (`agentos_db_tasks`). | Completing a follow-up or rescheduling moves cards dynamically between buckets; syncs with `/tasks`. | Time-blocked calendar sync (Google Calendar / Outlook two-way sync), AI-prioritized call queue sorted by Expected Commission Value × Close Probability, and power-dialer mode. |
| **`pages/OpportunitiesHub.tsx`** (`/opportunities-hub`) | Dedicated revenue expansion hub surfacing **human-verified** AI upsell and cross-sell opportunities across the book of business, with total annualized revenue ticker and **Loss-Aversion Pitch Generator Modal** (WhatsApp/Viber copy/deep-link). | Reads `findingsStorage` (`agentos_findings_<agencyId>` where `status === 'verified'` and `type` in `['upsell', 'cross-sell']`), joins with `useCrmData().customers`. | Populated when an agent clicks "Verify" in `CustomerProfile -> AgentReviewPanel`; links back to `/customer/:customerId` or launches messaging apps. | 1-click "Convert to Pipeline Deal" (spawning an `Opportunity__EXT` on the Kanban board), bulk renewal cross-sell campaigns, and conversion tracking from AI finding -> bound endorsement. |
| **`pages/Tasks.tsx`** (`/tasks`), **`TaskList.tsx`**, **`TaskItem.tsx`**, **`TaskModal.tsx`** | Full CRUD task manager with priority (`low`, `medium`, `high`), due date filters, completion toggles, and polymorphic entity linking (`customer`, `opportunity`, `lead`). | Backed by `useTasks` -> `taskService` (`localStorage['agentos_db_tasks']`, seeded from `data/tasks.json`). | Links directly to `/customer/:id` or pipeline deals; automation rules (`create_task` action) target this domain. | Recurring task templates, team task delegation & @mentions, SLA escalation rules, and Kanban/Calendar task views. |

---

### Platform 4: Micro-CRM, Lead Management & 360° Customer / ACORD Lifecycle

| Component / Module | Current Features | Residing Data & Storage Keys | Connections & Reactive Behavior | Unicorn Service Upgrades Needed |
| :--- | :--- | :--- | :--- | :--- |
| **`hooks/useCrmData.ts`** | Central CRM state manager providing `customers`, `leads`, `users`, CRUD mutations, timeline event/annotation appenders, policy renewals, and `convertLeadToCustomer`. | `localStorage['customers_data']` (seeded from `MOCK_CUSTOMERS`) and `localStorage['leads_data']` (seeded from `MOCK_LEADS`). | Consumed by `MicroCRM`, `CustomerProfile`, `LeadsDashboard`, `LeadCapturePage`, `LeadsInbox`, `OpportunitiesHub`, `GenerateSiteModal`, and `RuleTesterModal`. | Unify with `services/api.ts` and `usePipelineData` into a single relational backend (PostgreSQL/Cloud SQL) with full-text search, deduplication engine (AFM/VAT, email, phone), and household/company graph relationships. |
| **`pages/MicroCRM.tsx`** (`/micro-crm`) | Tabbed Customers & Leads workspace featuring **AI Smart Document Import** (upload ID card, tax document, or policy image/PDF -> multimodal Gemini extracts customer & policy fields -> pre-populates `CustomerFormModal`). | Consumes `useCrmData`; local `activeTab`, `isFormOpen`, `prefilledCustomerData`, `isExtracting`. Calls `/api/gemini/generate`. | Creating/converting a lead updates both tabs and navigates to `/customer/:customerId`. | Bulk CSV/Excel/legacy-BMS importer with AI column mapping, Greek AFM (GSIS/AADE) & vehicle plate lookup auto-enrichment, and custom saved segments/views. |
| **`CustomersTable.tsx`, `CustomerFormModal.tsx`, `CrmLeadsTable.tsx`, `LeadsTable.tsx`, `LeadDetailModal.tsx`** | Searchable/paginated customer & lead directories, multi-policy badge summaries, lead status updates, lead-to-customer conversion workflow. | Controlled table filter/sort/page states; modal form state. | `LeadDetailModal` triggers `convertLeadToCustomer(leadId)`, setting `lead.status = CLOSED`, setting `lead.customerId`, and creating a new `Customer` record. | Inline bulk actions (assign agent, tag, enroll in sequence), RFM/churn risk score column, and total household GWP / commission rollup column. |
| **`pages/LeadsDashboard.tsx`** (`/leads-dashboard`) & **`pages/LeadGeneration.tsx`** (`/lead-gen`) | Lead funnel analytics (`LeadStatusFunnel`, `LeadSourceChart`, `LeadControls`) and outbound/inbound lead capture playbooks. | Reads `useCrmData().leads` and `useAllLeadsData`. | Visualizes conversion velocity of leads captured from `LeadCapturePage` and `MicroCRM`. | Multi-touch attribution modeling (first-touch, linear, time-decay) linking ad spend -> click -> form -> quote -> bound policy GWP. |
| **`pages/CustomerProfile.tsx`** (`/customer/:customerId`) | **360° Client Dossier**: contact header, urgent `AttentionFlag` banner, GDPR/Marketing `ConsentManagement`, human-in-the-loop `AgentReviewPanel` for AI findings, `ActionableOpportunities`, `DetailedPolicyView` (ACORD policies) + legacy `PolicyCard`s, `EmbeddedGapAnalysis`, `StoredAnalysisCard` history, and auditable `CustomerTimeline`. | Joins 5 stores for `:customerId`: `useCrmData` (`customers_data`), `usePolicySync` (`agentos_acord_policies`), `useFindingsData` (`agentos_findings_<agencyId>`), `useAnalysisData` (`agentos_gap_analyses`), and `auditLogService` (`agentos_db_audit_logs`). | **Core reactive hub**: (1) Editing ACORD coverages inline logs an `AuditLog` + updates `policyStorage`; (2) Running `EmbeddedGapAnalysis` writes `pending_review` findings; (3) Approving findings in `AgentReviewPanel` moves them to `ActionableOpportunities`, `OpportunitiesHub`, and `Dashboard` KPIs! | Client Self-Service Portal view (policy wallet, digital ID cards, 1-click endorsement requests, FNOL photo upload), family/corporate org-chart tree, document vault with e-signature history, and automated renewal timeline (T-90, T-60, T-30). |
| **Customer Modals & Sub-Panels (`components/customer/*`)** | `EditProfileModal`, `AddressChangeModal` (propagates address change + logs timeline event), `AttentionFlagModal`, `AddTimelineEventModal` (notes, calls, claims, annotations), `RenewalModal`, `PolicyRecommendationModal`, `AgentReviewPanel` + `SuggestionCard`, `ActionableOpportunities` + `ActionableOpportunityCard`, `DetailedPolicyView`. | Local form states; `DetailedPolicyView` uses `EditableField` to mutate `PolicyACORD` coverages/beneficiaries via `usePolicySync`. | Every significant mutation appends a `TimelineEvent` to `customer.timeline` for compliance traceability. | Automated endorsement generation (ACORD 125/126/140 PDF export), carrier portal RPA/API sync when address or vehicle changes, and omnichannel message thread (Email + WhatsApp + Viber + SMS unified in `CustomerTimeline`). |

---

### Platform 5: AI Policy Scanner, ACORD Mapper & Underwriting Risk Engine

| Component / Module | Current Features | Residing Data & Storage Keys | Connections & Reactive Behavior | Unicorn Service Upgrades Needed |
| :--- | :--- | :--- | :--- | :--- |
| **`pages/GapAnalysis.tsx`** (`/gap-analysis`) & **`EmbeddedGapAnalysis.tsx`** | Standalone and customer-embedded AI Policy Analyzer: accepts PDF/image policy declarations, extracts structured fields, enforces human data review, maps to ACORD format, and runs actuarial coverage gap & upsell analysis. | Local workflow state (`uploadedFile`, `parsedPolicy: DetailedPolicy`, `isReviewModalOpen`, `analysisResult: GapAnalysisResult`); persists via `policyStorage`, `analysisStorage`, and `findingsStorage`. | Calls `POST /api/gemini/parse-policy` and `POST /api/gemini/analyze-gaps`; links analyzed policies directly to a selected or newly created `Customer`. | Batch multi-policy portfolio upload (drag 50 PDFs across Auto, Home, Life, Umbrella), cross-policy overlap/gap synthesis (e.g., Umbrella underlying limit mismatch), and Greek carrier template fine-tuning (Ethniki, Generali, Interamerican, Ergo, NN, Allianz). |
| **`FileUploader.tsx`, `PolicyParser.tsx`, `DataReviewModal.tsx`, `PolicyReviewForm.tsx`, `DataCorrectionForm.tsx`** | Drag-and-drop multimodal file reader (Base64 conversion), `react-hook-form` human-in-the-loop verification modal split into `PolicyDetailsSection`, `PolicyholderSection`, `CoveragesSection`, and `BeneficiariesSection`, backed by `services/policyValidator.ts`. | Form state hydrated from `DetailedPolicy`; validation errors from `policyValidator.ts`. | Blocks AI risk scoring until the agent confirms/corrects extracted policy numbers, dates, premiums, deductibles, and limits (preventing hallucinated underwriting advice). | Side-by-side synchronized PDF bounding-box viewer (hovering a form field highlights the exact paragraph/table cell on the scanned policy PDF with confidence scores). |
| **`services/acordMapper.ts` & `AcordPolicyDisplay.tsx`** | Deterministic transformer `mapToPolicyACORD(detailedPolicy)` converting AI JSON into standardized `PolicyACORD` (`policyNumber`, `insurer`, `lineOfBusiness`, `effectiveDate`, `expirationDate`, `totalPremium`, `coverages[]`, `insuredItems[]`). | Pure transformation pipeline writing to `localStorage['agentos_acord_policies']` keyed by `customerId`. | Bridges Platform 5 (AI Scanner) and Platform 4 (`CustomerProfile -> DetailedPolicyView`), synchronized via `usePolicySync` and `usePolicyCrmSync`. | Full ACORD AL3 / XML 2.x import/export compatibility, endorsement diffing (comparing last year's renewal PDF vs. this year's renewal offer to highlight premium hikes or silent coverage reductions). |
| **`GapAnalysisResults.tsx` & `StoredAnalysisCard.tsx`** | Renders **Risk Score gauge (0–100)**, prioritized `gaps` (high/medium/low), `upsell_opportunities`, `cross_sell_opportunities`, **Financial Impact vs. Cost of Implementation** badges, and persuasive advisor `salesScript`s. | Consumes `GapAnalysisResult` / `StoredAnalysis` (`localStorage['agentos_gap_analyses']`). | Automatically invokes `savePendingFindings()` in `findingsStorage.ts`, queueing findings for human verification in `CustomerProfile`. | Branded client-facing **Coverage Audit Proposal PDF** (1-click export with charts & Greek/English explanations), interactive "What-If" coverage slider showing live carrier quote deltas, and E&O (Errors & Omissions) client sign-off when a customer declines recommended coverage. |

---

### Platform 6: Omnichannel Social Studio, Ad Campaigns & Marketing Analytics

| Component / Module | Current Features | Residing Data & Storage Keys | Connections & Reactive Behavior | Unicorn Service Upgrades Needed |
| :--- | :--- | :--- | :--- | :--- |
| **`pages/SocialComposer.tsx`** (`/social-composer`) | 3-column AI Social Marketing Studio: strategy brief -> parallel 4-network post generation (`facebook`, `instagram`, `linkedin`, `x`) -> inline AI refinement -> AI visual studio -> regulatory compliance check -> publish/schedule/drafts. | Local studio state (`posts` per platform, `selectedPlatform`, `brandVoice`, `campaignStrategy`, `mediaUrl`, `drafts` in `localStorage['social_drafts']`); reads `useSocialConnections()`. | Calls `/api/gemini/generate` (parallel per platform + `SmartEditor` rewrites) and `/api/gemini/generate-image`; checks `Settings` social connections before publishing. | Real OAuth 2.0 publishing & scheduling queue via Meta Graph API, LinkedIn Marketing API, X API, and Instagram Reels/Carousel composer; content calendar view with agency approval workflows. |
| **Composer Sub-Components (`components/composer/*`)** | `TopicInspiration` (seasonal/event insurance hooks), `CampaignBrief`, `VoiceSelector` (`professional`, `empathetic`, `urgent`, `educational`), `SmartEditor` (shorten/expand/emojify/polish), `HashtagManager`, `CharacterCount`, `EngagementScore`, `PostPreview`, `MediaManager`, `ImageGenerator`, `TemplateSelector`, `ComplianceCheck`. | Controlled props from `SocialComposer`; `ComplianceCheck` runs regex/rule checks + Gemini review for banned insurance claims (e.g., `"Εγγυημένα"`, `"100% κάλυψη"`, `"cheapest"`). | Real-time feedback loop: editing text in `SmartEditor` instantaneously recalculates `CharacterCount`, `EngagementScore`, `ComplianceCheck` warnings, and live `PostPreview`. | Brand-kit visual compositor (auto-overlay agency logo, license number, and brand colors onto generated images), Bank of Greece / EU IDD (Insurance Distribution Directive) legal compliance verifier with citation links, and comment/DM unified inbox. |
| **`pages/AdCampaigns.tsx`** (`/ad-campaigns`), **`CampaignList.tsx`**, **`CampaignWizard.tsx`**, **`AdPreview.tsx`** | Paid acquisition manager with 5-step wizard: `Step1_Objective`, `Step2_Audience` (age, interests, locations), `Step3_Budget`, `Step4_Creative` (AI ad copy + `/api/gemini/generate-image` creative), `Step5_LeadCapture` (custom form builder) & `Step5_Review`. | Backed by `useCampaigns` -> `campaignService` (`localStorage['agentos_db_campaigns']`); wizard holds draft `Campaign` state. | Generates a live public capture URL `/#/campaign/lead/:campaignId` rendered by `LeadCapturePage.tsx`! | Direct Meta Ads Manager & Google Ads API deployment (launch ad sets, sync daily spend/impressions, A/B creative testing, Meta Conversions API server-side pixel firing when a lead binds a policy). |
| **`pages/LeadCapturePage.tsx`** (`/campaign/lead/:campaignId`) | **Public unauthenticated high-conversion landing page** dynamically styled (`home`/ENFIA, `health`, `auto`, `generic`) from `Campaign.creative` and `Campaign.leadCaptureForm`. | Reads `useCampaigns` (`agentos_db_campaigns`) and writes via `useCrmData().addLead` (`leads_data`). | Submitting the form creates a `Lead` tagged with `campaignId` and `source: campaign.name`, immediately visible in `MicroCRM` and `LeadsDashboard`. | Instant indicative quote calculator widget on the landing page (enter plate number / home sq.m. -> see price range -> unlock full quote via OTP phone verification), eliminating fake phone numbers; also emit `TransactionInquiry` so leads land in `LeadsInbox` simultaneously. |
| **`pages/Analytics.tsx`** (`/analytics`) & **`components/analytics/*`** | Marketing performance dashboard (`AnalyticsFilters`, `KpiCard`, `PerformanceChart`, `SpendChart`) tracking impressions, clicks, CTR, spend, conversions, and CPC by network and campaign. | Consumes `useAnalyticsData` (`data/analytics.json` / `AnalyticsRecord[]`) joined with `Campaign` IDs. | Correlates `AdCampaigns` spend against lead generation volume. | Closed-loop ROAS (Return on Ad Spend) attribution connecting `AnalyticsRecord.campaignId` -> `Lead.campaignId` -> `Customer.policies[].premium` to show true GWP and commission earned per €1 of ad spend. |

---

### Platform 7: Agency Digital Presence, Microsite Builder, Marketplace & Content

| Component / Module | Current Features | Residing Data & Storage Keys | Connections & Reactive Behavior | Unicorn Service Upgrades Needed |
| :--- | :--- | :--- | :--- | :--- |
| **`pages/MicrositeBuilder.tsx`** (`/microsite-builder`) | Drag-and-drop (`react-dnd`) no-code agency website builder with 14 modular block types, live responsive `SitePreview`, per-block `BlockEditor`, global `SiteSettingsEditor` (SEO, colors, contact, socials), `TemplateSelector` marketplace, and **1-Click AI Full-Site Generator**. | Persists `MicrositeConfig` in `localStorage['microsite_config_<agencyId>']`; reads `useMicrositeTemplates`, `useAuth` (plan tier), `useCrmData`, `useNewsData`, and `useTestimonialsData`. | **Deep cross-module hydration**: `GenerateSiteModal` reads the agent's real CRM product mix, latest news headlines, and approved testimonial count to prompt `/api/gemini/generate` for a tailored agency website; `TemplateSelector` gates premium templates by `User.plan.tier` (`free` vs `pro` vs `enterprise`) with upsell path to `/billing`. | Multi-tenant edge hosting with automated SSL & custom domains (`www.papadopoulos-insurance.gr`), SSR Next.js/Astro static publishing for 100/100 Lighthouse SEO, and live embedded quote/appointment booking widgets wired directly to `LeadsInbox`. |
| **14 Microsite Block Previews (`components/microsite/blocks/*`) & `AIContentRefiner.tsx`** | `Hero`, `About`, `Products`, `Team`, `Testimonials`, `Faq`, `ContactForm`, `News`, `Awards`, `Certificates`, `PolicyHighlights`, `Location`, `Video`, `Downloads` + inline per-field `AIContentRefiner` magic wand. | Block JSON props inside `MicrositeConfig.blocks[]`. | `ContactFormPreview` models public lead capture; `NewsBlockPreview` & `TestimonialsBlockPreview` pull from agency content stores. | Interactive insurance calculators block (Life coverage needs, Home rebuild cost, ENFIA tax savings), Calendly-style live slot picker block, and GDPR cookie consent banner block. |
| **`ContentManager.tsx`, `NewsListing.tsx`, `NewsArticleDetail.tsx`, `Testimonials.tsx`** | Full CMS for agency `NewsArticle`s (`NewsManager`, `NewsEditor`, `ArticleCard`, `ShareButtons`) and social proof `Testimonial`s (`ModerationCard` approve/reject workflow, `TestimonialCarousel`, `AddTestimonialModal`). | `useNewsData` (`localStorage['news_articles']`) and `useTestimonialsData` (`localStorage['testimonials_data']`). | Approved testimonials and published articles dynamically feed `MicrositeBuilder` blocks and public share pages (`/news/:articleId`). | Automated AI Insurance Blog writer (generates weekly SEO articles on tax/insurance law changes), automated post-renewal NPS survey that converts 9–10 scores into `Testimonial` moderation items and Google Reviews, plus completion of `CustomerMicrosite.tsx` as a personalized per-client policy micro-portal. |

---

### Platform 8: CRM Workflow Automation & Omnichannel Rule Engine

| Component / Module | Current Features | Residing Data & Storage Keys | Connections & Reactive Behavior | Unicorn Service Upgrades Needed |
| :--- | :--- | :--- | :--- | :--- |
| **`pages/AutomationRules.tsx`** (`/crm/automation-rules/*`) & **`RuleCategoryView.tsx`, `AutomationOverview.tsx`, `RulesTable.tsx`, `RulesFilters.tsx`** | Admin-protected automation hub with nested tabs: Overview KPIs, Lead Conversion rules, Communication rules, Message Templates, Channel Settings, and Execution Event Log. | `useAutomationRules` (`localStorage['automation_rules']`, seeded from `data/rules/*.json`); guarded by `UserSystemRole.ADMIN`. | Central control plane governing automated actions across leads, tasks, and messaging channels. | Visual node-based DAG workflow canvas (triggers, time delays, if/else branches, A/B splits, webhook calls, renewal T-60/T-30/T-7 drips, unpaid installment dunning sequences). |
| **`pages/RuleBuilder.tsx`** (`/new`, `/edit/:ruleId`), **`ConditionRow.tsx`, `ActionRow.tsx`** | Dynamic `react-hook-form` (`useFieldArray`) IF-ALL / THEN builder supporting triggers (`on_lead_creation`, `on_status_change`), conditions (`lead_status`, `lead_score`, `policy_interest`), and actions (`send_email`, `send_sms`, `send_viber`, `send_whatsapp`, `assign_agent`, `create_task`, `add_tag`). | Form state bound to `AutomationRule`; loads `MessageTemplate[]` from `useTemplates` into `ActionRow` dropdowns. | Saves rules to `useAutomationRules`; opens `RuleTesterModal` for pre-deployment dry runs. | Expand condition schema to all ACORD policy fields (`expirationDate <= 30d`, `riskScore > 70`, `missing Home policy`, `claim status changed`), OR/AND nested condition groups, and AI Natural-Language-to-Rule generator ("Remind Auto clients on Viber 15 days before renewal"). |
| **`lib/rule-engine.ts` & `RuleTesterModal.tsx` (`SampleLeadSelector`, `SimulationResults`)** | Deterministic rule evaluator `simulateRule(rule, lead)` testing every condition against real CRM `Lead` records and rendering pass/fail diagnostics with actual vs. expected values. | Reads live `leads` from `useCrmData` inside `SampleLeadSelector`; returns `SimulationResult`. | Validates rules before activation without sending real external messages. | **Live Event-Driven Execution Worker**: hook `rule-engine.ts` into a server-side event bus (PostgreSQL triggers / BullMQ) so real `addLead`, `updateOpportunityStage`, and cron renewal events actually execute rules in production, dispatch messages, create `Task`s, and append `AutomationEvent` logs! |
| **`pages/TemplatesManager.tsx` & `TemplateEditorModal.tsx`** | Omnichannel template studio (`email`, `sms`, `viber`, `whatsapp`) with dynamic variable merge-tag insertion (`{{Lead.FirstName}}`, `{{Agent.Name}}`, `{{Policy.ExpirationDate}}`, etc. from `constants/placeholders.ts`). | `useTemplates` (`localStorage['message_templates']`, seeded from `data/templates/*.json`). | Consumed by `ActionRow` in `RuleBuilder` and quick-messaging flows. | Official Meta WhatsApp Business Cloud API template sync (HSM approval status tracking), rich Viber Business button/image cards, HTML email drag-and-drop builder, and AI tone/length optimizer. |
| **`pages/AutomationSettings.tsx` & `pages/AutomationEventLog.tsx`** (`ConversionImpactChart`, `EventLogTable`, `EventLogFilters`) | Configures SMTP, SMS, Viber, and WhatsApp API credentials with connection test simulation; tracks execution telemetry, failure rates, and conversion lift charts. | `useAutomationSettings` (`localStorage['automation_settings']`) and `useAutomationEvents` (`data/analytics/automation_events.json`). | Provides operational observability over automated outreach. | Encrypted server-side secret vault (KMS/Secret Manager — never store channel API keys in browser storage), real Twilio / Infobip / Routee / SendGrid delivery & read-receipt webhooks, and automatic channel fallback (e.g., Viber -> SMS -> Email if undelivered). |

---

### Platform 9: Agency Governance, Billing, Academy Support & System Settings

| Component / Module | Current Features | Residing Data & Storage Keys | Connections & Reactive Behavior | Unicorn Service Upgrades Needed |
| :--- | :--- | :--- | :--- | :--- |
| **`pages/UserManagement.tsx`** (`/user-management`) & **`components/users/*`** | Admin roster & security governance built on the **ACORD Party-Role model** (`UsersTable`, `UserFilters`, `BulkActionsToolbar`, `InviteUserModal`, `AuditLogsTable`, `AuditLogFilters`). | `useUserManagementData` -> `userService` (`agentos_db_users`) & `auditLogService` (`agentos_db_audit_logs`). | Role changes and user invitations automatically write immutable `AuditLog` entries. | Sub-agent hierarchy & commission split trees, Bank of Greece / EU IDD license expiration tracking (`AcordLicense.expirationDate` auto-alerts & CPD credit tracking), and territory/branch data partitioning. |
| **`pages/Billing.tsx`** (`/billing`) & **`CreditUsageCard.tsx`** | SaaS subscription plan manager (`Starter`, `Pro`, `Enterprise`), seats & storage gauges, invoice table, and **Flex-Budget AI Credit Metering** (`includedCredits`, `usedCredits`, `overageRate`, user-adjustable `monthlyBudgetCap` with 80% warning & 100% hard-stop indicators). | Local billing state initialized from `User.plan` and `BillingUsage` (`billing.documentation.md` model). | Upgrades unlock gated templates in `MicrositeBuilder` and higher AI credit allowances. | Real Stripe Subscriptions + Stripe Metered Billing integration, **server-side token/credit enforcement middleware on `/api/gemini/*`** deducting exact credits per policy scan / image generation, and automated Greek myDATA (AADE) compliant tax invoicing. |
| **`pages/Support.tsx`** (`/support`), **`CourseViewer.tsx`, `SocialMediaGuide.tsx`, `ProfilePhotoEnhancer.tsx`** | Agent enablement hub: interactive insurance sales/marketing micro-courses, social playbook, and **AI Headshot Studio** (`ProfilePhotoEnhancer` transforms casual agent selfies into corporate/modern/friendly studio portraits via multimodal Gemini). | Course progress state; Base64 uploaded photo + style prompt sent to `/api/gemini/generate-image`. | Enhanced profile photos can be downloaded or applied to agent profiles and microsite `TeamBlockPreview`. | Interactive AI Roleplay Coach (voice-to-voice Gemini Live practice calls where the AI plays a skeptical Greek prospect objecting to Life/Health insurance and scores the agent's handling), plus searchable help center & live support ticketing. |
| **`pages/Profile.tsx`** (`/profile`) & **`pages/Settings.tsx`** (`/settings` + `components/settings/*`) | Agent profile editor, timezone/date preferences, dark mode, 2FA/password UI, granular browser notification toggles (`NotificationEventSettings`, `PermissionDeniedWarning`), `SocialConnectionRow` + `SocialAuthModal`, and Google Business Profile (`gapi`) connector. | `localStorage` keys: `google_client_id`, `gbp_location_name`, `gbp_location_title`, `social_connections`, `notifications_enabled`, `individual_notification_settings`. *(Note: legacy `gemini_api_key` UI field in `Settings.tsx` should be deprecated/removed since Gemini now runs securely server-side via `server.ts`)*. | Updating `gbp_location_name` hydrates `Dashboard` GBP reviews; connecting platforms in `SocialConnectionRow` enables publishing in `SocialComposer`; notification toggles filter `NotificationContext` alerts. | Remove legacy client API key input in `Settings.tsx` (enforce zero client secrets), implement real OAuth 2.0 PKCE/server token exchange for Google Workspace (Gmail/Calendar/GBP) and Meta/LinkedIn, plus self-service GDPR data export & retention policy controls. |

---

### Platform 10: Backend API Proxy & Client Persistence Infrastructure

| Component / Module | Current Features | Residing Data & Storage Keys | Connections & Reactive Behavior | Unicorn Service Upgrades Needed |
| :--- | :--- | :--- | :--- | :--- |
| **`server.ts`** | Express 5 full-stack server running on `0.0.0.0:3000`: mounts Vite dev middleware in development, serves `/dist` in production, and exposes `/api/health`, `/api/gemini/generate`, `/api/gemini/generate-image`, `/api/gemini/parse-policy`, and `/api/gemini/analyze-gaps`. | Reads `process.env.GEMINI_API_KEY` server-side; zero secret exposure to browser. | Services all 17 AI-enabled frontend components via `services/geminiClient.ts`. | Modularize into versioned REST/tRPC/GraphQL microservices (`/api/v1/auth`, `/api/v1/crm`, `/api/v1/policies`, `/api/v1/pipeline`, `/api/v1/webhooks`, `/api/v1/ai`), add rate limiting, Zod request validation, structured logging, and SSE streaming for instant AI token rendering. |
| **`services/geminiClient.ts`** | Typed frontend SDK wrapping `fetch('/api/gemini/*')` for text/multimodal generation, image generation, ACORD policy parsing, and underwriting gap analysis. | Stateless HTTP client. | Imported by `GapAnalysis`, `EmbeddedGapAnalysis`, `SocialComposer`, `ImageGenerator`, `ComplianceCheck`, `MicroCRM`, `Dashboard/ReviewCard`, `LeadRow`, `LeadQuickView`, `OpportunityCard`, `OpportunityDetailModal`, `OpportunitiesHub`, `AdCampaigns`, `GenerateSiteModal`, `AIContentRefiner`, and `ProfilePhotoEnhancer`. | Streaming response hooks (`useStreamingGeneration`), request cancellation (`AbortController`), retry with exponential backoff, and automatic response caching by content hash. |
| **`services/api.ts`** | Generic `MockRepository<T>` CRUD layer with simulated latency and `localStorage['agentos_db_*']` persistence (`customerService`, `leadService`, `taskService`, `campaignService`, `userService`, `auditLogService`). | `agentos_db_customers`, `agentos_db_leads`, `agentos_db_tasks`, `agentos_db_campaigns`, `agentos_db_users`, `agentos_db_audit_logs`. | Powers `Tasks`, `AdCampaigns`, `UserManagement`, and `AuditLogs`. | Replace `MockRepository` with Drizzle/Prisma ORM over multi-tenant PostgreSQL (with Row-Level Security on `agency_id`) + TanStack Query (`@tanstack/react-query`) for optimistic UI, cache invalidation, and pagination. |

---

## 3. Data Model Topology, Relationships & Split-Store Audit

### 3.1 Master Entity-Relationship Graph (`types.ts`)

```
                          ┌──────────────────────────────────┐
                          │         Agency (agencyId)        │
                          └────────────────┬─────────────────┘
              ┌────────────────────────────┼────────────────────────────┐
              ▼                            ▼                            ▼
┌───────────────────────────┐ ┌─────────────────────────┐ ┌───────────────────────────┐
│        User (ACORD)       │ │       Campaign          │ │     AutomationRule        │
│ • party (name, contact)   │ │ • objective, audience   │ │ • triggerType             │
│ • partyRole (ADMIN/AGENT) │ │ • budget, creative      │ │ • conditions: RuleCond[]  │
│ • licenses: AcordLicense[]│ │ • leadCaptureForm       │ │ • actions: RuleAction[]   │
│ • plan (tier, seats)      │ └──────┬──────────┬───────┘ └─────────────┬─────────────┘
└─────────────┬─────────────┘        │          │                       │ uses
              │                      │          ▼                       ▼
              │ 1:N                  │   ┌──────────────┐      ┌──────────────────┐
              ▼                      │   │AnalyticsRec[]│      │ MessageTemplate  │
┌───────────────────────────┐        │   └──────────────┘      │ (email/sms/viber │
│         AuditLog          │        │ generates               │  /whatsapp)      │
│ • actorId -> User.id      │        ▼                         └──────────────────┘
└───────────────────────────┘ ┌─────────────────────────┐
                              │       Lead (CRM)        │◄── evaluated by ── lib/rule-engine.ts
                              │ • campaignId?           │
                              │ • status: LeadStatus    │
                              │ • customerId? (on close)│
                              └────────────┬────────────┘
                                           │ convertLeadToCustomer()
                                           ▼
┌───────────────────────────┐ ┌─────────────────────────┐ ┌───────────────────────────┐
│  DetailedPolicy (Gemini)  │ │        Customer         │ │  TransactionInquiry (Pipe)│
│ • policyholder, coverages │ │ • id, agencyId, afm     │ │ • source, channel, details│
│ • insuredItems[]          │ │ • attentionFlag         │ └─────────────┬─────────────┘
└──────┬──────────────┬─────┘ │ • communicationConsent  │               │ createOpportunity()
       │              │       │ • policies: Policy[]    │               ▼
mapToPolicyACORD()    │       │ • timeline: TimelineEv[]│ ┌───────────────────────────┐
       ▼              │       └─────┬──────┬──────┬─────┘ │ Prospect ──► Opportunity  │
┌──────────────────┐  │             │      │      │       │ • stage (new..won/lost)   │
│   PolicyACORD    │◄─┼─────────────┘      │      │       │ • value, nextFollowUpTs   │
│ (policyStorage)  │  │                    │      │       └──────┬──────────────┬─────┘
└──────────────────┘  │ analyze-gaps       │      │              │              │ stage='won'
                      ▼                    │      │              ▼              ▼
             ┌──────────────────┐          │      │     ┌──────────────┐ ┌────────────┐
             │GapAnalysisResult │          │      │     │ Interaction[]│ │ Conversion │
             │ • riskScore      │          │      │     └──────────────┘ └────────────┘
             │ • gaps/upsells   │          │      │
             └────────┬─────────┘          │      └───────────────────┐
                      │ savePending()      ▼                          ▼
                      ▼           ┌──────────────────┐       ┌──────────────────┐
             ┌──────────────────┐ │ StoredAnalysis[] │       │      Task        │
             │  StoredFinding   │ └──────────────────┘       │ • relatedTo:     │
             │ • pending_review │                            │   customer | opp │
             │ • verified       │◄── joins CustomerId        │   | lead         │
             │ • dismissed      │    in OpportunitiesHub     └──────────────────┘
             └──────────────────┘
```

### 3.2 Key Data Transformation Pipelines

1. **Multimodal Policy-to-Revenue Pipeline**:
   `PDF/Image Base64` ──(`POST /api/gemini/parse-policy`)──► `DetailedPolicy` ──(`DataReviewModal` human validation + `policyValidator.ts`)──► `mapToPolicyACORD()` ──► `PolicyACORD` (`localStorage['agentos_acord_policies'][customerId]`) + `POST /api/gemini/analyze-gaps` ──► `GapAnalysisResult` ──► `StoredAnalysis` (`agentos_gap_analyses`) + `StoredFinding[]` (`status: 'pending_review'` in `agentos_findings_<agencyId>`) ──(`AgentReviewPanel` approval)──► `StoredFinding` (`status: 'verified'`) ──► **`ActionableOpportunities` + `Dashboard` KPI Cards + `OpportunitiesHub`**.
2. **Campaign-to-CRM Attribution Pipeline**:
   `CampaignWizard` ──► `Campaign` (`agentos_db_campaigns`) ──► `/#/campaign/lead/:campaignId` (`LeadCapturePage`) ──► `Lead` (`leads_data`, `campaignId`, `status: 'New'`) ──(`convertLeadToCustomer`)──► `Customer` (`customers_data`, `lead.customerId` linked).
3. **Inquiry-to-Deal Pipeline**:
   `TransactionInquiry` (`transaction_inquiries`) ──(`LeadsInbox.createOpportunity`)──► `Prospect` (`prospects`) + `Opportunity__EXT` (`opportunities_ext`, `stage: 'new'`) ──(`OpportunityPipeline` Kanban drag to `'won'`)──► `Conversion` (`pipeline_conversions`, `attributionId: inquiryId`).

### 3.3 Architectural Split-Store Silos Identified (Critical Unification Targets)

During inspection of the codebase, **four data-model disconnects** were identified that currently prevent seamless end-to-end data flow and must be unified in the Unicorn architecture:

| Silo / Gap | Current Behavior in Codebase | Required Unification Fix |
| :--- | :--- | :--- |
| **1. Dual CRM Storage Keys** | `useCrmData.ts` reads/writes `localStorage['customers_data']` and `localStorage['leads_data']`, whereas `services/api.ts` defines `customerService` (`agentos_db_customers`) and `leadService` (`agentos_db_leads`). | Consolidate onto a single canonical repository/API table (`customers`, `leads`) consumed via React Query hooks. |
| **2. `Lead` vs. `TransactionInquiry` Split** | `LeadCapturePage` and `MicroCRM` create `Lead` records (`leads_data`), whereas `LeadsInbox` reads `TransactionInquiry` records (`transaction_inquiries`). Campaign leads do not automatically appear in `LeadsInbox`! | Unify inbound capture into a single `InboundLead` / `Inquiry` ingestion pipeline so every campaign, microsite, and webhook submission lands immediately in `LeadsInbox` AND triggers `AutomationRule`s. |
| **3. `Opportunity ('won')` -> `Customer` Gap** | Dragging an `Opportunity__EXT` card to `'won'` in `OpportunityPipeline` records a `Conversion`, but does **not** automatically create/update a `Customer` and `Policy` in `MicroCRM`. | Trigger a "Bind Policy & Onboard Client" modal/transaction on `'won'` that promotes `Prospect` -> `Customer` (or links existing `Customer` by AFM/email) and creates the active `PolicyACORD`. |
| **4. Summary `Customer.policies[]` vs. `PolicyACORD[]`** | `Customer.policies` stores lightweight `Policy` objects while `policyStorage.ts` stores rich `PolicyACORD` records (`agentos_acord_policies`), requiring `usePolicyCrmSync` glue logic. | Make `PolicyACORD` the single relational `policies` table (`customer_id` FK), computing summary badges via SQL views/selectors. |

---

## 4. Cross-Component Reactive Integration Flows

### Flow A: Policy Upload -> Human Verification -> Agency-Wide Upsell Activation
1. Agent uploads a policy PDF in `GapAnalysis.tsx` or `CustomerProfile -> EmbeddedGapAnalysis.tsx`.
2. `geminiClient.parsePolicy` calls `server.ts` (`POST /api/gemini/parse-policy`), returning schema-constrained `DetailedPolicy` JSON.
3. `DataReviewModal` opens automatically; `policyValidator.ts` highlights missing/suspicious dates or coverage amounts. Agent edits/approves fields.
4. `acordMapper.mapToPolicyACORD` saves the normalized policy to `policyStorage` (`DetailedPolicyView` on `CustomerProfile` immediately reflects the new ACORD coverages).
5. `geminiClient.analyzeGaps` (`POST /api/gemini/analyze-gaps`) scores portfolio risk (`0–100`) and generates `gaps`, `upsell_opportunities`, and `cross_sell_opportunities`.
6. `findingsStorage.savePendingFindings` writes each recommendation with `status: 'pending_review'`.
7. On `CustomerProfile`, `AgentReviewPanel` displays a pending badge. When the agent clicks **Approve/Verify** on a `SuggestionCard`, `findingsStorage` flips `status` to `'verified'`, instantly populating:
   - `ActionableOpportunities` on `CustomerProfile`
   - `Verified Upsells` & `Verified Cross-Sells` KPI counters on `Dashboard.tsx`
   - `OpportunitiesHub.tsx` revenue table & WhatsApp/Viber Loss-Aversion Pitch Generator.

### Flow B: CRM Portfolio -> Context-Aware AI Microsite Generation
1. Agent opens `MicrositeBuilder.tsx` and clicks **Generate with AI** (`GenerateSiteModal`).
2. `GenerateSiteModal` reads live agency context across 4 hooks: `useAuth` (agency name & plan), `useCrmData` (top policy lines in the book of business), `useNewsData` (recent agency news titles), and `useTestimonialsData` (count of approved client reviews).
3. `/api/gemini/generate` synthesizes a localized (`el`/`en`) `MicrositeBlock[]` layout tailored to the agency's actual book of business and hydrates `SitePreview` + `BlockEditor` in one click.

### Flow C: Paid Campaign -> Dynamic Lead Magnet -> CRM Conversion
1. Agent builds a campaign in `AdCampaigns -> CampaignWizard` (e.g., `"ENFIA 20% Home Insurance Discount"`), generating ad copy and creative via `/api/gemini/generate-image`.
2. Saving writes `Campaign` to `agentos_db_campaigns` and exposes `/#/campaign/lead/:campaignId`.
3. Prospect visits `LeadCapturePage.tsx`, which inspects `campaign.name` + `creative.headline`, auto-selects the `home` ENFIA theme magnet, renders custom `leadCaptureForm.fields`, and calls `useCrmData().addLead()` on submit.
4. Agent opens `MicroCRM` (or tests rules in `RuleBuilder -> RuleTesterModal`), inspects the attributed `Lead`, and calls `convertLeadToCustomer()` to promote them into a full `CustomerProfile`.

---

## 5. Unicorn Service Roadmap: What Must Be Implemented Per Platform

To elevate AgentRise / AgentOS from a capable AI-assisted portal into a **$1B+ category-defining InsurTech Operating System** (comparable to Applied Epic + HubSpot + Gong + Stripe for European & global insurance brokers), the following capabilities must be engineered across each platform:

### Phase 1: Cloud Core, Multi-Tenancy & Unified Data Graph (Foundation)
- **Cloud SQL (PostgreSQL) + Row-Level Security (`agency_id`)**: Replace all `localStorage` repositories (`customers_data`, `agentos_db_*`, `agentos_acord_policies`, `transaction_inquiries`) with a unified ACID relational schema (`agencies`, `users`, `households`, `parties`, `policies_acord`, `coverages`, `insured_assets`, `inquiries`, `opportunities`, `interactions`, `findings`, `campaigns`, `automation_rules`, `automation_runs`, `credit_ledger`, `audit_logs`).
- **Real-Time Collaborative Sync**: WebSockets / SSE with optimistic TanStack Query mutations and live presence indicators so multiple agents never overwrite a policy or call the same lead twice.
- **Enterprise Identity & Compliance**: SAML/OIDC SSO, Passkeys/2FA, encrypted PII columns (AFM/Tax ID, health disclosures, IBAN), immutable cryptographic audit logs, and automated GDPR Right-to-Access / Right-to-Erasure workflows.

### Phase 2: Carrier Connectivity, Comparative Rating & Instant Bind (The Moat)
- **Multi-Carrier Comparative Rater (`OpportunityDetailModal` & `CustomerProfile`)**: Integrate live REST/SOAP rating APIs with major insurers (e.g., Interamerican, Generali, Ethniki, Ergo, Allianz, NN, Hellas Direct) — enter 1 risk profile (plate number via Ministry/HIC lookup, or property registry data) and receive **10+ live bindable carrier quotes in <5 seconds**.
- **1-Click Bind, Payment & Policy Issuance**: Embedded Viva Wallet / Stripe / IRIS / SEPA Direct Debit checkout links; once paid, auto-issue the carrier contract PDF, write the `PolicyACORD` record, reconcile agency commission, and deliver the policy to the client via WhatsApp/Email.
- **Automated Renewal Engine (`RenewalModal` & `OpportunityPipeline`)**: Background cron state machine scanning `PolicyACORD.expirationDate` at **T-90, T-60, T-30, T-15, and T-3 days** — automatically re-shopping renewals across carriers if premium rises >10%, running AI renewal diffing, and launching personalized Viber/WhatsApp renewal approval links.

### Phase 3: Autonomous AI Underwriting, Voice Copilot & Claims Concierge
- **Synchronized PDF Citation Viewer (`GapAnalysis` & `DataReviewModal`)**: Dual-pane PDF canvas highlighting exact bounding boxes for every extracted limit, deductible, exclusion, and fine-print clause, plus cross-policy **Household Risk Graph** analysis (detecting uninsured drivers, underinsured rebuild values due to inflation, or missing ENFIA-eligible catastrophe perils: earthquake + fire + flood).
- **Real-Time Voice & Video Call Copilot (`LeadsInbox` & `OpportunityPipeline`)**: Built-in Twilio/LiveKit WebRTC dialer streaming live audio to Gemini Live API — surfacing real-time objection cards, mandatory EU IDD disclosure checklists, and automatic post-call CRM note + follow-up task generation.
- **24/7 AI FNOL (First Notice of Loss) Claims Triage (`Dashboard` & Client Portal)**: Mobile web flow where a policyholder at an accident/property loss uploads photos, voice notes, and GPS pin -> multimodal AI assesses damage severity, checks active `PolicyACORD` coverages/deductibles, drafts the carrier FNOL packet, books tow/repair partners, and alerts the agent immediately.

### Phase 4: True Omnichannel Growth Engine & Hosted Client Experience
- **Live Ad & Social API Orchestration (`SocialComposer`, `AdCampaigns`, `Analytics`)**: Direct Meta Marketing API, Google Ads API, and LinkedIn Ads API integration with server-side Conversions API (feeding offline policy bind values back to Meta/Google ad algorithms to optimize for **bound GWP** rather than cheap unqualified clicks).
- **Production Workflow Engine (`lib/rule-engine.ts` -> BullMQ Worker)**: Server-side event/cron rule runner executing multi-step journeys across verified WhatsApp Business Cloud API, Viber Business Messages, SMS, and transactional Email with automatic channel failover and quiet-hours compliance.
- **Edge-Hosted Custom-Domain Microsites & Client Self-Service Wallet (`MicrositeBuilder` & `CustomerMicrosite.tsx`)**:
  - Publish agency sites to custom domains (`*.agency.gr`) with SSR SEO, interactive quote calculators, and instant appointment booking.
  - Transform `CustomerMicrosite.tsx` into a **Magic-Link Client Insurance Wallet** (Apple/Google Wallet insurance cards, household coverage score, 1-click green card / roadside / certificate downloads, endorsement requests, and referral rewards).

### Phase 5: Fintech Monetization, Commission Accounting & Network Marketplace
- **Server-Side AI Credit Ledger & Stripe Billing (`Billing.tsx` & `server.ts`)**: Enforce `monthlyBudgetCap` middleware on `/api/gemini/*`, real-time token accounting, automated top-ups, and Greek myDATA / EU VAT e-invoicing.
- **Automated Carrier Commission & Sub-Agent Accounting (`ExecutiveDashboard` & `UserManagement`)**: Ingest monthly carrier bordereaux CSV/XML statements, auto-match against bound `PolicyACORD` premiums, flag unpaid/clawed-back commissions, and calculate sub-agent payout splits.
- **Premium Financing & Embedded Insurance API**: Offer monthly installment financing ("Buy Now, Pay Monthly" on annual commercial/home policies) and expose white-label embeddable quote widgets that real-estate agencies, car dealerships, and mortgage brokers can drop onto their own sites, routing deals directly into the agent's `LeadsInbox`.


---

## 6. Unicorn Execution Log (10-Iteration Build & Verification Tracker)

### Iteration 1/10 — COMPLETED: Security Hardening, HMAC Session Auth, Multi-Tenant Persistence & Server-Side Credit Ledger
- **Server Security Kernel (`server/security.ts`)**: Implemented PBKDF2-SHA256 (100,000 iterations + timing-safe comparison) credential verification, HMAC-SHA256 signed session tokens (`Bearer`), iframe-compatible security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`), and sliding-window API rate limiting.
- **Server-Side Flex-Budget Credit Gate (`server/creditLedger.ts` & `server.ts`)**: Enforced credit metering (`25`–`100` credits/op) and monthly overage cap (`402 Payment Required` hard stop at 100%, warning header at 80%) directly on all `/api/gemini/*` endpoints, with Greek **myDATA MARK** VAT-compliant invoice generation.
- **Atomic Multi-Tenant Store & Hash-Chained Audit Log (`server/persistence.ts`)**: Added atomic `.tmp`-rename disk persistence (`.data/agentos_store.json`) and SHA-256 hash-chained (`prevHash -> entryHash`) tamper-evident audit logs (`/api/audit-logs`).
- **Client Secret Elimination & Instant Session Bootstrap (`Settings.tsx`, `AuthContext.tsx`, `OnboardingContext.tsx`, `Login.tsx`)**: Removed legacy client-side API key input from `Settings.tsx`, wired `AuthContext` to `/api/auth/login`, eliminated `ProtectedRoute` onboarding flicker via synchronous state initialization, and added `?autostart=1` + 1-click Demo Role access.

### Iteration 2/10 — COMPLETED: Unified Data Graph, Split-Store Elimination & Zero-Broken-Image Resilience
- **Reactive Multi-Hook & Server Store Sync (`hooks/useOfflineSync.ts`)**: Fixed critical overwrite bug where route transitions reset user-created records back to static mocks; added canonical key aliasing, `CustomEvent('agentos:sync')` intra-tab instant reactivity, and `PUT /api/store/:collection` Express synchronization.
- **Eliminated Silos 1, 2 & 4**:
  - *Silo 1*: Unified `customers_data` / `agentos_db_customers` and `leads_data` / `agentos_db_leads` across `useCrmData.ts` and `services/api.ts`.
  - *Silo 2*: Bridged `addLead` (including unauthenticated public `LeadCapturePage` submissions via explicit `campaign.agencyId`) to automatically emit `TransactionInquiry` records into `LeadsInbox` and `Dashboard` KPI counters.
  - *Silo 4*: Wired `services/policyStorage.ts` so `savePolicyForCustomer` & `deletePolicyForCustomer` automatically project `PolicyACORD` updates into `Customer.policies`.
- **Zero-Broken-Image Assets (`lib/avatars.ts`)**: Replaced external `via.placeholder.com` and `i.pravatar.cc` links in `services/api.ts` and `data/mockData.ts` with crisp deterministic SVG data-URI avatars and campaign banners.

### Iteration 3/10 — COMPLETED: Production Event-Driven Automation Engine & Omnichannel Execution
- **Multi-Entity Rule Evaluator (`lib/rule-engine.ts`)**: Added `AND`/`OR` combinators, `contains`/numeric operators, fields across `potential_value`, `lead_source`, and `days_to_renewal`, plus `renderTemplateContent()` dynamic `{{Lead.*}}` merge-tag interpolation.
- **Live Event-Driven Rule Runner (`services/automationExecutor.ts`)**: Wired real-time `agentos:lead-created` and `agentos:lead-status-changed` listeners in `App.tsx` that automatically evaluate active agency rules, render templates, create SLA follow-up `Task`s, spawn `Opportunity__EXT` deals, and log live `AutomationEvent` records.
- **Crash Fix & Natural-Language Rule Studio (`RuleBuilder.tsx`, `ConditionRow.tsx`, `ActionRow.tsx`)**: Fixed the missing `FormProvider` / `useFormContext` crash when adding conditions or actions, added `create_task` and `create_opportunity` actions, and introduced a plain-language AI Rule Builder bar.

### Iteration 4/10 — COMPLETED: Multi-Carrier Comparative Rater, 1-Click Bind & Opportunity-to-Customer Promotion
- **Actuarial Comparative Rater (`lib/comparativeRater.ts`)**: Built live comparative tariff engine across 6 major carriers (**Hellas Direct**, **Interamerican**, **Generali Hellas**, **Ethniki Asfalistiki**, **ERGO**, **Allianz Europe**) for Auto, Home (including automatic **ENFIA -20% Property Tax Discount** verification), Health, and Life lines, calculating gross/net premium, deductibles, coverages, agency commission, and value fit score.
- **3-Tab Deal Cockpit & Silo 3 Elimination (`OpportunityDetailModal.tsx`, `usePipelineData.ts`, `OpportunityPipeline.tsx`, `PipelineColumn.tsx`)**:
  - Wired previously disconnected `OpportunityDetailModal` into `OpportunityPipeline` and fixed `PipelineColumn` blocking drops into `'won'`/`'lost'`.
  - Added **1-Click Bind & Issue Policy** (`IRIS`, `Viva Wallet`, `SEPA`, `Card`) that promotes `Prospect -> Customer` in Micro-CRM, issues an active `PolicyACORD` synced to `Customer.policies`, logs a `TimelineEvent`, marks the deal `'won'`, and records a `Conversion`.
- **Verified Finding -> Kanban Bridge (`OpportunitiesHub.tsx`)**: Added **Send to Pipeline** 1-click conversion from AI-verified upsell/cross-sell findings directly onto the Kanban board, while replacing decorative `border-l-4` and `animate-ping` elements with clean SaaS surfaces and `tabular-nums`.

### Iteration 5/10 — COMPLETED: Automated Renewal Radar (T-90/T-60/T-30), Household Risk Graph & EU IDD Coverage Audit Export
- **Renewal & Household Risk Engine (`lib/renewalEngine.ts`)**:
  - Built `computeRenewalRadar()` scanning customer portfolios and bucketing expiring contracts into `overdue`, `due30` (T-30), `due60` (T-60), and `due90` (T-90) retention windows with total at-risk GWP.
  - Built `evaluateCustomerHouseholdProfile()` computing a 0–100 **Household Protection Index** across the 4 core pillars (`Auto`, `Home`, `Health`, `Life`) and auditing Home coverages for statutory **ENFIA -20% Property Tax Discount** compliance (`Fire + Earthquake + Flood`).
- **Customer 360 Risk & Audit Dossier (`pages/CustomerProfile.tsx` & `components/gap-analysis/GapAnalysisResults.tsx`)**:
  - Added live Household Protection Completeness panel, ENFIA -20% Catastrophe upgrade banner (catching missing Earthquake & Flood on `HOME-67890`), 1-click **Quote in Pipeline** action, **Open Client Wallet** link, and **Export Coverage Audit** HTML dossier download.
  - Added **EU IDD E&O Client Declination Waiver** checkboxes and advisory export on `GapAnalysisResults.tsx`, while replacing `border-l-4` card borders with clean SaaS surfaces and `tabular-nums`.
- **Dashboard Retention Command (`pages/Dashboard.tsx`)**: Added interactive T-90 Renewal & Retention Radar with bucket filters and 1-click **Re-Shop in Pipeline** deal creation.

### Iteration 6/10 — COMPLETED: Client Self-Service Insurance Wallet & 24/7 AI FNOL Claims Concierge
- **Digital Policyholder Wallet (`pages/CustomerMicrosite.tsx` & `App.tsx`)**: Replaced the 13-line placeholder stub with a full standalone & embedded **Client Insurance Wallet** mounted at `/wallet/:customerId` (public magic-link) and `/client-wallet` (advisor view):
  - **Digital Policy Cards**: Displays active policies, renewals, coverage limits, and 1-click **Certificate / EU Green Card** downloads.
  - **Coverage Upgrades & ENFIA -20% Self-Service**: Surfaces household gaps and ENFIA catastrophe eligibility, allowing clients to request quotes in 1 click (emitting both a `ServiceRequest` and a qualified `Lead`/`TransactionInquiry` into `LeadsInbox`).
  - **24/7 AI FNOL Claims Concierge**: Interactive First Notice of Loss intake with live AI coverage/deductible triage (`generateGeminiContent` + deterministic fallback), writing real `FirstNoticeOfLoss` records (`agentos_db_ftnol`) and `Customer.timeline` claim events while immediately incrementing Dashboard `Portal Submissions`.

### Iteration 7/10 — COMPLETED: Public Lead Capture Instant Quote Calculator, Microsite Form Wiring & Closed-Loop ROAS Attribution
- **Interactive 6-Carrier Quote Magnet (`pages/LeadCapturePage.tsx`)**:
  - Replaced external `i.pravatar.cc` social proof avatars with deterministic inline SVG data-URIs.
  - Embedded a live **Instant 6-Carrier Estimator** (`getQuickQuoteRange`) with property rebuild capital / vehicle value sliders, sq.m. input, and Greek **ENFIA -20% Tax Discount** verification, passing `campaign.agencyId` and `potentialValue` into `addLead()` so public submissions flow directly into CRM, `LeadsInbox`, and `AutomationRule` execution.
- **Microsite Live Lead Capture (`components/microsite/blocks/ContactFormPreview.tsx`)**: Replaced the non-functional `e.preventDefault()` form stub with live CRM + `LeadsInbox` lead creation and confirmation feedback.
- **Closed-Loop Attribution & True ROAS (`pages/Analytics.tsx`)**: Joined `Campaign` ad spend with attributed CRM `Lead` pipeline values and `Conversion` bound GWP to compute true per-campaign ROAS alongside direct landing-funnel preview links.

### Iteration 8/10 — COMPLETED: Carrier Commission Accounting, Sub-Agent Splits, EU IDD Compliance & Live Server Billing
- **Carrier Bordereaux & Commission Engine (`lib/commissionEngine.ts` & `pages/ExecutiveDashboard.tsx`)**:
  - Built `computeAgencyCommissions()` calculating Gross Written Premium (GWP), Net Premium, Gross Carrier Commissions by line of business, 60/40 Brokerage-to-Sub-Agent splits, settlement status (`Matched` vs `Pending Remittance`), and 1-click **Export Bordereaux CSV**.
- **Server-Connected Billing & AADE myDATA Invoices (`pages/Billing.tsx`)**:
  - Connected `Billing.tsx` directly to `/api/billing/usage`, `/api/billing/overage`, `/api/billing/plan`, and `/api/billing/simulate` with live `agentos:credits-updated` synchronization, interactive plan tier switching (`Starter`, `Pro Agency`, `Enterprise Network`), and downloadable **AADE myDATA MARK** VAT (24%) tax invoices.
- **EU IDD License Governance & Iframe Safety (`components/users/UsersTable.tsx`)**: Added Bank of Greece / EU IDD license verification badges (`AcordLicense`) and replaced `window.alert`/`window.confirm` dialogs with clean inline confirmation controls.

### Iteration 9/10 — COMPLETED: Global `Cmd+K` Omnibar Command Palette, Quick-Create Menu & SaaS Shell Polish
- **Global `Cmd+K` Omnibar (`components/CommandPalette.tsx` & `components/Layout.tsx`)**: Added keyboard-navigable (`⌘K` / `Ctrl+K`, `↑↓`, `Enter`, `Esc`) search across CRM Clients, Pipeline Deals, Workspace Routes, Theme toggling, and EN/EL bilingual switching.
- **SaaS Typography & Tabular Financials (`index.html`)**: Configured `Plus Jakarta Sans` + `JetBrains Mono` typography with global `.tabular-nums` alignment and removed unused external legacy scripts.
- **Header & Sidebar Refinement (`components/Header.tsx` & `components/Sidebar.tsx`)**:
  - Replaced the last external `i.pravatar.cc` URLs with inline SVG data-URI avatars and removed decorative green status dots.
  - Added a **`+ New` Quick Create** menu, live **AI Credits** balance link synced via `agentos:credits-updated`, Dark/Light toggle, `Client Wallet & FNOL` navigation entry, and live `tabular-nums` count badges on `Leads Inbox` and `Tasks`.

### Iteration 10/10 — COMPLETED: Automated Engine Unit Tests, Real-Browser Visual Audit, Greek i18n Fix & Mobile Drawer Perfection
- **Deterministic `node:test` Suite (`tests/unicornEngines.test.ts`)**: Verified all 6 pure core engines (`server/security.ts`, `server/creditLedger.ts`, `lib/comparativeRater.ts`, `lib/rule-engine.ts`, `lib/renewalEngine.ts`, `lib/commissionEngine.ts`, and `lib/avatars.ts`) with 100% passing assertions.
- **Headless Chromium E2E & Visual Critique (`playwright-cli`)**:
  - Audited Desktop (`1440x900`) and Mobile (`390x844`) viewports across Dashboard, Sales Pipeline, Multi-Carrier Rater & 1-Click Policy Bind, Customer 360° Dossier, Client Self-Service Wallet & AI FNOL, Public Lead Capture Calculator, Executive Commission Bordereaux, Server-Metered Billing, and `Cmd+K` Omnibar.
  - **Visual & Runtime Fixes Verified**:
    1. *Zero Console Errors*: Moved Tailwind script load order before `tailwind.config` in `index.html`, eliminating startup `ReferenceError` and achieving `0` console errors across every route.
    2. *Greek Localization Hierarchy Fix (`data/locales/el.json`)*: Fixed a malformed brace nesting in `el.json` where `executive`, `automationRules`, and `leadCapture` were trapped inside `support`, restoring full Greek translations across Executive Dashboard KPIs, Automation Studio, and Public Lead Funnels.
    3. *Responsive Mobile Slide-Over Drawer (`Layout.tsx`, `Sidebar.tsx`)*: Auto-collapsed sidebar below `1024px` (`lg`) and converted mobile navigation into a clean slide-over drawer with backdrop overlay.
    4. *Public Lead Capture & XML-Safe SVG Banners (`hooks/useCampaigns.ts`, `pages/LeadCapturePage.tsx`, `lib/avatars.ts`)*: Enabled unauthenticated public lookup on `/campaign/lead/:campaignId`, synced Home rebuild capital slider defaults (`€150,000`), and XML-escaped `&` entities in generated SVG campaign banners so zero broken images occur across the entire platform.

