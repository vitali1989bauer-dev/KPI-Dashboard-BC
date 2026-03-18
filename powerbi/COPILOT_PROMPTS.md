# K+S MarginControl — Copilot-Prompts für Power BI (Deutsch)

Fertige Prompts zum Kopieren in den Copilot-Bereich von Power BI Desktop.
Reihenfolge: Seite für Seite durcharbeiten.

> **Voraussetzung**: Alle 20 CSV-Dateien aus `data/` sind bereits importiert
> und das Design `KS_MarginControl_Theme.json` ist aktiviert.

---

## Vorbereitung

### Measures-Tabelle anlegen
```
Erstelle eine neue Tabelle namens "_Measures" über "Daten eingeben".
Diese Tabelle wird nur für DAX-Measures verwendet.
```

---

## Seite 1: Dashboard (Top-KPIs)

### Prompt 1 — Hero-KPI-Karte
```
Erstelle ein Karten-Visual mit dem Wert aus der Tabelle 01_TopKPIs,
gefiltert auf KPI_ID = "actual-sco". Zeige den Wert groß an mit
der Einheit "€/MT". Titel: "Aktueller SCO/MT".
```

### Prompt 2 — Vergleichs-KPIs
```
Erstelle drei kleine Karten-Visuals nebeneinander aus 01_TopKPIs:
1. KPI_ID = "vs-ly" mit Titel "gg. Vorjahr"
2. KPI_ID = "vs-pl" mit Titel "gg. Plan"
3. KPI_ID = "vs-target" mit Titel "gg. Ziel"
Formatiere positive Werte grün und negative rot.
```

### Prompt 3 — Weitere KPI-Karten
```
Erstelle vier Karten-Visuals in einer Reihe aus 01_TopKPIs für:
1. "volume-forecast" — Titel "Volumenprognose"
2. "market-price-index" — Titel "Marktpreisindex"
3. "position-valuation" — Titel "Positionsbewertung"
4. "revenue-leakage" — Titel "Erlösausfall"
Zeige jeweils Wert, Einheit und die prozentuale Veränderung.
```

### Prompt 4 — SCO-Trend-Flächendiagramm
```
Erstelle ein Flächendiagramm aus der Tabelle 02_SCO_Trend.
X-Achse: Month. Y-Achse: Actual_SCO_MT und Plan_SCO_MT als zwei Reihen.
Ist-Linie in Blau (#173B7A) mit Flächenfüllung, Plan-Linie in Grau
(#667885) gestrichelt ohne Füllung. Titel: "SCO/MT — 12-Monats-Trend".
```

### Prompt 5 — Produkt-SCO-Beitragstabelle
```
Erstelle eine Tabelle aus 04_Product_SCO_Contribution mit den Spalten:
Product, SCO_per_MT, Volume_MT, Total_SCO_M_EUR, Share_of_Total_Pct, vs_LY_Pct.
Füge Datenbalken auf Share_of_Total_Pct hinzu.
Formatiere vs_LY_Pct bedingt: grün wenn >= 0, rot wenn < 0.
Titel: "Produkt-SCO-Beitrag".
```

---

## Seite 2: SCO-Brücke

### Prompt 6 — Wasserfalldiagramm
```
Erstelle ein Wasserfalldiagramm aus 03_SCO_Waterfall.
Kategorie: Effect_Name, sortiert nach Step_Order.
Werte: Value_EUR_MT.
Farben: Zunahme grün (#1a8754), Abnahme rot (#c43e3e), Summe blau (#173B7A).
Datenbeschriftungen einschalten.
Titel: "SCO/MT-Brücke — Wasserfallzerlegung".
```

> **Manuell**: Nach dem Erstellen Rechtsklick auf den ersten und letzten
> Balken → „Als Summe markieren"

