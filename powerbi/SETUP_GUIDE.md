# K+S AgriMetrics — Power BI Setup Guide

Complete instructions to recreate the web-based KPI Dashboard in Power BI Desktop.

---

## Quick Start

1. Open **Power BI Desktop**
2. **Import theme**: View → Themes → Browse → select `KS_AgriMetrics_Theme.json`
3. **Import all 20 CSV files** from the `data/` folder (Get Data → Text/CSV)
4. Follow the page-by-page instructions below
5. Add DAX measures from `DAX_Measures.md`

---

## Color Reference

| Name | Hex | Usage |
|------|-----|-------|
| Primary (K+S Blue) | `#173B7A` | Main brand, headers, primary bars |
| Primary Light | `#2a5199` | Hover states |
| Sidebar Dark | `#0f2654` | Hero card gradient |
| Positive / Green | `#1a8754` | Good KPIs, above target |
| Negative / Red | `#c43e3e` | Bad KPIs, below limit, cost overruns |
| Warning / Amber | `#d49a1a` | Warnings, in-corridor |
| Grey / Accent | `#667885` | Secondary text, muted elements |
| Light Grey | `#b8c2cf` | "Last Year" / "Budget" bars |
| Background | `#f4f6f8` | Page canvas |
| Card White | `#ffffff` | Visual backgrounds |
| Border | `#d5dbe3` | Card borders, gridlines |
| Text Primary | `#1a2332` | Main text |
| Text Secondary | `#4a5568` | Subtitles, axis labels |
| Text Muted | `#667885` | Labels, hints |

---

## Global Settings

- **Page size**: 1440 × 900 px (custom, or use 16:9)
- **Page background**: `#f4f6f8`
- **Font**: Inter (install from Google Fonts) or Segoe UI as fallback
- **Card style**: White background, 1px `#d5dbe3` border, 12px corner radius
- **Gridlines**: Dashed, `#d5dbe3`, vertical off for most charts

---

## Navigation Setup

Create a **left sidebar** using a rectangle shape (width: 240px, full height):
- Background: Linear fill from `#0f2654` (top) to `#091a3d` (bottom)
- Add a text box at top: "K+S AgriMetrics" in white bold + "Fertilizer & Salt KPI" subtitle
- Add **Page Navigation buttons** for each page (white text, `#173B7A` highlight on active)

**Pages to create (8 report pages):**
1. Dashboard (Top KPIs)
2. SCO Bridge
3. Market Intelligence
4. Customer Portfolio
5. Pricing & Conditions
6. Operations
7. Pricing Detail (Deep-dive)
8. Cost Detail (Deep-dive)

---

## Filter Bar (All Pages)

Add a **horizontal slicer panel** at the top of each page (below the page title area):

**Slicer order (LEFT to RIGHT) — Archetype FIRST:**
1. **Archetype** ← MOST IMPORTANT, first position
2. Region
3. Cluster
4. Segment
5. Customer
6. Product

**Slicer style**: Dropdown, horizontal tiles, or buttons
- Use data from `20_Filter_Options.csv` (filter by `Filter_Type` for each slicer)
- Sort by `Sort_Order` column

**Time Period**: Add as **button bar / bookmark navigator** above the slicers
- Options: Month-to-month | PL period | **YTD** (default) | Full year / Fiscal year
- Style: Tab buttons, active = `#173B7A` white text, inactive = grey

> **Power BI Alternative for filter reactivity**: Since the CSVs contain static base data,
> slicers act as visual filters only. For full dynamic recalculation like the web app,
> connect to a live data source or use Power Query parameters.

---

## PAGE 1: Dashboard (Top KPIs)

### Layout

