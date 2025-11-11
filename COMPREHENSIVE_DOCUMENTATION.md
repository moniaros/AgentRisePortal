# AgentRise: Comprehensive Application Documentation

This document provides a detailed audit of the AgentRise web application, cataloging every page, its functionalities, data sources, and routing information. It serves as a technical reference for developers and stakeholders.

## 1. Core Application Structure

### 1.1. Application Entry Point
-   **File:** `index.tsx`
-   **Purpose:** The main entry point of the React application. It finds the `root` DOM element and renders the main `App` component within it.

### 1.2. Main App Component
-   **File:** `App.tsx`
-   **Purpose:** The top-level component that orchestrates the entire application.
-   **Functionalities:**
    -   **Context Providers:** Wraps the application in all necessary context providers:
        -   `LanguageProvider`: For bilingual (EN/EL) support.
        -   `AuthProvider`: For managing user authentication state.
        -   `NotificationProvider`: For global toast/notification messages.
        -   `GTMProvider`: For integrating Google Tag Manager.
    -   **Routing:** Defines all application routes using `react-router-dom`, mapping URL paths to their respective page components.
    -   **Layout:** Uses the `Layout` component to provide a consistent structure (Header, Sidebar) for all authenticated pages.

### 1.3. Global Layout
-   **File:** `components/Layout.tsx`
-   **Purpose:** A wrapper component that enforces a consistent UI shell for all pages that require authentication.
-   **Functionalities:**
    -   Redirects unauthenticated users to the `/login` page.
    -   Renders the main `Sidebar` and `Header` components.
    -   Includes a `Breadcrumbs` component for navigation context.
    -   Provides the main content area where child page components are rendered.

---

## 2. Routing Map

The following table summarizes all defined routes in the application.

| Route Path                     | Page Component          | Description                                                                 | Route Parameters |
| ------------------------------ | ----------------------- | --------------------------------------------------------------------------- | ---------------- |
| `/login`                       | `Login`                 | User authentication page.                                                   | -                |
| `/logout`                      | `Logout`                | Clears user session and redirects to login.                                 | -                |
| `/`                            | `Dashboard`             | The main landing page after login, showing KPIs and overviews.              | -                |
| `/lead-generation`             | `LeadGeneration`        | Displays a filterable list of all leads.                                    | -                |
| `/micro-crm`                   | `MicroCRM`              | Main Customer Relationship Management page.                                 | -                |
| `/customer/:customerId`        | `CustomerProfile`       | Detailed view of a single customer, including policies and timeline.        | `customerId`     |
| `/gap-analysis`                | `GapAnalysis`           | AI-powered tool to analyze insurance policy documents.                      | -                |
| `/onboarding`                  | `Onboarding`            | A guided checklist for new users.                                           | -                |
| `/billing`                     | `Billing`               | Placeholder page for future payment and billing integration.                | -                |
| `/social-composer`             | `SocialComposer`        | Tool for creating and scheduling social media posts.                        | -                |
| `/ad-campaigns`                | `AdCampaigns`           | Page for viewing and creating marketing ad campaigns.                       | -                |
| `/analytics`                   | `Analytics`             | Dashboard for analyzing ad campaign performance.                            | -                |
| `/profile`                     | `Profile`               | Page for the logged-in user to view and edit their profile.                 | -                |
| `/settings`                    | `Settings`              | Hub for application settings like social connections and GTM.               | -                |
| `/settings/automation-rules`   | `AutomationRules`       | Page to manage workflow automation rules.                                   | -                |
| `/user-management`             | `UserManagement`        | Page for admins to manage users and view audit logs.                        | -                |
| `/leads-dashboard`             | `LeadsDashboard`        | A visual dashboard summarizing lead data and funnels.                       | -                |
| `/microsite-builder`           | `MicrositeBuilder`      | Tool for building a simple, public-facing agency website.                   | -                |
| `/executive-dashboard`         | `ExecutiveDashboard`    | High-level dashboard for agency-wide metrics.                               | -                |
| `/news`                        | `NewsListing`           | Lists all news articles and announcements.                                  | -                |
| `/news/:articleId`             | `NewsArticleDetail`     | Displays a single news article.                                             | `articleId`      |
| `/testimonials`                | `Testimonials`          | Page for viewing, submitting, and moderating testimonials.                  | -                |
| `/sitemap`                     | `Sitemap`               | A page listing all application routes for SEO purposes.                     | -                |
| `/capture/:campaignId`         | `LeadCapturePage`       | A public-facing landing page to capture leads from campaigns.               | `campaignId`     |
| `*`                            | `Navigate` to `/`       | Wildcard route that redirects any unmatched URL to the dashboard.           | -                |

---

## 3. Page & Component Documentation

