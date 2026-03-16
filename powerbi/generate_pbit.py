#!/usr/bin/env python3
"""
K+S AgriMetrics — Power BI Template (.pbit) Generator
=====================================================
Run:   python3 generate_pbit.py
Output: KS_AgriMetrics_Dashboard.pbit

Double-click the .pbit file to open in Power BI Desktop.
All data is embedded — no external files needed.
"""

import json
import zipfile
import uuid
import os
import csv
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "data")
OUTPUT = os.path.join(SCRIPT_DIR, "KS_AgriMetrics_Dashboard.pbit")
THEME_FILE = os.path.join(SCRIPT_DIR, "KS_AgriMetrics_Theme.json")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def uid():
    return str(uuid.uuid4())


def encode_utf16le(text):
    """Encode string as UTF-16 LE with BOM (Power BI internal encoding)."""
    return b"\xff\xfe" + text.encode("utf-16-le")


def read_csv_file(filename):
    """Read a CSV and return (headers, rows) with auto-typed values."""
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        headers = next(reader)
        rows = []
        for row in reader:
            typed = []
            for val in row:
                val = val.strip()
                if val == "":
                    typed.append(None)
                else:
                    try:
                        if "." in val:
                            typed.append(float(val))
                        else:
                            typed.append(int(val))
                    except ValueError:
                        typed.append(val)
            rows.append(typed)
    return headers, rows


def m_literal(val):
    """Convert Python value to M language literal."""
    if val is None:
        return "null"
    if isinstance(val, bool):
        return "true" if val else "false"
    if isinstance(val, int):
        return str(val)
    if isinstance(val, float):
        return str(val)
    # String — escape double quotes
    escaped = str(val).replace('"', '""')
    return f'"{escaped}"'


def m_type_for(val):
    """Infer M column type from a Python value."""
    if isinstance(val, float):
        return "number"
    if isinstance(val, int):
        return "Int64.Type"
    return "text"


def infer_m_types(headers, rows):
    """Infer M types for each column from the first non-null row."""
    types = ["text"] * len(headers)
    for row in rows:
        for i, val in enumerate(row):
            if val is not None:
                types[i] = m_type_for(val)
        if all(t != "text" or rows[0][i] is not None for i, t in enumerate(types)):
            break
    return types


def build_m_expression(headers, rows, m_types):
    """Build M #table() expression with inline data."""
    # Type declaration
    type_parts = []
    for h, t in zip(headers, m_types):
        type_parts.append(f"[{h} = {t}]")
    type_decl = "type table " + ", ".join(type_parts)

    # Data rows
    row_strs = []
    for row in rows:
        vals = ", ".join(m_literal(v) for v in row)
        row_strs.append(f"        {{{vals}}}")
    data_block = ",\n".join(row_strs)

    expr = f"""let
    Source = #table(
        {type_decl},
        {{
{data_block}
        }}
    )
in
    Source"""
    return expr


def tom_datatype(m_type):
    """Map M type to TOM dataType string."""
    return {
        "text": "string",
        "number": "double",
        "Int64.Type": "int64",
        "datetime": "dateTime",
    }.get(m_type, "string")


# ---------------------------------------------------------------------------
# Table definitions (name → csv filename)
# ---------------------------------------------------------------------------

TABLE_CSV_MAP = {
    "01_TopKPIs": "01_TopKPIs.csv",
    "02_SCO_Trend": "02_SCO_Trend.csv",
    "03_SCO_Waterfall": "03_SCO_Waterfall.csv",
    "04_Product_SCO_Contribution": "04_Product_SCO_Contribution.csv",
    "05_Pricing_by_Product": "05_Pricing_by_Product.csv",
    "06_Condition_Spending_Monthly": "06_Condition_Spending_Monthly.csv",
    "07_Condition_Breakdown": "07_Condition_Breakdown.csv",
    "08_Net_Revenue_Waterfall": "08_Net_Revenue_Waterfall.csv",
    "09_Volume_Monthly": "09_Volume_Monthly.csv",
    "10_Cost_by_Category": "10_Cost_by_Category.csv",
    "11_Customer_Portfolio": "11_Customer_Portfolio.csv",
    "12_Price_Alerts": "12_Price_Alerts.csv",
    "13_Benchmark_Prices": "13_Benchmark_Prices.csv",
    "14_Input_Costs": "14_Input_Costs.csv",
    "15_FX_Rates": "15_FX_Rates.csv",
    "16_Competitor_Landscape": "16_Competitor_Landscape.csv",
    "17_Production_Sites": "17_Production_Sites.csv",
    "18_Market_Signals": "18_Market_Signals.csv",
    "19_Corridor_Thresholds": "19_Corridor_Thresholds.csv",
    "20_Filter_Options": "20_Filter_Options.csv",
}


# ---------------------------------------------------------------------------
# DAX Measures — grouped by destination table
# ---------------------------------------------------------------------------

