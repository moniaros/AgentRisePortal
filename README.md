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

-   **Connect Google Business Profile Button:** This button initiates the Google OAuth 2.0 flow.
    -   It uses the Client ID saved in `localStorage`.
    -   It requests the `https://www.googleapis.com/auth/business.manage` scope, which is required for managing a user's Google Business Profile.
    -   The user is prompted with Google's standard consent screen.
-   **Status Indicator:** A text label displays the current connection state (e.g., "Status: Not Connected", "Status: Connecting...", "Status: Connected", "Status: Connection failed").

### LocalStorage Usage

The Settings page utilizes `localStorage` to persist credentials across browser sessions.

-   **`google_client_id`**: Stores the Google Cloud Client ID as a plain text string.
-   **`gemini_api_key`**: Stores the Gemini API Key as a plain text string. **Note:** While the input field is masked, the key is stored in plain text in `localStorage`.