### Prompt 7 — Top-5-Effektkarten
```
Erstelle 5 Karten-Visuals aus 03_SCO_Waterfall (ohne start/end-Zeilen).
Sortiere nach Absolutwert von Value_EUR_MT absteigend, nimm die Top 5.
Zeige Effect_Name und Value_EUR_MT mit Vorzeichen (+/-) und "€/MT".
Positive Werte: grüner Rahmen. Negative Werte: roter Rahmen.
```

### Prompt 8 — Effektdetail-Tabelle
```
Erstelle eine Tabelle aus 03_SCO_Waterfall (nur Zeilen wo Type nicht
"start" und nicht "end" ist) mit Spalten: Effect_Name, Value_EUR_MT,
Category. Füge eine Summenzeile hinzu. Titel: "Effektdetail".
Formatiere Value_EUR_MT bedingt: positiv grün, negativ rot.
```

---

## Seite 3: Marktintelligenz

### Prompt 9 — Benchmark-KPI-Karten
```
Erstelle vier KPI-Karten in einer Reihe:
1. "K+S-Prämie" — berechnet aus dem letzten Monat in 13_Benchmark_Prices
2. "Gaspreis" — letzter Wert Natural_Gas_EUR_MWh aus 14_Input_Costs
3. "EUR/USD" — letzter Wert aus 15_FX_Rates
4. "Frachtindex" — letzter Wert Freight_Index aus 14_Input_Costs
```

### Prompt 10 — Kali-Benchmark-Liniendiagramm
```
Erstelle ein Liniendiagramm aus 13_Benchmark_Prices.
X-Achse: Month.
Reihen: MOP_Vancouver_FOB_EUR, MOP_Baltic_FOB_EUR, MOP_Brazil_CFR_EUR,
KS_Realized_Price_EUR.
K+S-Reihe gestrichelt mit Flächenfüllung in Grün.
Titel: "Kali-Preisbenchmarks (€/MT)".
```

### Prompt 11 — Inputkosten-Diagramm
```
Erstelle ein Liniendiagramm mit doppelter Y-Achse aus 14_Input_Costs.
X-Achse: Month.
Linke Y-Achse: Natural_Gas_EUR_MWh (gelb #d49a1a).
Rechte Y-Achse: Electricity_EUR_MWh (rot #c43e3e).
Titel: "Inputkosten-Tracker".
```

### Prompt 12 — Wechselkurs-Diagramm
```
Erstelle ein Liniendiagramm mit doppelter Y-Achse aus 15_FX_Rates.
X-Achse: Month.
Linke Y-Achse: EUR_USD (blau #173B7A).
Rechte Y-Achse: EUR_BRL (grün #1a8754).
Titel: "Wechselkursentwicklung".
```

### Prompt 13 — Wettbewerbertabelle
```
Erstelle eine Tabelle aus 16_Competitor_Landscape mit allen Spalten.
Bedingte Formatierung auf Price_Impact: "bullish" grüner Hintergrund,
"bearish" roter Hintergrund, "neutral" grauer Hintergrund.
Titel: "Globale Kali-Wettbewerbslandschaft".
```

---

## Seite 4: Kundenportfolio

### Prompt 14 — Portfolio-KPI-Karten
```
Erstelle fünf KPI-Karten aus 11_Customer_Portfolio:
1. Gesamtanzahl Kunden (COUNTROWS)
2. Durchschnittspreis (AVERAGE von Price_EUR_MT) mit "€/MT"
3. Anzahl Kunden mit Price_EUR_MT >= 310 — "Über Ziel"
4. Anzahl Kunden mit Price_EUR_MT >= 260 und < 310 — "Im Korridor"
5. Anzahl Kunden mit Price_EUR_MT < 260 — "Unter Limit"
Karte 3 grün, Karte 4 gelb, Karte 5 rot formatieren.
```

