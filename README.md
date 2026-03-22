# Incident to Project Intelligence System

> AI-powered incident classification pipeline that transforms IT incidents into actionable project suggestions.

[![Pipeline](https://img.shields.io/badge/Pipeline-Grok%20AI%20Powered-5b5bd6)](#)
[![Platform](https://img.shields.io/badge/Platform-ServiceNow-2ecc71)](#)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](#)

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   LinkedIn   │────▶│  Vercel React    │────▶│  Vercel Serverless  │
│   Visitor    │◀────│  Frontend        │◀────│  API Routes         │
└──────────────┘     └──────────────────┘     └─────────┬───────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────────┐
                                              │  ServiceNow PDI     │
                                              │  ┌───────────────┐  │
                                              │  │ Grok AI       │  │
                                              │  │ Classifier    │  │
                                              │  └───────┬───────┘  │
                                              │          ▼          │
                                              │  ┌───────────────┐  │
                                              │  │ Cluster       │  │
                                              │  │ Engine        │  │
                                              │  └───────┬───────┘  │
                                              │          ▼          │
                                              │  ┌───────────────┐  │
                                              │  │ Project       │  │
                                              │  │ Suggestion    │  │
                                              │  └───────────────┘  │
                                              └─────────────────────┘
```

## Pipeline

```
Incident → Grok AI Classification → Theme & Confidence Score
         → Cluster Matching → Aggregate Patterns
         → Project Suggestion → Actionable IT Initiatives
```

## Tech Stack

| Component        | Technology              |
|-----------------|------------------------|
| AI Engine       | Grok AI (xAI)          |
| Platform        | ServiceNow PDI         |
| Frontend        | React 18 + Vite        |
| Hosting         | Vercel (Serverless)    |
| Authentication  | Basic Auth (server-side only) |
| Styling         | Inline CSS (Dark Theme)|

## Deploy

```bash
# Clone
git clone <repo-url>
cd incident-intelligence-ui

# Install
npm install

# Set environment variables in Vercel dashboard:
#   SN_INSTANCE  = https://your-instance.service-now.com
#   SN_USERNAME  = admin
#   SN_PASSWORD  = your_password

# Deploy
vercel deploy --prod
```

## ServiceNow Components

| Type              | Count | Details                                      |
|-------------------|-------|----------------------------------------------|
| Script Includes   | 5     | GrokClassifier, ClusterEngine, ProjectEngine, IncidentProcessor, ConfigHelper |
| Business Rules    | 1     | Async AI classification on incident insert   |
| REST Resources    | 4     | submit-incident, clusters, project-suggestions, poll |
| System Properties | 8     | API keys, thresholds, feature flags           |
| Tables            | 3     | Smart Incident, Incident Cluster, Project Suggestion |

## Local Development

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`. API calls proxy to `/api/*` routes which require Vercel environment variables.

## Author

Built by **Nyra** — AI + ServiceNow systems engineer
