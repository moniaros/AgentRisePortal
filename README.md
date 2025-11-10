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
