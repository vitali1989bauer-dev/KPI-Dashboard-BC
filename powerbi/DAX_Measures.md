# DAX Measures for K+S AgriMetrics Power BI Dashboard

Use these DAX measures after importing the CSV data tables. Create a separate
"Measures" table (`Enter Data` → name it `_Measures`) and add each measure below.

---

## Color Constants (used in conditional formatting)

```dax
_Color_Primary = "#173B7A"
_Color_Positive = "#1a8754"
_Color_Negative = "#c43e3e"
_Color_Warning = "#d49a1a"
_Color_Grey = "#667885"
_Color_LightGrey = "#b8c2cf"
```

---

## Page 1: Top KPIs / Dashboard

```dax
// Hero KPI
Actual SCO/MT =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "actual-sco")

// Comparison KPIs
Delta vs LY =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "vs-ly")

Delta vs PL =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "vs-pl")

Delta vs Target =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "vs-target")

Volume Forecast Fulfillment =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "volume-forecast")

Market Price Index =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "market-price-index")

Position Valuation =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "position-valuation")

Revenue Leakage =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "revenue-leakage")

// KPI Status Color (for conditional formatting)
KPI Status Color =
    VAR Status = SELECTEDVALUE('01_TopKPIs'[Status])
    RETURN SWITCH(Status,
        "positive", "#1a8754",
        "negative", "#c43e3e",
        "warning", "#d49a1a",
        "#173B7A"
    )

// Product SCO Contribution
Total SCO All Products =
    SUM('04_Product_SCO_Contribution'[Total_SCO_M_EUR])

Share of Total =
    DIVIDE(
        SUM('04_Product_SCO_Contribution'[Total_SCO_M_EUR]),
        CALCULATE(SUM('04_Product_SCO_Contribution'[Total_SCO_M_EUR]), ALL('04_Product_SCO_Contribution'))
    )
```

---

## Page 2: SCO Bridge (Waterfall)

```dax
// Use the built-in Waterfall chart visual in Power BI
// Category = Effect_Name (sorted by Step_Order)
// Y-axis values = Value_EUR_MT
// Breakdown = Type (use 'start'/'end' as Total sentiment)

Waterfall Display Value =
    SUM('03_SCO_Waterfall'[Value_EUR_MT])

Net SCO Effect =
    VAR StartVal = CALCULATE(SUM('03_SCO_Waterfall'[Value_EUR_MT]), '03_SCO_Waterfall'[Type] = "start")
    VAR EndVal = CALCULATE(SUM('03_SCO_Waterfall'[Value_EUR_MT]), '03_SCO_Waterfall'[Type] = "end")
    RETURN EndVal - StartVal

// Effect share of total delta
Effect Share =
    VAR CurrentVal = SUM('03_SCO_Waterfall'[Value_EUR_MT])
    VAR TotalDelta = [Net SCO Effect]
    RETURN DIVIDE(CurrentVal, ABS(TotalDelta))

// Waterfall bar color
Waterfall Color =
    SWITCH(SELECTEDVALUE('03_SCO_Waterfall'[Type]),
        "start", "#173B7A",
        "end", "#173B7A",
        "positive", "#1a8754",
        "negative", "#c43e3e",
        "#667885"
    )

// Category badge
Effect Category = SELECTEDVALUE('03_SCO_Waterfall'[Category])
```

---

## Page 3: Market Intelligence

```dax
// K+S Premium vs Spot
KS Premium Pct =
    VAR LastMonth = LASTDATE('13_Benchmark_Prices'[Month])
    VAR KSPrice = CALCULATE(MAX('13_Benchmark_Prices'[KS_Realized_Price_EUR]), '13_Benchmark_Prices'[Month] = LastMonth)
    VAR MOPVan = CALCULATE(MAX('13_Benchmark_Prices'[MOP_Vancouver_FOB_EUR]), '13_Benchmark_Prices'[Month] = LastMonth)
    RETURN DIVIDE(KSPrice - MOPVan, MOPVan)

// Gas price latest
Latest Gas Price =
    CALCULATE(MAX('14_Input_Costs'[Natural_Gas_EUR_MWh]), LASTDATE('14_Input_Costs'[Month]))

// FX latest
Latest EUR USD =
    CALCULATE(MAX('15_FX_Rates'[EUR_USD]), LASTDATE('15_FX_Rates'[Month]))

// Freight index latest
Latest Freight Index =
    CALCULATE(MAX('14_Input_Costs'[Freight_Index]), LASTDATE('14_Input_Costs'[Month]))
```

---

## Page 4: Customer Portfolio

