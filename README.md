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

## API and Data Standards

-   **Data Interchange:** The application uses structured **JSON** for all data operations, simulating a modern REST API.
-   **Industry Vocabulary:** The data models for insurance policies and customer information are designed to be compatible with industry-standard vocabulary, such as **ACORD**, to ensure realistic and interoperable data structures.

---

## API Endpoint Payloads (Examples)

Below are examples of JSON payloads for core entities, designed for compatibility with standard insurtech APIs.

### 1. Parties (Customers)

A "Party" represents an individual or entity involved in an insurance policy.

#### `POST /api/v1/parties` (Create a new Party)

**Request Body:**

```json
{
  "partyType": "Person",
  "firstName": "Alexandros",
  "lastName": "Papageorgiou",
  "dateOfBirth": "1985-05-20",
  "contact": {
    "email": "alex.papageorgiou@example.com",
    "phone": "6971112233"
  },
  "address": {
    "street": "Leof. Kifisias 123",
    "city": "Athens",
    "postalCode": "11526",
    "country": "GR"
  }
}
```

#### `GET /api/v1/parties/{partyId}` (Retrieve a Party)

**Response Body:**

```json
{
  "id": "cust1",
  "partyType": "Person",
  "firstName": "Alexandros",
  "lastName": "Papageorgiou",
  "dateOfBirth": "1985-05-20",
  "contact": {
    "email": "alex.papageorgiou@example.com",
    "phone": "6971112233"
  },
  "address": {
    "street": "Leof. Kifisias 123",
    "city": "Athens",
    "postalCode": "11526",
    "country": "GR"
  }
}
```

### 2. Policies

A "Policy" represents an insurance contract.

#### `POST /api/v1/policies` (Create a new Policy)

**Request Body:**

```json
{
  "policyNumber": "CAR-12345",
  "policyType": "auto",
  "insurer": "Generali",
  "status": "active",
  "effectiveDate": "2023-01-15",
  "expirationDate": "2024-01-14",
  "premium": {
    "amount": 350.50,
    "currency": "EUR"
  },
  "parties": [
    {
      "partyId": "cust1",
      "role": "Insured"
    }
  ]
}
```

#### `GET /api/v1/policies/{policyId}` (Retrieve a Policy)

**Response Body:**

```json
{
  "id": "pol1",
  "policyNumber": "CAR-12345",
  "policyType": "auto",
  "insurer": "Generali",
  "status": "active",
  "effectiveDate": "2023-01-15",
  "expirationDate": "2024-01-14",
  "premium": {
    "amount": 350.50,
    "currency": "EUR"
  },
  "parties": [
    {
      "partyId": "cust1",
      "role": "Insured"
    }
  ],
  "timeline": [
    {
      "id": "evt1",
      "date": "2023-10-20T10:00:00Z",
      "type": "note",
      "title": "Policy Issued",
      "content": "New auto policy created and activated.",
      "author": "System"
    }
  ]
}
```

#### `PATCH /api/v1/policies/{policyId}` (Update a Policy)

Used for partial updates, such as renewing a policy.

**Request Body:**

```json
{
  "status": "active",
  "expirationDate": "2025-01-14",
  "premium": {
    "amount": 365.00,
    "currency": "EUR"
  }
}
```
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