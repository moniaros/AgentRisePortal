# AgentRise: Insurance Lead & Policy Management Platform

## Project Description

AgentRise is a modern, comprehensive, and bilingual (Greek/English) front-end platform designed for insurance professionals. It serves as an MVP to showcase a powerful suite of tools for lead generation, customer relationship management (CRM), and policy administration. Key features include an AI-powered gap analysis tool using Google Gemini, multi-tenant architecture with role-based access control, and full offline capabilities, making it a versatile solution for the modern insurance agent.

---

## Technologies Used

This project is built with a focus on stability and modern development practices, using a browser-native ES module setup without a build step.

-   **Front-End:** [React](https://react.dev/) (v19, Stable), [TypeScript](https://www.typescriptlang.org/)
-   **Routing:** [React Router DOM](https://reactrouter.com/) (v7)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v3, via CDN)
-   **Data Visualization:** [Recharts](https://recharts.org/)
-   **AI Integration:** [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
-   **Data Source:** Static JSON files and in-memory services simulating a REST API.

---

## Installation Instructions

This project is designed to run directly in the browser without a complex build setup.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/agentrise-platform.git
    cd agentrise-platform
    ```

2.  **Set up the Google Gemini API Key:**
    This project requires a Google Gemini API key for its AI-powered features. The application expects this key to be available as an environment variable (`API_KEY`). The development environment will prompt you to provide one if it's not detected.

3.  **Serve the project locally:**
    You can use any simple local web server. Here are two common options:

    *   **Using Python:**
        ```bash
        python -m http.server
        ```
    *   **Using Node.js (with `serve`):**
        ```bash
        npx serve
        ```

4.  **Access the application:**
    Open your browser and navigate to the local address provided by your server (e.g., `http://localhost:8000`).

---

## Platform Status & Feature Breakdown

This section provides a clear overview of the project's current status for product managers and stakeholders.

### Implemented Features (Current MVP)

The platform is currently a high-fidelity MVP with a simulated backend. The following features are implemented and functional from a UI and front-end logic perspective.

#### Navigation & CRM Improvements
-   **Description:** The main navigation and CRM functionalities have been restructured to create a more intuitive and efficient workflow for agents.
-   **Centralized CRM Menu:** A new collapsible "CRM" parent menu has been added to the main sidebar, grouping all related features.
-   **Unified "Customers & Leads" Page:** The previous standalone "Leads List" and "Micro-CRM" pages have been merged into a single, powerful `Customers & Leads` page (`/micro-crm`). This view "pins" recent, un-converted leads at the top for quick action and displays the full customer list below, all managed through a shared search filter.
-   **Renamed AI Tool:** The "Gap Analysis" page has been renamed to `Import Policy (AI)` (`/gap-analysis`) and is now logically located within the CRM menu, clarifying its purpose as a tool for populating the CRM with policy data.
-   **Embedded AI Analysis:** The customer detail page (`/customer/:id`) now features an "AI Policy Analysis" panel. This allows agents to upload a policy document directly for a specific customer, analyze it for cross-sell and upsell opportunities using Gemini, and automatically log the analysis results to the customer's timeline, creating a seamless workflow and a complete audit trail.

#### 1. Modern Dashboard & UI
-   **Description:** A clean, responsive user dashboard serves as the landing page post-login. It features a dynamic, time-aware greeting, the current date, and the user's agency affiliation. It also includes several key performance indicator (KPI) cards, including 'New Leads', 'Est. Monthly Revenue', and 'Total Policies in Force', which shows the current policy count with a month-over-month comparison. The entire UI is built with Tailwind CSS, supports bilingual (Greek/English) toggling, and is designed for a seamless experience on all devices.
-   **Components:** `Dashboard.tsx`, `Layout.tsx`, `Header.tsx`, `Sidebar.tsx`.

#### 2. Multi-Tenant Architecture & RBAC
-   **Description:** The application is structured to support multiple insurance agencies on a single instance. Data is segregated based on the logged-in user's agency. Role-Based Access Control (RBAC) is implemented, with a UI for administrators to manage users. The user profile includes a read-only audit trail showing recent logins, key actions, and system notifications. The data model for users has been refactored to align with the ACORD industry standard, separating personal identity (`Party`) from contextual role (`PartyRole`) for easier future API integration.
-   **Components:** `UserManagement.tsx`, `UsersTable.tsx`, `InviteUserModal.tsx`, `AuditLogsTable.tsx`, `Profile.tsx`.
-   **Data Structures (ACORD-Aligned):**
    ```typescript
    // Represents the individual's identity details
    interface AcordParty {
        partyName: { firstName: string; lastName: string; };
        contactInfo: { email: string; workPhone?: string; mobilePhone?: string; };
        addressInfo?: { fullAddress?: string; };
        profilePhotoUrl?: string; // Base64 data URL for PartyPhoto
        signature?: string;       // Base64 data URL for PartySignature
    }

    // Represents the user's role and permissions within the system
    interface AcordPartyRole {
        roleType: 'agent' | 'admin';
        roleTitle: string; // e.g., 'Senior Insurance Agent'
        permissionsScope: 'agency' | 'global' | 'team';
        jobTitle?: string;
        department?: string;
        licenses?: {
            type: string;
            licenseNumber: string;
            expirationDate: string;
            status: 'valid' | 'expired' | 'pending_review';
        }[];
    }

    // The final User object composes Party and PartyRole
    interface User {
        id: string;
        agencyId: string;
        party: AcordParty;
        partyRole: AcordPartyRole;
    }
    
    interface UserActivityEvent {
        id: string;
        userId: string;
        timestamp: string;
        type: 'login' | 'action' | 'notification';
        description: string;
        agencyId: string;
    }
    interface AuditLog {
        id: string;
        timestamp: string;
        actorName: string;
        action: 'user_invited' | 'user_removed' | 'role_changed';
        targetName: string;
        details: string;
        agencyId: string;
    }
    ```

#### 3. Automation Rules Management
-   **Description:** A dedicated interface at `/settings/automation-rules` allows administrators to view and manage workflow automation rules. It features a filterable, bilingual table displaying rules grouped by categories like 'Renewal', 'Payment', and 'Lead Assignment'. Admins can toggle rules on or off, edit, duplicate, and delete them with a confirmation step. The UI is designed to provide a clear overview of all automated processes, including their status, last execution time, and success rate.
-   **Components:** `AutomationRules.tsx`, `RulesTable.tsx`, `RulesFilters.tsx`.
-   **Data Structures:**
    ```typescript
    interface AutomationRule {
        id: string;
        nameKey: string; // localization key
        category: 'renewal' | 'payment' | 'lead_assignment' | 'task_creation';
        triggerKey: string; // localization key
        isEnabled: boolean;
        lastExecuted: string | null;
        successRate: number; // 0 to 1
        agencyId: string;
    }
    ```

#### SEO & Analytics Integration
-   **Description:** The platform incorporates SEO best practices and comprehensive analytics tracking to monitor traffic and user engagement.
-   **SEO Features:**
    -   **Dynamic Meta Tags:** Pages like News Articles dynamically update `document.title` and `meta description` tags for better search engine results.
    -   **Canonical URLs:** Individual article pages include a `rel="canonical"` link tag to prevent duplicate content issues.
    -   **Sitemap Generation Concept:** A dedicated `/sitemap` page programmatically lists all public routes, demonstrating the logic required for a server-side process to generate a `sitemap.xml` file for search engine crawlers.
-   **Analytics (via Google Tag Manager):**
    -   **GTM Integration:** A `GTMProvider` dynamically injects the Google Tag Manager script based on a configurable container ID.
    -   **Automated Page View Tracking:** A `RouteAnalyticsTracker` component automatically sends `page_view` events to the `dataLayer` on every route change.
    -   **Custom Event Tracking:** Key user interactions, such as submitting a testimonial or completing an AI gap analysis, are tracked with custom events pushed to the `dataLayer`, allowing for detailed conversion monitoring in Google Analytics.
-   **Components:** `GTMProvider.tsx`, `RouteAnalyticsTracker.tsx`, `Sitemap.tsx`.
-   **Services:** `services/analytics.ts`.

### Comprehensive Pages and Routing Documentation

For a complete and detailed audit of every page, component, route, and data source within the application, please refer to the comprehensive documentation document. This guide is intended for developers and stakeholders to understand the full scope and architecture of the front-end.

[**View Comprehensive Documentation**](./COMPREHENSIVE_DOCUMENTATION.md)

---

## Product Roadmap: Path to an Enterprise-Level Platform

The current MVP provides a strong foundation. To evolve AgentRise into a market-ready, enterprise-level SaaS platform, development should focus on the following key areas.

### Tier 1: Core Backend & Security (Critical Path)

These items are necessary to move beyond the mocked front-end and create a real, secure product.

1.  **Develop a Production-Ready Backend API:**
    -   **Action:** Replace the mock `api.ts` service with a robust backend (e.g., Node.js/Express, Python/Django, or Go).
    -   **Requirements:**
        -   Implement a scalable REST or GraphQL API.
        -   Connect to a production-grade database (e.g., PostgreSQL) to manage all application data.
        -   Ensure all API endpoints enforce tenant isolation (i.e., an agent from Agency A cannot access data from Agency B).

2.  **Implement Real Authentication & Authorization:**
    -   **Action:** Replace the hardcoded `AuthContext` with a full-featured authentication system.
    -   **Requirements:**
        -   User registration, login (with password hashing), and session management (e.g., JWT).
        -   Implement social logins (Google, LinkedIn).
        -   Secure password reset functionality.
        -   Enforce RBAC on the server-side for all API endpoints.

3.  **Establish Cloud Infrastructure & CI/CD:**
    -   **Action:** Set up a scalable hosting environment and deployment pipeline.
    -   **Requirements:**
        -   Deploy the application to a cloud provider (AWS, Google Cloud, Azure).
        -   Implement CI/CD pipelines for automated testing and deployment.
        -   Set up database backups and disaster recovery plans.

### Tier 2: Feature Parity & Commercialization

These features are essential for a commercially viable product in the insurance industry.

1.  **Advanced Policy Management:**
    -   **Action:** Expand the `Policy` model and UI to handle the full lifecycle.
    -   **Requirements:**
        -   **Endorsements:** Ability to make and track changes to an active policy.
        -   **Claims:** A system for logging First Notice of Loss (FNOL) and tracking claim status.
        -   **Cancellations & Reinstatements:** Workflows for managing policy status changes.

2.  **Commission Management Module:**
    -   **Action:** Build a system to calculate, track, and report on agent commissions.
    -   **Requirements:**
        -   Configurable commission rates per policy type and insurer.
        -   Automated calculation upon policy binding or premium payment.
        -   Reporting for agents and administrators.

3.  **True Customer Portal (Policyholder Access):**
    -   **Action:** Create a separate, secure login for policyholders (`policyholder` role).
    -   **Requirements:**
        -   Allow customers to view their policies and documents.
        -   Enable online premium payments via Stripe integration.
        -   Provide a simple interface to initiate a claim or request a policy change.

4.  **Payment Gateway Integration:**
    -   **Action:** Integrate with Stripe or a similar payment processor to handle premium collections.
    -   **Requirements:**
        -   Securely process one-time and recurring payments.
        -   Update policy status automatically based on payment success.
        -   Store transaction history.

### Tier 3: Enterprise-Grade Enhancements & Integrations

These features will differentiate the platform and make it suitable for larger, more demanding agencies.

1.  **Third-Party Integrations:**
    -   **Action:** Connect AgentRise to the wider ecosystem of tools used by insurance professionals.
    -   **Requirements:**
        -   **Email & Calendar:** Sync with Google Workspace/Outlook 365 to log communications in the customer timeline and manage appointments.
        -   **E-Signature:** Integrate with DocuSign or similar for digital document signing.
        -   **Accounting Software:** Connect with QuickBooks or Xero for financial management.

2.  **Advanced Reporting & Business Intelligence:**
    -   **Action:** Move beyond the current analytics to provide deeper business insights.
    -   **Requirements:**
        -   Customizable report builder.
        -   Dashboards for agency performance, agent productivity, and sales funnels.
        -   Data export capabilities (CSV, PDF).

3.  **Workflow Automation:**
    -   **Action:** Build a rules engine to automate routine tasks.
    -   **Requirements:**
        -   Automated email/SMS reminders for renewals and payments.
        -   Task creation for agents based on triggers (e.g., new lead assigned).
        -   Automated lead assignment rules.

4.  **Compliance and Security Hardening:**
    -   **Action:** Ensure the platform meets industry-specific security and data privacy standards.
    -   **Requirements:**
        -   Achieve compliance with regulations like GDPR and CCPA.
        -   Implement two-factor authentication (2FA).
        -   Conduct regular security audits and penetration testing.

---

## Contribution Guidelines

We welcome contributions to enhance the AgentRise platform! To contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3.  Commit your changes with clear and descriptive messages.
4.  Ensure any new user-facing text is added to both localization files (`/data/locales/en.json` and `/data/locales/el.json`).
5.  Push your branch and submit a Pull Request.

---

## License

This project is licensed under the **MIT License**.