This section details each page, organized by the main navigation categories.

### 3.1. Authentication

#### Page: Login
-   **File:** `pages/Login.tsx`
-   **Purpose:** To authenticate users. This is the main public-facing page.
-   **Functionalities:**
    -   Displays email and password input fields.
    -   Handles form submission and validation.
    -   Communicates with `AuthContext` to attempt login.
    -   Displays authentication errors.
-   **UI Elements:** Login form, language toggle button.
-   **Data Source:** `data/mockData.ts` (via `AuthContext`).
-   **Localization:** Fully supported (form labels, error messages, etc.).

### 3.2. Main Menu

#### Page: Dashboard
-   **File:** `pages/Dashboard.tsx`
-   **Purpose:** Serves as the primary landing page after login, providing a high-level overview of key metrics.
-   **Functionalities:**
    -   Displays a dynamic, time-aware greeting to the user.
    -   Shows KPI cards for "New Leads", "Est. Monthly Revenue", and "Total Policies in Force".
    -   Visualizes policy distribution.
    -   Includes an auto-rotating carousel of approved client testimonials.
-   **UI Elements:** Dynamic header, KPI cards, progress bars, testimonial carousel.
-   **Data Source:** `data/mockData.ts` (via `fetchDashboardData`).
-   **Localization:** Fully supported. Date formatting is also localized.

#### Page: Leads Dashboard
-   **File:** `pages/LeadsDashboard.tsx`
-   **Purpose:** Provides a visual summary of lead generation and conversion performance.
-   **Functionalities:**
    -   Displays KPI cards for "Total Leads", "New Leads", "Conversion Rate", and "Closed Deals".
    -   Shows a pie chart of leads by their source.
    -   Renders a funnel chart visualizing the lead status pipeline.
-   **UI Elements:** KPI cards, Pie chart (`LeadSourceChart`), Funnel chart (`LeadStatusFunnel`).
-   **Data Source:** `hooks/useCrmData.ts` (fetches from `data/mockData.ts`).
-   **Localization:** Fully supported.

#### Page: Leads List
-   **File:** `pages/LeadGeneration.tsx`
-   **Purpose:** To view, search, and filter the list of all leads for the user's agency.
-   **Functionalities:**
    -   Displays leads in a paginated table.
    -   Allows filtering by status, source, and a free-text search.
    -   Users can click to view lead details in a modal window.
-   **UI Elements:** Filter controls, data table, modal dialog.
-   **Data Source:** `hooks/useCrmData.ts`.
-   **Localization:** Fully supported.

#### Page: Micro-CRM
-   **File:** `pages/MicroCRM.tsx`
-   **Purpose:** The central hub for managing customer records.
-   **Functionalities:**
    -   Displays a searchable list of all customers.
    -   Allows adding, editing, and deleting customer profiles via a modal form.
    -   Shows a list of recent leads.
-   **UI Elements:** Customer table, recent leads table, "Add Customer" button, search input, `CustomerFormModal`.
-   **Data Source:** `hooks/useCrmData.ts`.
-   **Localization:** Fully supported.

#### Page: Customer Profile
-   **File:** `pages/CustomerMicrosite.tsx`
-   **Purpose:** Provides a 360-degree view of a single customer.
-   **Functionalities:**
    -   Displays customer's personal and contact information.
    -   Lists all associated insurance policies with details.
    -   Allows renewal of policies and AI-powered policy reviews (using Gemini).
    -   Shows a chronological timeline of all interactions (calls, emails, notes, system events).
    -   Users can add new events, add annotations to existing events, and flag important events.
    -   Supports editing the customer's profile and address.
-   **UI Elements:** Customer info header, policy cards, interactive timeline, multiple modals for different actions.
-   **Data Source:** `hooks/useCrmData.ts`.
-   **Localization:** Fully supported.

#### Page: AI Gap Analysis
-   **File:** `pages/GapAnalysis.tsx`
-   **Purpose:** To use the Gemini API to analyze a client's policy for coverage gaps.
-   **Functionalities:**
    -   Allows users to upload a policy document (PDF, JPG, PNG).
    -   Simulates extracting policy data from the document.
    -   Provides a text area for the user to describe the client's needs.
    -   Sends the policy data and user needs to the Gemini API for analysis.
    -   Displays the structured results (gaps, upsell, cross-sell opportunities).
-   **UI Elements:** File uploader, text area, results display with color-coded cards.
-   **Data Source:** `services/api.ts` (`fetchParsedPolicy`) for mock extraction, and the Gemini API for analysis.
-   **Localization:** Fully supported.

