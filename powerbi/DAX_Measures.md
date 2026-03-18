# DAX-Measures für K+S MarginControl Power BI Dashboard

Diese DAX-Measures nach dem Import der CSV-Datentabellen verwenden. Eine separate
„Measures"-Tabelle anlegen (`Daten eingeben` → benennen als `_Measures`) und jedes Measure unten hinzufügen.

---

## Farbkonstanten (für bedingte Formatierung)

```dax
_Farbe_Primaer = "#173B7A"
_Farbe_Positiv = "#1a8754"
_Farbe_Negativ = "#c43e3e"
_Farbe_Warnung = "#d49a1a"
_Farbe_Grau = "#667885"
_Farbe_Hellgrau = "#b8c2cf"
```

---

## Seite 1: Top-KPIs / Dashboard

```dax
// Hero-KPI
Aktueller SCO je MT =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "actual-sco")

// Vergleichs-KPIs
Delta gg VJ =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "vs-ly")

Delta gg Plan =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "vs-pl")

Delta gg Ziel =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "vs-target")

Volumenprognose Erfuellung =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "volume-forecast")

Marktpreisindex =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "market-price-index")

Positionsbewertung =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "position-valuation")

Erloesausfall =
    LOOKUPVALUE('01_TopKPIs'[Value], '01_TopKPIs'[KPI_ID], "revenue-leakage")

// KPI-Statusfarbe (für bedingte Formatierung)
KPI Statusfarbe =
    VAR Status = SELECTEDVALUE('01_TopKPIs'[Status])
    RETURN SWITCH(Status,
        "positive", "#1a8754",
        "negative", "#c43e3e",
        "warning", "#d49a1a",
        "#173B7A"
    )

// Produkt-SCO-Beitrag
Gesamt SCO alle Produkte =
    SUM('04_Product_SCO_Contribution'[Total_SCO_M_EUR])

Anteil am Gesamt =
    DIVIDE(
        SUM('04_Product_SCO_Contribution'[Total_SCO_M_EUR]),
        CALCULATE(SUM('04_Product_SCO_Contribution'[Total_SCO_M_EUR]), ALL('04_Product_SCO_Contribution'))
    )
```

---

## Seite 2: SCO-Brücke (Wasserfall)

```dax
// Das eingebaute Wasserfall-Visual in Power BI verwenden
// Kategorie = Effect_Name (sortiert nach Step_Order)
// Y-Achsen-Werte = Value_EUR_MT
// Aufschlüsselung = Type ('start'/'end' als Summe markieren)

Wasserfall Anzeigewert =
    SUM('03_SCO_Waterfall'[Value_EUR_MT])

Netto SCO Effekt =
    VAR Startwert = CALCULATE(SUM('03_SCO_Waterfall'[Value_EUR_MT]), '03_SCO_Waterfall'[Type] = "start")
    VAR Endwert = CALCULATE(SUM('03_SCO_Waterfall'[Value_EUR_MT]), '03_SCO_Waterfall'[Type] = "end")
    RETURN Endwert - Startwert

// Effektanteil an Gesamtveränderung
Effektanteil =
    VAR AktuellerWert = SUM('03_SCO_Waterfall'[Value_EUR_MT])
    VAR Gesamtdelta = [Netto SCO Effekt]
    RETURN DIVIDE(AktuellerWert, ABS(Gesamtdelta))

// Wasserfall-Balkenfarbe
Wasserfall Farbe =
    SWITCH(SELECTEDVALUE('03_SCO_Waterfall'[Type]),
        "start", "#173B7A",
        "end", "#173B7A",
        "positive", "#1a8754",
        "negative", "#c43e3e",
        "#667885"
    )

// Kategorie-Badge
Effektkategorie = SELECTEDVALUE('03_SCO_Waterfall'[Category])
```

---

## Seite 3: Marktintelligenz