MEASURES = {
    "_Measures": [
        # Color constants
        ("_Color_Primary", '"#173B7A"'),
        ("_Color_Positive", '"#1a8754"'),
        ("_Color_Negative", '"#c43e3e"'),
        ("_Color_Warning", '"#d49a1a"'),
        ("_Color_Grey", '"#667885"'),
        ("_Color_LightGrey", '"#b8c2cf"'),
        # Hero KPIs
        ("Actual SCO/MT", "LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], \"actual-sco\")"),
        ("Delta vs LY", "LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], \"vs-ly\")"),
        ("Delta vs PL", "LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], \"vs-pl\")"),
        ("Delta vs Target", "LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], \"vs-target\")"),
        ("Volume Forecast Fulfillment", "LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], \"volume-forecast\")"),
        ("Market Price Index", "LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], \"market-price-index\")"),
        ("Position Valuation", "LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], \"position-valuation\")"),
        ("Revenue Leakage", "LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], \"revenue-leakage\")"),
        # KPI status color
        (
            "KPI Status Color",
            'VAR Status = SELECTEDVALUE(\'01_TopKPIs\'[Status])\n'
            'RETURN SWITCH(Status, "positive", "#1a8754", "negative", "#c43e3e", "warning", "#d49a1a", "#173B7A")',
        ),
        # Product SCO
        ("Total SCO All Products", "SUM('04_Product_SCO_Contribution'[Total_SCO_M_EUR])"),
        (
            "Share of Total",
            "DIVIDE(\n"
            "    SUM('04_Product_SCO_Contribution'[Total_SCO_M_EUR]),\n"
            "    CALCULATE(SUM('04_Product_SCO_Contribution'[Total_SCO_M_EUR]), ALL('04_Product_SCO_Contribution'))\n"
            ")",
        ),
        # SCO Waterfall
        ("Waterfall Display Value", "SUM('03_SCO_Waterfall'[Value_EUR_MT])"),
        (
            "Net SCO Effect",
            "VAR StartVal = CALCULATE(SUM('03_SCO_Waterfall'[Value_EUR_MT]), '03_SCO_Waterfall'[Type] = \"start\")\n"
            "VAR EndVal = CALCULATE(SUM('03_SCO_Waterfall'[Value_EUR_MT]), '03_SCO_Waterfall'[Type] = \"end\")\n"
            "RETURN EndVal - StartVal",
        ),
        (
            "Effect Share",
            "VAR CurrentVal = SUM('03_SCO_Waterfall'[Value_EUR_MT])\n"
            "VAR TotalDelta = [Net SCO Effect]\n"
            "RETURN DIVIDE(CurrentVal, ABS(TotalDelta))",
        ),
        (
            "Waterfall Color",
            'SWITCH(SELECTEDVALUE(\'03_SCO_Waterfall\'[Type]),\n'
            '    "start", "#173B7A", "end", "#173B7A",\n'
            '    "positive", "#1a8754", "negative", "#c43e3e", "#667885")',
        ),
        # Market Intelligence
        (
            "KS Premium Pct",
            "VAR LastMonth = LASTDATE('13_Benchmark_Prices'[Month])\n"
            "VAR KSPrice = CALCULATE(MAX('13_Benchmark_Prices'[KS_Realized_Price_EUR]), '13_Benchmark_Prices'[Month] = LastMonth)\n"
            "VAR MOPVan = CALCULATE(MAX('13_Benchmark_Prices'[MOP_Vancouver_FOB_EUR]), '13_Benchmark_Prices'[Month] = LastMonth)\n"
            "RETURN DIVIDE(KSPrice - MOPVan, MOPVan)",
        ),
        ("Latest Gas Price", "CALCULATE(MAX('14_Input_Costs'[Natural_Gas_EUR_MWh]), LASTDATE('14_Input_Costs'[Month]))"),
        ("Latest EUR USD", "CALCULATE(MAX('15_FX_Rates'[EUR_USD]), LASTDATE('15_FX_Rates'[Month]))"),
        ("Latest Freight Index", "CALCULATE(MAX('14_Input_Costs'[Freight_Index]), LASTDATE('14_Input_Costs'[Month]))"),
        # Customer Portfolio
        ("Customers Above Target", "COUNTROWS(FILTER('11_Customer_Portfolio', '11_Customer_Portfolio'[Price_EUR_MT] >= 310))"),
        (
            "Customers In Corridor",
            "COUNTROWS(FILTER('11_Customer_Portfolio',\n"
            "    '11_Customer_Portfolio'[Price_EUR_MT] >= 260 &&\n"
            "    '11_Customer_Portfolio'[Price_EUR_MT] < 310))",
        ),
        ("Customers Below Limit", "COUNTROWS(FILTER('11_Customer_Portfolio', '11_Customer_Portfolio'[Price_EUR_MT] < 260))"),
        ("Avg Portfolio Price", "AVERAGE('11_Customer_Portfolio'[Price_EUR_MT])"),
        ("Total Active Customers", "COUNTROWS('11_Customer_Portfolio')"),
        (
            "Price Zone",
            'VAR Price = SELECTEDVALUE(\'11_Customer_Portfolio\'[Price_EUR_MT])\n'
            'RETURN IF(Price >= 310, "Above Target", IF(Price >= 260, "In Corridor", "Below Limit"))',
        ),
        (
            "Price Zone Color",
            'VAR Price = SELECTEDVALUE(\'11_Customer_Portfolio\'[Price_EUR_MT])\n'
            'RETURN IF(Price >= 310, "#1a8754", IF(Price >= 260, "#d49a1a", "#c43e3e"))',
        ),
        (
            "Margin Zone",
            'VAR Margin = SELECTEDVALUE(\'11_Customer_Portfolio\'[Margin_Pct])\n'
            'RETURN IF(Margin >= 28, "Above Target", IF(Margin >= 18, "In Corridor", "Below Limit"))',
        ),
        (
            "Margin Zone Color",
            'VAR Margin = SELECTEDVALUE(\'11_Customer_Portfolio\'[Margin_Pct])\n'
            'RETURN IF(Margin >= 28, "#1a8754", IF(Margin >= 18, "#d49a1a", "#c43e3e"))',
        ),
        (
            "Trend Color",
            'SWITCH(SELECTEDVALUE(\'11_Customer_Portfolio\'[Trend]),\n'
            '    "up", "#1a8754", "down", "#c43e3e", "#667885")',
        ),
        # Pricing & Conditions
        (
            "Avg Price Per MT",
            "DIVIDE(\n"
            "    SUMX('05_Pricing_by_Product', '05_Pricing_by_Product'[Avg_Price_EUR_MT] * '05_Pricing_by_Product'[Volume_MT]),\n"
            "    SUM('05_Pricing_by_Product'[Volume_MT])\n"
            ")",
        ),
        (
            "Avg Margin Pct",
            "DIVIDE(\n"
            "    SUMX('05_Pricing_by_Product', '05_Pricing_by_Product'[Margin_Pct] * '05_Pricing_by_Product'[Volume_MT]),\n"
            "    SUM('05_Pricing_by_Product'[Volume_MT])\n"
            ")",
        ),
        ("Total Condition Spending", "SUM('06_Condition_Spending_Monthly'[Actual_M_EUR])"),
        ("Total Condition LY", "SUM('06_Condition_Spending_Monthly'[LastYear_M_EUR])"),
        ("Condition Change vs LY Pct", "DIVIDE([Total Condition Spending] - [Total Condition LY], [Total Condition LY])"),
        ("Total Condition Actual", "SUM('07_Condition_Breakdown'[Actual_M_EUR])"),
        ("Total Condition Budget", "SUM('07_Condition_Breakdown'[Budget_M_EUR])"),
        ("Total Condition Variance Pct", "DIVIDE([Total Condition Actual] - [Total Condition Budget], [Total Condition Budget])"),
        (
            "Variance Color",
            'IF(SELECTEDVALUE(\'07_Condition_Breakdown\'[Variance_Pct]) > 0, "#c43e3e", "#1a8754")',
        ),
        # Operations
        ("Total Actual Volume", "SUM('09_Volume_Monthly'[Actual_MT])"),
        ("Total Forecast Volume", "SUM('09_Volume_Monthly'[Forecast_MT])"),
        ("Forecast Fulfillment Pct", "DIVIDE([Total Actual Volume], [Total Forecast Volume])"),
        ("Total Actual Cost", "SUM('10_Cost_by_Category'[Actual_M_EUR])"),
        ("Total Budget Cost", "SUM('10_Cost_by_Category'[Budget_M_EUR])"),
        ("Cost Variance", "[Total Actual Cost] - [Total Budget Cost]"),
        ("Cost Variance Pct", "DIVIDE([Cost Variance], [Total Budget Cost])"),
        (
            "Site Status Color",
            'SWITCH(SELECTEDVALUE(\'17_Production_Sites\'[Status]),\n'
            '    "on-track", "#1a8754", "attention", "#d49a1a", "critical", "#c43e3e", "#667885")',
        ),
        (
            "Utilization Color",
            'VAR Util = SELECTEDVALUE(\'17_Production_Sites\'[Utilization_Pct])\n'
            'RETURN IF(Util >= 85, "#1a8754", IF(Util >= 75, "#d49a1a", "#c43e3e"))',
        ),
        # Pricing Deep-Dive
        ("Gross Revenue", "CALCULATE(SUM('08_Net_Revenue_Waterfall'[Value_M_EUR]), '08_Net_Revenue_Waterfall'[Type] = \"start\")"),
        ("Net Revenue", "CALCULATE(SUM('08_Net_Revenue_Waterfall'[Value_M_EUR]), '08_Net_Revenue_Waterfall'[Type] = \"end\")"),
        ("Total Conditions M EUR", "[Gross Revenue] - [Net Revenue]"),
        ("Condition Ratio Pct", "DIVIDE([Total Conditions M EUR], [Gross Revenue])"),
        ("Net Gross Ratio Pct", "DIVIDE([Net Revenue], [Gross Revenue])"),
        # Cost Deep-Dive
        (
            "Cost Variance Badge Color",
            'VAR VarPct = SELECTEDVALUE(\'10_Cost_by_Category\'[Variance_Pct])\n'
            'RETURN IF(VarPct > 2, "#c43e3e", IF(VarPct > 0, "#d49a1a", "#1a8754"))',
        ),
    ]
}


