# Aσφαλιστική Πύλη | Insurance Portal

A comprehensive lead generation and management platform for insurance professionals. This application provides a full suite of tools, from a micro-CRM to AI-powered gap analysis, designed to streamline agent workflows and boost sales.

## Implemented Features

- **Bilingual Interface**: Full support for both Greek (Ελληνικά) and English, with a language toggle.
- **Offline Capability**: Utilizes `localStorage` and `navigator.onLine` to provide seamless offline access to critical data like customer and lead information.
- **Responsive Layout**: A modern, responsive design that works across devices, built with TailwindCSS.
- **Authentication**: A mock authentication flow to simulate user login and secure routes.
- **Dashboard**: A central hub displaying key performance indicators (KPIs) such as:
    - New Leads Today
    - New Leads This Month (with sparkline and MoM % change)
    - Total Policies In-Force
    - On-Time Renewal Rate (visualized with a gauge chart)
    - Lead-to-Policy conversion funnel chart.
    - A notification widget for policies expiring within the next 30 days.
- **Renewal Reminder Automation**: A rules-based system that simulates daily checks for policies nearing expiration.
    - **Configurable Intervals**: Automatically generates reminders at 90, 60, 30, 15, and 7 days before a policy's end date.
    - **Duplicate Prevention**: Maintains a log of sent reminders to ensure tasks are not created redundantly for the same policy at the same interval.
    - **Bilingual Templates**: Uses localized templates to generate clear, actionable tasks for the assigned agent.
    - **Dashboard Widget**: Displays all newly generated tasks and reminders for the day in the "Automated Tasks & Reminders" widget.
- **Micro-CRM**:
    - View, add, edit, and delete customer profiles.
    - Manage customer policies and communication preferences.
    - A detailed customer profile page with a timeline of interactions (notes, calls, emails).
    - AI-powered policy review to get recommendations directly from the customer profile.
- **Lead Generation Page**:
    - View and filter a list of all leads.
    - Search by name, email, status, or source.
- **AI-Powered Gap Analysis**:
    - Upload a policy document (mocked).
    - The system extracts policy details (mocked).
    - An agent can input customer needs.
    - Uses the Gemini API to analyze the policy against the customer's needs and identify coverage gaps, upsell opportunities, and cross-sell opportunities.
- **Social Media Composer**:
    - A composer to write social media posts.
    - **AI Post Generation**: Utilizes the Gemini API to generate post content based on a user's prompt.
    - Platform selection and a live preview of the post.
- **Ad Campaigns & Analytics**:
    - Create and view mock advertising campaigns.
    - An analytics dashboard to view campaign performance (spend, impressions, CTR, conversions).
    - Filterable charts for performance over time and spend by network.
- **Executive Dashboard**: A high-level overview for managers, including:
    - Agency Growth (Premium vs. Policies)
    - Product Mix Donut Chart
    - Claims Trend
    - Lead Funnel
    - Campaign ROI Table
    - Risk Exposure Chart
- **User Management**:
    - View a list of users within the agency.
    - Invite new users with a specific role (Agent/Admin).
    - View audit logs for key actions like user invites and role changes.
- **Microsite Builder**: A drag-and-drop interface (conceptual) to build a simple, public-facing website for the agent or agency. Includes a live preview and editors for site settings and content blocks.
- **News & Updates**: A content section for publishing articles, filterable by agency. Includes SEO-friendly detail pages.
- **Testimonials**: A system for customers to submit testimonials and for admins to moderate (approve/reject) them.
- **Localization**: Comprehensive internationalization support:
    - All user-facing strings are translated based on the selected language (EN/EL).
    - Dates are formatted according to the user's locale.
    - Numbers and currency values are formatted using locale-specific conventions (e.g., `€1.250,50` in Greek vs. `€1,250.50` in English).

## Application Structure & Pages

The application is structured around a central dashboard with specialized pages accessible via a sidebar menu. The menu is divided into a main section for daily agent tasks and a management section for administrative and high-level oversight.

### Main Menu

-   **Dashboard (`/`)**: The main landing page after login. It provides a high-level, at-a-glance overview of key performance indicators (KPIs), an actionable list of expiring policies, a sales funnel visualization, and automated reminders.
-   **Leads Dashboard (`/leads-dashboard`)**: A focused dashboard for lead management. It displays lead-specific KPIs (total leads, new leads, conversion rate) and includes charts for lead sources and the status funnel.
-   **Lead Generation (`/lead-generation`)**: A comprehensive table of all leads. This page allows agents to search, filter, and sort leads by status, source, and other criteria. Agents can click on a lead to view detailed information.
-   **Micro-CRM (`/micro-crm`)**: The core customer relationship management hub. It features a searchable table of all customers and a list of recent leads. From here, agents can add new customers or navigate to individual customer profiles.
-   **AI Gap Analysis (`/gap-analysis`)**: An intelligent tool that uses the Gemini API to find sales opportunities. Agents can upload a client's policy document (mocked), describe the client's needs, and receive an AI-generated report on coverage gaps, upsell, and cross-sell recommendations.
-   **Social Composer (`/social-composer`)**: A content creation studio for social media. It includes an AI-powered post generator (using Gemini), post templates, platform selection (Facebook, LinkedIn, etc.), and a live preview.
-   **Ad Campaigns (`/ad-campaigns`)**: A control center for creating and managing digital ad campaigns. It features a multi-step wizard to guide users through setting objectives, audience, budget, and creative assets.
-   **Analytics (`/analytics`)**: The central dashboard for measuring ad campaign performance. It displays filterable charts and KPIs for metrics like total spend, impressions, click-through rate (CTR), and conversions.
-   **Microsite Builder (`/microsite-builder`)**: A visual, block-based editor for creating a simple, professional-looking personal or agency website. Users can add, arrange, and edit content blocks (e.g., Hero, About, Services) and see a live preview.
-   **News & Updates (`/news`)**: A content hub for internal and external communications. It functions like a blog, allowing the agency to post articles and updates.
-   **Testimonials (`/testimonials`)**: A page for managing client feedback. It displays approved testimonials publicly. Admins have a moderation view to approve or reject pending submissions.