```
┌─────────────────────────────────────────────────────┐
│  HERO CARD: Actual SCO/MT (dark gradient)           │
│  218.5 €/MT · YTD                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ vs LY    │ │ vs Plan  │ │ vs Target│            │
│  │ +14.7    │ │ -4.8     │ │ +6.3     │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────┘

┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Vol Fcst   │ │ Market Idx │ │ Pos. Val.  │ │ Rev Leakage│
│ 92.6%      │ │ 112.4      │ │ 5.8 M€     │ │ 24.3 M€    │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

┌─────────────────────────────────────────────────────┐
│  AREA CHART: SCO/MT — 12 Month Trend                │
│  Data: 02_SCO_Trend.csv                             │
│  Series: Actual (solid #173B7A) + Plan (dashed grey)│
│  Y-axis: €/MT   X-axis: Month                       │
│  Fill area under Actual with gradient                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABLE: Product SCO Contribution                     │
│  Data: 04_Product_SCO_Contribution.csv              │
│  Columns: Product | SCO/MT | Volume | Total SCO |   │
│           Share (with data bar) | vs LY (colored)   │
└─────────────────────────────────────────────────────┘
```

### Hero Card
- Use a **rectangle shape** with gradient fill: `#0f2654` → `#173B7A` → `#0f2654`
- Place **Card visuals** inside for the main value and 3 comparison boxes
- Comparison boxes: semi-transparent white background (`rgba(255,255,255,0.1)`)

### KPI Cards (4 cards row)
- Use **Card** or **Multi-row Card** visuals
- Data source: `01_TopKPIs.csv` (filter each card to its KPI_ID)
- Show: Value + Unit + Change badge + Subtitle
- Conditional formatting: Use `KPI Status Color` measure

### SCO Trend Chart
- **Area Chart** visual
- Data: `02_SCO_Trend.csv`
- Legend: Actual (solid line `#173B7A`, fill gradient) + Plan (dashed line `#667885`, no fill)
- Y-axis: `€{value}` format

### Product SCO Table
- **Table** or **Matrix** visual
- Data: `04_Product_SCO_Contribution.csv`
- Add data bars on `Share_of_Total_Pct` column
- Color `vs_LY_Pct`: green if ≥ 0, red if < 0

---

## PAGE 2: SCO Bridge

### Layout
```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ Top 5 effect summary cards (sorted by |impact|) │
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘

┌─────────────────────────────────────────────────────┐
│  WATERFALL CHART: SCO/MT Bridge                      │
│  Data: 03_SCO_Waterfall.csv                         │
│  Category: Effect_Name (sorted by Step_Order)       │
│  Values: Value_EUR_MT                                │
│  Mark start/end bars as "Total" in waterfall setup  │
│  Colors: Total=#173B7A, Increase=#1a8754, Decrease=#c43e3e │
│  Data labels ON                                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABLE: Effect Detail                                │
│  Columns: Effect | Impact €/MT | Share of Δ | Category│
│  Total row at bottom (bold)                          │
└─────────────────────────────────────────────────────┘
```

### Waterfall Chart
- Use Power BI's **built-in Waterfall** visual
- Category: `Effect_Name` (sort by `Step_Order`)
- Values: `Value_EUR_MT`
- **Mark "Actual SCO/MT Last Year" and "Actual SCO/MT Current" as Total** (right-click → "Total" in the visual)
- Sentiment colors: Increase = `#1a8754`, Decrease = `#c43e3e`, Total = `#173B7A`

### Summary Cards
- Create 5 card visuals showing the top 5 effects by absolute value
- Green border/bg for positive, Red for negative

---

## PAGE 3: Market Intelligence