# ---------------------------------------------------------------------------
# Build Tabular Object Model (DataModelSchema)
# ---------------------------------------------------------------------------

def build_data_model():
    tables = []

    # -- Data tables from CSVs --
    for table_name, csv_file in TABLE_CSV_MAP.items():
        headers, rows = read_csv_file(csv_file)
        m_types = infer_m_types(headers, rows)
        m_expr = build_m_expression(headers, rows, m_types)

        columns = []
        for i, (h, mt) in enumerate(zip(headers, m_types)):
            col = {
                "name": h,
                "dataType": tom_datatype(mt),
                "sourceColumn": h,
            }
            if i == 0:
                col["isNameColumn"] = True
            columns.append(col)

        table_def = {
            "name": table_name,
            "columns": columns,
            "partitions": [
                {
                    "name": "Partition",
                    "mode": "import",
                    "source": {
                        "type": "m",
                        "expression": m_expr.split("\n"),
                    },
                }
            ],
        }

        # Add sort-by for ordered tables
        if table_name == "03_SCO_Waterfall":
            for col in columns:
                if col["name"] == "Effect_Name":
                    col["sortByColumn"] = "Step_Order"
        if table_name == "08_Net_Revenue_Waterfall":
            for col in columns:
                if col["name"] == "Step_Name":
                    col["sortByColumn"] = "Step_Order"

        tables.append(table_def)

    # -- Measures table --
    measures_table = {
        "name": "_Measures",
        "columns": [
            {
                "name": "_MeasureGroup",
                "dataType": "string",
                "isHidden": True,
                "sourceColumn": "_MeasureGroup",
            }
        ],
        "measures": [],
        "partitions": [
            {
                "name": "Partition",
                "mode": "import",
                "source": {
                    "type": "m",
                    "expression": [
                        'let',
                        '    Source = #table(type table [_MeasureGroup = text], {{"All"}})',
                        'in',
                        '    Source',
                    ],
                },
            }
        ],
        "isHidden": True,
    }

    for name, expression in MEASURES["_Measures"]:
        measure = {
            "name": name,
            "expression": expression.split("\n") if "\n" in expression else expression,
        }
        # Set format strings
        if "Pct" in name or "Ratio" in name or "Share" in name or "Fulfillment" in name:
            measure["formatString"] = "0.0%"
        elif "EUR" in name or "Cost" in name or "Revenue" in name or "SCO" in name or "Price" in name or "Valuation" in name or "Leakage" in name or "Spending" in name:
            measure["formatString"] = "#,##0.0"
        measures_table["measures"].append(measure)

    tables.append(measures_table)

    model = {
        "name": "KS_AgriMetrics",
        "compatibilityLevel": 1567,
        "model": {
            "culture": "en-US",
            "tables": tables,
            "annotations": [
                {
                    "name": "PBI_QueryOrder",
                    "value": json.dumps(list(TABLE_CSV_MAP.keys()) + ["_Measures"]),
                },
                {
                    "name": "__PBI_TimeIntelligenceEnabled",
                    "value": "0",
                },
            ],
        },
    }

    return model


