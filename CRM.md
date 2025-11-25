# AgentRise CRM: Product Status & Enhancement Roadmap

**Date:** October 26, 2024  
**Author:** Head of Product  
**Target Audience:** Product Strategy & UI/UX Design Teams

---

## 1. Executive Summary

The "Micro-CRM" module within AgentRise currently serves as a lightweight, mobile-first client management system designed for independent insurance agents. Its core value proposition is the tight integration of **AI capabilities** (Policy Scanning, Gap Analysis) directly into the customer record.

However, to compete with enterprise-grade solutions (Salesforce Financial Services Cloud, HubSpot), the CRM needs to evolve from a "digital rolodex" into a **Proactive Relationship Intelligence Engine**. The current UI is clean but lacks density for power users, and several key insurance-specific workflows (Householding, Commercial Lines) are missing.

---

## 2. Current Status (The "As-Is")

### 2.1 Core Modules
1.  **Customer Directory:**
    *   *Features:* List view with basic search/filtering. "Smart Import" allowing PDF drag-and-drop to create profiles.
    *   *Status:* Functional but basic. Lacks advanced segmentation (e.g., "Clients with Auto but no Home").
2.  **Customer Profile (360 View):**
    *   *Features:* Contact info, Consent (GDPR), Timeline (Notes/Events), Policy List, AI Analysis History.
    *   *Status:* The central hub. The "Attention Flag" and "Actionable Opportunities" (AI findings) are strong differentiators.
3.  **Policy Management:**
    *   *Features:* ACORD-mapped data structure. Collapsible detailed view. Inline editing for coverages.
    *   *Status:* Good for viewing, but lacks "Policy Lifecycle" features (Endorsements, Renewals, Cancellations history).
4.  **Timeline & Activity:**
    *   *Features:* Chronological log of interactions. Ability to add notes/files.
    *   *Status:* Linear and text-heavy. Hard to scan for critical events over a long history.

### 2.2 UX/UI Observations
*   **Modal Heavy:** Too many actions (Edit Profile, Add Event, View Policy) open modals, removing context from the main dashboard.
*   **Information Density:** The "DetailedPolicyView" uses a lot of vertical space. Comparing two policies side-by-side is impossible.
*   **Navigation:** Switching between "Timeline", "Policies", and "Analysis" requires tab clicks, hiding critical context (e.g., seeing a claim on the timeline while looking at policy limits).

---

## 3. Strategic Enhancements (The "To-Be")

We propose a 3-phase roadmap to elevate the CRM experience.

### Phase 1: UX/UI Modernization (Focus: Efficiency)

#### 1.1 The "Dense" Dashboard Layout
*   **Proposal:** Move away from the single-column Tab layout on desktop.
*   **Design:** Implement a **3-Column Layout**:
    *   *Left (20%):* Static Profile Card (Contact, VIP Status, Churn Risk Score, Next Best Action).
    *   *Center (50%):* Activity Feed & Communication Hub (Unified timeline + email/SMS composer).
    *   *Right (30%):* Contextual Sidebar (Current Policies summary, AI Opportunities, Open Tasks).
*   **Goal:** Reduce clicks. An agent should answer "Is this customer covered for X?" and "When did we last speak?" without scrolling or clicking tabs.

#### 1.2 "Quick Action" Command Center
*   **Proposal:** A Floating Action Button (FAB) or Command Palette (`Cmd+K`) for power users.
*   **Actions:** "Log Call," "Create Quote," "Send Renewal Email," "Upload Claim Doc."
*   **Goal:** Speed up data entry.

#### 1.3 Visual Policy Comparison
*   **Proposal:** A "Compare" mode for policies (e.g., Current Year vs. Renewal Offer, or Auto 1 vs. Auto 2).
*   **UI:** Side-by-side table highlighting changed limits/premiums in red/green.

### Phase 2: Functional Depth (Focus: Insurance Specifics)

#### 2.1 Householding (Group View)
*   **Gap:** Currently, customers are individuals. Insurance is often sold to households or businesses.
*   **Proposal:** Link customers via relationships (Spouse, Child, Employee).
*   **UI:** A "Household Tree" visualization showing total household premium and cross-sell gaps across the entire family.

#### 2.2 Commercial Lines Support
*   **Gap:** The current UI assumes personal lines (Auto/Home/Life).
*   **Proposal:** Add support for "Assets" (Fleets, Buildings, Equipment) separate from "Policies."
*   **UI:** A "Risk Map" view showing insured locations on a Google Map vs. active policies.

#### 2.3 Automated Renewal Workflows
*   **Proposal:** Instead of just a "Renewal Date," implement a timeline tracking the renewal lifecycle: *T-60 (Review), T-45 (Re-shop), T-30 (Send Proposal), T-0 (Bind).*
*   **UI:** A progress bar for active renewals at the top of the profile.

### Phase 3: AI & Intelligence (Focus: Proactivity)

#### 3.1 "Next Best Action" Widget
*   **Logic:** If *Claim Status* = Open -> Action: "Call for status update."
*   **Logic:** If *Birthday* = Today -> Action: "Send card."
*   **Logic:** If *Gap Analysis* = High Risk -> Action: "Schedule Review."
*   **UI:** A prominent card at the top of the profile suggesting the single most important thing to do today.

#### 3.2 Sentiment Analysis on Timeline
*   **Proposal:** Use Gemini to analyze timeline notes and emails.
*   **UI:** Color-code timeline events (Green = Happy, Red = Frustrated). Trend line showing "Relationship Health" over time.

---

## 4. UI/UX Expert Brief

**To the Design Team:**
Please review the existing `CustomerProfile.tsx` and `DetailedPolicyView.tsx`. We need high-fidelity mockups for **Phase 1 (The 3-Column Layout)**.

**Key Constraints:**
1.  **Responsiveness:** Must collapse gracefully to a single column for field agents on tablets/phones.
2.  **Clarity:** Insurance data is number-heavy. Use typography and spacing effectively to make coverage limits readable.
3.  **Trust:** The aesthetic should feel financial and secure, yet modern.

**To the Product Team:**
Please prioritize the **Data Model changes** required for Householding (Phase 2.1) as this affects the core architecture.