### Layout
```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ K+S Prem│ │ Gas Price│ │ EUR/USD │ │ Freight │
│ X.X%    │ │ €XX.X   │ │ 1.XXX   │ │ XXX     │
└─────────┘ └─────────┘ └─────────┘ └─────────┘

┌─────────────────────────────────────────────────────┐
│  LINE/AREA CHART: Potash Price Benchmarks (€/MT)    │
│  Data: 13_Benchmark_Prices.csv                      │
│  4 series: MOP Vancouver, MOP Baltic, MOP Brazil,   │
│            K+S Realized (dashed with area fill)      │
└─────────────────────────────────────────────────────┘

┌────────────────────────┐ ┌────────────────────────┐
│ LINE: Input Cost       │ │ LINE: FX Impact        │
│ Gas + Electricity      │ │ EUR/USD + EUR/BRL      │
│ Dual Y-axis            │ │ Dual Y-axis            │
└────────────────────────┘ └────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABLE: Global Potash Competitor Landscape           │
│  Data: 16_Competitor_Landscape.csv                  │
│  Color "Price Impact": bullish=green, bearish=red   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  CARDS/TEXT: Market Signals (2×2 grid)              │
│  Data: 18_Market_Signals.csv                        │
│  Left-border colored by impact                       │
└─────────────────────────────────────────────────────┘
```

### Benchmark Chart
- **Line Chart** (+ Area for K+S Realized)
- Colors: MOP Vancouver = `#173B7A`, MOP Baltic = `#667885`, MOP Brazil = `#d49a1a`, K+S Realized = `#1a8754` (dashed)

### Input Cost & FX Charts
- **Line Chart with Dual Y-Axis** (use "Line and Clustered Column" or two Y-axes)
- Input Costs: Gas = `#d49a1a`, Electricity = `#c43e3e`
- FX: EUR/USD = `#173B7A`, EUR/BRL = `#1a8754`

### Competitor Table
- Use conditional formatting on "Price_Impact" column (Icons or background color)

### Market Signals
- **Power BI Alternative**: Use a **Table** or **Multi-row card** visual with `18_Market_Signals.csv`
- Or use 4 **text box shapes** with left-border color matching impact

---

## PAGE 4: Customer Portfolio

### Layout
```
┌─────────────────────────────────────────────────────┐
│  ALERT BANNER: Price Alerts (collapsible)           │
│  Data: 12_Price_Alerts.csv                          │
│  Show critical (red) and warning (amber) alerts     │
└─────────────────────────────────────────────────────┘

┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Customers│ │Avg Price│ │Above   │ │In      │ │Below   │
│20       │ │€317/MT  │ │Target  │ │Corridor│ │Limit   │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘

┌────────────────────────┐ ┌────────────────────────┐
│ SCATTER: Volume vs     │ │ SCATTER: Volume vs     │
│ Price Corridor         │ │ Margin Corridor        │
│ Bubble size = Margin % │ │ Bubble size = Margin % │
│ Color by Segment       │ │ Color by Segment       │
│ Reference lines at     │ │ Reference lines at     │
│ Target=310, Limit=260  │ │ Target=28%, Limit=18%  │
│ Background zones       │ │ Background zones       │
└────────────────────────┘ └────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABLE: Customer Detail (sorted by volume)          │
│  Columns: Customer | Archetype | Segment | Volume | │
│  Price | Margin% | Price Zone | Margin Zone | Trend │
└─────────────────────────────────────────────────────┘
```

### Scatter Charts
- Data: `11_Customer_Portfolio.csv`
- X-axis: `Volume_MT`, Y-axis: `Price_EUR_MT` (left chart) / `Margin_Pct` (right chart)
- Size: `Margin_Pct`
- Color by `Segment`:
  - Arable Farming = `#173B7A`
  - Specialty Crops = `#1a8754`
  - Horticulture = `#d49a1a`
  - Industrial = `#667885`

**Reference lines** (use Analytics pane):
- Left chart: Y = 310 (target, green dashed), Y = 260 (limit, red dashed)
- Right chart: Y = 28 (target, green dashed), Y = 18 (limit, red dashed)

**Background zones**: Use **Constant Line + Band** in Analytics pane, or overlay transparent rectangles

### Price Alerts
- **Power BI Alternative**: Use a **Table** with conditional row formatting
- Critical rows: light red background, Warning rows: light amber background
- Or use **KPI visual** with conditional icons

