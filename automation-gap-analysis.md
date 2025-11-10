# Automation Gap Analysis

## 1. Introduction

This document provides a gap analysis of the AgentRise platform's current automation capabilities. It compares the existing implementation against the desired features of a flexible, rules-based automation system. The analysis is based on the code present in the `services/`, `data/rules/`, and `types.ts` files.

The core requirements for the automation system are:
1.  Automated email/SMS reminders for both renewals and payments.
2.  Task creation for agents based on various triggers.
3.  Automated lead assignment based on defined rules.

---

## 2. Executive Summary

The platform has a well-defined and robust **data model** for a generic rules engine, with clear schemas for rules, triggers, conditions, and actions. However, the **functional implementation** of this generic engine is largely missing.

Currently, only one piece of automation is fully functional: **renewal reminder task creation for agents**. This is implemented via a hardcoded, standalone service (`renewalAutomation.ts`) and is not integrated with the generic JSON-based rules engine.

All other desired automations (payment reminders, lead assignment, new policy tasks) exist only as data models in JSON files but lack the underlying "rules runner" service to execute them.

---

## 3. Detailed Analysis by Requirement

### 3.1. Automated Communication (Email/SMS)

-   **What Already Exists:**
    -   A hardcoded service (`renewalAutomation.ts`) that successfully detects policies nearing expiration and creates **internal agent tasks**.
-   **What is Partially Implemented:**
    -   A rule definition exists in `data/rules/payment-reminders.rules.json` that correctly specifies a `SEND_EMAIL` action for overdue payments. The data model is ready.
-   **What is Completely Missing:**
    -   A core "Rules Engine Runner" service that can process the `payment-reminders.rules.json` file.
    -   A trigger mechanism to check for overdue payments daily.
    -   Any logic to actually send emails or SMS. A mock `EmailService` or `SmsService` would be required.
    -   The ability for the existing renewal system to send communications directly to the customer; it currently only creates internal tasks.

### 3.2. Automated Task Creation

-   **What Already Exists:**
    -   The `renewalAutomation.ts` service fully implements task creation for the `POLICY_EXPIRING_SOON` trigger.
    -   The `AutomatedTask` type and the `AutomatedTasksWidget.tsx` component are fully functional and display these tasks correctly on the dashboard.
-   **What is Partially Implemented:**
    -   A rule definition exists in `data/rules/task-creation.rules.json` to create a welcome task when a new 'life' policy is bound.
-   **What is Completely Missing:**
    -   The "Rules Engine Runner" to process the `task-creation.rules.json` file.
    -   A trigger point within the CRM logic. The system does not currently emit a `POLICY_CREATED` event that the rules engine could listen for.

### 3.3. Automated Lead Assignment

-   **What Already Exists:**
    -   N/A. There is no functional implementation of this feature.
-   **What is Partially Implemented:**
    -   A rule definition exists in `data/rules/lead-assignments.rules.json` to assign high-value leads to a specific agent. The `ActionType.ASSIGN_LEAD` is also correctly defined in `types.ts`.
    -   The `Customer` data model has an `assignedAgentId` field.
-   **What is Completely Missing:**
    -   The "Rules Engine Runner" to process the lead assignment rule.
    -   A trigger point within the lead creation logic (e.g., in `useCrmData.ts`'s `addLead` function) to invoke the rules engine.
    -   The `Lead` data model is missing an `assignedAgentId` field to store the result of the assignment before the lead is converted to a customer.

---

## 4. Core Missing Component: The Rules Engine Runner

The primary gap across all requirements is the absence of a central **"Rules Engine Runner"** service. This service is the brain that would connect the data models (JSON rules) to the application's business logic.

A functional implementation of this service would need to:
1.  Be invoked by specific events in the application (e.g., `NEW_LEAD_CREATED`, a daily cron job).
2.  Load and parse the relevant `.rules.json` files based on the event.
3.  For each rule, evaluate its `conditions` against the data payload provided by the trigger (e.g., a `Lead` object, a `Policy` object).
4.  If all conditions pass, execute the defined `actions` by calling appropriate services (e.g., a `TaskService` to create tasks, an `EmailService` to send emails, or `useCrmData` to update a lead's `assignedAgentId`).

---

## 5. Recommended Enhancement Priorities

1.  **High Priority: Implement the Core "Rules Engine Runner" Service.** This is the foundational component required to unlock all other automation features. It should be designed to be generic and event-driven.

2.  **High Priority: Refactor Renewal Reminders.** Modify the existing `renewalAutomation.ts` service to utilize the new "Rules Engine Runner" and process the `renewal-reminders.rules.json` file. This will validate the new engine and remove the current hardcoded logic.

3.  **Medium Priority: Implement Automated Lead Assignment.**
    -   Update the `Lead` type in `types.ts` to include an optional `assignedAgentId`.
    -   Integrate the "Rules Engine Runner" into the `addLead` function in `useCrmData.ts`.
    -   Update the UI (e.g., `LeadsTable`) to display the assigned agent.

4.  **Medium Priority: Implement Payment Reminders.**
    -   Create a new trigger service that simulates a daily check for overdue payments.
    -   This service should invoke the "Rules Engine Runner" with a `PAYMENT_DUE` event.
    -   Create a mock `EmailService` that logs to the console to handle the `SEND_EMAIL` action.

5.  **Low Priority: Implement New Policy Task Creation.**
    -   Integrate the "Rules Engine Runner" into the logic where new policies are added to a customer (`CustomerFormModal.tsx` or `useCrmData.ts`) to fire a `POLICY_CREATED` event.
