# AgentOS - Notification Preferences Feature

This document outlines the Notification Preferences feature added to the Settings page.

## 1. Feature Overview

The Notification Preferences panel allows users to opt-in to receiving real-time browser and sound notifications for critical CRM events, such as the arrival of a new lead.

## 2. Technical Implementation

- **State Management**: The user's preference is managed by the `useNotificationPreferences` custom hook. This hook persists the boolean state to `localStorage` under the key `notification_preferences_enabled`, ensuring the choice is remembered across sessions.

- **Browser Permissions**:
    - The feature utilizes the standard browser **Notification API**.
    - When a user enables the toggle for the first time, the application calls `Notification.requestPermission()`. The preference is only saved and enabled if the user grants permission.
    - If permission is denied, a warning notification is displayed to the user, and the toggle remains in the "off" state. The user must then manually change the permission in their browser's site settings to re-enable the feature.

- **Sound Alerts**:
    - A simple, non-intrusive sound alert is played alongside the visual browser notification to draw the user's attention.
    - The sound is an embedded Base64 WAV data URI located in `constants/sounds.ts`. This avoids the need for external file dependencies and is played using the browser's native `Audio` constructor.

- **Demo Functionality & User Experience**:
    - To provide immediate feedback and confirm the setup, a demo notification (both visual and audible) is triggered immediately after the user grants permission.
    - A "Preview Demo Notification" link is also available within the settings panel, allowing users to test the notification's appearance and sound at any time.
    - The content of this demo notification, along with all UI labels, is fully localized in both English and Greek.
    
     <!-- Placeholder for screenshot -->

## 3. Side Effects & Considerations

- **User Interruption**: As this feature generates system-level notifications, it is designed as an opt-in to respect the user's workflow and avoid unwanted interruptions.
- **Browser Support**: The feature relies on browser support for the Notification API. A check is in place to inform users if their browser is not supported.
- **Future Extension**: The `notificationService.ts` is built to be extensible. New notification types for different CRM events (e.g., "New Message", "Task Assigned") can be easily added by calling the core `showBrowserNotification` and `playSound` functions with different localized content.
