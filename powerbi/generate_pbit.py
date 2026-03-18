#!/usr/bin/env python3
"""
K+S MarginControl — Power BI Template (.pbit) Generator  v2
==========================================================
Run:   python3 generate_pbit.py
Output: KS_MarginControl_Dashboard.pbit

Double-click the .pbit file to open in Power BI Desktop.
All data is embedded — no external files needed.
"""

import json
import zipfile
import uuid
import os
import csv
import struct

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "data")
OUTPUT = os.path.join(SCRIPT_DIR, "KS_MarginControl_Dashboard.pbit")


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
            if val is not None and i < len(types):
                types[i] = m_type_for(val)
    return types


def build_m_expression(headers, rows, m_types):
    """Build M #table() expression with inline data."""
    # Type declaration — all columns in one bracket pair
    col_defs = ", ".join(f"{h} = {t}" for h, t in zip(headers, m_types))
    type_decl = f"type table [{col_defs}]"

    lines = []
    lines.append("let")
    lines.append("    Source = #table(")
    lines.append(f"        {type_decl},")
    lines.append("        {")

    for i, row in enumerate(rows):
        # Pad row if needed
        while len(row) < len(headers):
            row.append(None)
        vals = ", ".join(m_literal(v) for v in row[:len(headers)])
        comma = "," if i < len(rows) - 1 else ""
        lines.append(f"            {{{vals}}}{comma}")

    lines.append("        }")
    lines.append("    )")
    lines.append("in")
    lines.append("    Source")

    return lines


def tom_datatype(m_type):
    """Map M type to TOM dataType string."""
    return {
        "text": "string",
        "number": "double",
        "Int64.Type": "int64",
        "datetime": "dateTime",
    }.get(m_type, "string")


# ---------------------------------------------------------------------------
# Table definitions
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
# DAX Measures
# ---------------------------------------------------------------------------

DAX_MEASURES = [
    # Color constants
    ("_Color_Primary", '"#173B7A"'),
    ("_Color_Positive", '"#1a8754"'),
    ("_Color_Negative", '"#c43e3e"'),
    ("_Color_Warning", '"#d49a1a"'),
    ("_Color_Grey", '"#667885"'),
    ("_Color_LightGrey", '"#b8c2cf"'),
    # Hero KPIs
    ("Actual SCO/MT", 'LOOKUPVALUE(\'01_TopKPIs\'[Value], \'01_TopKPIs\'[KPI_ID], "actual-sco")'),
    ("Delta vs LY", 'LOOKUPVALUE(\'01_TopKPIs\'[Value], \'01_TopKPIs\'[KPI_ID], "vs-ly")'),
    ("Delta vs PL", 'LOOKUPVALUE(\'01_TopKPIs\'[Value], \'01_TopKPIs\'[KPI_ID], "vs-pl")'),
    ("Delta vs Target", 'LOOKUPVALUE(\'01_TopKPIs\'[Value], \'01_TopKPIs\'[KPI_ID], "vs-target")'),
    ("Volume Forecast Fulfillment", 'LOOKUPVALUE(\'01_TopKPIs\'[Value], \'01_TopKPIs\'[KPI_ID], "volume-forecast")'),
    ("Market Price Index", 'LOOKUPVALUE(\'01_TopKPIs\'[Value], \'01_TopKPIs\'[KPI_ID], "market-price-index")'),
    ("Position Valuation", 'LOOKUPVALUE(\'01_TopKPIs\'[Value], \'01_TopKPIs\'[KPI_ID], "position-valuation")'),
    ("Revenue Leakage", 'LOOKUPVALUE(\'01_TopKPIs\'[Value], \'01_TopKPIs\'[KPI_ID], "revenue-leakage")'),
    ("Total SCO All Products", "SUM('04_Product_SCO_Contribution'[Total_SCO_M_EUR])"),
    ("Waterfall Display Value", "SUM('03_SCO_Waterfall'[Value_EUR_MT])"),
    # Market Intelligence
    ("Latest Gas Price", "CALCULATE(MAX('14_Input_Costs'[Natural_Gas_EUR_MWh]), LASTDATE('14_Input_Costs'[Month]))"),
    ("Latest EUR USD", "CALCULATE(MAX('15_FX_Rates'[EUR_USD]), LASTDATE('15_FX_Rates'[Month]))"),
    ("Latest Freight Index", "CALCULATE(MAX('14_Input_Costs'[Freight_Index]), LASTDATE('14_Input_Costs'[Month]))"),
    # Customer Portfolio
    ("Customers Above Target", "COUNTROWS(FILTER('11_Customer_Portfolio', '11_Customer_Portfolio'[Price_EUR_MT] >= 310))"),
    ("Customers Below Limit", "COUNTROWS(FILTER('11_Customer_Portfolio', '11_Customer_Portfolio'[Price_EUR_MT] < 260))"),
    ("Avg Portfolio Price", "AVERAGE('11_Customer_Portfolio'[Price_EUR_MT])"),
    ("Total Active Customers", "COUNTROWS('11_Customer_Portfolio')"),
    # Pricing
    ("Total Condition Spending", "SUM('06_Condition_Spending_Monthly'[Actual_M_EUR])"),
    ("Total Condition LY", "SUM('06_Condition_Spending_Monthly'[LastYear_M_EUR])"),
    # Operations
    ("Total Actual Volume", "SUM('09_Volume_Monthly'[Actual_MT])"),
    ("Total Forecast Volume", "SUM('09_Volume_Monthly'[Forecast_MT])"),
    ("Forecast Fulfillment Pct", "DIVIDE(SUM('09_Volume_Monthly'[Actual_MT]), SUM('09_Volume_Monthly'[Forecast_MT]))"),
    ("Total Actual Cost", "SUM('10_Cost_by_Category'[Actual_M_EUR])"),
    ("Total Budget Cost", "SUM('10_Cost_by_Category'[Budget_M_EUR])"),
    # Pricing Deep-Dive
    ("Gross Revenue", "CALCULATE(SUM('08_Net_Revenue_Waterfall'[Value_M_EUR]), '08_Net_Revenue_Waterfall'[Type] = \"start\")"),
    ("Net Revenue", "CALCULATE(SUM('08_Net_Revenue_Waterfall'[Value_M_EUR]), '08_Net_Revenue_Waterfall'[Type] = \"end\")"),
]