```dax
// K+S-Prämie gg. Spot
KS Praemie Pzt =
    VAR LetzterMonat = LASTDATE('13_Benchmark_Prices'[Month])
    VAR KSPreis = CALCULATE(MAX('13_Benchmark_Prices'[KS_Realized_Price_EUR]), '13_Benchmark_Prices'[Month] = LetzterMonat)
    VAR MOPVan = CALCULATE(MAX('13_Benchmark_Prices'[MOP_Vancouver_FOB_EUR]), '13_Benchmark_Prices'[Month] = LetzterMonat)
    RETURN DIVIDE(KSPreis - MOPVan, MOPVan)

// Aktueller Gaspreis
Aktueller Gaspreis =
    CALCULATE(MAX('14_Input_Costs'[Natural_Gas_EUR_MWh]), LASTDATE('14_Input_Costs'[Month]))

// Aktueller Wechselkurs
Aktueller EUR USD =
    CALCULATE(MAX('15_FX_Rates'[EUR_USD]), LASTDATE('15_FX_Rates'[Month]))

// Aktueller Frachtindex
Aktueller Frachtindex =
    CALCULATE(MAX('14_Input_Costs'[Freight_Index]), LASTDATE('14_Input_Costs'[Month]))
```

---

## Seite 4: Kundenportfolio

```dax
// Kundenanzahl nach Zone
Kunden ueber Ziel =
    COUNTROWS(FILTER('11_Customer_Portfolio', '11_Customer_Portfolio'[Price_EUR_MT] >= 310))

Kunden im Korridor =
    COUNTROWS(FILTER('11_Customer_Portfolio',
        '11_Customer_Portfolio'[Price_EUR_MT] >= 260 &&
        '11_Customer_Portfolio'[Price_EUR_MT] < 310))

Kunden unter Limit =
    COUNTROWS(FILTER('11_Customer_Portfolio', '11_Customer_Portfolio'[Price_EUR_MT] < 260))

Durchschnittspreis Portfolio =
    AVERAGE('11_Customer_Portfolio'[Price_EUR_MT])

Aktive Kunden gesamt =
    COUNTROWS('11_Customer_Portfolio')

// Preiszone-Badge (für bedingte Formatierung)
Preiszone =
    VAR Preis = SELECTEDVALUE('11_Customer_Portfolio'[Price_EUR_MT])
    RETURN IF(Preis >= 310, "Über Ziel", IF(Preis >= 260, "Im Korridor", "Unter Limit"))

Preiszone Farbe =
    VAR Preis = SELECTEDVALUE('11_Customer_Portfolio'[Price_EUR_MT])
    RETURN IF(Preis >= 310, "#1a8754", IF(Preis >= 260, "#d49a1a", "#c43e3e"))

// Margenzone-Badge
Margenzone =
    VAR Marge = SELECTEDVALUE('11_Customer_Portfolio'[Margin_Pct])
    RETURN IF(Marge >= 28, "Über Ziel", IF(Marge >= 18, "Im Korridor", "Unter Limit"))

Margenzone Farbe =
    VAR Marge = SELECTEDVALUE('11_Customer_Portfolio'[Margin_Pct])
    RETURN IF(Marge >= 28, "#1a8754", IF(Marge >= 18, "#d49a1a", "#c43e3e"))

// Trend-Symbolfarbe
Trendfarbe =
    SWITCH(SELECTEDVALUE('11_Customer_Portfolio'[Trend]),
        "up", "#1a8754",
        "down", "#c43e3e",
        "#667885"
    )
```

---

## Seite 5: Preise & Konditionen

```dax
// Gewichteter Durchschnittspreis über Produkte
Durchschnittspreis je MT =
    DIVIDE(
        SUMX('05_Pricing_by_Product', '05_Pricing_by_Product'[Avg_Price_EUR_MT] * '05_Pricing_by_Product'[Volume_MT]),
        SUM('05_Pricing_by_Product'[Volume_MT])
    )

// Gewichtete Durchschnittsmarge
Durchschnittsmarge Pzt =
    DIVIDE(
        SUMX('05_Pricing_by_Product', '05_Pricing_by_Product'[Margin_Pct] * '05_Pricing_by_Product'[Volume_MT]),
        SUM('05_Pricing_by_Product'[Volume_MT])
    )

// Konditionsausgaben
Konditionsausgaben gesamt = SUM('06_Condition_Spending_Monthly'[Actual_M_EUR])
Konditionsausgaben VJ = SUM('06_Condition_Spending_Monthly'[LastYear_M_EUR])

Konditionsveraenderung gg VJ Pzt =
    DIVIDE([Konditionsausgaben gesamt] - [Konditionsausgaben VJ], [Konditionsausgaben VJ])

// Konditionstyp-Summen
Kondition Ist gesamt = SUM('07_Condition_Breakdown'[Actual_M_EUR])
Kondition Budget gesamt = SUM('07_Condition_Breakdown'[Budget_M_EUR])
Kondition Abweichung Pzt =
    DIVIDE([Kondition Ist gesamt] - [Kondition Budget gesamt], [Kondition Budget gesamt])

// Abweichungsfarbe (Überausgabe = rot)
Abweichungsfarbe =
    IF(SELECTEDVALUE('07_Condition_Breakdown'[Variance_Pct]) > 0, "#c43e3e", "#1a8754")
```

