# Frontend API Integration Guide

This guide explains how the frontend connects to the backend API and how to use the API services in your components.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Environment Configuration](#environment-configuration)
- [API Services](#api-services)
- [Authentication Flow](#authentication-flow)
- [Using API Services in Components](#using-api-services-in-components)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Architecture Overview

The frontend uses a **service layer pattern** to communicate with the backend API:

```
Components/Pages → Custom Hooks → API Services → API Client (Axios) → Backend API
```

### Key Files

- **`src/services/apiClient.ts`** - Axios instance with request/response interceptors
- **`src/services/authService.ts`** - Authentication operations (login, logout, register)
- **`src/services/customerService.ts`** - Customer CRM operations
- **`src/services/leadService.ts`** - Lead management operations
- **`src/services/policyService.ts`** - Insurance policy operations
- **`src/services/campaignService.ts`** - Marketing campaign operations
- **`src/services/analyticsService.ts`** - Analytics and reporting operations
- **`context/AuthContext.tsx`** - Authentication state management
- **`hooks/useCrmData.ts`** - CRM data hook (customers & leads)

## Environment Configuration

### 1. Environment Variables

Create a `.env` file in the project root:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api/v1

# Optional: Application settings
VITE_APP_NAME=AgentRise Insurance Portal
VITE_APP_VERSION=1.0.0
```

### 2. Access Environment Variables

In your code:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

**Note:** Environment variables in Vite must be prefixed with `VITE_` to be exposed to the client.

## API Services

### API Client (`apiClient.ts`)

The API client is a configured Axios instance that:

1. **Adds auth tokens** to all requests automatically
2. **Handles token refresh** when access tokens expire
3. **Redirects to login** if authentication fails

#### Request Interceptor

```typescript
// Automatically adds Authorization header
config.headers.Authorization = `Bearer ${accessToken}`;
```

#### Response Interceptor

```typescript
// Automatically refreshes expired tokens and retries requests
if (error.response?.status === 401) {
  // Try to refresh token
  const { accessToken } = await refreshTokenAPI();
  // Retry original request
  return apiClient(originalRequest);
}
```

### Authentication Service (`authService.ts`)

```typescript
import { authService } from './services/authService';

// Login
const { user, accessToken, refreshToken } = await authService.login({
  email: 'agent@agentrise.com',
  password: 'password123'
});

// Get current user
const currentUser = await authService.getCurrentUser();

// Update profile
await authService.updateProfile({
  firstName: 'John',
  lastName: 'Doe',
  phone: '555-1234'
});

// Change password
await authService.changePassword({
  currentPassword: 'oldPassword',
  newPassword: 'newPassword'
});

// Logout
await authService.logout();
```

### Customer Service (`customerService.ts`)

```typescript
import { customerService } from './services/customerService';

// Get all customers with pagination
const { data, pagination } = await customerService.getCustomers({
  page: 1,
  limit: 50,
  status: 'active',
  search: 'john'
});

// Get customer by ID
const customer = await customerService.getCustomerById(123);

// Create customer
const { id } = await customerService.createCustomer({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '555-1234'
});

// Update customer
await customerService.updateCustomer(123, {
  status: 'inactive'
});

// Delete customer
await customerService.deleteCustomer(123);

// Add timeline entry
await customerService.addTimelineEntry(123, {
  entryType: 'note',
  title: 'Customer Follow-up',
  description: 'Called customer about renewal'
});
```

### Lead Service (`leadService.ts`)

```typescript
import { leadService } from './services/leadService';

// Get all leads
const { data, pagination } = await leadService.getLeads({
  status: 'new',
  source: 'Facebook Ad'
});

// Create lead
const { id } = await leadService.createLead({
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  source: 'Google Search',
  interest: 'auto'
});

// Update lead
await leadService.updateLead(456, {
  status: 'contacted'
});

// Convert lead to customer
const { customerId } = await leadService.convertLead(456);
```

### Policy Service (`policyService.ts`)

```typescript
import { policyService } from './services/policyService';

// Get policies for a customer
const { policies } = await policyService.getPolicies({
  customerId: 123
});

// Create policy
const { id } = await policyService.createPolicy({
  customerId: 123,
  policyNumber: 'AUTO-2024-001',
  policyType: 'auto',
  insurer: 'State Farm',
  effectiveDate: '2024-01-01',
  expirationDate: '2025-01-01',
  premiumAmount: 1200,
  coverageAmount: 100000
});

// Update policy
await policyService.updatePolicy(789, {
  status: 'expired'
});
```

### Campaign Service (`campaignService.ts`)

```typescript
import { campaignService } from './services/campaignService';

// Get all campaigns
const campaigns = await campaignService.getCampaigns();

// Create campaign
const { id } = await campaignService.createCampaign({
  name: 'Spring Auto Insurance Sale',
  objective: 'Lead Generation',
  budget: 5000,
  platforms: ['Facebook', 'Google']
});

// Update campaign
await campaignService.updateCampaign(101, {
  status: 'paused'
});
```

### Analytics Service (`analyticsService.ts`)

```typescript
import { analyticsService } from './services/analyticsService';

// Get dashboard stats
const stats = await analyticsService.getDashboardStats();
// Returns: { customers, policies, leads, campaigns }

// Get revenue analytics
const revenue = await analyticsService.getRevenueAnalytics('2024-01-01', '2024-12-31');

// Get lead funnel data
const funnel = await analyticsService.getLeadFunnelAnalytics();
```

## Authentication Flow

### 1. Login Process

```typescript
// In your login component
import { useAuth } from './hooks/useAuth';

const { login } = useAuth();

const handleLogin = async () => {
  const success = await login(email, password);
  if (success) {
    // Redirect to dashboard
    navigate('/');
  } else {
    // Show error message
    setError('Invalid credentials');
  }
};
```

### 2. Protected Routes

The `Layout` component automatically checks authentication:

```typescript
// In Layout.tsx
const { currentUser, loading } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}

if (!currentUser) {
  return <Navigate to="/login" replace />;
}
```

### 3. Token Storage

- **Access Token**: Stored in `localStorage.accessToken` (7 day expiry)
- **Refresh Token**: Stored in `localStorage.refreshToken` (30 day expiry)
- **User Data**: Stored in `localStorage.currentUser`

### 4. Token Refresh

Automatic token refresh handled by `apiClient` interceptor:

```typescript
// When API returns 401
→ Get refresh token from localStorage
→ Call POST /api/v1/auth/refresh
→ Update accessToken in localStorage
→ Retry original request with new token
```

### 5. Logout

```typescript
const { logout } = useAuth();

await logout(); // Clears tokens and redirects to login
```

## Using API Services in Components

### Example: Customer List Component

```typescript
import { useState, useEffect } from 'react';
import { customerService } from '../services/customerService';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const { data } = await customerService.getCustomers({ limit: 50 });
        setCustomers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {customers.map(customer => (
        <div key={customer.id}>{customer.firstName} {customer.lastName}</div>
      ))}
    </div>
  );
};
```

### Example: Using `useCrmData` Hook

```typescript
import { useCrmData } from '../hooks/useCrmData';

const CRMDashboard = () => {
  const {
    customers,
    leads,
    isLoading,
    error,
    addCustomer,
    updateCustomer
  } = useCrmData();

  const handleAddCustomer = async () => {
    await addCustomer({
      party: {
        partyName: { firstName: 'John', lastName: 'Doe' },
        contactInfo: { email: 'john@example.com', phone: '555-1234' }
      }
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Customers: {customers.length}</h1>
      <h1>Leads: {leads.length}</h1>
      <button onClick={handleAddCustomer}>Add Customer</button>
    </div>
  );
};
```

## Error Handling

### API Error Response Format

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required",
      "value": "invalid-email"
    }
  ]
}
```

### Handling Errors in Components

```typescript
try {
  await customerService.createCustomer(data);
} catch (error: any) {
  if (error.response?.data) {
    // API error response
    const { message, errors } = error.response.data;
    console.error('API Error:', message, errors);
    setErrorMessage(message);
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.message);
    setErrorMessage('Network error. Please check your connection.');
  } else {
    // Other error
    console.error('Error:', error.message);
    setErrorMessage('An unexpected error occurred.');
  }
}
```

### Common HTTP Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (invalid/expired token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate entry)
- **500** - Internal Server Error

## Best Practices

### 1. Always Use Try-Catch

```typescript
const handleSubmit = async () => {
  try {
    await customerService.createCustomer(formData);
    showSuccessMessage('Customer created');
  } catch (error) {
    showErrorMessage('Failed to create customer');
  }
};
```

### 2. Show Loading States

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await customerService.createCustomer(formData);
  } finally {
    setIsSubmitting(false);
  }
};
```

### 3. Use Optimistic Updates (Optional)

```typescript
// Immediately update UI
setCustomers(prev => [...prev, newCustomer]);

// Then sync with API
try {
  await customerService.createCustomer(data);
} catch (error) {
  // Revert on error
  setCustomers(prev => prev.filter(c => c.id !== newCustomer.id));
}
```

### 4. Invalidate/Refresh Data After Mutations

```typescript
const handleDelete = async (id) => {
  await customerService.deleteCustomer(id);
  // Refresh list
  const { data } = await customerService.getCustomers();
  setCustomers(data);
};
```

### 5. Don't Store Sensitive Data in State

```typescript
// ❌ Bad
const [password, setPassword] = useState('');

// ✅ Good - use form ref or local variable
const passwordRef = useRef('');
```

### 6. Implement Debouncing for Search

```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query) => {
  const { data } = await customerService.getCustomers({ search: query });
  setResults(data);
}, 300);

