# AgentOS - Ασφαλιστική Πύλη (Insurance Portal)

AgentOS is a modern, comprehensive lead generation and management platform designed for insurance professionals. It provides a bilingual interface (Greek/English), offline capabilities, and a suite of tools including a micro-CRM, AI-powered gap analysis, and a social media composer to streamline agent workflows and boost sales.

This project is bootstrapped with React, TypeScript, and Tailwind CSS, running in a web-based environment.

## Implemented Features

### Core Platform
- **Bilingual Interface**: Seamlessly switch between English (EN) and Greek (EL) with full localization support.
- **Offline First**: Core data like customer and lead information is cached locally, allowing the application to function without an internet connection.
- **Role-Based Access Control (RBAC)**: Differentiates between 'Admin' and 'Agent' roles, restricting access to management features.
- **Responsive Design**: The UI is optimized for both desktop and mobile devices.

### Main Tools
- **Dashboard**: A central hub providing at-a-glance KPIs for new leads, policies sold, and conversion rates. It also features a sales funnel visualization, a list of expiring policies, and a feed of automated tasks and reminders.
- **Leads Dashboard**: A focused dashboard for analyzing lead sources and the status of leads in the conversion funnel.
- **Micro-CRM**: A lightweight Customer Relationship Management tool to manage customer profiles, policies, and interaction timelines.
- **AI Gap Analysis**: An intelligent tool that parses a client's existing policy documents, and when combined with user-described needs, uses the Gemini API to identify coverage gaps, upsell, and cross-sell opportunities.
- **Social Composer**: A tool for crafting and scheduling social media posts. It includes an AI Content Helper (powered by Gemini API) to generate post ideas and templates for common insurance topics.
- **Campaign Management**: Create and manage marketing campaigns that can be linked to leads.
- **Analytics**: View performance metrics for marketing campaigns, including spend, impressions, CTR, and conversions, with filterable charts.
- **Microsite Builder**: A drag-and-drop interface to build a simple, public-facing webpage for the agent or agency, including sections for services, team, testimonials, and contact information.

### Management Tools
- **User Management**: (Admin only) Invite, remove, and change the roles of users within the agency. Includes a detailed audit log for all management actions.
- **Executive Dashboard**: (Admin only) A high-level overview of agency performance, including monthly growth in premium volume, product mix, claims trends, and campaign ROI.
- **Automation Rules**: (Admin only) An overview page to monitor the status of the automation engine, showing total rules, recent executions, and success rates.

### Content & Engagement
- **News & Updates**: A section for viewing global or agency-specific news articles, with SEO-friendly detail pages.
- **Testimonials**: A system for clients to submit testimonials, which can then be moderated by an admin and displayed publicly or on the agent's microsite.

### Localization & Internationalization
- **Bilingual Text**: All UI text, labels, and messages are translated using a JSON-based i18n system (`/data/locales/`). The primary language is Greek (EL), with English (EN) as a fallback.
- **Dynamic Date/Time Formatting**: Dates and times across the application (e.g., in tables, charts, timelines) are formatted according to the user's selected language (`el-GR` or `en-US`).
- **Locale-Aware Number & Currency Formatting**: All numerical and currency values (e.g., on KPI cards, in analytics charts) are formatted using the appropriate locale, ensuring correct decimal and thousands separators.

---

## Automation Systems

### Rules Engine Data Model

The platform includes a flexible, JSON-based rules engine designed to automate various business logic without requiring code changes. The core components of this model are:

-   **`RuleDefinition`**: The main object that encapsulates a single rule, including its trigger, conditions, and actions.
-   **`Trigger`**: The event that initiates a rule check (e.g., `POLICY_EXPIRING_SOON`, `NEW_LEAD_CREATED`).
-   **`Condition`**: A specific check that must pass for the rule to execute (e.g., `policy.type` EQUALS `auto`).
-   **`Action`**: The operation to perform if all conditions are met (e.g., `CREATE_TASK`, `SEND_EMAIL`).

**Example Rule Definition (`renewal-reminders.rules.json`):**
```json
{
  "id": "RR-001",
  "name": "30-Day Auto Policy Renewal Reminder",
  "trigger": {
    "eventType": "POLICY_EXPIRING_SOON",
    "parameters": { "daysBefore": 30 }
  },
  "conditions": [
    { "field": "policy.type", "operator": "EQUALS", "value": "auto" }
  ],
  "actions": [
    { "actionType": "CREATE_TASK", "target": "AGENT", "template": "Follow up with {customer.name}..." },
    { "actionType": "SEND_EMAIL", "target": "CUSTOMER", "parameters": { "templateId": "renewal-30-day" } }
  ],
  "isEnabled": true
}
```