# ---------------------------------------------------------------------------
# Build Report Layout
# ---------------------------------------------------------------------------

PAGE_DEFS = [
    {
        "displayName": "Dashboard",
        "ordinal": 0,
        "visuals": [
            {"type": "card", "x": 30, "y": 20, "w": 280, "h": 160,
             "title": "Actual SCO/MT", "measure": "Actual SCO/MT"},
            {"type": "card", "x": 340, "y": 20, "w": 200, "h": 160,
             "title": "Δ vs Last Year", "measure": "Delta vs LY"},
            {"type": "card", "x": 570, "y": 20, "w": 200, "h": 160,
             "title": "Δ vs Plan", "measure": "Delta vs PL"},
            {"type": "card", "x": 800, "y": 20, "w": 200, "h": 160,
             "title": "Δ vs Target", "measure": "Delta vs Target"},
            {"type": "card", "x": 30, "y": 200, "w": 240, "h": 130,
             "title": "Volume Forecast Fulfillment", "measure": "Volume Forecast Fulfillment"},
            {"type": "card", "x": 300, "y": 200, "w": 240, "h": 130,
             "title": "Market Price Index", "measure": "Market Price Index"},
            {"type": "card", "x": 570, "y": 200, "w": 240, "h": 130,
             "title": "Position Valuation", "measure": "Position Valuation"},
            {"type": "card", "x": 840, "y": 200, "w": 240, "h": 130,
             "title": "Revenue Leakage", "measure": "Revenue Leakage"},
            {"type": "lineChart", "x": 30, "y": 350, "w": 1050, "h": 300,
             "title": "SCO/MT — 12 Month Trend",
             "table": "02_SCO_Trend",
             "category": "Month",
             "values": ["Actual_EUR_MT", "Plan_EUR_MT"]},
            {"type": "table", "x": 30, "y": 670, "w": 1050, "h": 280,
             "title": "Product SCO Contribution",
             "table": "04_Product_SCO_Contribution",
             "columns": ["Product", "SCO_per_MT_EUR", "Volume_MT", "Total_SCO_M_EUR", "Share_of_Total_Pct", "vs_LY_Pct"]},
        ],
    },
    {
        "displayName": "SCO Bridge",
        "ordinal": 1,
        "visuals": [
            {"type": "waterfallChart", "x": 30, "y": 20, "w": 1050, "h": 400,
             "title": "SCO Bridge — Year-over-Year Decomposition",
             "table": "03_SCO_Waterfall",
             "category": "Effect_Name",
             "values": ["Value_EUR_MT"]},
            {"type": "table", "x": 30, "y": 440, "w": 1050, "h": 280,
             "title": "Effect Detail",
             "table": "03_SCO_Waterfall",
             "columns": ["Effect_Name", "Value_EUR_MT", "Type", "Category"]},
        ],
    },
    {
        "displayName": "Market Intelligence",
        "ordinal": 2,
        "visuals": [
            {"type": "card", "x": 30, "y": 20, "w": 240, "h": 130,
             "title": "K+S Premium vs Spot", "measure": "KS Premium Pct"},
            {"type": "card", "x": 300, "y": 20, "w": 240, "h": 130,
             "title": "Gas Price (EUR/MWh)", "measure": "Latest Gas Price"},
            {"type": "card", "x": 570, "y": 20, "w": 240, "h": 130,
             "title": "EUR/USD Rate", "measure": "Latest EUR USD"},
            {"type": "card", "x": 840, "y": 20, "w": 240, "h": 130,
             "title": "Freight Index", "measure": "Latest Freight Index"},
            {"type": "lineChart", "x": 30, "y": 170, "w": 1050, "h": 300,
             "title": "Potash Price Benchmarks",
             "table": "13_Benchmark_Prices",
             "category": "Month",
             "values": ["MOP_Vancouver_FOB_EUR", "MOP_Baltic_EUR", "MOP_Brazil_CFR_EUR", "KS_Realized_Price_EUR"]},
            {"type": "lineChart", "x": 30, "y": 490, "w": 510, "h": 250,
             "title": "Input Cost Tracker",
             "table": "14_Input_Costs",
             "category": "Month",
             "values": ["Natural_Gas_EUR_MWh", "Electricity_EUR_MWh"]},
            {"type": "lineChart", "x": 570, "y": 490, "w": 510, "h": 250,
             "title": "FX Impact",
             "table": "15_FX_Rates",
             "category": "Month",
             "values": ["EUR_USD", "EUR_BRL"]},
            {"type": "table", "x": 30, "y": 760, "w": 1050, "h": 200,
             "title": "Competitor Capacity",
             "table": "16_Competitor_Landscape",
             "columns": ["Producer", "Region", "Capacity_MT_yr", "Status", "Price_Impact", "KS_Implication"]},
        ],
    },
    {
        "displayName": "Customer Portfolio",
        "ordinal": 3,
        "visuals": [
            {"type": "card", "x": 30, "y": 20, "w": 190, "h": 120,
             "title": "Total Customers", "measure": "Total Active Customers"},
            {"type": "card", "x": 250, "y": 20, "w": 190, "h": 120,
             "title": "Avg. Price", "measure": "Avg Portfolio Price"},
            {"type": "card", "x": 470, "y": 20, "w": 190, "h": 120,
             "title": "Above Target", "measure": "Customers Above Target"},
            {"type": "card", "x": 690, "y": 20, "w": 190, "h": 120,
             "title": "In Corridor", "measure": "Customers In Corridor"},
            {"type": "card", "x": 910, "y": 20, "w": 190, "h": 120,
             "title": "Below Limit", "measure": "Customers Below Limit"},
            {"type": "scatterChart", "x": 30, "y": 160, "w": 510, "h": 350,
             "title": "Volume vs. Price Corridor",
             "table": "11_Customer_Portfolio",
             "xCol": "Volume_MT",
             "yCol": "Price_EUR_MT",
             "category": "Customer"},
            {"type": "scatterChart", "x": 570, "y": 160, "w": 510, "h": 350,
             "title": "Volume vs. Margin Corridor",
             "table": "11_Customer_Portfolio",
             "xCol": "Volume_MT",
             "yCol": "Margin_Pct",
             "category": "Customer"},
            {"type": "table", "x": 30, "y": 530, "w": 1050, "h": 400,
             "title": "Customer Detail",
             "table": "11_Customer_Portfolio",
             "columns": ["Customer", "Archetype", "Segment", "Volume_MT", "Price_EUR_MT", "Margin_Pct", "Trend"]},
        ],
    },
    {
        "displayName": "Pricing & Conditions",
        "ordinal": 4,
        "visuals": [
            {"type": "card", "x": 30, "y": 20, "w": 240, "h": 130,
             "title": "Avg Price / MT", "measure": "Avg Price Per MT"},
            {"type": "card", "x": 300, "y": 20, "w": 240, "h": 130,
             "title": "Avg Margin %", "measure": "Avg Margin Pct"},
            {"type": "card", "x": 570, "y": 20, "w": 240, "h": 130,
             "title": "Total Condition Spending", "measure": "Total Condition Spending"},
            {"type": "card", "x": 840, "y": 20, "w": 240, "h": 130,
             "title": "Change vs LY", "measure": "Condition Change vs LY Pct"},
            {"type": "table", "x": 30, "y": 170, "w": 1050, "h": 250,
             "title": "Product Category Pricing Analysis",
             "table": "05_Pricing_by_Product",
             "columns": ["Product", "Avg_Price_EUR_MT", "Price_vs_LY_Pct", "Margin_Pct", "Margin_vs_LY_pp", "Volume_MT"]},
            {"type": "clusteredBarChart", "x": 30, "y": 440, "w": 510, "h": 300,
             "title": "Monthly Condition Spending",
             "table": "06_Condition_Spending_Monthly",
             "category": "Month",
             "values": ["Actual_M_EUR", "LastYear_M_EUR"]},
            {"type": "table", "x": 570, "y": 440, "w": 510, "h": 300,
             "title": "Condition Spending by Type",
             "table": "07_Condition_Breakdown",
             "columns": ["Condition_Type", "Actual_M_EUR", "Budget_M_EUR", "Variance_Pct", "Share_of_Revenue_Pct"]},
        ],
    },
    {
        "displayName": "Operations",
        "ordinal": 5,
        "visuals": [
            {"type": "card", "x": 30, "y": 20, "w": 240, "h": 130,
             "title": "Total Volume", "measure": "Total Actual Volume"},
            {"type": "card", "x": 300, "y": 20, "w": 240, "h": 130,
             "title": "Forecast Fulfillment", "measure": "Forecast Fulfillment Pct"},
            {"type": "card", "x": 570, "y": 20, "w": 240, "h": 130,
             "title": "Total Cost", "measure": "Total Actual Cost"},
            {"type": "card", "x": 840, "y": 20, "w": 240, "h": 130,
             "title": "Cost Variance vs Budget", "measure": "Cost Variance Pct"},
            {"type": "lineChart", "x": 30, "y": 170, "w": 510, "h": 300,
             "title": "Monthly Volume Trend",
             "table": "09_Volume_Monthly",
             "category": "Month",
             "values": ["Actual_MT", "Forecast_MT", "LastYear_MT"]},
            {"type": "clusteredBarChart", "x": 570, "y": 170, "w": 510, "h": 300,
             "title": "Cost by Category",
             "table": "10_Cost_by_Category",
             "category": "Category",
             "values": ["Actual_M_EUR", "Budget_M_EUR"]},
            {"type": "table", "x": 30, "y": 490, "w": 1050, "h": 250,
             "title": "Production Site Performance",
             "table": "17_Production_Sites",
             "columns": ["Site", "Location", "Product", "Utilization_Pct", "Output_MT", "Cost_per_MT_EUR", "Cost_vs_Budget_Pct", "Status"]},
            {"type": "table", "x": 30, "y": 760, "w": 1050, "h": 200,
             "title": "Cost Variance Detail",
             "table": "10_Cost_by_Category",
             "columns": ["Category", "Actual_M_EUR", "Budget_M_EUR", "Variance_M_EUR", "Variance_Pct"]},
        ],
    },
    {
        "displayName": "Pricing Deep-Dive",
        "ordinal": 6,
        "visuals": [
            {"type": "card", "x": 30, "y": 20, "w": 310, "h": 130,
             "title": "Avg. Price / MT", "measure": "Avg Price Per MT"},
            {"type": "card", "x": 370, "y": 20, "w": 310, "h": 130,
             "title": "Avg. Margin", "measure": "Avg Margin Pct"},
            {"type": "card", "x": 710, "y": 20, "w": 310, "h": 130,
             "title": "Total Volume", "measure": "Total Actual Volume"},
            {"type": "waterfallChart", "x": 30, "y": 170, "w": 1050, "h": 350,
             "title": "Net Revenue Waterfall — Gross to Net",
             "table": "08_Net_Revenue_Waterfall",
             "category": "Step_Name",
             "values": ["Value_M_EUR"]},
            {"type": "table", "x": 30, "y": 540, "w": 1050, "h": 250,
             "title": "Product Category Pricing Analysis",
             "table": "05_Pricing_by_Product",
             "columns": ["Product", "Avg_Price_EUR_MT", "Price_vs_LY_Pct", "Margin_Pct", "Margin_vs_LY_pp", "Volume_MT"]},
        ],
    },
    {
        "displayName": "Cost Deep-Dive",
        "ordinal": 7,
        "visuals": [
            {"type": "card", "x": 30, "y": 20, "w": 310, "h": 130,
             "title": "Total Actual Cost", "measure": "Total Actual Cost"},
            {"type": "card", "x": 370, "y": 20, "w": 310, "h": 130,
             "title": "Total Budget", "measure": "Total Budget Cost"},
            {"type": "card", "x": 710, "y": 20, "w": 310, "h": 130,
             "title": "Variance vs Budget", "measure": "Cost Variance Pct"},
            {"type": "clusteredBarChart", "x": 30, "y": 170, "w": 1050, "h": 300,
             "title": "Cost by Category — Actual vs Budget",
             "table": "10_Cost_by_Category",
             "category": "Category",
             "values": ["Actual_M_EUR", "Budget_M_EUR"]},
            {"type": "table", "x": 30, "y": 490, "w": 1050, "h": 280,
             "title": "Variance Detail",
             "table": "10_Cost_by_Category",
             "columns": ["Category", "Actual_M_EUR", "Budget_M_EUR", "Variance_M_EUR", "Variance_Pct"]},
        ],
    },
    {
        "displayName": "Price Alerts",
        "ordinal": 8,
        "visuals": [
            {"type": "table", "x": 30, "y": 20, "w": 1050, "h": 400,
             "title": "Active Price Alerts",
             "table": "12_Price_Alerts",
             "columns": ["Customer", "Product", "Actual_Price_EUR", "Limit_Price_EUR", "Deviation_Pct", "Severity", "Timestamp"]},
            {"type": "table", "x": 30, "y": 440, "w": 1050, "h": 300,
             "title": "Market Signals",
             "table": "18_Market_Signals",
             "columns": ["Title", "Description", "Impact"]},
        ],
    },
    {
        "displayName": "Data Sources",
        "ordinal": 9,
        "visuals": [
            {"type": "textbox", "x": 30, "y": 20, "w": 1050, "h": 100,
             "text": "Data Connections & Source Health\n\nThis page provides an overview of all data sources connected to the K+S AgriMetrics dashboard. In production, SAP S/4HANA, SAP BW/4HANA, Argus FMB, CRM, Mine Production System, and Excel uploads feed real-time data into this dashboard."},
            {"type": "table", "x": 30, "y": 140, "w": 1050, "h": 250,
             "title": "Corridor Thresholds",
             "table": "19_Corridor_Thresholds",
             "columns": ["Metric", "Target", "Limit"]},
            {"type": "table", "x": 30, "y": 410, "w": 1050, "h": 300,
             "title": "Available Filter Options",
             "table": "20_Filter_Options",
             "columns": ["Filter_Type", "Option_Value", "Sort_Order"]},
        ],
    },
]