const handleSearch = (e) => {
  debouncedSearch(e.target.value);
};
```

### 7. Use AbortController for Cleanup

```typescript
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const { data } = await customerService.getCustomers();
      if (!controller.signal.aborted) {
        setCustomers(data);
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(error.message);
      }
    }
  };

  fetchData();

  return () => controller.abort();
}, []);
```

## Testing the Integration

### 1. Start the Backend

```bash
cd backend
npm run dev
```

Backend should be running at `http://localhost:5000`

### 2. Start the Frontend

```bash
npm run dev
```

Frontend should be running at `http://localhost:5173`

### 3. Test Login

Use the demo credentials:
- **Email**: agent@agentrise.com
- **Password**: password123

### 4. Check Browser Console

Open DevTools → Network tab to see API requests

### 5. Check localStorage

Open DevTools → Application → Local Storage to see stored tokens

## Troubleshooting

### CORS Errors

If you see CORS errors:

1. Check backend `.env`:
   ```env
   CORS_ORIGIN=http://localhost:5173
   ```

2. Restart backend server

### 401 Unauthorized Errors

1. Check if access token is in localStorage
2. Try logging out and logging in again
3. Check backend JWT_SECRET matches

### Network Errors

1. Ensure backend is running (`npm run dev` in backend folder)
2. Check `VITE_API_URL` in frontend `.env`
3. Check firewall/network settings

