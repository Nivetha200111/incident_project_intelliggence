# Incident to Project Intelligence System

> AI-powered incident classification pipeline that transforms IT incidents into actionable project suggestions — powered by Grok AI on ServiceNow.

[![Pipeline](https://img.shields.io/badge/Pipeline-Grok%20AI%20Powered-5b5bd6)](#)
[![Platform](https://img.shields.io/badge/Platform-ServiceNow-2ecc71)](#)
[![Status](https://img.shields.io/badge/Status-Live%20%E2%9C%93-2ecc71)](#)
[![Clusters](https://img.shields.io/badge/Clusters-8%20Active-3498db)](#)
[![Incidents](https://img.shields.io/badge/Incidents-80%2B%20Processed-f39c12)](#)

**Live Demo:** [incident-project-intelliggence.vercel.app](https://incident-project-intelliggence.vercel.app)

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   LinkedIn   │────▶│  Vercel React    │────▶│  Vercel Serverless  │
│   Visitor    │◀────│  Frontend (SPA)  │◀────│  API Routes (5)     │
└──────────────┘     └──────────────────┘     └─────────┬───────────┘
                                                        │ Basic Auth
                                                        │ (server-side only)
                                                        ▼
                                              ┌─────────────────────┐
                                              │  ServiceNow PDI     │
                                              │                     │
                                              │  ┌───────────────┐  │
                                              │  │ Grok AI       │  │
                                              │  │ Classifier    │  │
                                              │  └───────┬───────┘  │
                                              │          ▼          │
                                              │  ┌───────────────┐  │
                                              │  │ Cluster       │  │
                                              │  │ Manager       │  │
                                              │  └───────┬───────┘  │
                                              │          ▼          │
                                              │  ┌───────────────┐  │
                                              │  │ Project       │  │
                                              │  │ Suggestion    │  │
                                              │  │ Engine        │  │
                                              │  └───────────────┘  │
                                              └─────────────────────┘
```

Credentials are stored as Vercel environment variables. The browser **never** sees ServiceNow auth — all API calls are proxied through serverless functions.

## Pipeline

```
Incident ──▶ Grok AI Classification ──▶ Theme + Confidence Score + Root Cause
                                    ──▶ Cluster Matching (auto-create or increment)
                                    ──▶ Impact Level Calculation (Low → Critical)
                                    ──▶ Project Suggestion (auto-generate at 5+ incidents)
                                    ──▶ Cost Projection (hours × rate × incident count)
```

**Async processing:** Incidents are created immediately. A Business Rule fires async, calls the Grok API, classifies the incident, matches it to a cluster, and evaluates project suggestions — all within 3-10 seconds.

## Live Pipeline Results (as of 2026-03-23)

| Metric | Value |
|--------|-------|
| Total Incidents Processed | 80+ |
| Active Clusters | 8 |
| Project Suggestions Generated | 5 |
| Highest Volume Cluster | Performance Degradation (23 incidents, Critical) |
| Largest Projected Annual Impact | $143,520 USD (Performance Degradation) |
| Themes Detected | Network Outage, Application Error, Performance Degradation, Authentication Failure, Security Incident, Data Integrity Issue, Infrastructure Capacity, Provisioning Request |

## Frontend Panels

| Panel | Description |
|-------|-------------|
| **Overview** | Live dashboard — incident count, cluster count, suggestion count, high-impact count. Pipeline status with real-time connection indicators. |
| **Submit** | Single incident submission with async polling. Shows AI classification result (theme, confidence, summary, business impact, root cause) within 3-10 seconds. |
| **Upload** | CSV bulk upload — drag-and-drop, client-side parsing, batch submit (max 50). Live polling tracker shows each incident's classification status in real time. |
| **Clusters** | All clusters sorted by incident count. Expandable cards with impact level badges, recommendation status, and AI-generated summaries. |
| **Projects** | Auto-generated project suggestions with priority, status, justification, and cost projections (current operational cost + projected annual impact + remediation savings). |

## Tech Stack

| Component | Technology | Role |
|-----------|------------|------|
| AI Engine | Grok AI (xAI) | Incident classification, theme extraction, root cause analysis |
| Platform | ServiceNow PDI | Tables, Business Rules, Scripted REST APIs, Script Includes |
| Frontend | React 18 + Vite | Single-page app, inline styles, no external UI libraries |
| Hosting | Vercel | Serverless API routes + static SPA hosting |
| Auth | Basic Auth | Server-side only — proxied through Vercel functions |
| Fonts | DM Sans + IBM Plex Mono | Google Fonts, loaded via @import |

## Vercel API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/clusters` | GET | Fetch all incident clusters |
| `/api/suggestions` | GET | Fetch all project suggestions |
| `/api/submit-incident` | POST | Submit single incident to classification pipeline |
| `/api/bulk-submit` | POST | Submit up to 50 incidents from CSV upload |
| `/api/poll-incident` | GET | Poll incident by sys_id for async AI classification results |

## ServiceNow Components

| Type | Count | Details |
|------|-------|---------|
| Script Includes | 5 | GrokClassifier, ClusterManager, ProjectEngine, IncidentProcessor, ConfigHelper |
| Business Rules | 1 | Async AI classification on Smart Incident insert |
| Scripted REST API | 1 | `incident_intelligence_api` with 4 resources |
| REST Resources | 4 | submit-incident, bulk-submit, clusters, project-suggestions |
| System Properties | 8 | Grok API key, confidence threshold, project threshold, feature flags |
| Tables | 3 | Smart Incident, Incident Cluster, Project Suggestion |
| Staging Table | 1 | Bulk import staging with transform map |

## Deploy

```bash
# Clone
git clone <repo-url>
cd incident-intelligence-ui

# Install
npm install

# Set environment variables in Vercel dashboard:
#   SN_INSTANCE  = https://your-instance.service-now.com
#   SN_USERNAME  = your_api_user
#   SN_PASSWORD  = your_password

# Deploy
vercel deploy --prod
```

## Local Development

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`. API calls proxy to `/api/*` routes which require Vercel environment variables (`SN_INSTANCE`, `SN_USERNAME`, `SN_PASSWORD`).

## CSV Bulk Upload Format

```csv
short_description,detailed_description
"Core switch failure in Building 7","Cisco Catalyst 9300 went unresponsive at 14:32 UTC..."
"SSO login failures for Salesforce","Multiple users unable to authenticate via Okta SSO..."
```

- First row is header (skipped)
- Handles quoted fields with commas
- Max 50 incidents per batch
- Empty `detailed_description` is fine

## Author

Built by **Nivetha** — AI + ServiceNow systems engineer