def make_visual_config(visual_def, idx):
    """Create the config JSON for a visual container."""
    v = visual_def
    name = uid()

    config = {
        "name": name,
        "layouts": [
            {
                "id": 0,
                "position": {
                    "x": v["x"],
                    "y": v["y"],
                    "z": idx,
                    "width": v["w"],
                    "height": v["h"],
                    "tabOrder": idx,
                },
            }
        ],
    }

    vtype = v["type"]

    if vtype == "textbox":
        config["singleVisual"] = {
            "visualType": "textbox",
            "objects": {
                "general": [
                    {
                        "properties": {
                            "paragraphs": [
                                {
                                    "textRuns": [
                                        {
                                            "value": v["text"],
                                            "textStyle": {
                                                "fontFamily": "Inter, Segoe UI, sans-serif",
                                                "fontSize": "12px",
                                            },
                                        }
                                    ],
                                }
                            ]
                        }
                    }
                ]
            },
        }
        return config

    if vtype == "card":
        config["singleVisual"] = {
            "visualType": "card",
            "projections": {"Values": [{"queryRef": f"_Measures.{v['measure']}"}]},
            "prototypeQuery": {
                "Version": 2,
                "From": [{"Name": "m", "Entity": "_Measures", "Type": 0}],
                "Select": [
                    {
                        "Measure": {
                            "Expression": {"SourceRef": {"Source": "m"}},
                            "Property": v["measure"],
                        },
                        "Name": f"_Measures.{v['measure']}",
                    }
                ],
            },
            "objects": {
                "labels": [
                    {
                        "properties": {
                            "fontSize": {"expr": {"Literal": {"Value": "28D"}}},
                            "color": {"solid": {"color": {"expr": {"Literal": {"Value": "'#1a2332'"}}}}},
                            "fontFamily": {"expr": {"Literal": {"Value": "'Inter, Segoe UI, sans-serif'"}}},
                        }
                    }
                ],
                "categoryLabels": [
                    {
                        "properties": {
                            "show": {"expr": {"Literal": {"Value": "true"}}},
                            "fontSize": {"expr": {"Literal": {"Value": "11D"}}},
                            "color": {"solid": {"color": {"expr": {"Literal": {"Value": "'#4a5568'"}}}}},
                        }
                    }
                ],
            },
            "vcObjects": {
                "title": [
                    {
                        "properties": {
                            "show": {"expr": {"Literal": {"Value": "true"}}},
                            "text": {"expr": {"Literal": {"Value": f"'{v['title']}'"}}},
                            "fontSize": {"expr": {"Literal": {"Value": "11D"}}},
                            "fontColor": {"solid": {"color": {"expr": {"Literal": {"Value": "'#667885'"}}}}},
                        }
                    }
                ],
            },
        }
        return config

    if vtype in ("lineChart", "clusteredBarChart", "waterfallChart"):
        table = v["table"]
        alias = table[0].lower()
        category_col = v["category"]
        value_cols = v["values"]

        froms = [{"Name": alias, "Entity": table, "Type": 0}]
        selects = [
            {
                "Column": {
                    "Expression": {"SourceRef": {"Source": alias}},
                    "Property": category_col,
                },
                "Name": f"{table}.{category_col}",
            }
        ]
        value_projections = []
        for vc in value_cols:
            selects.append(
                {
                    "Aggregation": {
                        "Expression": {
                            "Column": {
                                "Expression": {"SourceRef": {"Source": alias}},
                                "Property": vc,
                            }
                        },
                        "Function": 0,  # Sum
                    },
                    "Name": f"Sum({table}.{vc})",
                }
            )
            value_projections.append({"queryRef": f"Sum({table}.{vc})"})

        config["singleVisual"] = {
            "visualType": vtype,
            "projections": {
                "Category": [{"queryRef": f"{table}.{category_col}"}],
                "Y": value_projections,
            },
            "prototypeQuery": {
                "Version": 2,
                "From": froms,
                "Select": selects,
                "OrderBy": [
                    {
                        "Direction": 1,
                        "Expression": {
                            "Column": {
                                "Expression": {"SourceRef": {"Source": alias}},
                                "Property": category_col,
                            }
                        },
                    }
                ],
            },
            "vcObjects": {
                "title": [
                    {
                        "properties": {
                            "show": {"expr": {"Literal": {"Value": "true"}}},
                            "text": {"expr": {"Literal": {"Value": f"'{v['title']}'"}}},
                            "fontSize": {"expr": {"Literal": {"Value": "13D"}}},
                            "fontColor": {"solid": {"color": {"expr": {"Literal": {"Value": "'#4a5568'"}}}}},
                        }
                    }
                ],
            },
        }
        return config

    if vtype == "scatterChart":
        table = v["table"]
        alias = table[0].lower()
        config["singleVisual"] = {
            "visualType": "scatterChart",
            "projections": {
                "X": [{"queryRef": f"Sum({table}.{v['xCol']})"}],
                "Y": [{"queryRef": f"Sum({table}.{v['yCol']})"}],
                "Category": [{"queryRef": f"{table}.{v['category']}"}],
            },
            "prototypeQuery": {
                "Version": 2,
                "From": [{"Name": alias, "Entity": table, "Type": 0}],
                "Select": [
                    {
                        "Column": {
                            "Expression": {"SourceRef": {"Source": alias}},
                            "Property": v["category"],
                        },
                        "Name": f"{table}.{v['category']}",
                    },
                    {
                        "Aggregation": {
                            "Expression": {
                                "Column": {
                                    "Expression": {"SourceRef": {"Source": alias}},
                                    "Property": v["xCol"],
                                }
                            },
                            "Function": 0,
                        },
                        "Name": f"Sum({table}.{v['xCol']})",
                    },
                    {
                        "Aggregation": {
                            "Expression": {
                                "Column": {
                                    "Expression": {"SourceRef": {"Source": alias}},
                                    "Property": v["yCol"],
                                }
                            },
                            "Function": 0,
                        },
                        "Name": f"Sum({table}.{v['yCol']})",
                    },
                ],
            },
            "vcObjects": {
                "title": [
                    {
                        "properties": {
                            "show": {"expr": {"Literal": {"Value": "true"}}},
                            "text": {"expr": {"Literal": {"Value": f"'{v['title']}'"}}},
                            "fontSize": {"expr": {"Literal": {"Value": "13D"}}},
                            "fontColor": {"solid": {"color": {"expr": {"Literal": {"Value": "'#4a5568'"}}}}},
                        }
                    }
                ],
            },
        }
        return config

    if vtype == "table":
        table = v["table"]
        alias = table[0].lower()
        cols = v["columns"]
        froms = [{"Name": alias, "Entity": table, "Type": 0}]
        selects = []
        projections = []
        for c in cols:
            selects.append(
                {
                    "Column": {
                        "Expression": {"SourceRef": {"Source": alias}},
                        "Property": c,
                    },
                    "Name": f"{table}.{c}",
                }
            )
            projections.append({"queryRef": f"{table}.{c}"})

        config["singleVisual"] = {
            "visualType": "tableEx",
            "projections": {"Values": projections},
            "prototypeQuery": {
                "Version": 2,
                "From": froms,
                "Select": selects,
            },
            "vcObjects": {
                "title": [
                    {
                        "properties": {
                            "show": {"expr": {"Literal": {"Value": "true"}}},
                            "text": {"expr": {"Literal": {"Value": f"'{v['title']}'"}}},
                            "fontSize": {"expr": {"Literal": {"Value": "13D"}}},
                            "fontColor": {"solid": {"color": {"expr": {"Literal": {"Value": "'#4a5568'"}}}}},
                        }
                    }
                ],
            },
        }
        return config

    # Fallback — textbox
    config["singleVisual"] = {"visualType": "textbox"}
    return config


