# PulseReview AI

PulseReview AI is a SaaS-style customer feedback intelligence platform that transforms reviews, tickets, and survey responses into actionable business decisions.

## Product Pages

- Landing page: `/`
- Dashboard: `/dashboard.html`
- Feedback ingestion: `/ingestion.html`
- AI copilot: `/copilot.html`
- Alerts and automation: `/alerts.html`
- Reports: `/reports.html`
- Team collaboration: `/team.html`
- API integrations settings: `/integrations.html`
- Authentication: `/auth.html`

## Key Platform Capabilities

- Multi-tenant workspace model with role-ready user records
- Feedback ingestion (manual, CSV-simulated bulk, API ingestion endpoint)
- Sentiment, confidence, emotions, intents, topic clusters, churn risk and urgency analytics
- Dashboard KPIs and charts (trend, channel, category, emotion, region)
- AI insights layer with weekly and daily summaries
- Alerts and automation settings with threshold rules
- Team assignment workflow (Open, In Progress, Resolved, Ignored)
- AI copilot Q&A over workspace feedback data
- Reporting exports and delivery actions
- Integration management for Zendesk, Intercom, Shopify, Google Reviews, Play Store, App Store
- Security controls: secret encryption, rate limiting, audit logs, GDPR workspace deletion endpoint

## Architecture

### Backend

- `server.js`: app bootstrap and Azure analyze endpoint
- `src/routes/api.js`: modular SaaS API routes
- `src/data/seed.js`: realistic seeded data for demo/testing
- `src/services/analyticsService.js`: KPI and chart aggregations
- `src/services/copilotService.js`: rule-based copilot responses
- `src/services/securityService.js`: encrypted secret handling
- `src/middleware/rateLimiter.js`: API rate limiting

### Frontend

- Shared shell and reusable helpers: `public/js/platform.js`
- Page modules:
  - `public/js/dashboard.js`
  - `public/js/ingestion.js`
  - `public/js/copilot.js`
  - `public/js/alerts.js`
  - `public/js/reports.js`
  - `public/js/team.js`
  - `public/js/integrations.js`
  - `public/js/auth.js`
- Design system and responsive themes: `public/styles.css`

### Database Design

Production schema reference is included at `database/schema.sql` with tables for:

- users
- organizations
- workspaces
- reviews
- review_sources
- analysis_results
- aspect_scores
- alerts
- saved_filters
- notes
- assignments
- integrations
- reports
- audit_logs

## Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment

```env
AZURE_LANGUAGE_ENDPOINT=https://your-language-resource.cognitiveservices.azure.com/
AZURE_LANGUAGE_KEY=your_azure_language_key
APP_SECRET=replace_with_long_random_secret
PORT=3000
```

3. Start server

```bash
npm start
```

4. Open app

- `http://localhost:3000`

## API Endpoints (Selected)

- `GET /api/dashboard`
- `GET /api/insights`
- `GET /api/reviews`
- `POST /api/reviews/manual`
- `POST /api/reviews/bulk`
- `POST /api/ingest`
- `GET /api/alerts`
- `PUT /api/alerts/:id`
- `GET /api/team/items`
- `POST /api/team/assign`
- `GET /api/reports`
- `POST /api/reports/export`
- `GET /api/integrations`
- `PUT /api/integrations/:id`
- `POST /api/copilot/ask`
- `GET /api/audit-logs`
- `DELETE /api/gdpr/workspace/:workspaceId`
- `POST /api/analyze` (Azure Text Analytics fallback-enabled endpoint)

## Notes

- This build includes realistic seeded analytics and business-facing UX patterns.
- Integrations, OAuth, and exports are wired as production-style modules with demo-safe mocked execution paths.