```dax
// Customer counts by zone
Customers Above Target =
    COUNTROWS(FILTER('11_Customer_Portfolio', '11_Customer_Portfolio'[Price_EUR_MT] >= 310))

Customers In Corridor =
    COUNTROWS(FILTER('11_Customer_Portfolio',
        '11_Customer_Portfolio'[Price_EUR_MT] >= 260 &&
        '11_Customer_Portfolio'[Price_EUR_MT] < 310))

Customers Below Limit =
    COUNTROWS(FILTER('11_Customer_Portfolio', '11_Customer_Portfolio'[Price_EUR_MT] < 260))

Avg Portfolio Price =
    AVERAGE('11_Customer_Portfolio'[Price_EUR_MT])

Total Active Customers =
    COUNTROWS('11_Customer_Portfolio')

// Price zone badge (for conditional formatting)
Price Zone =
    VAR Price = SELECTEDVALUE('11_Customer_Portfolio'[Price_EUR_MT])
    RETURN IF(Price >= 310, "Above Target", IF(Price >= 260, "In Corridor", "Below Limit"))

Price Zone Color =
    VAR Price = SELECTEDVALUE('11_Customer_Portfolio'[Price_EUR_MT])
    RETURN IF(Price >= 310, "#1a8754", IF(Price >= 260, "#d49a1a", "#c43e3e"))

// Margin zone badge
Margin Zone =
    VAR Margin = SELECTEDVALUE('11_Customer_Portfolio'[Margin_Pct])
    RETURN IF(Margin >= 28, "Above Target", IF(Margin >= 18, "In Corridor", "Below Limit"))

Margin Zone Color =
    VAR Margin = SELECTEDVALUE('11_Customer_Portfolio'[Margin_Pct])
    RETURN IF(Margin >= 28, "#1a8754", IF(Margin >= 18, "#d49a1a", "#c43e3e"))

// Trend icon color
Trend Color =
    SWITCH(SELECTEDVALUE('11_Customer_Portfolio'[Trend]),
        "up", "#1a8754",
        "down", "#c43e3e",
        "#667885"
    )
```

---

## Page 5: Pricing & Conditions

```dax
// Weighted average price across products
Avg Price Per MT =
    DIVIDE(
        SUMX('05_Pricing_by_Product', '05_Pricing_by_Product'[Avg_Price_EUR_MT] * '05_Pricing_by_Product'[Volume_MT]),
        SUM('05_Pricing_by_Product'[Volume_MT])
    )

// Weighted average margin
Avg Margin Pct =
    DIVIDE(
        SUMX('05_Pricing_by_Product', '05_Pricing_by_Product'[Margin_Pct] * '05_Pricing_by_Product'[Volume_MT]),
        SUM('05_Pricing_by_Product'[Volume_MT])
    )

// Condition spending
Total Condition Spending = SUM('06_Condition_Spending_Monthly'[Actual_M_EUR])
Total Condition LY = SUM('06_Condition_Spending_Monthly'[LastYear_M_EUR])

Condition Change vs LY Pct =
    DIVIDE([Total Condition Spending] - [Total Condition LY], [Total Condition LY])

// Condition type totals
Total Condition Actual = SUM('07_Condition_Breakdown'[Actual_M_EUR])
Total Condition Budget = SUM('07_Condition_Breakdown'[Budget_M_EUR])
Total Condition Variance Pct =
    DIVIDE([Total Condition Actual] - [Total Condition Budget], [Total Condition Budget])

// Variance color (overspend = red)
Variance Color =
    IF(SELECTEDVALUE('07_Condition_Breakdown'[Variance_Pct]) > 0, "#c43e3e", "#1a8754")
```

---

## Page 6: Operations

```dax
// Volume
Total Actual Volume = SUM('09_Volume_Monthly'[Actual_MT])
Total Forecast Volume = SUM('09_Volume_Monthly'[Forecast_MT])
Forecast Fulfillment Pct = DIVIDE([Total Actual Volume], [Total Forecast Volume])

// Cost
Total Actual Cost = SUM('10_Cost_by_Category'[Actual_M_EUR])
Total Budget Cost = SUM('10_Cost_by_Category'[Budget_M_EUR])
Cost Variance = [Total Actual Cost] - [Total Budget Cost]
Cost Variance Pct = DIVIDE([Cost Variance], [Total Budget Cost])

// Production site status color
Site Status Color =
    SWITCH(SELECTEDVALUE('17_Production_Sites'[Status]),
        "on-track", "#1a8754",
        "attention", "#d49a1a",
        "critical", "#c43e3e",
        "#667885"
    )

// Utilization color
Utilization Color =
    VAR Util = SELECTEDVALUE('17_Production_Sites'[Utilization_Pct])
    RETURN IF(Util >= 85, "#1a8754", IF(Util >= 75, "#d49a1a", "#c43e3e"))
```

---

## Page 7: Pricing Deep-Dive

```dax
// Net Revenue Waterfall — use built-in waterfall visual
// Steps are in 08_Net_Revenue_Waterfall, same approach as SCO waterfall

Gross Revenue =
    CALCULATE(SUM('08_Net_Revenue_Waterfall'[Value_M_EUR]), '08_Net_Revenue_Waterfall'[Type] = "start")

Net Revenue =
    CALCULATE(SUM('08_Net_Revenue_Waterfall'[Value_M_EUR]), '08_Net_Revenue_Waterfall'[Type] = "end")

Total Conditions M EUR = [Gross Revenue] - [Net Revenue]

Condition Ratio Pct = DIVIDE([Total Conditions M EUR], [Gross Revenue])

Net Gross Ratio Pct = DIVIDE([Net Revenue], [Gross Revenue])
```

---

## Page 8: Cost Deep-Dive

```dax
// Re-uses 10_Cost_by_Category — same measures as Operations cost section
// Add cost variance detail color formatting

Cost Variance Badge Color =
    VAR VarPct = SELECTEDVALUE('10_Cost_by_Category'[Variance_Pct])
    RETURN IF(VarPct > 2, "#c43e3e", IF(VarPct > 0, "#d49a1a", "#1a8754"))
```

---

## Slicer / Filter Measures

```dax
// For Archetype slicer (first / leftmost position)
Selected Archetype = SELECTEDVALUE('20_Filter_Options'[Option_Value], "All Archetypes")

// For time period tabs — use a bookmark navigator or button slicer
Selected Time Period = SELECTEDVALUE('20_Filter_Options'[Option_Value], "YTD")
```