def build_report_layout():
    report_id = uid()
    sections = []

    for page in PAGE_DEFS:
        section_name = f"ReportSection{uid().replace('-', '')[:16]}"
        visual_containers = []

        for idx, vis in enumerate(page["visuals"]):
            cfg = make_visual_config(vis, idx)
            container = {
                "x": vis["x"],
                "y": vis["y"],
                "z": idx,
                "width": vis["w"],
                "height": vis["h"],
                "config": json.dumps(cfg),
                "filters": "[]",
            }
            visual_containers.append(container)

        # Page-level config
        page_config = {
            "name": section_name,
            "displayName": page["displayName"],
            "objects": {
                "background": [
                    {
                        "properties": {
                            "color": {"solid": {"color": {"expr": {"Literal": {"Value": "'#f4f6f8'"}}}}},
                            "transparency": {"expr": {"Literal": {"Value": "0D"}}},
                        }
                    }
                ]
            },
        }

        section = {
            "name": section_name,
            "displayName": page["displayName"],
            "filters": "[]",
            "ordinal": page["ordinal"],
            "visualContainers": visual_containers,
            "config": json.dumps(page_config),
            "displayOption": 1,
            "width": 1280,
            "height": 960,
        }
        sections.append(section)

    # Report-level config
    report_config = {
        "version": "5.53",
        "themeCollection": {"baseTheme": {"name": "CY24SU11", "version": "5.53", "type": 2}},
        "activeSectionIndex": 0,
        "defaultDrillFilterOtherVisuals": True,
        "linguisticSchemaSyncVersion": 2,
        "settings": {
            "useStylableVisualContainerHeader": True,
            "exportDataMode": 1,
            "useDefaultAggregateDisplayName": True,
        },
        "objects": {
            "section": [
                {
                    "properties": {
                        "verticalAlignment": {"expr": {"Literal": {"Value": "'Top'"}}},
                    }
                }
            ]
        },
    }

    layout = {
        "id": 0,
        "reportId": report_id,
        "sections": sections,
        "config": json.dumps(report_config),
        "layoutOptimization": 0,
    }

    return layout


