# AI-Powered Customer Policy Wallet: Gemini API Integration Guide

**Version:** 1.0  
**Status:** Design Proposal  
**Author:** Product Strategy Office

---

## 1. Executive Summary

This document outlines the architecture for an "AI Policy Wallet," a mobile application feature that empowers customers to digitize, understand, and manage their insurance policies. By leveraging the Google Gemini API, customers can transform static policy documents (PDFs, photos) into interactive, understandable digital assets stored securely on their device.

The core principle is a "human-in-the-loop" workflow where the AI extracts data, but the **customer must verify its accuracy** before it is analyzed and saved. This ensures data integrity and builds user trust.

---

## 2. Core User Flow

From the customer's perspective, the process is simple and intuitive:

1.  **Upload Policy:** The user takes a photo of their insurance document or uploads a PDF directly within the app.
2.  **AI Extraction:** The app securely sends the image/document to the Gemini API for data extraction. A loading indicator is shown with messages like "Reading your document...".
3.  **Verify Your Data (Crucial Step):** The app displays the extracted information (Policy Number, Insurer, Coverages, etc.) in a clean, editable form. The user is prompted to review and correct any inaccuracies.
4.  **AI Analysis:** Once the user confirms the data, the structured information is sent to the Gemini API with a second prompt to generate a simplified, "plain English" summary.
5.  **Secure Storage:** The verified data and its AI-generated summary are saved in an encrypted format on the user's device.

---

## 3. Technical Workflow & Gemini API Integration

### Step 1: Data Extraction with `gemini-2.5-flash` (Multimodal)

The app captures the policy document as a Base64 encoded string and sends it to the Gemini API.

**API Call:** `ai.models.generateContent`
**Model:** `gemini-2.5-flash`
**Prompt Engineering:**

```
You are an expert, highly accurate insurance policy parser. Analyze the provided image or document.
Your task is to extract the key policy details into a structured JSON format.

- Do not hallucinate or invent data. If a field is not present, use an empty string "" or null.
- Dates should be in YYYY-MM-DD format.
- Ensure all monetary values are extracted as numbers.

Return ONLY the JSON object.
```

**`config` object with `responseSchema`:** A strict schema is critical for reliable parsing.

```json
{
  "responseMimeType": "application/json",
  "responseSchema": {
    "type": "OBJECT",
    "properties": {
      "policyNumber": { "type": "STRING" },
      "insurer": { "type": "STRING" },
      "policyholder": {
        "type": "OBJECT",
        "properties": {
          "name": { "type": "STRING" },
          "address": { "type": "STRING" }
        }
      },
      "effectiveDate": { "type": "STRING" },
      "expirationDate": { "type": "STRING" },
      "totalPremium": { "type": "NUMBER" },
      "coverages": {
        "type": "ARRAY",
        "items": {
          "type": "OBJECT",
          "properties": {
            "type": { "type": "STRING" },
            "limit": { "type": "STRING" },
            "deductible": { "type": "STRING" }
          }
        }
      }
    }
  }
}
```

### Step 2: The User Verification Screen

This is the most critical step for user trust and data accuracy.

*   **UI/UX:** The application must present the JSON data from Step 1 in a user-friendly, editable form. Each field (e.g., Policy Number, Coverage Limit) should be an input field pre-filled with the AI's extraction.
*   **User Action:** The user reviews the data, makes any necessary corrections, and taps a "Confirm & Analyze" button. This action signifies that the data is now considered the "source of truth."

### Step 3: Plain-Language Analysis with `gemini-2.5-flash`

After user verification, the app sends the *corrected, user-verified JSON data* to the Gemini API for simplification.

**API Call:** `ai.models.generateContent`
**Model:** `gemini-2.5-flash`
**Prompt Engineering:**

```
You are a helpful insurance expert explaining a policy to a client.
Based on the following JSON data, provide a simple, easy-to-understand summary. Use bullet points.

- **`summary`:** A one-sentence summary of what this policy is for.
- **`keyCoverages`:** List the 3 most important coverages and what they mean in one simple sentence each.
- **`keyNumbers`:** Clearly state the Total Premium and any significant Deductibles.
- **`thingsToKnow`:** Briefly mention one important exclusion or condition the user should be aware of.

Keep the language simple and direct. Avoid jargon. The response must be a JSON object.
```

**`config` object with `responseSchema`:**

```json
{
  "responseMimeType": "application/json",
  "responseSchema": {
    "type": "OBJECT",
    "properties": {
      "summary": { "type": "STRING" },
      "keyCoverages": {
        "type": "ARRAY",
        "items": { "type": "STRING" }
      },
      "keyNumbers": {
        "type": "ARRAY",
        "items": { "type": "STRING" }
      },
      "thingsToKnow": { "type": "STRING" }
    }
  }
}
```

---

## 4. Secure Storage Architecture (Client-Side)

To ensure privacy, all policy data should be stored **locally and encrypted** on the user's device. Cloud sync should be an explicit opt-in feature.

### Recommended Storage:
*   **iOS:** Keychain or an encrypted file.
*   **Android:** Keystore or an encrypted file.
*   **Cross-Platform:** A local database like SQLite with an encryption layer (e.g., SQLCipher).

### Data Structure

A single JSON file or database table per user, containing an array of `StoredPolicy` objects.

**`StoredPolicy` Object Schema:**

```json
{
  "id": "policy_uuid_12345",
  "metadata": {
    "addedAt": "2024-10-26T10:00:00Z",
    "sourceFileName": "my_car_insurance_2024.pdf"
  },
  "verifiedData": {
    // This object contains the full, user-verified data from Step 2.
    // It should match the structure of the JSON from the first AI call.
    "policyNumber": "CAR-12345",
    "insurer": "Generali",
    "policyholder": {
      "name": "Alexandros Papageorgiou",
      "address": "Leof. Kifisias 123, Athens"
    },
    "effectiveDate": "2024-01-15",
    "expirationDate": "2025-01-14",
    "totalPremium": 350.50,
    "coverages": [
      { "type": "Bodily Injury", "limit": "€1,300,000", "deductible": null },
      { "type": "Property Damage", "limit": "€1,300,000", "deductible": null }
    ]
  },
  "aiAnalysis": {
    // This object contains the simplified analysis from Step 3.
    "summary": "This is a car insurance policy for your Fiat 500X.",
    "keyCoverages": [
      "Bodily Injury: Covers costs if you injure someone in an accident, up to €1.3M.",
      "Property Damage: Covers damage to other people's property, up to €1.3M."
    ],
    "keyNumbers": [
      "Total Premium: €350.50 per year."
    ],
    "thingsToKnow": "This policy does not include roadside assistance."
  }
}
```
This structure ensures a clear separation between the verified "source of truth" (`verifiedData`) and the AI-generated interpretation (`aiAnalysis`), allowing the UI to present both simple and detailed views effectively.