### Prompt 15 — Preis-Streudiagramm
```
Erstelle ein Streudiagramm aus 11_Customer_Portfolio.
X-Achse: Volume_MT. Y-Achse: Price_EUR_MT.
Blasengröße: Margin_Pct. Farbe nach Segment.
Datenpunktbeschriftung: Customer_Name.
Füge Referenzlinien hinzu: Y = 310 (grün gestrichelt, "Zielpreis")
und Y = 260 (rot gestrichelt, "Limitpreis").
Titel: "Menge vs. Preiskorridor".
```

### Prompt 16 — Margen-Streudiagramm
```
Erstelle ein Streudiagramm aus 11_Customer_Portfolio.
X-Achse: Volume_MT. Y-Achse: Margin_Pct.
Blasengröße: Margin_Pct. Farbe nach Segment.
Referenzlinien: Y = 28 (grün, "Zielmarge") und Y = 18 (rot, "Limitmarge").
Titel: "Menge vs. Margenkorridor".
```

### Prompt 17 — Kundendetail-Tabelle
```
Erstelle eine Tabelle aus 11_Customer_Portfolio mit den Spalten:
Customer_Name, Archetype, Segment, Volume_MT, Price_EUR_MT, Margin_Pct, Trend.
Sortierung: Volume_MT absteigend.
Bedingte Formatierung auf Price_EUR_MT: >= 310 grün, >= 260 gelb, < 260 rot.
Gleiche Formatierung auf Margin_Pct: >= 28 grün, >= 18 gelb, < 18 rot.
Titel: "Kundendetail".
```

---

## Seite 5: Preise & Konditionen

### Prompt 18 — Preis-KPI-Karten
```
Erstelle vier KPI-Karten:
1. Gewichteter Durchschnittspreis aus 05_Pricing_by_Product (SUMPRODUCT Preis*Menge / SUM Menge)
2. Gewichtete Durchschnittsmarge aus 05_Pricing_by_Product
3. Gesamte Konditionsausgaben aus 06_Condition_Spending_Monthly (SUM Actual_M_EUR) mit "M€"
4. Veränderung gg. Vorjahr in Prozent
```

### Prompt 19 — Preisanalyse-Tabelle
```
Erstelle eine Tabelle aus 05_Pricing_by_Product mit allen Spalten.
Formatiere Price_vs_LY_Pct und Margin_vs_LY_Pct bedingt: positiv grün, negativ rot.
Titel: "Preisanalyse nach Produktkategorie".
```

### Prompt 20 — Konditionsausgaben-Balkendiagramm
```
Erstelle ein gruppiertes Säulendiagramm aus 06_Condition_Spending_Monthly.
X-Achse: Month.
Werte: Actual_M_EUR (blau #173B7A) und LastYear_M_EUR (hellgrau #b8c2cf).
Legende: "Ist" und "Vorjahr".
Titel: "Monatliche Konditionsausgaben".
```

### Prompt 21 — Konditionsaufschlüsselung
```
Erstelle eine Tabelle aus 07_Condition_Breakdown mit Spalten:
Condition_Type, Actual_M_EUR, Budget_M_EUR, Variance_Pct, Share_of_Revenue_Pct.
Summenzeile hinzufügen.
Variance_Pct bedingt formatieren: positiv rot (Überschreitung), negativ grün.
Titel: "Konditionstyp-Aufschlüsselung".
```

---

## Seite 6: Betrieb & Produktion

### Prompt 22 — Betriebs-KPIs
```
Erstelle vier KPI-Karten:
1. Gesamtmenge Ist (SUM Actual_MT aus 09_Volume_Monthly) mit "MT"
2. Prognoseerfüllung (Ist / Prognose * 100) mit "%"
3. Gesamtkosten Ist (SUM Actual_M_EUR aus 10_Cost_by_Category) mit "M€"
4. Kostenabweichung in % ((Ist - Budget) / Budget * 100)
```