# ---------------------------------------------------------------------------
# Build Tabular Object Model (DataModelSchema)
# ---------------------------------------------------------------------------

def build_data_model():
    tables = []

    for table_name, csv_file in TABLE_CSV_MAP.items():
        headers, rows = read_csv_file(csv_file)
        m_types = infer_m_types(headers, rows)
        m_expr = build_m_expression(headers, rows, m_types)

        columns = []
        for h, mt in zip(headers, m_types):
            columns.append({
                "name": h,
                "dataType": tom_datatype(mt),
                "sourceColumn": h,
            })

        table_def = {
            "name": table_name,
            "columns": columns,
            "partitions": [
                {
                    "name": "Partition",
                    "mode": "import",
                    "source": {
                        "type": "m",
                        "expression": m_expr,
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

    # Measures table
    measures_list = []
    for name, expression in DAX_MEASURES:
        m = {"name": name, "expression": expression}
        if "Pct" in name or "Ratio" in name:
            m["formatString"] = "0.0%"
        elif "EUR" in name or "Cost" in name or "Revenue" in name or "Price" in name:
            m["formatString"] = "#,##0.0"
        measures_list.append(m)

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
        "measures": measures_list,
        "partitions": [
            {
                "name": "Partition",
                "mode": "import",
                "source": {
                    "type": "m",
                    "expression": [
                        "let",
                        '    Source = #table(type table [_MeasureGroup = text], {{"All"}})',
                        "in",
                        "    Source",
                    ],
                },
            }
        ],
        "isHidden": True,
    }
    tables.append(measures_table)

    return {
        "name": "SemanticModel",
        "compatibilityLevel": 1550,
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


# ---------------------------------------------------------------------------
# Build Report Layout
# ---------------------------------------------------------------------------

def make_visual(vtype, x, y, w, h, title, table=None, category=None,
                values=None, columns=None, measure=None,
                x_col=None, y_col=None, text=None):
    """Create a visual container dict."""
    name = uid()
    config = {
        "name": name,
        "layouts": [{
            "id": 0,
            "position": {"x": x, "y": y, "z": 0, "width": w, "height": h, "tabOrder": 0},
        }],
    }

    title_obj = {
        "title": [{
            "properties": {
                "show": {"expr": {"Literal": {"Value": "true"}}},
                "text": {"expr": {"Literal": {"Value": f"'{title}'"}}},
            }
        }]
    }

    if vtype == "textbox":
        config["singleVisual"] = {
            "visualType": "textbox",
            "objects": {
                "general": [{
                    "properties": {
                        "paragraphs": [{
                            "textRuns": [{"value": text or title, "textStyle": {"fontSize": "14px"}}]
                        }]
                    }
                }]
            },
        }
    elif vtype == "card":
        config["singleVisual"] = {
            "visualType": "card",
            "projections": {"Values": [{"queryRef": f"_Measures.{measure}"}]},
            "prototypeQuery": {
                "Version": 2,
                "From": [{"Name": "m", "Entity": "_Measures", "Type": 0}],
                "Select": [{
                    "Measure": {
                        "Expression": {"SourceRef": {"Source": "m"}},
                        "Property": measure,
                    },
                    "Name": f"_Measures.{measure}",
                }],
            },
            "vcObjects": title_obj,
        }
    elif vtype in ("lineChart", "clusteredBarChart", "waterfallChart"):
        alias = "t"
        selects = [{
            "Column": {
                "Expression": {"SourceRef": {"Source": alias}},
                "Property": category,
            },
            "Name": f"{table}.{category}",
        }]
        y_proj = []
        for vc in (values or []):
            selects.append({
                "Aggregation": {
                    "Expression": {
                        "Column": {
                            "Expression": {"SourceRef": {"Source": alias}},
                            "Property": vc,
                        }
                    },
                    "Function": 0,
                },
                "Name": f"Sum({table}.{vc})",
            })
            y_proj.append({"queryRef": f"Sum({table}.{vc})"})
        config["singleVisual"] = {
            "visualType": vtype,
            "projections": {
                "Category": [{"queryRef": f"{table}.{category}"}],
                "Y": y_proj,
            },
            "prototypeQuery": {
                "Version": 2,
                "From": [{"Name": alias, "Entity": table, "Type": 0}],
                "Select": selects,
            },
            "vcObjects": title_obj,
        }
    elif vtype == "scatterChart":
        alias = "t"
        config["singleVisual"] = {
            "visualType": "scatterChart",
            "projections": {
                "X": [{"queryRef": f"Sum({table}.{x_col})"}],
                "Y": [{"queryRef": f"Sum({table}.{y_col})"}],
                "Category": [{"queryRef": f"{table}.{category}"}],
            },
            "prototypeQuery": {
                "Version": 2,
                "From": [{"Name": alias, "Entity": table, "Type": 0}],
                "Select": [
                    {"Column": {"Expression": {"SourceRef": {"Source": alias}}, "Property": category}, "Name": f"{table}.{category}"},
                    {"Aggregation": {"Expression": {"Column": {"Expression": {"SourceRef": {"Source": alias}}, "Property": x_col}}, "Function": 0}, "Name": f"Sum({table}.{x_col})"},
                    {"Aggregation": {"Expression": {"Column": {"Expression": {"SourceRef": {"Source": alias}}, "Property": y_col}}, "Function": 0}, "Name": f"Sum({table}.{y_col})"},
                ],
            },
            "vcObjects": title_obj,
        }
    elif vtype == "tableEx":
        alias = "t"
        selects = []
        proj = []
        for c in (columns or []):
            selects.append({
                "Column": {"Expression": {"SourceRef": {"Source": alias}}, "Property": c},
                "Name": f"{table}.{c}",
            })
            proj.append({"queryRef": f"{table}.{c}"})
        config["singleVisual"] = {
            "visualType": "tableEx",
            "projections": {"Values": proj},
            "prototypeQuery": {
                "Version": 2,
                "From": [{"Name": alias, "Entity": table, "Type": 0}],
                "Select": selects,
            },
            "vcObjects": title_obj,
        }

    return {
        "x": x, "y": y, "z": 0, "width": w, "height": h,
        "config": json.dumps(config),
        "filters": "[]",
    }


def build_report_layout():
    """Build the complete Report/Layout JSON."""
    FW = 1220  # Full width (page 1280 - margins)

    pages = [
        # Page 1: Dashboard
        {
            "name": "Dashboard",
            "visuals": [
                make_visual("card", 30, 20, 280, 160, "Actual SCO/MT", measure="Actual SCO/MT"),
                make_visual("card", 340, 20, 200, 160, "vs Last Year", measure="Delta vs LY"),
                make_visual("card", 570, 20, 200, 160, "vs Plan", measure="Delta vs PL"),
                make_visual("card", 800, 20, 200, 160, "vs Target", measure="Delta vs Target"),
                make_visual("lineChart", 30, 200, FW, 300, "SCO/MT — 12 Month Trend",
                            table="02_SCO_Trend", category="Month",
                            values=["Actual_EUR_MT", "Plan_EUR_MT"]),
                make_visual("tableEx", 30, 520, FW, 280, "Product SCO Contribution",
                            table="04_Product_SCO_Contribution",
                            columns=["Product", "SCO_per_MT_EUR", "Volume_MT", "Total_SCO_M_EUR", "Share_of_Total_Pct", "vs_LY_Pct"]),
            ],
        },
        # Page 2: SCO Bridge
        {
            "name": "SCO Bridge",
            "visuals": [
                make_visual("clusteredBarChart", 30, 20, FW, 380, "SCO Waterfall (EUR/MT)",
                            table="03_SCO_Waterfall", category="Effect_Name",
                            values=["Value_EUR_MT"]),
                make_visual("tableEx", 30, 420, FW, 280, "Effect Details",
                            table="03_SCO_Waterfall",
                            columns=["Effect_Name", "Value_EUR_MT", "Type", "Category"]),
            ],
        },
        # Page 3: Market Intelligence
        {
            "name": "Market Intelligence",
            "visuals": [
                make_visual("card", 30, 20, 280, 130, "Gas Price", measure="Latest Gas Price"),
                make_visual("card", 340, 20, 280, 130, "EUR/USD", measure="Latest EUR USD"),
                make_visual("card", 650, 20, 280, 130, "Freight Index", measure="Latest Freight Index"),
                make_visual("lineChart", 30, 170, FW, 300, "Potash Price Benchmarks",
                            table="13_Benchmark_Prices", category="Month",
                            values=["MOP_Vancouver_FOB_EUR", "MOP_Baltic_EUR", "MOP_Brazil_CFR_EUR", "KS_Realized_Price_EUR"]),
                make_visual("tableEx", 30, 490, FW, 250, "Competitor Landscape",
                            table="16_Competitor_Landscape",
                            columns=["Producer", "Region", "Capacity_MT_yr", "Status", "Price_Impact"]),
            ],
        },
        # Page 4: Customer Portfolio
        {
            "name": "Customer Portfolio",
            "visuals": [
                make_visual("card", 30, 20, 230, 120, "Customers", measure="Total Active Customers"),
                make_visual("card", 290, 20, 230, 120, "Avg Price", measure="Avg Portfolio Price"),
                make_visual("card", 550, 20, 230, 120, "Above Target", measure="Customers Above Target"),
                make_visual("card", 810, 20, 230, 120, "Below Limit", measure="Customers Below Limit"),
                make_visual("scatterChart", 30, 160, 590, 340, "Volume vs Price",
                            table="11_Customer_Portfolio", category="Customer",
                            x_col="Volume_MT", y_col="Price_EUR_MT"),
                make_visual("scatterChart", 650, 160, 590, 340, "Volume vs Margin",
                            table="11_Customer_Portfolio", category="Customer",
                            x_col="Volume_MT", y_col="Margin_Pct"),
                make_visual("tableEx", 30, 520, FW, 280, "Customer Detail",
                            table="11_Customer_Portfolio",
                            columns=["Customer", "Segment", "Archetype", "Volume_MT", "Price_EUR_MT", "Margin_Pct", "Trend"]),
            ],
        },
        # Page 5: Pricing & Conditions
        {
            "name": "Pricing & Conditions",
            "visuals": [
                make_visual("card", 30, 20, 280, 130, "Condition Spending", measure="Total Condition Spending"),
                make_visual("card", 340, 20, 280, 130, "Condition LY", measure="Total Condition LY"),
                make_visual("tableEx", 30, 170, FW, 250, "Product Pricing",
                            table="05_Pricing_by_Product",
                            columns=["Product", "Avg_Price_EUR_MT", "Price_vs_LY_Pct", "Margin_Pct", "Margin_vs_LY_pp", "Volume_MT"]),
                make_visual("clusteredBarChart", 30, 440, 580, 300, "Monthly Condition Spending",
                            table="06_Condition_Spending_Monthly", category="Month",
                            values=["Actual_M_EUR", "LastYear_M_EUR"]),
                make_visual("tableEx", 640, 440, 610, 300, "Condition Breakdown",
                            table="07_Condition_Breakdown",
                            columns=["Condition_Type", "Actual_M_EUR", "Budget_M_EUR", "Variance_Pct", "Share_of_Revenue_Pct"]),
            ],
        },
        # Page 6: Operations
        {
            "name": "Operations",
            "visuals": [
                make_visual("card", 30, 20, 280, 130, "Total Volume", measure="Total Actual Volume"),
                make_visual("card", 340, 20, 280, 130, "Fulfillment", measure="Forecast Fulfillment Pct"),
                make_visual("card", 650, 20, 280, 130, "Total Cost", measure="Total Actual Cost"),
                make_visual("lineChart", 30, 170, 590, 280, "Monthly Volume",
                            table="09_Volume_Monthly", category="Month",
                            values=["Actual_MT", "Forecast_MT", "LastYear_MT"]),
                make_visual("clusteredBarChart", 650, 170, 590, 280, "Cost by Category",
                            table="10_Cost_by_Category", category="Category",
                            values=["Actual_M_EUR", "Budget_M_EUR"]),
                make_visual("tableEx", 30, 470, FW, 280, "Production Sites",
                            table="17_Production_Sites",
                            columns=["Site", "Location", "Product", "Utilization_Pct", "Output_MT", "Cost_per_MT_EUR", "Status"]),
            ],
        },
        # Page 7: Pricing Deep-Dive
        {
            "name": "Pricing Deep-Dive",
            "visuals": [
                make_visual("card", 30, 20, 380, 130, "Gross Revenue", measure="Gross Revenue"),
                make_visual("card", 440, 20, 380, 130, "Net Revenue", measure="Net Revenue"),
                make_visual("clusteredBarChart", 30, 170, FW, 340, "Net Revenue Waterfall",
                            table="08_Net_Revenue_Waterfall", category="Step_Name",
                            values=["Value_M_EUR"]),
                make_visual("tableEx", 30, 530, FW, 250, "Product Pricing Analysis",
                            table="05_Pricing_by_Product",
                            columns=["Product", "Avg_Price_EUR_MT", "Price_vs_LY_Pct", "Margin_Pct", "Volume_MT"]),
            ],
        },
        # Page 8: Cost Deep-Dive
        {
            "name": "Cost Deep-Dive",
            "visuals": [
                make_visual("card", 30, 20, 380, 130, "Total Cost", measure="Total Actual Cost"),
                make_visual("card", 440, 20, 380, 130, "Budget", measure="Total Budget Cost"),
                make_visual("clusteredBarChart", 30, 170, FW, 300, "Cost — Actual vs Budget",
                            table="10_Cost_by_Category", category="Category",
                            values=["Actual_M_EUR", "Budget_M_EUR"]),
                make_visual("tableEx", 30, 490, FW, 260, "Variance Detail",
                            table="10_Cost_by_Category",
                            columns=["Category", "Actual_M_EUR", "Budget_M_EUR", "Variance_M_EUR", "Variance_Pct"]),
            ],
        },
        # Page 9: Alerts & Signals
        {
            "name": "Alerts & Signals",
            "visuals": [
                make_visual("tableEx", 30, 20, FW, 350, "Price Alerts",
                            table="12_Price_Alerts",
                            columns=["Customer", "Product", "Actual_Price_EUR", "Limit_Price_EUR", "Deviation_Pct", "Severity"]),
                make_visual("tableEx", 30, 390, FW, 300, "Market Signals",
                            table="18_Market_Signals",
                            columns=["Title", "Description", "Impact"]),
            ],
        },
        # Page 10: Data & Filters
        {
            "name": "Data & Filters",
            "visuals": [
                make_visual("tableEx", 30, 20, FW, 200, "Corridor Thresholds",
                            table="19_Corridor_Thresholds",
                            columns=["Metric", "Target", "Limit"]),
                make_visual("tableEx", 30, 240, FW, 400, "Filter Options",
                            table="20_Filter_Options",
                            columns=["Filter_Type", "Option_Value", "Sort_Order"]),
            ],
        },
    ]

    sections = []
    for i, page in enumerate(pages):
        section_id = uid().replace("-", "")[:16]
        section_name = f"ReportSection{section_id}"
        sections.append({
            "name": section_name,
            "displayName": page["name"],
            "filters": "[]",
            "ordinal": i,
            "visualContainers": page["visuals"],
            "config": json.dumps({"name": section_name, "displayName": page["name"]}),
            "displayOption": 1,
            "width": 1280,
            "height": 960,
        })

    report_config = {
        "version": "5.53",
        "themeCollection": {
            "baseTheme": {"name": "CY24SU11", "version": "5.53", "type": 2}
        },
        "activeSectionIndex": 0,
        "defaultDrillFilterOtherVisuals": True,
    }

    return {
        "id": 0,
        "reportId": uid(),
        "sections": sections,
        "config": json.dumps(report_config),
        "layoutOptimization": 0,
    }


# ---------------------------------------------------------------------------
# OPC Package / .pbit assembly
# ---------------------------------------------------------------------------

CONTENT_TYPES = '\r\n'.join([
    '<?xml version="1.0" encoding="utf-8"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />',
    '  <Override PartName="/Version" ContentType="text/plain" />',
    '  <Override PartName="/DataModelSchema" ContentType="application/json" />',
    '  <Override PartName="/Report/Layout" ContentType="application/json" />',
    '  <Override PartName="/DiagramLayout" ContentType="application/json" />',
    '  <Override PartName="/Settings" ContentType="application/json" />',
    '  <Override PartName="/Metadata" ContentType="application/json" />',
    '  <Override PartName="/SecurityBindings" ContentType="application/octet-stream" />',
    '</Types>',
])

RELS = '\r\n'.join([
    '<?xml version="1.0" encoding="utf-8"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '</Relationships>',
])


def generate():
    print("Building data model (20 tables + DAX measures)...")
    model = build_data_model()

    print("Building report layout (10 pages with visuals)...")
    layout = build_report_layout()

    metadata_json = json.dumps({"version": 3})
    settings_json = json.dumps({"version": 3})
    diagram_json = json.dumps({"version": "1.0", "diagrams": []})
    model_json = json.dumps(model, ensure_ascii=False)
    layout_json = json.dumps(layout, ensure_ascii=False)

    print(f"Packaging {OUTPUT}...")
    with zipfile.ZipFile(OUTPUT, "w", zipfile.ZIP_DEFLATED) as z:
        # OPC required files
        z.writestr("[Content_Types].xml", CONTENT_TYPES.encode("utf-8"))
        z.writestr("_rels/.rels", RELS.encode("utf-8"))

        # SecurityBindings — minimal non-empty binary (required by PBI)
        z.writestr("SecurityBindings", b"\x00\x00\x00\x00")

        # Version — pure ASCII, no encoding prefix whatsoever
        z.writestr("Version", "2.0".encode("ascii"))

        # Core content — UTF-16 LE BOM
        z.writestr("DataModelSchema", encode_utf16le(model_json))
        z.writestr("Report/Layout", encode_utf16le(layout_json))

        # Supporting files — UTF-16 LE BOM
        z.writestr("DiagramLayout", encode_utf16le(diagram_json))
        z.writestr("Metadata", encode_utf16le(metadata_json))
        z.writestr("Settings", encode_utf16le(settings_json))

    size_kb = os.path.getsize(OUTPUT) / 1024
    print(f"\nDone! Generated: {OUTPUT} ({size_kb:.0f} KB)")
    print("\nOpen the .pbit in Power BI Desktop:")
    print("  1. Double-click KS_MarginControl_Dashboard.pbit")
    print("  2. Click 'Load' when prompted")
    print("  3. Apply theme: View > Themes > Browse > KS_MarginControl_Theme.json")


if __name__ == "__main__":
    generate()