# ---------------------------------------------------------------------------
# Package .pbit
# ---------------------------------------------------------------------------

CONTENT_TYPES_XML = """<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="json" ContentType="application/json" />
  <Override PartName="/DataModelSchema" ContentType="application/json" />
  <Override PartName="/Report/Layout" ContentType="application/json" />
  <Override PartName="/DiagramLayout" ContentType="application/json" />
  <Override PartName="/Metadata" ContentType="application/json" />
  <Override PartName="/Settings" ContentType="application/json" />
  <Override PartName="/Version" ContentType="text/plain" />
</Types>"""


def generate():
    print("Building data model (20 tables + DAX measures)...")
    model = build_data_model()

    print("Building report layout (10 pages with visuals)...")
    layout = build_report_layout()

    metadata = {
        "version": 3,
        "creator": "K+S AgriMetrics Generator",
    }

    settings = {
        "version": 3,
    }

    print(f"Packaging {OUTPUT}...")
    with zipfile.ZipFile(OUTPUT, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", CONTENT_TYPES_XML)
        z.writestr("Version", encode_utf16le("2.0"))
        z.writestr("DataModelSchema", encode_utf16le(json.dumps(model, ensure_ascii=False)))
        z.writestr("Report/Layout", encode_utf16le(json.dumps(layout, ensure_ascii=False)))
        z.writestr("DiagramLayout", encode_utf16le(json.dumps({"version": "1.0", "diagrams": []})))
        z.writestr("Metadata", encode_utf16le(json.dumps(metadata)))
        z.writestr("Settings", encode_utf16le(json.dumps(settings)))

    size_kb = os.path.getsize(OUTPUT) / 1024
    print(f"\nDone! Generated: {OUTPUT} ({size_kb:.0f} KB)")
    print("\nNext steps:")
    print("  1. Copy the .pbit file to your Windows PC")
    print("  2. Double-click to open in Power BI Desktop")
    print("  3. When prompted, click 'Load' to import all embedded data")
    print("  4. Apply the K+S theme: View → Themes → Browse → KS_AgriMetrics_Theme.json")
    print("  5. All 10 pages with visuals and DAX measures are ready!")


if __name__ == "__main__":
    generate()
