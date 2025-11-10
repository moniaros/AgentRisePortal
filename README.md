# AgentRise Insurance Portal (Aσφαλιστική Πύλη)

AgentRise is a comprehensive, bilingual (Greek/English) lead generation and management platform designed specifically for insurance professionals. It features a micro-CRM, AI-powered tools for gap analysis, social media content generation, and a flexible automation engine to streamline daily tasks.

## Implemented Features

### Core Platform
- **Bilingual Interface**: Seamlessly switch between Greek (ΕΛ) and English (EN).
- **Offline First**: Core data is cached in `localStorage` for offline access.
- **Role-Based Access Control (RBAC)**: Differentiates between 'Admin' and 'Agent' roles, restricting access to management sections.
- **Responsive Design**: UI adapts for desktop, tablet, and mobile devices.

### Agent Tools
- **Dashboard**: A central hub displaying key performance indicators (KPIs) like new leads, policies sold, and conversion rates. It also includes widgets for expiring policies and automated agent tasks.
- **Micro-CRM**: A lightweight Customer Relationship Management tool to manage customers and their associated policies and interaction timelines.
- **Lead Generation Dashboard**: An overview of lead-related KPIs, sources, and conversion funnels.
- **AI Gap Analysis**: Upload a client's existing policy document (PDF, PNG, JPG) and describe their needs. The system uses the Gemini API to analyze the document, identify coverage gaps, and suggest upsell/cross-sell opportunities.
- **AI Social Composer**: Generate social media posts using AI. Provides templates and a preview for composing posts for platforms like Facebook, LinkedIn, and X.

### Management Tools
- **User Management**: Admins can invite, remove, and change the roles of users within their agency. Includes an audit log to track these actions.
- **Executive Dashboard**: A high-level overview for administrators, showing agency growth, product mix, claims trends, and campaign ROI.
- **Automation Rules**: An overview page for managing the rules engine, displaying stats and recent rule executions. (Admin only)

### Content & Marketing
- **News & Updates**: A section for viewing global or agency-specific news articles.
- **Testimonials**: A system for clients to submit testimonials, which admins can then approve or reject for public display.
- **Microsite Builder**: A tool to create a simple, public-facing webpage for the agent or agency by adding and arranging content blocks.

### Localization
- **Bilingual Text**: All UI elements, including labels, buttons, and navigation, are translated using JSON files for Greek and English.
- **Dynamic Date/Time**: Dates and times are formatted according to the user's selected language (`el-GR` or `en-US`).
- **Locale-Aware Number & Currency Formatting**: All numeric and currency values are displayed using the correct separators and symbols for the selected locale.

### Automation Systems
- **Flexible Rules Engine Data Model**: The platform includes a comprehensive, JSON-based data model for creating flexible business rules. This model consists of `RuleDefinition`, `Trigger`, `Condition`, and `Action` components, allowing for the definition of complex automation logic in a structured and readable format.
- **Renewal Reminder Automation**: A rule-based system that simulates a daily check for policies nearing expiration. It triggers at configurable intervals (e.g., 90, 60, 30 days) and can execute multiple actions based on bilingual JSON templates, such as creating a task for an agent or sending mock email/SMS reminders to the customer. Duplicate reminders are prevented by maintaining a reminder log.
- **Payment Reminder Automation**: A rule-based system that simulates a daily check for policy payment due dates. It triggers on events like `PAYMENT_DUE_IN_30_DAYS` or `PAYMENT_OVERDUE_3_DAYS`. It uses bilingual JSON templates to execute multi-channel actions, including creating agent tasks and sending mock email and SMS notifications.

---

## Application Structure & Pages

### Main Navigation
- **Dashboard (`/`)**: The main landing page with KPIs and widgets.
- **Leads Dashboard (`/leads-dashboard`)**: Analytics focused on lead sources and status.
- **Lead Generation (`/lead-generation`)**: Table view for filtering and managing all leads.
- **Micro-CRM (`/micro-crm`)**: Manage customer profiles and recent leads.
- **Customer Profile (`/customer/:customerId`)**: Detailed view of a single customer, including their policies and timeline.
- **Gap Analysis (`/gap-analysis`)**: AI tool for analyzing policy documents.
- **Social Composer (`/social-composer`)**: Create and schedule social media posts.
- **Ad Campaigns (`/ad-campaigns`)**: (Placeholder) Manage digital ad campaigns.
- **Analytics (`/analytics`)**: View performance metrics for marketing campaigns.
- **Microsite Builder (`/microsite-builder`)**: Build and preview a personal agency website.
- **News (`/news`)**: A listing of all news articles.
- **News Article (`/news/:articleId`)**: Detailed view of a single news article.
- **Testimonials (`/testimonials`)**: View and manage client testimonials.

### Management Tools (Admin Only)
- **User Management (`/user-management`)**: Manage agency users and view audit logs.
- **Billing (`/billing`)**: (Placeholder) Manage agency billing and subscriptions.
- **Executive Dashboard (`/executive-dashboard`)**: High-level analytics for agency performance.
- **Automation Rules (`/settings/automation-rules`)**: An overview page to monitor the status and recent executions of all automation rules. (Admin only)

### Other Pages
- **Login (`/login`)**: Authentication page.
- **Profile (`/profile`)**: View and edit your user profile.
- **Settings (`/settings`)**: Manage social media connections and other app settings.
- **Onboarding (`/onboarding`)**: A welcome page for new users with a checklist of key tasks.
- **Lead Capture Page (`/capture/:campaignId`)**: A public-facing landing page for capturing leads from a specific campaign.

---

## Automation Gap Analysis

A detailed analysis of the platform's automation capabilities has been conducted. The report outlines what is currently working, what is partially implemented, and what is completely missing based on the desired feature set. It also provides recommended priorities for future development.

**[Read the full Automation Gap Analysis](./automation-gap-analysis.md)**

---

## Testing & Documentation

The project includes infrastructure and documentation to ensure the reliability and maintainability of its core systems, particularly the rules engine.

-   **Test Suite**: A placeholder test suite has been created to demonstrate unit and integration testing coverage for the automation services. It outlines tests for utility functions and end-to-end rule execution flows.
    -   [View Test File (`services/__tests__/automation.test.ts`)](./services/__tests__/automation.test.ts)
-   **Developer Guide**: This document provides a technical overview of the rules engine architecture and instructions on how to extend it with new triggers and actions.
    -   [Read the Developer Guide](./docs/rules-engine-developer-guide.md)
-   **User Guide**: A non-technical, bilingual guide for administrators on how to use the automation rules feature, including best practices and examples.
    -   [Read the User Guide](./docs/automation-rules-user-guide.md)

---
## Data Display Audit & Fixes
*Date: 2024-07-25*

A comprehensive audit of the codebase was performed to ensure all dummy data from mock files is correctly loaded and displayed in the UI.

### Summary of Issues Resolved:
- **Root Cause**: The primary issue identified was a mismatch in the placeholder variable syntax within the automation system's templates. Agent task templates used single-brace syntax (e.g., `{variable}`), while email and SMS templates used double-brace syntax (e.g., `{{variable}}`).
- **Impact**: The `renderTemplate` utility function was only designed to handle single-brace syntax. As a result, all mock email and SMS notifications generated by the renewal and payment automation systems failed to correctly substitute dynamic data (like customer names, policy numbers, etc.), which was visible in the console logs.
- **Fix Applied**: All email and SMS templates in the `data/templates/` directory were updated to use the consistent, single-brace syntax (`{variable}`). This aligns all templates with the existing renderer logic, ensuring all data placeholders are now correctly populated across all automated communication channels.