### Customer Detail Table
- Sort default: Volume descending
- Conditional formatting on Price Zone / Margin Zone columns (background color rules)
- Trend column: Use KPI icons (up arrow green, down arrow red, dash grey)

---

## PAGE 5: Pricing & Conditions

### Layout
```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Avg Price│ │ Avg Mrgn│ │ Cond Spd│ │ vs LY % │
└─────────┘ └─────────┘ └─────────┘ └─────────┘

┌─────────────────────────────────────────────────────┐
│  TABLE: Product Category Pricing Analysis           │
│  Data: 05_Pricing_by_Product.csv                    │
└─────────────────────────────────────────────────────┘

┌────────────────────────┐ ┌────────────────────────┐
│ CLUSTERED BAR:         │ │ TABLE: Condition Type  │
│ Monthly Condition      │ │ Breakdown              │
│ Spending               │ │ Data: 07_Condition_    │
│ Actual vs Last Year    │ │ Breakdown.csv          │
│ Data: 06_Condition_    │ │ Total row at bottom    │
│ Spending_Monthly.csv   │ │                        │
└────────────────────────┘ └────────────────────────┘
```

### Condition Spending Chart
- **Clustered Bar Chart** (vertical)
- Actual = `#173B7A`, Last Year = `#b8c2cf`
- Rounded corners (use theme)

---

## PAGE 6: Operations

### Layout
```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Tot Vol  │ │ Fcst Ful│ │ Tot Cost│ │ Var %   │
└─────────┘ └─────────┘ └─────────┘ └─────────┘

┌────────────────────────┐ ┌────────────────────────┐
│ LINE: Monthly Volume   │ │ HORIZ BAR: Cost by Cat │
│ Actual + Forecast +    │ │ Actual vs Budget       │
│ Last Year              │ │ Data: 10_Cost_by_      │
│ Data: 09_Volume_       │ │ Category.csv           │
│ Monthly.csv            │ │                        │
└────────────────────────┘ └────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABLE: Production Site Performance                  │
│  Data: 17_Production_Sites.csv                      │
│  Utilization: data bar + % value                    │
│  Status badge: green/amber/red                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABLE: Cost Variance Detail                         │
│  Data: 10_Cost_by_Category.csv                      │
│  Total row at bottom                                 │
└─────────────────────────────────────────────────────┘
```

### Volume Line Chart
- 3 series: Actual = `#173B7A` (thick), Forecast = `#1a8754` (dashed), Last Year = `#667885` (thin)

### Cost Bar Chart
- **Horizontal bar chart** (Bar Chart with categories on Y-axis)
- Actual = `#173B7A`, Budget = `#b8c2cf`

### Production Sites Table
- Use data bars on Utilization column
- Color rules: ≥85% green, 75-85% amber, <75% red
- Status column: conditional background formatting

---

## PAGE 7: Pricing Detail (Deep-Dive)

### Layout
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Avg Price/MT │ │ Avg Margin   │ │ Total Volume │
│ + vs LY %   │ │ + vs LY pp   │ │              │
└──────────────┘ └──────────────┘ └──────────────┘

┌─────────────────────────────────────────────────────┐
│  WATERFALL: Net Revenue — Gross to Net (M€)         │
│  Data: 08_Net_Revenue_Waterfall.csv                 │
│  Gross Revenue & Net Revenue = Total (blue)         │
│  Deductions = red bars                               │
│  Data labels ON                                      │
│  Footer: Total Conditions | Condition Ratio | Net/Gross│
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABLE: Product Category Pricing Analysis           │
│  Data: 05_Pricing_by_Product.csv (same as Page 5)  │
└─────────────────────────────────────────────────────┘
```

### Net Revenue Waterfall
- Same approach as SCO Waterfall (Page 2)
- Mark "Gross Revenue" and "Net Revenue" as **Total**
- All intermediate steps are decreases (red)
- Colors: Total = `#173B7A`, Decrease = `#c43e3e`

