# AgentRise: Application Documentation

This document provides a technical reference for key features of the AgentRise web application.

## Settings Page

The settings page provides a centralized location for configuring essential API keys and third-party integrations.

### UI and Functionality

The page is divided into two main sections: Setup and Integrations.

#### 1. Setup Form

This section contains a form for inputting and saving crucial API credentials.

-   **Google Cloud Client ID:** A text input field where the user enters their Google Cloud project's OAuth 2.0 Client ID. This is necessary for authenticating with Google services.
-   **Gemini API Key:** A password input field for the user's Gemini API key. The input is masked for security during entry.
-   **Save Settings Button:** When clicked, this button persists both the Client ID and the API Key into the browser's `localStorage`. A success notification appears to confirm the action.

#### 2. Integrations

This section manages connections to external services.

-   **Connect Google Business Profile Button:** This button initiates the Google OAuth 2.0 flow to connect the user's Google Business Profile.
-   **Status Indicator:** A text label displays the current connection state (e.g., "Status: Not Connected", "Status: Connected to My Business").

#### OAuth Flow and Location Selection

1.  **Initiation:** Clicking the "Connect" button starts the process. It requires the "Google Cloud Client ID" to be saved first.
2.  **Authentication:** The app uses Google's `gapi` library to prompt the user to sign in and grant permission for the `https://www.googleapis.com/auth/business.manage` scope.
3.  **Account Discovery:** Upon successful authentication, the application makes an API call to `accounts.list` to find all Google Business Profile accounts associated with the user.
4.  **Location Discovery:** Using the first account found, the app then calls `locations.list` to retrieve a list of business locations managed by that account.
5.  **Automatic Selection:** The application automatically selects the **first** business location from the list.
6.  **Storage:** The selected location's title (e.g., `My Business`) and its unique resource name (e.g., `accounts/123/locations/456`) are saved to the browser's `localStorage`.
7.  **Confirmation:** The status indicator updates to show the connected business name, and the user is redirected to the Dashboard.

### LocalStorage Usage

-   `google_client_id`: Stores the Google Cloud Client ID as a plain text string.
-   `gemini_api_key`: Stores the Gemini API Key as a plain text string. **Note:** While the input field is masked, the key is stored in plain text in `localStorage`.
-   `gbp_location_title`: Stores the title (business name) of the connected Google Business Profile location.
-   `gbp_location_name`: Stores the full resource name (e.g., `accounts/{accountId}/locations/{locationId}`) of the connected location.

## Dashboard Page

The Dashboard is the main landing page after a user has successfully connected their Google Business Profile. It provides an at-a-glance summary of their business's online reputation.

### Authentication and Redirection

On page load, the application checks `localStorage` for `gbp_location_name`. It also verifies that the user is signed in via the Google API client (`gapi`). If either of these checks fails, the user is immediately redirected to the `/settings` page to complete the connection.

### API Calls and Data Display

If authenticated, the Dashboard makes the following simulated API calls:

1.  **`locations.get`**:
    -   **Purpose:** To fetch the overall business summary.
    -   **Data Used:** The `title`, `averageRating`, and `totalReviewCount` fields are extracted and displayed in a prominent summary section.

2.  **`locations.reviews.list`**:
    -   **Purpose:** To fetch the most recent reviews for the business.
    -   **Data Used:** The 20 most recent reviews are retrieved. For each review, the `reviewer.displayName`, `starRating`, `comment`, and `createTime` fields are used to render a list of review cards.

### Local Development

For local development, these API calls are mocked by fetching data from static JSON files:
-   `/data/gbp_location.json` (for the business summary)
-   `/data/gbp_reviews.json` (for the list of reviews)
This allows for UI development and testing without requiring live API credentials.
