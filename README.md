# Pricing Quality Dashboard

An interactive single-page dashboard demonstrating an **11-KPI pricing-quality
framework** organised into three dimensions — Market Signals, Price Performance,
and Price Operations. Built as the closing visual for a 75-minute pricing
summit breakout: the facilitator screen-shares the dashboard, walks through
each dimension, and clicks into individual KPIs to show realistic data. All
numbers are mocked and generated client-side; there is no backend.

## Stack

- React 19 + TypeScript + Vite (single-page app, deploys to Railway)
- Tailwind CSS v4
- Recharts for all visualisations
- Inter font, Accenture-red accent (`#FF3246`) on a near-white canvas

> The original brief asked for Next.js 14, but the existing Railway deploy
> infrastructure was already configured for Vite and the brief explicitly says
> no routing or backend is needed — same UX, faster build.

## Local development

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc -b && vite build
npm run preview      # serve the production build locally
```

Node 20+.

## Live dashboard

Deploys from `claude/pricing-kpi-dashboard-2ab0q` to Railway with the standard
Vite build (`npm run build` → `npx serve dist`).

> **https://&lt;your-railway-app&gt;.up.railway.app** *(update after first deploy)*

## What's inside

- Three dimension sections, each with 3–4 KPI tiles. Tiles show a hero metric,
  trend vs. last quarter, status dot, and 8-quarter sparkline.
- Click any tile to expand inline (no modal) — formula, "what good looks like",
  and a tailored chart per KPI: scatter, waterfall, donut, stacked bar,
  histogram, etc.
- Closing panel: "What this dashboard catches that revenue & margin don't" —
  one insight per dimension.

## File layout

```
src/
  App.tsx                     # composition
  data/mockData.ts            # all KPI definitions + per-chart datasets
  components/
    Header.tsx                # title + company / period selectors
    DimensionSection.tsx      # section header + tile grid + expanded view
    KpiTile.tsx               # hero tile with sparkline + status dot
    KpiExpanded.tsx           # inline detail view + chart picker
    InsightsPanel.tsx         # closing dark panel
    Sparkline.tsx             # tiny sparkline used in tiles
    charts/                   # eleven Recharts visualisations, one per KPI
```
