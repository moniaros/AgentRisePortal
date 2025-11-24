
# AgentOS Microsite Template Marketplace

## 1. Overview
The Template Marketplace is a sub-module within the Microsite Builder designed to accelerate user adoption and drive subscription upgrades. It allows agents to apply pre-configured sets of blocks and theme settings ("Templates") to their site instantly.

## 2. Architecture

### Data Model
Templates are defined by the `MicrositeTemplate` interface:
- **Metadata**: `id`, `name`, `description`, `thumbnailUrl`.
- **Access Control**: `tier` ('free' | 'pro' | 'enterprise').
- **Payload**: 
  - `blocks`: An array of `MicrositeBlock` objects that define the layout.
  - `defaultConfig`: Partial `MicrositeConfig` to set color themes and fonts associated with the template.

### Integration
The Marketplace resides in the `BuilderControls` component (Left Sidebar). It interacts with the main builder state in `MicrositeBuilder.tsx`.

**Data Flow:**
1. User selects template in `TemplateSelector`.
2. `onSelect` triggers `handleApplyTemplate` in `MicrositeBuilder`.
3. Application verifies User Plan vs. Template Tier.
4. If valid, `setBlocks` and `setConfig` are called with the template data.

## 3. Monetization Strategy
- **Free Tier**: Access to "General Agency" and "Basic Contact" templates.
- **Pro Tier**: Access to high-value verticals ("Luxury Home", "Commercial Fleet") and AI-optimized layouts.
- **Upsell Hook**: Pro templates are visible but locked for Free users, triggering an upgrade modal (or notification) upon interaction.

## 4. Future Enhancements (Roadmap)
1.  **Community Marketplace**: Allow third-party designers or "Agency Networks" to publish private templates for their sub-agents.
2.  **Dynamic Preview**: Hovering over a template thumbnail shows a live, scrollable preview in a modal before applying.
3.  **AI-Generated Templates**: Instead of static JSON, generate the template structure on-the-fly based on the agent's specific niche (e.g., "Cyber Insurance for Small Tech Firms").
4.  **Analytics**: Track which templates have the highest publish rate and conversion rate to inform future designs.