### Database Errors

1. Ensure MySQL is running
2. Run migrations: `cd backend && npm run db:migrate`
3. Seed demo data: `npm run db:seed`

## Migration from Mock Data

The following have been updated to use real API:

- ✅ `context/AuthContext.tsx` - Authentication
- ✅ `hooks/useCrmData.ts` - CRM operations
- ⏳ Other hooks (campaigns, analytics, etc.) - Use service layer directly

### Still Using Mock Data

Some features still use mock data and need to be migrated:

- [ ] `hooks/useCampaigns.ts` - Replace with campaignService
- [ ] `hooks/useAutomationRules.ts` - Need automation service integration
- [ ] `pages/GapAnalysis.tsx` - AI integration pending
- [ ] `pages/Dashboard.tsx` (GBP reviews) - Need GBP service integration

## Next Steps

1. **Test authentication flow** - Login/logout
2. **Test CRM operations** - Add/edit/delete customers and leads
3. **Implement remaining hooks** - Migrate other hooks to use API services
4. **Add error boundaries** - Better error handling UI
5. **Implement caching** - Consider React Query or SWR
6. **Add loading indicators** - Better UX for async operations

---

For more information, see:
- Backend API Documentation: `backend/README.md`
- Backend Setup Guide: `backend/SETUP_GUIDE.md`
- Frontend Environment Setup: `.env.example`