### Management Tools

-   **User Management (`/user-management`)**: _(Admin Access Only)_ An administrative page for managing team access. Admins can invite new users, change user roles (Agent/Admin), remove users, and review a detailed audit log of all administrative actions.
-   **Billing (`/billing`)**: _(Admin Access Only)_ A placeholder page for future integration with a payment processor like Stripe. This section is intended for managing subscriptions or processing premium payments.
-   **Executive Dashboard (`/executive-dashboard`)**: _(Admin Access Only)_ A strategic overview designed for agency owners and managers. It visualizes high-level business metrics, including agency growth (premium vs. policy count), product mix, claims trends, campaign ROI, and risk exposure.
-   **Automation Rules (`/settings/automation-rules`)**: _(Admin Access Only)_ A placeholder page for the future UI where admins can create, edit, and manage the business logic rules that drive platform automations (e.g., lead assignment, payment reminders).

### Utility & Other Pages

-   **Login (`/login`)**: The application's entry point for user authentication.
-   **Profile (`/profile`)**: The current user's personal profile page. Here, users can edit their contact information, upload a profile photo and digital signature, and view their recent activity log.
-   **Settings (`/settings`)**: A page for application-level configurations. Users can connect/disconnect social media accounts for the Social Composer and configure the Google Tag Manager (GTM) ID for analytics.
-   **Customer Profile (`/customer/:customerId`)**: A detailed, 360-degree view of a single customer, accessible from the Micro-CRM. It displays all policies, a complete timeline of interactions, and provides actions like renewing a policy or running an AI policy review.
-   **Lead Capture Page (`/capture/:campaignId`)**: A public-facing landing page linked from an ad campaign. It presents a form to capture lead information (e.g., name, email), which is then fed into the CRM.
-   **Onboarding (`/onboarding`)**: A welcome page for new users that guides them through initial setup steps with a checklist (e.g., complete profile, analyze first policy).
-   **Sitemap (`/sitemap`)**: An auto-generated page that lists all main pages and published news articles, primarily for SEO and accessibility.

## Automation Gap Analysis

A detailed analysis of the platform's automation capabilities has been conducted. The platform has a robust data model for a rules engine, but the functional implementation is currently limited to a hardcoded service for renewal-related task creation. A generic "rules runner" to process the defined JSON rules is the primary missing component.

For a complete breakdown of existing, partial, and missing features, as well as recommended development priorities, please see the full analysis document:

**[Read the full Automation Gap Analysis](./automation-gap-analysis.md)**

## Rules Engine Data Model

The platform includes a flexible, data-driven rules engine to automate common business processes. The engine's logic is defined entirely through JSON configurations, allowing for the creation and modification of rules without deploying new code.

The data model consists of four core components:

1.  **`RuleDefinition`**: The main container for a rule. It ties together a trigger, a set of conditions, and a set of actions.
2.  **`Trigger`**: The event that causes the rule to be evaluated. For example, `NEW_LEAD_CREATED` or `POLICY_EXPIRING_SOON`.
3.  **`Condition`**: A specific check that must pass for the rule's actions to be executed. A rule can have multiple conditions, all of which must be true (AND logic). Conditions check fields on the data object associated with the trigger (e.g., check if `lead.potentialValue` is greater than `2000`).
4.  **`Action`**: The operation to be performed if all conditions are met. This could be sending an email, creating a task in the CRM, or assigning a lead to a specific agent.

### Example Rule

Here is an example of a complete rule that assigns any new lead with a potential value over €2000 to a specific senior agent. This rule is defined in `data/rules/lead-assignments.rules.json`.

```json
[
  {
    "id": "LA-001",
    "name": "Assign High-Value Leads to Senior Agent",
    "description": "Automatically assigns new leads with a potential value greater than €2000 to the senior agent.",
    "category": "LEAD_ASSIGNMENT",
    "trigger": {
      "eventType": "NEW_LEAD_CREATED"
    },
    "conditions": [
      {
        "field": "lead.potentialValue",
        "operator": "GREATER_THAN",
        "value": 2000
      }
    ],
    "actions": [
      {
        "actionType": "ASSIGN_LEAD",
        "target": "SYSTEM",
        "parameters": {
          "assignToAgentId": "user_1"
        }
      }
    ],
    "priority": 200,
    "isEnabled": true,
    "agencyId": "agency_1"
  }
]
```

This structured approach allows for powerful and maintainable automation within the platform. Schemas for all data models are located in `data/rules/schemas/`.