---

## PAGE 8: Cost Detail (Deep-Dive)

### Layout
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total Actual │ │ Total Budget │ │ Variance %  │
└──────────────┘ └──────────────┘ └──────────────┘

┌─────────────────────────────────────────────────────┐
│  HORIZ BAR: Cost by Category (M€)                   │
│  Data: 10_Cost_by_Category.csv                      │
│  Actual (#173B7A) vs Budget (#b8c2cf)               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABLE: Variance Detail                              │
│  Columns: Category | Actual | Budget | Var M€ | Var%│
│  Conditional formatting: >2% red, >0% amber, ≤0 green│
└─────────────────────────────────────────────────────┘
```

---

## Tips & Workarounds for Power BI Limitations

### 1. Waterfall Charts
Power BI has a **native Waterfall visual**. Set start/end items as "Total" by right-clicking the bar in the visual. No custom visuals needed.

### 2. Scatter with Background Zones
Power BI's scatter chart supports **constant lines** (Analytics pane) but not filled zones. Workarounds:
- Use **Constant Lines** at Target and Limit thresholds (dashed, colored)
- For background fills, use the **"Charticulator"** custom visual or overlay semi-transparent shapes
- Alternatively, use conditional coloring on the data points themselves

### 3. Hero Gradient Card
Power BI doesn't support gradient card backgrounds natively. Alternatives:
- Use a **rectangle shape** with a dark solid color (`#0f2654`) as the background
- Overlay Card/Multi-row Card visuals on top with transparent backgrounds
- Or use an **image** of the gradient as a background

### 4. Collapsible Alert Banner
Power BI doesn't support collapsible sections. Alternatives:
- Use **Bookmarks + Buttons** to toggle alert visibility
- Or place alerts in a separate **tooltip page** that appears on hover

### 5. Tab-style Time Period Selector
Power BI doesn't have tab buttons natively. Alternatives:
- Use **Button group** with bookmarks (one bookmark per time period)
- Or use a **horizontal slicer** styled as tiles/buttons

### 6. Market Signals Cards
For the 4 market signal cards with colored left borders:
- Use a **Table** visual with conditional formatting (left border)
- Or create 4 **Card visuals** arranged in a 2×2 grid

### 7. Dynamic Data (Like the Web App)
The web app uses a hash function to vary data based on filter selections. In Power BI:
- The CSVs contain the **base/default (YTD, All Regions, etc.)** values
- For full dynamic behavior, replace CSVs with a **SQL/API data source**
- Alternatively, create multiple CSV variations and use **Power Query parameters** to switch

---

## File Checklist

```
powerbi/
├── KS_AgriMetrics_Theme.json     ← Import as Power BI theme
├── DAX_Measures.md               ← All DAX formulas
├── SETUP_GUIDE.md                ← This file
└── data/
    ├── 01_TopKPIs.csv
    ├── 02_SCO_Trend.csv
    ├── 03_SCO_Waterfall.csv
    ├── 04_Product_SCO_Contribution.csv
    ├── 05_Pricing_by_Product.csv
    ├── 06_Condition_Spending_Monthly.csv
    ├── 07_Condition_Breakdown.csv
    ├── 08_Net_Revenue_Waterfall.csv
    ├── 09_Volume_Monthly.csv
    ├── 10_Cost_by_Category.csv
    ├── 11_Customer_Portfolio.csv
    ├── 12_Price_Alerts.csv
    ├── 13_Benchmark_Prices.csv
    ├── 14_Input_Costs.csv
    ├── 15_FX_Rates.csv
    ├── 16_Competitor_Landscape.csv
    ├── 17_Production_Sites.csv
    ├── 18_Market_Signals.csv
    ├── 19_Corridor_Thresholds.csv
    └── 20_Filter_Options.csv
```
