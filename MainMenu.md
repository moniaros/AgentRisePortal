# Main Menu & Submenu Structure History

This document serves as a version-controlled audit trail for all changes made to the main navigation menu structure of the AgentOS application. This practice is a mandatory step for all future menu updates to maintain a clear history for product management and development teams.

---

## Version 1.0 (Initial State)

-   **Date:** 2023-10-27
-   **Description:** Initial documentation of the main menu and submenu structure upon establishing this version control practice.
-   **Reason:** To create a baseline for tracking all future navigational changes.
-   **Before/After Summary:**
    -   **Before:** No formal documentation existed.
    -   **After:** The current menu structure is now fully documented below.
-   **Notes:** This structure reflects the application state as of the initial documentation date. It includes primary navigation groups and their respective submenu items, routes, and access levels.

### Current Menu Structure

| Menu Group | Submenu Item | Route | Page Component | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Overview** | Dashboard | `/` | `Dashboard.tsx` | All Users |
| | Executive Analytics | `/executive-dashboard`| `ExecutiveDashboard.tsx` | All Users |
| **CRM** | Customers & Leads | `/micro-crm` | `MicroCRM.tsx` | All Users |
| | Leads Dashboard | `/leads-dashboard` | `LeadsDashboard.tsx`| All Users |
| | AI Policy Scanner | `/gap-analysis` | `GapAnalysis.tsx` | All Users |
| | Automation Rules | `/crm/automation-rules`| `AutomationRules.tsx`| Admin Only |
| **Campaigns** | Campaign Analytics | `/analytics` | `Analytics.tsx` | All Users |
| | Social Composer | `/social-composer` | `SocialComposer.tsx`| All Users |
| | Ad Campaigns | `/ad-campaigns` | `AdCampaigns.tsx` | All Users |
| **Website** | Microsite Builder | `/microsite-builder` | `MicrositeBuilder.tsx`| All Users |
| | News & Insights | `/news` | `NewsListing.tsx` | All Users |
| | Testimonials | `/testimonials` | `Testimonials.tsx` | All Users |
| **Agency Management**| User Management | `/user-management` | `UserManagement.tsx` | Admin Only |
| | Billing & Subscriptions| `/billing` | `Billing.tsx` | All Users |
| | Support Center | `/support` | `Support.tsx` | All Users |
| **Settings** | My Profile | `/profile` | `Profile.tsx` | All Users |
| | Application Settings | `/settings` | `Settings.tsx` | All Users |