---

## Seite 6: Betrieb & Produktion

```dax
// Mengen
Menge Ist gesamt = SUM('09_Volume_Monthly'[Actual_MT])
Menge Prognose gesamt = SUM('09_Volume_Monthly'[Forecast_MT])
Prognoseerfuellung Pzt = DIVIDE([Menge Ist gesamt], [Menge Prognose gesamt])

// Kosten
Kosten Ist gesamt = SUM('10_Cost_by_Category'[Actual_M_EUR])
Kosten Budget gesamt = SUM('10_Cost_by_Category'[Budget_M_EUR])
Kostenabweichung = [Kosten Ist gesamt] - [Kosten Budget gesamt]
Kostenabweichung Pzt = DIVIDE([Kostenabweichung], [Kosten Budget gesamt])

// Produktionsstandort-Statusfarbe
Standort Statusfarbe =
    SWITCH(SELECTEDVALUE('17_Production_Sites'[Status]),
        "on-track", "#1a8754",
        "attention", "#d49a1a",
        "critical", "#c43e3e",
        "#667885"
    )

// Auslastungsfarbe
Auslastungsfarbe =
    VAR Ausl = SELECTEDVALUE('17_Production_Sites'[Utilization_Pct])
    RETURN IF(Ausl >= 85, "#1a8754", IF(Ausl >= 75, "#d49a1a", "#c43e3e"))
```

---

## Seite 7: Preisdetail (Deep-Dive)

```dax
// Nettoumsatz-Wasserfall — eingebautes Wasserfall-Visual verwenden
// Schritte in 08_Net_Revenue_Waterfall, gleicher Ansatz wie SCO-Wasserfall

Bruttoumsatz =
    CALCULATE(SUM('08_Net_Revenue_Waterfall'[Value_M_EUR]), '08_Net_Revenue_Waterfall'[Type] = "start")

Nettoumsatz =
    CALCULATE(SUM('08_Net_Revenue_Waterfall'[Value_M_EUR]), '08_Net_Revenue_Waterfall'[Type] = "end")

Konditionen gesamt M EUR = [Bruttoumsatz] - [Nettoumsatz]

Konditionsquote Pzt = DIVIDE([Konditionen gesamt M EUR], [Bruttoumsatz])

Netto Brutto Verhaeltnis Pzt = DIVIDE([Nettoumsatz], [Bruttoumsatz])
```

---

## Seite 8: Kostendetail (Deep-Dive)

```dax
// Verwendet 10_Cost_by_Category — gleiche Measures wie Betrieb-Kostenbereich
// Kostenabweichungsdetail-Farbformatierung hinzufügen

Kostenabweichung Badge Farbe =
    VAR AbwPzt = SELECTEDVALUE('10_Cost_by_Category'[Variance_Pct])
    RETURN IF(AbwPzt > 2, "#c43e3e", IF(AbwPzt > 0, "#d49a1a", "#1a8754"))
```

---

## Datenschnitt- / Filter-Measures

```dax
// Für Archetyp-Datenschnitt (erste / ganz linke Position)
Ausgewaehlter Archetyp = SELECTEDVALUE('20_Filter_Options'[Option_Value], "All Archetypes")

// Für Zeitraum-Tabs — Lesezeichen-Navigator oder Schaltflächen-Datenschnitt verwenden
Ausgewaehlter Zeitraum = SELECTEDVALUE('20_Filter_Options'[Option_Value], "YTD")
```