#### Page: News & Updates
-   **Files:** `pages/NewsListing.tsx`, `pages/NewsArticleDetail.tsx`
-   **Purpose:** A section for company-wide or agency-specific announcements.
-   **Functionalities:**
    -   **Listing Page:** Displays all available articles in a card grid, sorted by date.
    -   **Detail Page:** Shows the full content of a single article. Includes author info, tags, and social sharing buttons.
    -   **SEO:** Dynamically updates the page title, meta description, and canonical URL for better search engine indexing.
-   **UI Elements:** Article cards, detailed article view, social share buttons.
-   **Data Source:** `hooks/useNewsData.ts` (fetches from `data/mockData.ts`).
-   **Localization:** Fully supported.

#### Page: Testimonials
-   **File:** `pages/Testimonials.tsx`
-   **Purpose:** To manage and display client testimonials.
-   **Functionalities:**
    -   Any authenticated user can submit a new testimonial (quote and star rating) via a modal.
    -   Displays all "approved" testimonials in a grid.
    -   For `Admin` users, a "Pending Moderation" tab appears, allowing them to approve or reject new submissions.
-   **UI Elements:** Tabbed interface, testimonial cards, moderation cards, submission modal.
-   **Data Source:** `hooks/useTestimonialsData.ts` (fetches from `data/mockData.ts`).
-   **Localization:** Fully supported.

### 3.3. Management

#### Page: User Management
-   **File:** `pages/UserManagement.tsx`
-   **Purpose:** Allows administrators to manage users within their agency.
-   **Functionalities:**
    -   Displays a list of all users in the agency.
    -   Allows inviting new users with a specific role (`agent` or `admin`).
    -   Allows changing a user's role or removing a user.
    -   Supports bulk actions (delete, change role) for selected users.
    -   Includes an "Audit Logs" tab to view a history of administrative actions.
-   **UI Elements:** Tabbed view, user table with checkboxes, audit log table, filter controls, invite modal.
-   **Data Source:** `hooks/useUserManagementData.ts`.
-   **Localization:** Fully supported.

#### Page: Executive Dashboard
-   **File:** `pages/ExecutiveDashboard.tsx`
-   **Purpose:** Provides high-level, agency-wide business intelligence for owners and managers.
-   **Functionalities:**
    -   Visualizes agency growth (premium vs. policy count).
    -   Shows product mix in a donut chart.
    -   Displays trends in insurance claims.
    -   Visualizes the lead conversion funnel.
    -   Presents a table of campaign Return on Investment (ROI).
    -   Shows a summary of risk exposure.
-   **UI Elements:** Various charts and tables from the `recharts` library.
-   **Data Source:** `hooks/useExecutiveData.ts`.
-   **Localization:** Fully supported.

### 3.4. User & Settings

#### Page: Profile
-   **File:** `pages/Profile.tsx`
-   **Purpose:** Allows the logged-in user to view and manage their own profile details.
-   **Functionalities:**
    -   Displays user's personal info, contact details, role, and licenses.
    -   Allows editing of name, contact info, and job title.
    -   Includes controls for uploading a profile photo and a digital signature.
    -   Shows a read-only log of the user's recent activity on the platform.
-   **UI Elements:** Multi-section form, image upload controls, read-only data sections, activity list.
-   **Data Source:** `context/AuthContext.tsx` (current user), `hooks/useUserActivity.ts`.
-   **Localization:** Fully supported.

#### Page: Settings
-   **File:** `pages/Settings.tsx`
-   **Purpose:** A central page for configuring application-level settings.
-   **Functionalities:**
    -   Provides a link to the "Automation Rules" management page.
    -   Allows users to "connect" and "disconnect" their social media accounts (mocked functionality).
    -   Includes an input field to set the Google Tag Manager container ID, which is stored in `localStorage`.
-   **UI Elements:** Settings cards, social connection list, GTM ID input field.
-   **Data Source:** `localStorage` for GTM ID, component state for social connections.
-   **Localization:** Fully supported.

#### Page: Automation Rules
-   **File:** `pages/AutomationRules.tsx`
-   **Purpose:** Provides a UI for administrators to manage agency-specific automation rules.
-   **Functionalities:**
    -   Features a tabbed sub-navigation to switch between an overview and specific rule categories (`Lead Conversion`, `Communication Automation`).
    -   Displays all automation rules for a selected category in a filterable table.
    -   Admins can toggle rules between "Active" and "Inactive".
    -   Admins can access an actions menu to (mock) Edit, Duplicate, or Delete a rule.
    -   Deleting a rule triggers a confirmation modal.
-   **UI Elements:** Tabbed sub-navigation, filter controls, data table with toggle switches and actions menu, confirmation modal.
-   **Data Source:** `hooks/useAutomationRules.ts` (fetches from `/data/rules/*.json`).
-   **Localization:** Fully supported (rule names and triggers are read from localization keys).
