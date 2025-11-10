# Rules Engine: Developer Guide

## 1. Architecture Overview

The AgentRise automation system is a flexible, JSON-configured rules engine designed to automate common business logic without requiring code changes for every new rule. The architecture is based on a simple, event-driven model:

1.  **Event Trigger**: An event occurs in the application (e.g., a daily scheduled check, a new lead being created).
2.  **Rule Loading**: The relevant service (e.g., `renewalAutomation.ts`) loads a set of rule definitions from a corresponding JSON file (e.g., `renewal-reminders.rules.json`).
3.  **Condition Evaluation**: For each rule triggered by the event, the engine evaluates a set of conditions against the context data (e.g., a `Policy` or `Customer` object).
4.  **Action Execution**: If all conditions are met, the engine executes one or more predefined actions (e.g., creates a task, sends a mock email).

The core logic for evaluating rules is centralized in `services/automation.utils.ts` to ensure consistency and testability.

---

## 2. Data Model Specifications

The engine is defined by a set of TypeScript interfaces located in `types.ts`.

### `RuleDefinition`

This is the top-level object for a single rule.

-   `id` (string): Unique identifier (e.g., "RR-001").
-   `name` (string): Human-readable name.
-   `trigger` (object): Defines what event starts the rule evaluation.
-   `conditions` (array): A list of conditions that must all be true.
-   `actions` (array): A list of actions to execute if conditions pass.
-   `isEnabled` (boolean): Allows for easily disabling a rule without deleting it.

### `Trigger`

-   `eventType` (enum `TriggerEventType`): The specific event name.
-   `parameters` (object, optional): Key-value pairs for event-specific data, like `daysBefore: 30`.

### `Condition`

-   `field` (string): A dot-notation path to a value in the context object (e.g., `policy.type`).
-   `operator` (enum): The comparison to perform (e.g., `EQUALS`, `GREATER_THAN`).
-   `value` (any): The value to compare against.

### `Action`

-   `actionType` (enum): The type of action to perform (e.g., `CREATE_TASK`, `SEND_EMAIL`).
-   `template` (string, optional): A string with `{variable}` placeholders for generating content.
-   `parameters` (object, optional): Key-value pairs for action-specific data, like `templateId`.

---

## 3. How to Extend the Engine

### How to Add a New Trigger Type

Let's say you want to add a trigger for when a customer's timeline event is flagged.

1.  **Update `types.ts`**: Add the new event to the `TriggerEventType` union type.
    ```typescript
    export type TriggerEventType = 
        | 'POLICY_EXPIRING_SOON'
        // ... existing types
        | 'TIMELINE_EVENT_FLAGGED'; // Add new type
    ```

2.  **Create or Modify a Service**: You need a service that will fire this trigger. This could be a new service or an existing one. For example, you could modify `useCrmData.ts`:

    ```typescript
    // in useCrmData.ts
    const toggleTimelineEventFlag = useCallback((customerId: string, eventId: string) => {
        // ... existing logic to update the event ...

        // NEW: After updating, invoke the rules engine
        // This part needs to be built, but conceptually:
        // const eventContext = { customer, event };
        // runRulesForTrigger('TIMELINE_EVENT_FLAGGED', eventContext);

    }, [/* dependencies */]);
    ```

3.  **Create a Rule Definition**: In a relevant JSON file (e.g., `data/rules/task-creation.rules.json`), create a new rule using your trigger.
    ```json
    {
      "id": "TC-002",
      "name": "Follow up on Flagged Timeline Event",
      "trigger": {
        "eventType": "TIMELINE_EVENT_FLAGGED"
      },
      "conditions": [],
      "actions": [{
        "actionType": "CREATE_TASK",
        "template": "Review flagged event for customer {customer.firstName}."
      }],
      "isEnabled": true
    }
    ```

### How to Add a New Action Type

Let's say you want to add an action to update a customer's `attentionFlag`.

1.  **Update `types.ts`**: Add the new action to the `actionType` in the `Action` interface.
    ```typescript
    // In RuleDefinition interface
    actions: {
        actionType: 'CREATE_TASK' | 'SEND_EMAIL' | 'SEND_SMS' | 'UPDATE_ATTENTION_FLAG'; // Add new action
        // ...
    }[];
    ```

2.  **Update the Automation Service**: In the service that will handle this action (e.g., `paymentAutomation.ts`), extend the `switch` statement in the `forEach(action => ...)` loop.

    ```typescript
    // in runPaymentChecks (or other service)
    switch (action.actionType) {
        case 'CREATE_TASK':
            // ... existing logic
            break;
        
        // NEW ACTION HANDLER
        case 'UPDATE_ATTENTION_FLAG':
            if (action.template) {
                const reason = renderTemplate(action.template, templateData);
                console.log(`[AUTOMATION] Mock Set Attention Flag for customer ${customer.id} with reason: ${reason}`);
                // In a real app, you would call a function here to update the customer state, e.g.:
                // updateCustomerAttentionFlag(customer.id, reason);
            }
            break;
        
        // ... other cases
    }
    ```

3.  **Create a Rule Definition**: Use your new action in a JSON rule file.
    ```json
    {
      "id": "AF-001",
      "name": "Flag Customer on Second Overdue Payment",
      "trigger": { "eventType": "PAYMENT_OVERDUE_3_DAYS" },
      "conditions": [{
          "field": "customer.overduePaymentCount", 
          "operator": "GREATER_THAN",
          "value": 1
      }],
      "actions": [{
        "actionType": "UPDATE_ATTENTION_FLAG",
        "template": "Customer has multiple overdue payments. Please review account."
      }],
      "isEnabled": true
    }
    ```