### Prompt 23 — Mengen-Liniendiagramm
```
Erstelle ein Liniendiagramm aus 09_Volume_Monthly.
X-Achse: Month.
Reihen: Actual_MT (blau #173B7A, dicke Linie), Forecast_MT (grün #1a8754,
gestrichelt), LastYear_MT (grau #667885, dünne Linie).
Titel: "Monatliche Mengenentwicklung".
```

### Prompt 24 — Kosten-Balkendiagramm
```
Erstelle ein horizontales Balkendiagramm aus 10_Cost_by_Category.
Y-Achse: Category.
Werte: Actual_M_EUR (blau #173B7A) und Budget_M_EUR (hellgrau #b8c2cf).
Titel: "Kosten nach Kategorie — Ist vs. Budget".
```

### Prompt 25 — Produktionsstandort-Tabelle
```
Erstelle eine Tabelle aus 17_Production_Sites mit Spalten:
Site, Location, Product, Utilization_Pct, Output_MT, Cost_per_MT,
Cost_vs_Budget_Pct, Status.
Datenbalken auf Utilization_Pct. Bedingte Formatierung: >= 85% grün,
75-85% gelb, < 75% rot.
Status-Spalte: "on-track" grün, "attention" gelb, "critical" rot.
Titel: "Produktionsstandort-Performance".
```

---

## Seite 7: Preisdetail (Deep-Dive)

### Prompt 26 — Nettoumsatz-Wasserfall
```
Erstelle ein Wasserfalldiagramm aus 08_Net_Revenue_Waterfall.
Kategorie: Step_Name, sortiert nach Step_Order.
Werte: Value_M_EUR.
Summe-Farbe blau (#173B7A), Abnahme rot (#c43e3e).
Datenbeschriftungen einschalten.
Titel: "Nettoumsatz — Brutto zu Netto (M€)".
```

> **Manuell**: Ersten Balken (Bruttoumsatz) und letzten Balken (Nettoumsatz)
> als „Summe" markieren.

### Prompt 27 — Umsatzkennzahlen-Karten
```
Erstelle drei KPI-Karten:
1. Durchschnittspreis je MT aus 05_Pricing_by_Product (gewichtet)
2. Durchschnittsmarge (gewichtet)
3. Gesamtmenge (SUM Volume_MT)
Jeweils Veränderung gg. Vorjahr als Badge anzeigen.
```

---

## Seite 8: Kostendetail (Deep-Dive)

### Prompt 28 — Kosten-KPIs
```
Erstelle drei KPI-Karten aus 10_Cost_by_Category:
1. Gesamt Ist-Kosten (SUM Actual_M_EUR) mit "M€"
2. Gesamt Budget (SUM Budget_M_EUR) mit "M€"
3. Gesamtabweichung in % — bedingt: positiv rot, negativ grün
```

### Prompt 29 — Kostenabweichungstabelle
```
Erstelle eine Tabelle aus 10_Cost_by_Category mit Spalten:
Category, Actual_M_EUR, Budget_M_EUR, Variance_M_EUR, Variance_Pct.
Summenzeile hinzufügen.
Bedingte Formatierung auf Variance_Pct: > 2% roter Hintergrund,
> 0% gelber Hintergrund, <= 0% grüner Hintergrund.
Titel: "Kostenabweichungsdetail".
```

---

## Fertigstellung

### Navigation einrichten (manuell)
```
Auf jeder Seite:
1. Einfügen → Formen → Rechteck (links, 240px breit, volle Höhe)
2. Farbe: #0f2654
3. Textfeld darauf: "K+S MarginControl" in Weiß, Fett
4. Einfügen → Schaltflächen → Seitennavigation
5. Für jede der 8 Seiten eine Schaltfläche hinzufügen
```

### Design-Feinschliff (manuell)
```
- Alle Karten: weißer Hintergrund, 1px Rahmen #d5dbe3, Eckenradius 12px
- Gitternetzlinien: gestrichelt, vertikal aus
- Schriftart: Inter oder Segoe UI
- Datenschnitte oben auf jeder Seite platzieren
```
