# AgentOS: A Bilingual Micro-CRM & Lead Generation Platform

This is a comprehensive lead generation and client management platform designed for insurance professionals. It features a bilingual interface (Greek/English), offline capabilities, and a suite of AI-powered tools to enhance agent productivity.

## Key Features

-   **Bilingual Interface (i18n)**: Fully localized in English and Greek using `react-i18next`.
-   **Offline First**: Utilizes `localStorage` and custom hooks (`useOfflineSync`) to ensure core functionalities are available even without an internet connection.
-   **Micro-CRM**: A lightweight Customer Relationship Management system to manage customers and leads.
-   **AI Policy Scanner**: Upload insurance documents (PDFs) and use Google Gemini to automatically extract key information, perform a gap analysis, and identify upsell/cross-sell opportunities.
-   **ACORD Data Structure**: Maps and stores parsed policy data in a standardized, ACORD-compliant JSON format.
-   **Data Synchronization**: Logic to sync locally stored, parsed policy data with the main CRM data model.
-   **Detailed Policy View**: A responsive UI on the customer profile page to display comprehensive policy details with inline editing capabilities.
-   **Google Business Profile Integration**: Fetches and displays customer reviews directly on the dashboard.
-   **AI-Powered Review Replies**: Uses Google Gemini to generate professional, context-aware replies to customer reviews.
-   **AI Social Composer**: Generate and schedule social media content with the help of AI.
-   **Analytics & GTM Integration**: Tracks user interactions and page views, pushing events to Google Tag Manager.

---

## Technical Documentation

### AI Policy Scanner: Validation and Error Recovery

To ensure data integrity, the AI Policy Scanner includes a robust validation and error recovery workflow.

-   **Validation**: After the Gemini API returns the extracted data, a `policyValidator` service checks for the presence of mandatory fields (e.g., `policyNumber`, `policyholder.name`).
-   **Error Handling**:
    -   If the API returns malformed JSON or if mandatory fields are missing, the user is presented with a **Data Correction Form**.
    -   This form clearly lists the validation errors and allows the user to manually input or correct the missing information.
    -   The form is pre-filled with any data that was successfully extracted to minimize user effort.
-   **User Actions**: From the correction screen, the user has two options:
    1.  **Save and Continue**: Submits the corrected data to proceed with the gap analysis.
    2.  **Re-upload Document**: Resets the entire process, allowing the user to upload a different or clearer file.
-   **Audit Logging**: All validation failures and manual correction events are logged to `localStorage` under the `audit_log` key, creating a traceable history of data quality interventions.

### Main Menu & Submenu Structure History

This application follows a strict version control practice for its main navigation menu to maintain a clear audit trail for product management and development.

-   **Version 1.0 (2023-10-27):** Initial documentation of the menu structure to establish a baseline for all future changes. The current, detailed structure can be found in `MainMenu.md`.

### ACORD Policy Local Storage Strategy

Parsed policy data is persisted in `localStorage` to ensure offline access and data retention between sessions.

-   **Storage Key**: `agentos_acord_policies`
-   **Data Structure**: A single JSON object where each key is a `customerId`. The value is an object containing the customer's policies and metadata.
    ```json
    {
      "cust_1": {
        "version": 1,
        "lastUpdated": "2023-10-27T10:00:00.000Z",
        "policies": [
          { /* PolicyACORD object */ },
          { /* PolicyACORD object */ }
        ]
      }
    }
    ```
-   **Versioning**: Both the root object and individual policy records contain a `version` and `lastUpdated` timestamp. This allows for future data migrations if the storage schema evolves.
-   **Service Module**: All read/write operations are handled by the `services/policyStorage.ts` module, which includes error handling for safe JSON parsing.

### Policy Data Synchronization Mechanism

The application provides a mechanism to sync the locally stored ACORD policy data with the main CRM data model.

-   **Trigger**: The sync process is initiated manually by the user from the Micro-CRM page.
-   **Workflow**:
    1.  The `usePolicySync` hook reads all data from `localStorage`.
    2.  It iterates through each customer's stored policies.
    3.  For each policy, it attempts to find an existing customer in the CRM based on the policyholder's name.
    4.  **If a customer exists**, it updates their record by adding the new policy or updating an existing one (matched by policy number).
    5.  **If no customer exists**, it creates a new customer record using the data from the policyholder.
    6.  The `acordMapper.ts` service is used to convert the stored `PolicyACORD` format back into the CRM's internal `Policy` format.
-   **Outcome**: This ensures that data captured via the AI scanner can be seamlessly integrated as a permanent record in the CRM.

### Detailed Policy View UI

On the customer profile page, policies are displayed using a detailed, responsive component that presents the full ACORD-structured data.

