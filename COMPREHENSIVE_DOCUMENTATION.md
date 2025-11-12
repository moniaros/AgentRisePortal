

# AgentRise: Comprehensive Application Documentation

This document provides a detailed technical reference for all key features of the AgentRise web application.

## Table of Contents
1. [Core Architecture](#core-architecture)
2. [Localization (i18n)](#localization-i18n)
3. [Authentication](#authentication)
4. [Offline Capabilities & Data Sync](#offline-capabilities--data-sync)
5. [Settings Page & Integrations](#settings-page--integrations)
6. [Dashboard Page](#dashboard-page)
7. [AI Policy Scanner & Gap Analysis](#ai-policy-scanner--gap-analysis)
8. [AI Findings Verification Workflow](#ai-findings-verification-workflow)
9. [ACORD Data Mapping & Storage](#acord-data-mapping--storage)
10. [Policy Data Synchronization](#policy-data-synchronization)
11. [Detailed Policy View UI](#detailed-policy-view-ui)
12. [Sales Pipeline](#sales-pipeline)
13. [Analytics & GTM](#analytics--gtm)
14. [Component Library](#component-library)

---

## 1. Core Architecture

- **Framework**: React 18 with TypeScript.
- **Routing**: `react-router-dom` using `HashRouter` for compatibility with static hosting environments.
- **State Management**: React Context API is used for global state concerns like Authentication, Language, and Notifications. For specific feature data (e.g., CRM, campaigns), custom hooks (`useCrmData`, `useCampaigns`) manage data fetching, offline caching, and state updates.
- **Styling**: Tailwind CSS for utility-first styling, with dark mode support.
- **Build Tool**: Vite (inferred from `index.html` setup).
- **Error Handling**: A top-level `ErrorBoundary` component catches rendering errors to prevent a full application crash.

## 2. Localization (i18n)

- **Implementation**: A `LanguageContext` provides the current language (`en` or `el`) and a `t` function for translations.
- **Translation Files**: JSON files are located in `/data/locales/`. The application fetches these on startup.
- **`useLocalization` Hook**: This custom hook provides easy access to the context, abstracting away the `useContext` call. The `t` function can handle nested keys (e.g., `t('nav.dashboard')`) and placeholder replacements (e.g., `t('validation.required', {fieldName: 'Email'})`).
- **Persistence**: The user's language preference is stored in `localStorage` under the key `language`.

## 3. Authentication

- **Implementation**: `AuthContext` manages the `currentUser` state.
- **Mock Authentication**: The `login` function simulates an API call with a `setTimeout`, checking against a hardcoded list of users (`MOCK_USERS`) and a simple password (`password123`).
- **Persistence**: The logged-in `currentUser` object is stored in `sessionStorage`. This means the user remains logged in for the browser session but will need to log in again if they close the tab/window.
- **Protected Routes**: The `<Layout />` component acts as a route guard. If `currentUser` is null, it redirects to the `/login` page.

## 4. Offline Capabilities & Data Sync

- **`useOnlineStatus` Hook**: This simple hook listens to the browser's `online` and `offline` events to provide a reactive `isOnline` boolean.
- **`useOfflineSync` Hook**: This is a generic, reusable hook for managing data that needs to be available offline.
    - **Initialization**: On first load, it tries to populate its state from `localStorage`. If the cache is empty or corrupted, it proceeds to fetch.
    - **Online Behavior**: When the browser is online, it calls the provided `fetcher` function to get fresh data, updates its internal state, and writes the fresh data to `localStorage`.
    - **Offline Behavior**: When offline, it relies exclusively on the data cached in `localStorage`. If no cached data is available, it returns an error.
    - **Data-specific Hooks**: Hooks like `useCrmData`, `useCampaigns`, etc., are implementations of `useOfflineSync` tailored to specific data types.

## 5. Settings Page & Integrations

(Refer to `README.md` for a detailed user-flow description of the OAuth process.)

- **Technical Implementation**:
    - The page uses `useState` to manage form inputs for API keys. These are persisted to `localStorage` on save.
    - The Google Business Profile (GBP) connection relies on the Google API JavaScript Client (`gapi`). The process is initiated by `gapi.load('client:auth2', ...)`.
    - Once the user authenticates, the application uses `gapi.client.mybusinessbusinessinformation` to make API calls to list accounts and locations.
    - **Security Note**: Storing API keys and client IDs in `localStorage` is acceptable for a demo application but is **not secure** for a production environment. In a real-world scenario, the backend would manage these keys, and the frontend would authenticate with the backend, which would then make secure API calls.

### 5.1 Notification Preferences

This feature allows users to opt-in to receiving real-time browser and sound notifications for critical CRM events.

- **Implementation**: The user's preference is managed by the `useNotificationPreferences` hook, which persists the boolean state to `localStorage` under the key `notification_preferences_enabled`.

- **Permissions**:
    - The feature utilizes the standard browser [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/notification).
    - When a user enables the toggle for the first time, the application calls `Notification.requestPermission()`. The preference is only saved if the user grants permission.
    - If permission is denied, a warning notification is displayed, and the toggle remains off. The user must manually change the permission in their browser's site settings to re-enable it.

- **Sound Alerts**:
    - A simple, non-intrusive sound alert is played alongside the browser notification.
    - The sound is an embedded Base64 WAV data URI located in `constants/sounds.ts` to avoid external file dependencies. It is played using the `Audio` constructor.

- **Demo Functionality**:
    - To provide immediate feedback, a demo notification (both visual and audible) is triggered immediately after the user grants permission.
    - A "Preview Demo Notification" link is also available, allowing users to test the notification's appearance and sound at any time. The content of this demo notification is fully localized.

## 6. Dashboard Page

- **Data Fetching**: The dashboard relies on a successful GBP connection. It retrieves the stored `gbp_location_name` from `localStorage` to make its API calls.
- **AI Reply Generation**:
    - **API**: Uses the `@google/genai` SDK.
    - **Model**: `gemini-pro`.
    - **Prompt Engineering**: The prompt sent to Gemini is dynamically constructed based on the review's star rating (`>=4` is positive, `<4` is negative/neutral). It provides the AI with a persona ("friendly manager"), a clear goal, and specific instructions for handling positive vs. negative feedback. This is a key example of providing strong "guardrails" for the AI to ensure appropriate responses.
- **State Management**: The `reviews` state is managed locally within the `Dashboard.tsx` component. When a reply is successfully posted, the `onReplyPosted` callback updates the local state of the specific review, which causes the UI to re-render and hide the replied-to card (if the filter is active).

## 7. AI Policy Scanner & Gap Analysis

- **File Uploader Component**:
    - **Drag and Drop**: Implemented using `onDragEnter`, `onDragOver`, `onDragLeave`, and `onDrop` event handlers. A `dragActive` state is used to provide visual feedback to the user.
    - **File Input**: A hidden `<input type="file">` is used for the traditional file browser, triggered by a `<label>`.
- **Gemini API for Data Extraction**:
    - The core of this feature is sending the policy document's text to Gemini with a `responseSchema`.
    - The prompt instructs the AI to act as an "expert insurance policy parser".
    - The `responseSchema` forces the AI to return a JSON object that matches the `DetailedPolicy` type structure. This is crucial for getting reliable, structured data back from the model.
    - **Model**: `gemini-pro-vision` would be used for image-based PDFs, while `gemini-pro` is used for text. This implementation simulates the text extraction and uses `gemini-pro`.
- **Gemini API for Gap Analysis**:
    - After extracting the data, a second API call is made for the analysis itself.
    - The prompt includes both the `parsedPolicy` JSON and the `userNeeds` text provided by the user. This provides the AI with the necessary context to make relevant recommendations.
    - A `responseSchema` matching the `GapAnalysisResult` type is used to structure the output into gaps, upsell, and cross-sell opportunities.

## 8. AI Findings Verification Workflow

This feature introduces a "human-in-the-loop" step, ensuring AI-generated suggestions are vetted by an agent before becoming actionable items in the CRM.

-   **Data Model**:
    -   `StoredFinding`: The core data type for this feature. It includes properties like `customerId`, `type` ('gap', 'upsell', 'cross-sell'), and `status` ('pending_review', 'verified', 'dismissed').
-   **Storage Layer**:
    -   `services/findingsStorage.ts`: A dedicated service manages all `localStorage` operations for findings under the key `agentos_findings_[agencyId]`.
    -   It provides functions to save new pending findings, update the status of existing findings, and retrieve all findings for a customer or all verified opportunities across the agency.
-   **Workflow**:
    1.  **Generation**: After a successful AI policy analysis in `GapAnalysis.tsx` or `EmbeddedGapAnalysis.tsx`, the results are transformed into `StoredFinding` objects with a `pending_review` status and saved via `findingsStorage.savePendingFindings`.
    2.  **Review**: On the `CustomerProfile.tsx` page, the `useFindingsData` hook fetches these findings.
        -   The `AgentReviewPanel.tsx` component is rendered if there are any pending findings.
        -   Inside, `SuggestionCard.tsx` components display each finding with "Confirm," "Edit," and "Dismiss" actions. These actions call functions from the `useFindingsData` hook to update the finding's status in `localStorage`.
    3.  **Action**: Once a finding's status is updated to `verified`:
        -   If it's an 'upsell' or 'cross-sell' opportunity, it is displayed in the `ActionableOpportunities.tsx` component on the customer profile.
        -   `ActionableOpportunityCard.tsx` provides CTAs like "Call Now" (`tel:`) and "Send Email" (`mailto:`).
    4.  **Dashboard Aggregation**:
        -   The main `Dashboard.tsx` uses the `useAllVerifiedOpportunities` hook to get a count of all `verified` upsell and cross-sell opportunities.
        -   These counts are displayed in new KPI cards that link to the `OpportunitiesHub.tsx` page.
    5.  **Hub**: The `OpportunitiesHub.tsx` page provides a centralized list of all customers who have open, verified opportunities, allowing agents to easily track and prioritize their sales activities.

## 9. ACORD Data Mapping & Storage

This feature provides a layer of standardization and persistence for parsed policy data.

- **`acordMapper.ts`**: This service contains the logic to transform the application's internal `DetailedPolicy` format (which is what Gemini extracts) into a more standardized `PolicyACORD` format. This mapping ensures that the data saved to storage is consistent and predictable.
- **`policyStorage.ts`**: This service exclusively handles all interactions with `localStorage` for policy data.
    - **Single Key**: All policies are stored under one key (`agentos_acord_policies`) to simplify management.
    - **Structure**: The data is a nested object, keyed by `customerId`. This allows for efficient retrieval of all policies for a given customer.
    - **Versioning**: Both the top-level storage object and individual policy records include versioning and `lastUpdated` timestamps. This is a forward-thinking approach that would allow for data migrations if the schema changes in the future.
    - **Error Handling**: The service includes `try...catch` blocks around `JSON.parse` and `JSON.stringify` to prevent the application from crashing if the data in `localStorage` becomes corrupted.

## 10. Policy Data Synchronization

This mechanism connects the offline/parsed data in `localStorage` with the main, in-memory CRM state.

- **Trigger**: The process is initiated manually via the "Sync Policies from Storage" button on the Micro-CRM page.
- **`usePolicySync` Hook**: This custom hook orchestrates the entire process.
- **Workflow**:
    1.  **Read**: It calls `policyStorage.getStoredData()` to retrieve all customer and policy data from `localStorage`.
    2.  **Iterate & Match**: It loops through each customer found in storage. It uses the policyholder's name to find a corresponding customer in the live CRM data (from `useCrmData`).
    3.  **Update vs. Create**:
        -   **If a CRM customer is found**: It merges the policies. It updates existing policies (matched by `policyNumber`) and adds any new ones from storage to the customer's record. It then calls `updateCustomer` from `useCrmData`.
        -   **If no CRM customer is found**: It creates a new customer object, using the policyholder's details and mapping all the stored ACORD policies to the CRM's internal `Policy` format. It then calls `addCustomer` from `useCrmData`.
    4.  **Data Flow**: `localStorage (PolicyACORD)` -> `mapAcordToCrmPolicy()` -> `CRM State (Policy)`
- **Purpose**: This creates a robust bridge, allowing data captured and processed offline (or through the AI scanner) to be formally integrated into the agent's primary dataset.

## 11. Detailed Policy View UI

On the customer profile page (`CustomerMicrosite.tsx`), each policy is displayed using a detailed, responsive component that presents the full ACORD-structured data in a user-friendly manner. This replaces the previous, simpler `PolicyCard` component.

-   **Data Presentation**: The `DetailedPolicyView` component organizes information into logical, collapsible sections using the `<details>` and `<summary>` HTML elements for native accessibility and functionality. The primary sections are:
    -   Policy Details (number, insurer, dates, premium)
    -   Vehicle Details (if applicable)
    -   Coverages
    -   Beneficiaries
-   **Inline Editing**: To streamline data correction and updates, key fields are editable inline without a modal.
    -   **Mechanism**: A reusable `EditableField` component (`components/ui/EditableField.tsx`) manages the state for switching between a text `<span>` and an `<input>`.
    -   **Editable Fields**: Coverage limits, beneficiary names, and beneficiary addresses can be edited directly in the UI.
    -   **Saving**: Changes are committed on blur (when the user clicks away) or when the "Enter" key is pressed. The `onUpdatePolicy` callback is triggered, which then bubbles up to `useCrmData` to update the central state.
-   **Component Structure**:
    -   `DetailedPolicyView.tsx`: The main container component that structures the layout, manages the collapsible sections, and handles the state for editing complex lists like coverages and beneficiaries.
    -   `EditableField.tsx`: A generic, reusable component for any simple text field that needs to be editable in place.
-   **Mobile Usability**: The layout is fully responsive. Tables within the component are designed to be horizontally scrollable on small screens to prevent breaking the page layout, ensuring all data is accessible on any device.

## 12. Sales Pipeline

This feature provides a complete workflow for managing sales prospects from initial inquiry to a final outcome (`won` or `lost`). It is composed of three main pages and several specialized components.

-   **Data Models**:
    -   `TransactionInquiry`: Represents a new lead, typically from a web form. Contains contact info, consent, and attribution data.
    -   `Opportunity__EXT`: The central entity representing a sales deal. It is linked to an inquiry and a prospect and tracks value, stage, and follow-up dates.
    -   `Interaction`: A log of any communication (email, call, etc.) related to an opportunity.
    -   `Prospect`: A simple record of a potential customer's contact details.
-   **`usePipelineData` Hook**: This dedicated hook is the single source of truth for all pipeline-related data. It fetches mock data from new JSON files (`transaction_inquiries.json`, `opportunities_ext.json`, etc.), provides functions to mutate state (e.g., `createOpportunity`, `updateOpportunityStage`), and handles filtering by the current agent/agency.

-   **Key Components & Pages**:
    -   **Leads Inbox (`/pipeline/inbox`)**: Displays a list of `TransactionInquiry` records that have not yet been converted into an opportunity. This is the first step in the sales process. Agents can review incoming leads and click "Create Opportunity" to formally add them to the pipeline.
    -   **Opportunity Pipeline (`/pipeline/board`)**: A Kanban-style board visualizing all opportunities, organized into columns by their `stage` ('new', 'contacted', 'proposal', 'won', 'lost').
        -   **Drag & Drop**: Built using `react-dnd`, it allows agents to intuitively move opportunities between the 'new', 'contacted', and 'proposal' stages. Dragging to 'won' or 'lost' moves them to a terminal state.
        -   **Opportunity Card**: Each card displays the opportunity title, value, prospect name, and next follow-up date. Overdue tasks are visually highlighted in red.
    -   **My Day Dashboard (`/pipeline/my-day`)**: An agent-specific view designed for daily planning. It automatically organizes an agent's assigned opportunities into three lists: "Overdue," "Due Today," and "No Follow-up Date," enabling them to prioritize their work effectively.
    -   **KPI Bar**: A summary component displayed on the pipeline pages, showing key metrics like new leads, conversion rate, and total premium value won.

-   **Workflow & Analytics**:
    1.  A new lead appears in the **Leads Inbox**.
    2.  An agent converts the lead into an opportunity, which appears in the "New" column of the **Kanban board**.
    3.  The agent works the opportunity, moving it through the "Contacted" and "Proposal" stages, logging all communications as `Interaction` records.
    4.  When an opportunity is dragged to the "Won" column, the `usePipelineData` hook automatically generates a `Conversion` event with `kind: 'won'`, the opportunity's value, and the original attribution ID from the inquiry.
    5.  The KPIs update in real-time to reflect these changes.

## 13. Analytics & GTM

- **Implementation**: A simple analytics service (`services/analytics.ts`) provides functions to push events to the `window.dataLayer`.
- **`GTMProvider`**: This component is responsible for injecting the Google Tag Manager script into the `<head>` of the document if a `gtmContainerId` is found in `localStorage`.
- **`RouteAnalyticsTracker`**: This component listens for changes in `react-router-dom`'s `location`. On every route change, it fires a `trackPageView` event.
- **Session Management**: A simple `initSession` function creates a unique session ID and stores it in `sessionStorage` to track user sessions.
- **Event Structure**: All tracked events include common metadata like the current `language`, a hardcoded `user_role`, and the `session_id` for better context in analytics platforms.

## 14. Component Library

- **UI Primitives**: Reusable, low-level components like `SkeletonLoader`, `ErrorMessage`, `ConfirmationModal`, and `ToggleSwitch` are located in `components/ui/`.
- **Feature-Specific Components**: Components are organized into directories based on the feature they belong to (e.g., `components/dashboard/`, `components/crm/`, `components/campaigns/`).
- **Data Display**: Components like `UsersTable` and `RulesTable` are responsible for rendering data and emitting events (e.g., `onDelete`, `onEdit`), but they do not contain business logic themselves. The logic is handled by the parent page component that uses them.
- **Forms & Modals**: Complex interactions like creating a customer or building an automation rule are handled within modal components (`CustomerFormModal`, `RuleBuilder`) that encapsulate their own form state, often using `react-hook-form`.