
# Product Requirements Document: AgentRise Template Marketplace

**Version:** 1.1  
**Status:** Approved  
**Author:** Product Management Office  

---

## 1. Executive Summary
The Template Marketplace is a strategic enhancement to the AgentRise Web Builder. It aims to reduce the "Time to Publish" for new agents by providing high-quality, industry-specific starting points. Simultaneously, it serves as a primary driver for monetization by showcasing premium designs that require a "Pro" or "Enterprise" subscription.

## 2. Goals & Success Metrics

### Primary Goals
1.  **Accelerate Activation:** Enable users to publish a compliant, professional site in under 10 minutes.
2.  **Drive Upgrades:** Use premium templates as a "soft wall" to encourage Free tier users to upgrade to Pro.
3.  **Ensure Consistency:** Standardization of design across agency networks via Enterprise templates.

### Success Metrics (KPIs)
*   **Adoption Rate:** % of new sites created from a template vs. blank canvas.
*   **Time-to-Publish:** Average duration from "Create Site" to "Publish".
*   **Upgrade Conversion:** % of users who upgrade immediately after previewing a locked template.
*   **Template Utilization:** Usage count per template category (to inform future design investment).

---

## 3. User Personas & Journeys

### Personas
*   **The Rookie (Free Tier):** Limited technical skill. Wants a "done-for-you" site. Prioritizes speed and ease.
*   **The Specialist (Pro Tier):** Focused on a niche (e.g., Marine, High-Net-Worth). Willing to pay for a design that specifically speaks to their target market.
*   **The Network Admin (Enterprise):** Needs to distribute branded, compliant templates to hundreds of sub-agents.

### Key User Journeys
1.  **Discovery:** User opens "Microsite Builder" > Click "Templates" > Filter by "Auto Insurance" > Browses thumbnails.
2.  **Preview & Upgrade:** User clicks a "Pro" template > Views full-screen interactive preview > Clicks "Use Template" > Receives upgrade prompt > Upgrades Plan.
3.  **Application:** User selects a free template > Confirms overwrite of current content > Editor reloads with new block structure and theme.

---

## 4. Functional Requirements

### 4.1 Browsing & Discovery
*   **Search:** Real-time text search against template title, description, and tags.
*   **Filtering:**
    *   **Category:** Auto, Home, Life, Health, Commercial, etc.
    *   **Style:** Modern, Corporate, Minimalist, Warm.
    *   **Tier:** Free, Pro, Enterprise.
*   **Sorting:** Most Popular, Newest, Recommended.

### 4.2 Template Cards
*   Display thumbnail (aspect ratio 16:9).
*   Show Template Name and brief description (1 line).
*   **Badging:** "Pro", "New", "Best Seller" badges must be visually distinct.
*   **State Indication:** If the user is on the Free plan, Pro templates must show a "Lock" icon.

### 4.3 Preview Experience
*   **Quick View:** Hovering a card shows a "Preview" button.
*   **Interactive Modal:** Clicking "Preview" opens a full-screen modal loading the template in a sandboxed environment (or static image carousel).
*   **Responsive Toggle:** Ability to switch preview view between Desktop, Tablet, and Mobile.
*   **Metadata Display:** Sidebar showing "Included Pages", "Recommended For", and "Key Features".

### 4.4 Entitlement & Application
*   **Entitlement Check:** On "Apply", check `User.plan.tier` >= `Template.tier`.
    *   *Pass:* Proceed to Application.
    *   *Fail:* Trigger "Upgrade Plan" modal with benefit comparisons.
*   **Application Logic:**
    *   **Warning:** "Applying this template will replace your existing layout." (Confirmation required).
    *   **Execution:** Replace current `blocks` array with template blocks. Update `config` (colors, fonts) to match template defaults.

---

## 5. Edge Cases & Constraints

*   **Content Persistency:** When applying a template to an *existing* site, existing text content inside blocks will be lost unless a complex field-mapping system is built. *Decision: MVP will overwrite content; V2 will attempt to map content.*
*   **Downgrades:** If a user downgrades from Pro to Free, they keep their current site (grandfathered), but cannot re-apply Pro templates if they switch away.
*   **Custom Blocks:** If a user has created custom blocks, applying a template will remove them. The warning message must be explicit.

---

## 6. Information Architecture

### Navigation
*   **Entry Point:** "Templates" tab within the left-hand `BuilderControls` sidebar.
*   **Marketplace View:** Can be a slide-out panel (width: 400px+) or a full-screen overlay to maximize browsing area.

### Data Model: `MicrositeTemplate`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | string | Unique identifier (e.g., `tmpl_auto_01`) |
| `name` | string | Display name |
| `description` | string | Short marketing copy |
| `thumbnailUrl` | string | URL to cover image |
| `previewImages` | string[] | Array of URLs for detailed preview |
| `tier` | enum | `free`, `pro`, `enterprise` |
| `category` | enum | `general`, `auto`, `home`, `life`, `business` |
| `tags` | string[] | Keywords for search (e.g., "modern", "dark-mode") |
| `blocks` | Block[] | The JSON structure of the site layout |
| `defaultConfig` | object | Theme settings (primary color, fonts) |

---

## 7. Template Categories (Initial Set)

1.  **The Generalist:** Standard layout for multi-line agents. (Free)
2.  **Auto Velocity:** High-energy, image-heavy layout for car insurance. (Pro)
3.  **Home & Hearth:** Warm colors, focus on family and property safety. (Free)
4.  **Corporate Shield:** Blue/Grey palette, data-heavy layout for B2B/Liability. (Pro)
5.  **Life Legacy:** Soft tones, emotional imagery, focus on long-term planning. (Pro)
6.  **Health First:** Clean, white/clinical aesthetic with clear pricing tables. (Pro)
7.  **Cyber Secure:** Dark mode, tech-focused aesthetics. (Pro)
