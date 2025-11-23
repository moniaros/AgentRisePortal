# Flexible Credit Overage System - API Integration Guide

## 1. Overview
This document outlines the architecture for the **Flex-Budget** system. This system allows users to consume AI credits beyond their subscription allowance up to a user-defined monetary cap. This ensures service continuity while preventing "bill shock."

## 2. Data Model Updates

### 2.1 User/Organization Entity
Add the following fields to the Organization or Billing entity:

```json
{
  "billing": {
    "planId": "pro_tier",
    "baseCredits": 5000,
    "usedBaseCredits": 5000,
    "overage": {
      "isEnabled": true,
      "monthlyBudgetCap": 50.00, // User defined limit in currency
      "currentCycleUsageCost": 12.50, // Accrued cost this cycle
      "alertThresholds": [80, 100], // Percentages to trigger emails
      "lastAlertSentAt": 80 // Tracks which alert was sent
    }
  }
}
```

## 3. Operational Logic

### 3.1 The Metering Service (Middleware)
Before processing any request to `POST /ai/generate`, the backend must perform a **Credit Check Gate**:

1.  **Check Base Balance:** If `usedBaseCredits < baseCredits`, allow request. Increment `usedBaseCredits`.
2.  **If Base Depleted:** Check `overage.isEnabled`.
    *   *If False:* Return `402 Payment Required` (Quota Exceeded).
    *   *If True:* Calculate estimated cost of request.
3.  **Check Budget Cap:**
    *   `IF (overage.currentCycleUsageCost + estimatedRequestCost) <= overage.monthlyBudgetCap`:
        *   Allow request.
        *   Increment `overage.currentCycleUsageCost`.
        *   Trigger **Alert Async Job**.
    *   `ELSE`:
        *   Return `402 Payment Required` (Budget Cap Reached).

### 3.2 Alerting System (Async Job)
After every overage increment:
1.  Calculate `usagePercent = (currentCycleUsageCost / monthlyBudgetCap) * 100`.
2.  If `usagePercent >= 80` AND `lastAlertSentAt < 80`:
    *   Send **"Approaching Limit"** email/notification.
    *   Update `lastAlertSentAt = 80`.
3.  If `usagePercent >= 100` AND `lastAlertSentAt < 100`:
    *   Send **"Limit Reached - Service Paused"** email/notification.
    *   Update `lastAlertSentAt = 100`.

## 4. API Endpoints

### 4.1 Get Usage Status
`GET /api/v1/billing/usage`

**Response:**
```json
{
  "planName": "Professional",
  "cycleResetDate": "2024-11-01",
  "credits": {
    "total": 5000,
    "used": 5000,
    "remaining": 0
  },
  "overage": {
    "active": true,
    "cap": 50.00,
    "currentCost": 12.50,
    "projectedCost": 45.00
  }
}
```

### 4.2 Update Overage Settings
`PATCH /api/v1/billing/overage-settings`

**Request:**
```json
{
  "isEnabled": true,
  "monthlyBudgetCap": 100.00
}
```

**Validation Logic:**
*   `monthlyBudgetCap` cannot be lower than `currentCycleUsageCost` (to prevent retroactive lockout logic errors).
*   Trigger a `$0` or `$1` auth hold on the payment method if enabling for the first time to ensure solvability.

## 5. Revenue Recognition (Stripe Integration)
This system works best with **Stripe Metered Billing**.

1.  Create a Product in Stripe called "AI Overage Token".
2.  Set it to **Graduated Pricing** or **Per Unit**.
3.  Report usage via `stripe.subscriptionItems.createUsageRecord` asynchronously.
4.  The `monthlyBudgetCap` acts as a logic gate on your server; Stripe simply bills what you report.