### Renewal Reminder Automation

This system automatically generates tasks and notifications for policies that are nearing their expiration date.

-   **Engine**: A service (`renewalAutomation.ts`) simulates a daily check of all active policies.
-   **Triggers**: The service checks for policies expiring in 90, 60, 30, 15, and 7 days.
-   **Actions**:
    -   **Task Creation**: Creates an actionable task for the assigned agent, which appears on their main dashboard.
    -   **Multi-Channel Notifications**: Can send mock emails and SMS messages directly to the customer based on rule configurations.
-   **Configuration**: All logic is driven by the `data/rules/renewal-reminders.rules.json` file.
-   **Templates**: Communications use bilingual (EN/EL) templates stored in `data/templates/`. Available variables include: `{{policyholderName}}`, `{{policyNumber}}`, `{{expiryDate}}`, `{{agentName}}`, `{{agentPhone}}`.
-   **Duplicate Prevention**: A mock log (`MOCK_REMINDER_LOG`) is maintained to ensure that the same reminder for a specific policy is not sent more than once.

### Payment Reminder Automation

This system automates the process of reminding customers about upcoming or overdue premium payments.

-   **Engine**: A service (`paymentAutomation.ts`) simulates a daily check of all policies with pending payments.
-   **Trigger Events**: The rules engine is triggered based on the payment due date: `PAYMENT_DUE_IN_30_DAYS`, `PAYMENT_DUE_IN_7_DAYS`, `PAYMENT_DUE_TODAY`, and `PAYMENT_OVERDUE_3_DAYS`.
-   **Data Fields**: The system relies on the following ACORD-aligned fields in a policy record: `premiumAmount`, `paymentDueDate`, and `paymentStatus` (`pending`, `paid`, `overdue`).
-   **Actions**:
    -   `CREATE_TASK`: Generates a follow-up task for the assigned agent.
    -   `SEND_EMAIL`: Sends a reminder email to the policyholder.
    -   `SEND_SMS`: Sends a text message reminder, typically for urgent overdue notices.
-   **Configuration**: All logic is driven by the `data/rules/payment-reminders.rules.json` file, which is highly configurable.

---

### Automation Gap Analysis

For a detailed analysis of the current state of the automation system, what is partially implemented, and what is missing, please see the [Automation Gap Analysis](./automation-gap-analysis.md) document.

---

## Application Structure & Pages

### Main Navigation
-   **/ (Dashboard)**: The landing page with key performance indicators (KPIs) and an activity feed.
-   **/leads-dashboard**: A specialized dashboard focusing on lead sources and conversion funnel metrics.
-   **/lead-generation**: A tool for viewing and filtering all incoming leads.
-   **/micro-crm**: A list of all customers and recent leads, with functionality to add, edit, and view customer profiles.
-   **/customer/:id**: Detailed view of a single customer, including their policies, interaction timeline, and notes.
-   **/gap-analysis**: An AI-powered tool to analyze a client's existing policies for coverage gaps.
-   **/social-composer**: A workspace to create and schedule social media posts with AI assistance.
-   **/ad-campaigns**: A dashboard to create and monitor digital advertising campaigns.
-   **/analytics**: A page for viewing detailed analytics on campaign performance.
-   **/microsite-builder**: A visual editor to create a personalized public-facing website.
-   **/news**: A listing of industry or agency news articles.
-   **/news/:id**: The detail page for a single news article.
-   **/testimonials**: A page to view approved client testimonials and (for admins) moderate pending ones.

### Management Tools
-   **/executive-dashboard**: (Admin only) A high-level dashboard showing key agency growth metrics like premium volume, product mix, and claims trends.
-   **/user-management**: (Admin only) A section to invite, remove, and manage user roles within the agency. Includes an audit log of all administrative actions.
-   **/billing**: (Admin only) A placeholder page for future payment and subscription management integration.
-   **/settings/automation-rules**: (Admin only) An overview page to monitor and manage the business automation rules engine. It displays summary statistics, rule categories, and a log of recent rule executions.

### Other Pages
-   **/profile**: The logged-in user's profile page, showing personal details, licenses, and recent activity.
-   **/settings**: A page for configuring application settings, such as connecting social media accounts and entering a Google Tag Manager ID.
-   **/sitemap**: An auto-generated sitemap for SEO and easy navigation.
-   **/login**: The application's login page.
-   **/logout**: Clears the user session and redirects to the login page.
-   **/capture/:campaignId**: A public-facing lead capture form linked to a specific ad campaign.
-   **/onboarding**: A welcome page for new users that guides them through initial setup tasks.