-   **Organization**: Information is organized into logical, collapsible sections (Policy Details, Vehicle, Coverages, Beneficiaries) using the `<details>` element for accessibility.
-   **Inline Editing**: Key data points such as coverage limits and beneficiary details can be edited directly in the UI without opening a modal. A reusable `EditableField` component handles the switch between display text and an input field.
-   **Responsiveness**: The UI is mobile-friendly. Tables within the view are horizontally scrollable on small screens to ensure all data is accessible without breaking the layout.

### Dashboard KPI Cards

The agent dashboard features several Key Performance Indicator (KPI) cards for at-a-glance insights.

-   **New Inquiries Today**:
    -   **Purpose**: To provide immediate visibility into new customer transactions that require follow-up.
    -   **Data Source**: Counts records from `Transaction.Inquiry` where the `createdAt` timestamp is within the current day.
-   **Overdue Follow-ups**:
    -   **Purpose**: To highlight urgent, open opportunities that have passed their scheduled follow-up date.
    -   **Data Source**: Counts records from `Opportunity__EXT` where the `nextFollowUpDate` is in the past and the opportunity `stage` is not 'won' or 'lost'.
    -   **Visuals**: This card uses a "danger" theme (red coloring) to visually emphasize its urgency.
-   **Unread Messages**:
    -   **Purpose**: To highlight active, inbound customer communications that require an agent's attention.
    -   **Data Source**: Counts `Interaction` records where `direction` is 'inbound' and `read` is `false`.
    -   **Visuals**: This card uses an "info" theme (blue coloring) to signal an active engagement opportunity.
-   **New Portal Submissions**:
    -   **Purpose**: To track new claims (First Notice of Loss) and service requests submitted through the customer portal, highlighting urgent needs that are key to client retention.
    -   **Data Source**: A combined count of `Transaction.FirstNoticeOfLoss` and `ServiceRequest` records where the `createdAt` timestamp is within the current day.
    -   **Visuals**: This card uses a "success" theme (green coloring) to signal important client activity.
-   **Today's Ad Performance**:
    -   **Purpose**: To provide a real-time view of daily ad effectiveness by calculating the Cost Per Lead (CPL).
    -   **Data Source**: Aggregates `PerfSample.spend` and `PerfSample.conversions.lead` records where the `date` is the current day.
    -   **Visuals**: This card uses a "danger" theme (red coloring) if the CPL exceeds a predefined threshold (e.g., €50), providing an immediate visual cue for poor performance.
-   **Active Portal Users Today**:
    -   **Purpose**: To provide context for agent outreach by showing which customers have recently logged in to the customer portal.
    -   **Data Source**: Counts unique `PortalAccount__EXT` records where the `lastLoginAt` timestamp is within the current day.
-   **Google Business Profile Rating**: Displays the average star rating and total review count from the integrated Google Business Profile account.
-   **Total GWP Won**:
    -   **Purpose**: (Executive Dashboard) To show the total Gross Written Premium from deals won that originated from platform marketing leads.
    -   **Data Source**: Sums the `won.gwp` property from `KPISnapshot` records where the `source` is 'Platform Marketing Leads' and the `date` is within the selected period (e.g., Last 30 Days).
-   **Lead-to-Won Conversion Rate**:
    -   **Purpose**: (Executive Dashboard) To measure the effectiveness of the sales funnel from initial lead to a closed-won deal.
    -   **Data Source**: Calculates `(Total KPISnapshot.won.count) / (Total Leads created)` for the selected time period.
-   **Average Cost Per Acquisition (CPA)**:
    -   **Purpose**: (Executive Dashboard) To measure the average cost to acquire a new paying customer through advertising efforts.
    -   **Data Source**: Calculates `(Total PerfSample.spend) / (Total KPISnapshot.won.count)` for the selected time period.
-   **Microsite Funnel Conversion Rate**:
    -   **Purpose**: (Executive Dashboard) To measure the effectiveness of the public-facing microsite in converting visitors into leads.
    -   **Data Source**: Calculates `(Total FunnelRun.leads / Total FunnelRun.pageviews) * 100` for the selected time period.
-   **Average Time to First Reply**:
    -   **Purpose**: (Executive Dashboard) To measure the team's responsiveness to new inquiries.
    -   **Data Source**: Averages the `avgTimeToFirstReplyH` property from `KPISnapshot` records over the selected period.

### Onboarding Checklist

A simple onboarding checklist is presented to new users to guide them through key initial actions.

-   **Mechanism**: The `useOnboardingStatus` hook manages the state of the checklist.
-   **Persistence**: Progress is stored in `localStorage` under the key `onboarding_progress`.
-   **Completion**: Users can permanently dismiss the onboarding flow by clicking the final "Proceed to Dashboard" button, which sets an `onboarding_skipped` flag in `localStorage`.