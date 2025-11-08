# AgentRise: Insurance Lead & Policy Management Platform

## Project Description

AgentRise is a modern, comprehensive, and bilingual (Greek/English) front-end platform designed for insurance professionals. It serves as an MVP to showcase a powerful suite of tools for lead generation, customer relationship management (CRM), and policy administration. Key features include an AI-powered gap analysis tool using Google Gemini, a customizable microsite builder, and full offline capabilities, making it a versatile solution for the modern insurance agent.

---

## Technologies Used

This project is built with a focus on stability and modern development practices, using a browser-native ES module setup without a build step.

- **Front-End:** [React](https://react.dev/) (v19, Stable), [TypeScript](https://www.typescriptlang.org/)
- **Routing:** [React Router DOM](https://reactrouter.com/) (v7)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v3, via CDN)
- **Data Visualization:** [Recharts](https://recharts.org/)
- **AI Integration:** [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
- **Data Source:** Static JSON files simulating a REST API.

---

## Installation Instructions

This project is designed to run directly in the browser without a complex build setup.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/agentrise-platform.git
    cd agentrise-platform
    ```

2.  **Set up the Google Gemini API Key:**
    This project requires a Google Gemini API key for its AI-powered features. The application expects this key to be available as an environment variable (`API_KEY`). The development environment will prompt you to provide one if it's not detected.

3.  **Serve the project locally:**
    You can use any simple local web server. Here are two common options:

    *   **Using Python:**
        ```bash
        python -m http.server
        ```
    *   **Using Node.js (with `serve`):**
        ```bash
        npx serve
        ```

4.  **Access the application:**
    Open your browser and navigate to the local address provided by your server (e.g., `http://localhost:8000`).

---

## Features Overview

-   **Dashboard:** A central hub visualizing key metrics like new leads, monthly revenue, and policy type distribution.
-   **Lead Generation:** Manage incoming leads from social media with advanced filtering, sorting, and tagging capabilities.
-   **Micro-CRM:** A lightweight CRM to add, view, and edit customer profiles and their associated insurance policies.
-   **Policyholder Self-Service Portal:** An interactive hub for customers to manage policies, receive renewal alerts, use digital forms for updates, and run AI-powered policy reviews.
-   **AI Gap Analysis:** Upload policy documents (PDF, DOCX, images) to have Google Gemini automatically extract structured data and analyze coverage gaps based on client needs.
-   **Microsite Builder:** An intuitive UI for agents to build and customize bilingual, single-page websites for specific insurance products.
-   **Onboarding & Billing:** Placeholder modules designed for future integration with services like DocuSign and Stripe.

---

## Usage Guide

-   **Navigation:** Use the sidebar on the left to navigate between the different modules of the platform.
-   **Bilingual Support:** Switch between Greek (EL) and English (EN) at any time using the language toggle button in the header. All UI elements will update instantly.
-   **Offline Capabilities:** The application caches all CRM and lead data in your browser's `localStorage`. This allows you to view and manage information even when you are offline. Any changes made offline will be available when you reconnect.

---

## API and Data Standards

-   **Data Interchange:** The application uses structured **JSON** for all data operations, simulating a modern REST API.
-   **Industry Vocabulary:** The data models for insurance policies and customer information are designed to be compatible with industry-standard vocabulary, such as **ACORD**, to ensure realistic and interoperable data structures.

---

## Contribution Guidelines

We welcome contributions to enhance the AgentRise platform! To contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3.  Commit your changes with clear and descriptive messages.
4.  Ensure any new user-facing text is added to both localization files (`/data/locales/en.json` and `/data/locales/el.json`).
5.  Push your branch and submit a Pull Request.

---

## License

This project is licensed under the **MIT License**.

---

## Contact and Support

-   **Reporting Issues:** For any bugs or issues, please open an issue on the project's GitHub repository.
-   **General Inquiries:** For other questions or support, please contact the project maintainers.
