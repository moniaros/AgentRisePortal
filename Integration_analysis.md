# System Integration & Data Architecture Analysis

**Date:** October 29, 2024  
**Author:** Product Management Office  
**Version:** 1.0  
**Status:** Draft / Planning

---

## 1. Executive Summary

AgentOS is currently operating in a **Standalone/Offline-First** mode. The data layer relies on a simulated backend implemented via `MockRepository` classes in `services/api.ts` and static JSON fixtures located in the `data/` directory. State persistence is handled via `localStorage` to mimic database retention during user sessions.

To transition AgentOS to a production-ready enterprise environment, we must migrate from this client-side mock architecture to a robust, server-side API architecture. This document outlines the current data structures, the target architecture, and a step-by-step guide for engineering teams to replace dummy data with real RESTful or GraphQL endpoints.

---

## 2. Current Data Architecture (As-Is)

### 2.1 Data Access Layer (DAL)
The application uses a Service-Repository pattern located in `services/api.ts`. 
- **MockRepository Class:** Simulates async CRUD operations (`getAll`, `getById`, `create`, `update`, `delete`) with artificial latency.
- **Data Source:** 
  - Static JSON files (e.g., `data/leads.json`, `data/opportunities.json`).
  - In-memory constants (`data/mockData.ts`).
- **Persistence:** `localStorage` is used as a pseudo-database. If `localStorage` is empty, it seeds data from the JSON files.

### 2.2 State Management & Caching
- **Custom Hooks:** `useOfflineSync` is the core hook managing data fetching and caching. It prioritizes local storage (offline capability) and falls back to "network" (currently mocked) calls.
- **Context API:** Used for global session state (`AuthContext`, `LanguageContext`).

### 2.3 Entity Relationships (Implicit)
Relationships are currently logical and enforced by the frontend application code, not a database schema.
- **User -> Agency:** Linked via `agencyId`.
- **Lead -> Customer:** Linked via conversion logic (`convertLeadToCustomer` in `useCrmData.ts`).
- **Opportunity -> Prospect/Inquiry:** Linked via ID references (`prospectId`, `inquiryId`).

---

## 3. Integration Strategy: Swapping Mocks for Real APIs

### Phase 1: Environment Configuration
We must externalize configuration to support different environments (Dev, Staging, Prod).

**Action Items:**
1. Create `.env` files (`.env.development`, `.env.production`).
2. Define base API URL: `VITE_API_BASE_URL=https://api.agentos.com/v1`.
3. Define API keys (if not using proxy): `VITE_API_KEY=...`.

### Phase 2: The API Client Wrapper
Replace the direct usage of `MockRepository` with a standardized HTTP client.

**Implementation Guide:**
Create `services/httpClient.ts` using `fetch` or `axios`. This client must handle:
- Base URL injection.
- Authorization headers (Bearer Token from `AuthContext`).
- Global error handling (401 Unauthorized, 500 Server Error).
- Response transformation.

```typescript
// Example Concept
const apiClient = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = sessionStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${process.env.VITE_API_BASE_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) throw new Error('API Error');
  return response.json();
}
```

### Phase 3: Refactoring Service Layer
Modify `services/api.ts` to toggle between Mock and Real implementation based on environment or configuration flags.

**Current:**
```typescript
export const leadService = new MockRepository<Lead>('leads', '/data/allLeads.json');
```

**Target:**
```typescript
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const fetchAllLeads = async (): Promise<Lead[]> => {
  if (USE_MOCK) {
    return leadService.getAll(); // Keep existing mock for dev/testing
  }
  return apiClient<Lead[]>('/leads'); // Real API call
};
```

---

## 4. Data Mapping & Endpoint Definition

The following table maps our current JSON fixtures to required API Endpoints. Backend engineers should ensure response payloads match the TypeScript interfaces defined in `types.ts`.

| Domain | JSON Source File | TypeScript Interface | Target API Endpoint (REST) | Methods Required |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `MOCK_USERS` (in mockData.ts) | `User` | `/auth/login`, `/auth/me` | POST, GET |
| **CRM** | `data/customers.json` | `Customer` | `/customers` | GET, POST, PUT, DELETE |
| **Leads** | `data/allLeads.json` | `Lead` | `/leads` | GET, POST, PUT (Status Update) |
| **Pipeline** | `data/opportunities_ext.json` | `Opportunity__EXT` | `/pipeline/opportunities` | GET, POST, PATCH (Stage Drag&Drop) |
| **Inquiries** | `data/transaction_inquiries.json` | `TransactionInquiry` | `/pipeline/inquiries` | GET, POST |
| **Policies** | `localStorage` (AgentOS_Policies) | `PolicyACORD` | `/policies/acord` | GET, POST (Sync) |
| **Tasks** | `data/tasks.json` | `Task` | `/tasks` | GET, POST, PATCH (Complete) |
| **Analytics** | `data/analytics.json` | `AnalyticsData` | `/analytics/campaigns` | GET (Aggregated) |
| **Automation** | `data/rules/*.json` | `AutomationRule` | `/automation/rules` | GET, POST, PUT, DELETE |
| **Logs** | `Mock Audit Logs` | `AuditLog` | `/system/audit-logs` | GET, POST (Log Action) |

---

## 5. Special Integration Considerations

### 5.1 Authentication Flow
*   **Current:** `AuthContext` sets a mock user in SessionStorage.
*   **Target:**
    1.  Login form submits credentials to `/auth/login`.
    2.  API returns JWT Access Token + Refresh Token.
    3.  Store Tokens in `localStorage` (or HttpOnly Cookie).
    4.  `AuthContext` decodes JWT to get User Profile (`User` object).

### 5.2 AI Integration (Gemini)
*   **Current:** Frontend calls Google Gemini API directly using `process.env.API_KEY`.
*   **Target (Security Best Practice):**
    1.  **Frontend:** Sends prompt/context to *AgentOS Backend* endpoint (e.g., `/api/ai/generate-reply`).
    2.  **Backend:** Validates request, rate-limits, and calls Gemini API securely.
    3.  **Backend:** Returns generated text to Frontend.
    *Reasoning:* This prevents exposing the Google API Key to the client browser.

### 5.3 ACORD Policy Sync
*   **Current:** `usePolicySync` reads from `localStorage` and updates `useCrmData`.
*   **Target:** 
    1.  `usePolicySync` should serialize the ACORD JSON blob.
    2.  POST to `/customers/{id}/policies/sync`.
    3.  Backend parses ACORD data, updates SQL tables (Policies, Coverages, Vehicles), and returns the updated Customer object.

### 5.4 Offline Logic
The `useOfflineSync` hook is a valuable asset. We should retain it but modify the `fetcher` function.
*   **Logic:** 
    1.  Try `apiClient.get()`.
    2.  If successful -> Update State & `localStorage`.
    3.  If network error -> Read from `localStorage` & Show "Offline Mode" banner.
    4.  If write operation (POST/PUT) while offline -> Queue request in `IndexedDB` (Background Sync API) to retry when online.

---

## 6. Migration Checklist

- [ ] **Backend:** Implement API endpoints matching `types.ts` interfaces.
- [ ] **Backend:** Implement CORS policies to allow requests from the frontend domain.
- [ ] **Frontend:** Create `apiClient` abstraction.
- [ ] **Frontend:** Refactor `AuthContext` to use JWT.
- [ ] **Frontend:** Update `services/api.ts` to use `apiClient`.
- [ ] **Frontend:** Remove `data/*.json` imports from production build (dynamic import or conditional logic).
- [ ] **QA:** Verify data integrity (Dates, Currency formats) between JSON mocks and real API responses.
