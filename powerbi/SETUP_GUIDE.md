# K+S MarginControl — Power BI Einrichtungsanleitung

Vollständige Anleitung zur Nachbildung des webbasierten KPI-Dashboards in Power BI Desktop.

---

## Schnellstart

1. **Power BI Desktop** öffnen
2. **Design importieren**: Ansicht → Designs → Durchsuchen → `KS_MarginControl_Theme.json` auswählen
3. **Alle 20 CSV-Dateien** aus dem Ordner `data/` importieren (Daten abrufen → Text/CSV)
4. Den seitenweisen Anweisungen unten folgen
5. DAX-Measures aus `DAX_Measures.md` hinzufügen

---

## Farbreferenz

| Name | Hex | Verwendung |
|------|-----|------------|
| Primär (K+S Blau) | `#173B7A` | Hauptfarbe, Überschriften, primäre Balken |
| Primär Hell | `#2a5199` | Hover-Zustände |
| Seitenleiste Dunkel | `#0f2654` | Hero-Karten-Verlauf |
| Positiv / Grün | `#1a8754` | Gute KPIs, über Zielwert |
| Negativ / Rot | `#c43e3e` | Schlechte KPIs, unter Limit, Kostenüberschreitung |
| Warnung / Gelb | `#d49a1a` | Warnungen, im Korridor |
| Grau / Akzent | `#667885` | Sekundärtext, gedämpfte Elemente |
| Hellgrau | `#b8c2cf` | „Vorjahr"- / „Budget"-Balken |
| Hintergrund | `#f4f6f8` | Seitenhintergrund |
| Karte Weiß | `#ffffff` | Visual-Hintergründe |
| Rahmen | `#d5dbe3` | Kartenrahmen, Gitternetzlinien |
| Text Primär | `#1a2332` | Haupttext |
| Text Sekundär | `#4a5568` | Untertitel, Achsenbeschriftungen |
| Text Gedämpft | `#667885` | Beschriftungen, Hinweise |

---

## Globale Einstellungen

- **Seitengröße**: 1440 × 900 px (benutzerdefiniert, oder 16:9)
- **Seitenhintergrund**: `#f4f6f8`
- **Schriftart**: Inter (von Google Fonts installieren) oder Segoe UI als Fallback
- **Kartenstil**: Weißer Hintergrund, 1px `#d5dbe3` Rahmen, 12px Eckenradius
- **Gitternetzlinien**: Gestrichelt, `#d5dbe3`, vertikal aus bei den meisten Diagrammen

---

## Navigation einrichten

Erstelle eine **linke Seitenleiste** mit einem Rechteck (Breite: 240px, volle Höhe):
- Hintergrund: Linearer Farbverlauf von `#0f2654` (oben) nach `#091a3d` (unten)
- Textfeld oben einfügen: „K+S MarginControl" in Weiß Fett + „Düngemittel & Salz KPI" als Untertitel
- **Seitennavigations-Schaltflächen** für jede Seite hinzufügen (weißer Text, `#173B7A` Hervorhebung bei aktiver Seite)

**Anzulegende Seiten (8 Berichtsseiten):**
1. Dashboard (Top-KPIs)
2. SCO-Brücke
3. Marktintelligenz
4. Kundenportfolio
5. Preise & Konditionen
6. Betrieb & Produktion
7. Preisdetail (Deep-Dive)
8. Kostendetail (Deep-Dive)

---

## Filterleiste (alle Seiten)

Füge eine **horizontale Datenschnitt-Leiste** oben auf jeder Seite hinzu (unterhalb des Seitentitels):

**Datenschnitt-Reihenfolge (LINKS nach RECHTS) — Archetyp ZUERST:**
1. **Archetyp** ← WICHTIGSTER, erste Position
2. Region
3. Cluster
4. Segment
5. Kunde
6. Produkt

**Datenschnitt-Stil**: Dropdown, horizontale Kacheln oder Schaltflächen
- Daten aus `20_Filter_Options.csv` verwenden (nach `Filter_Type` für jeden Datenschnitt filtern)
- Nach `Sort_Order`-Spalte sortieren

**Zeitraum**: Als **Schaltflächenleiste / Lesezeichennavigation** über den Datenschnitten hinzufügen
- Optionen: Monat-zu-Monat | PL-Periode | **YTD** (Standard) | Gesamtjahr / Geschäftsjahr
- Stil: Tab-Schaltflächen, aktiv = `#173B7A` weißer Text, inaktiv = Grau

> **Power BI Hinweis zur Filterreaktivität**: Da die CSVs statische Basisdaten enthalten,
> wirken Datenschnitte nur als visuelle Filter. Für vollständige dynamische Neuberechnung wie in der Web-App
> eine Live-Datenquelle anbinden oder Power-Query-Parameter verwenden.

---

## SEITE 1: Dashboard (Top-KPIs)

### Layout

```
┌─────────────────────────────────────────────────────┐
│  HERO-KARTE: Aktueller SCO/MT (dunkler Verlauf)     │
│  218,5 €/MT · YTD                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ gg. VJ   │ │ gg. Plan │ │gg. Ziel  │             │
│  │ +14,7    │ │ -4,8     │ │ +6,3     │             │
│  └──────────┘ └──────────┘ └──────────┘             │
└─────────────────────────────────────────────────────┘

┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Vol.-Prog. │ │ Marktindex │ │ Pos.-Bew.  │ │ Erl.-Verl. │
│ 92,6%      │ │ 112,4      │ │ 5,8 M€     │ │ 24,3 M€    │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

┌─────────────────────────────────────────────────────┐
│  FLÄCHENDIAGRAMM: SCO/MT — 12-Monats-Trend           │
│  Daten: 02_SCO_Trend.csv                             │
│  Reihen: Ist (durchgez. #173B7A) + Plan (gestr. grau)│
│  Y-Achse: €/MT   X-Achse: Monat                      │
│  Fläche unter Ist mit Verlauf füllen                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABELLE: Produkt-SCO-Beitrag                        │
│  Daten: 04_Product_SCO_Contribution.csv              │
│  Spalten: Produkt | SCO/MT | Menge | Gesamt-SCO |    │
│           Anteil (mit Datenbalken) | gg. VJ (farbig)  │
└─────────────────────────────────────────────────────┘
```

### Hero-Karte
- Ein **Rechteck** mit Verlaufsfüllung verwenden: `#0f2654` → `#173B7A` → `#0f2654`
- **Karten-Visuals** darin platzieren für Hauptwert und 3 Vergleichsboxen
- Vergleichsboxen: halbtransparenter weißer Hintergrund (`rgba(255,255,255,0.1)`)

### KPI-Karten (4er-Reihe)
- **Karte** oder **Mehrzeilige Karte** verwenden
- Datenquelle: `01_TopKPIs.csv` (jede Karte auf ihre KPI_ID filtern)
- Anzeigen: Wert + Einheit + Veränderungsbadge + Untertitel
- Bedingte Formatierung: `KPI Status Farbe`-Measure verwenden

### SCO-Trenddiagramm
- **Flächendiagramm**
- Daten: `02_SCO_Trend.csv`
- Legende: Ist (durchgezogene Linie `#173B7A`, Flächenverlauf) + Plan (gestrichelte Linie `#667885`, keine Füllung)
- Y-Achse: `€{Wert}` Format

### Produkt-SCO-Tabelle
- **Tabelle** oder **Matrix**
- Daten: `04_Product_SCO_Contribution.csv`
- Datenbalken auf `Share_of_Total_Pct`-Spalte
- Farbe `vs_LY_Pct`: Grün wenn ≥ 0, Rot wenn < 0

---

## SEITE 2: SCO-Brücke

### Layout
```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ Top-5-Effekt-Zusammenfassungskarten (sortiert nach |Auswirkung|) │
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘

┌─────────────────────────────────────────────────────┐
│  WASSERFALLDIAGRAMM: SCO/MT-Brücke                   │
│  Daten: 03_SCO_Waterfall.csv                         │
│  Kategorie: Effect_Name (sortiert nach Step_Order)   │
│  Werte: Value_EUR_MT                                  │
│  Start-/End-Balken als „Summe" markieren              │
│  Farben: Summe=#173B7A, Zunahme=#1a8754, Abnahme=#c43e3e │
│  Datenbeschriftungen EIN                              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABELLE: Effektdetail                               │
│  Spalten: Effekt | Auswirkung €/MT | Anteil an Δ | Kategorie │
│  Summenzeile unten (fett)                            │
└─────────────────────────────────────────────────────┘
```

### Wasserfalldiagramm
- Das **eingebaute Wasserfall-Visual** von Power BI verwenden
- Kategorie: `Effect_Name` (sortieren nach `Step_Order`)
- Werte: `Value_EUR_MT`
- **„Actual SCO/MT Last Year" und „Actual SCO/MT Current" als Summe markieren** (Rechtsklick → „Summe" im Visual)
- Stimmungsfarben: Zunahme = `#1a8754`, Abnahme = `#c43e3e`, Summe = `#173B7A`

### Zusammenfassungskarten
- 5 Karten-Visuals erstellen, die die Top-5-Effekte nach Absolutwert zeigen
- Grüner Rahmen/Hintergrund für positiv, Rot für negativ

---

## SEITE 3: Marktintelligenz

### Layout
```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ K+S-Prä.│ │ Gaspreis │ │ EUR/USD │ │ Fracht  │
│ X,X%    │ │ €XX,X   │ │ 1,XXX   │ │ XXX     │
└─────────┘ └─────────┘ └─────────┘ └─────────┘

┌─────────────────────────────────────────────────────┐
│  LINIEN-/FLÄCHENDIAGRAMM: Kali-Preisbenchmarks (€/MT)│
│  Daten: 13_Benchmark_Prices.csv                      │
│  4 Reihen: MOP Vancouver, MOP Ostsee, MOP Brasilien, │
│            K+S Realisiert (gestrichelt mit Flächenfüll.)│
└─────────────────────────────────────────────────────┘

┌────────────────────────┐ ┌────────────────────────┐
│ LINIE: Inputkosten     │ │ LINIE: Währungseinfluss │
│ Gas + Strom            │ │ EUR/USD + EUR/BRL       │
│ Doppelte Y-Achse       │ │ Doppelte Y-Achse        │
└────────────────────────┘ └────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABELLE: Globale Kali-Wettbewerbslandschaft         │
│  Daten: 16_Competitor_Landscape.csv                  │
│  Farbe „Preisauswirkung": bullisch=grün, bärisch=rot │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  KARTEN/TEXT: Marktsignale (2×2 Raster)              │
│  Daten: 18_Market_Signals.csv                        │
│  Linker Rand farbig nach Auswirkung                  │
└─────────────────────────────────────────────────────┘
```

### Benchmark-Diagramm
- **Liniendiagramm** (+ Fläche für K+S Realisiert)
- Farben: MOP Vancouver = `#173B7A`, MOP Ostsee = `#667885`, MOP Brasilien = `#d49a1a`, K+S Realisiert = `#1a8754` (gestrichelt)

### Inputkosten- & Währungsdiagramme
- **Liniendiagramm mit doppelter Y-Achse** (oder „Linien- und gruppiertes Säulendiagramm")
- Inputkosten: Gas = `#d49a1a`, Strom = `#c43e3e`
- Währung: EUR/USD = `#173B7A`, EUR/BRL = `#1a8754`

### Wettbewerbertabelle
- Bedingte Formatierung auf „Price_Impact"-Spalte (Symbole oder Hintergrundfarbe)

### Marktsignale
- **Power BI Alternative**: **Tabelle** oder **Mehrzeilige Karte** mit `18_Market_Signals.csv`
- Oder 4 **Textfeld-Formen** mit linkem Rand in Auswirkungsfarbe

---

## SEITE 4: Kundenportfolio

### Layout
```
┌─────────────────────────────────────────────────────┐
│  WARNBANNER: Preiswarnungen (ein-/ausblendbar)       │
│  Daten: 12_Price_Alerts.csv                          │
│  Kritische (rot) und Warnungen (gelb) anzeigen       │
└─────────────────────────────────────────────────────┘

┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Kunden │ │Ø-Preis │ │ Über   │ │ Im     │ │ Unter  │
│ 20     │ │€317/MT │ │ Ziel   │ │Korridor│ │ Limit  │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘

┌────────────────────────┐ ┌────────────────────────┐
│ STREU: Menge gg.       │ │ STREU: Menge gg.       │
│ Preiskorridor          │ │ Margenkorridor          │
│ Blasengröße = Marge %  │ │ Blasengröße = Marge %   │
│ Farbe nach Segment     │ │ Farbe nach Segment      │
│ Referenzlinien bei     │ │ Referenzlinien bei      │
│ Ziel=310, Limit=260    │ │ Ziel=28%, Limit=18%     │
│ Hintergrundzonen       │ │ Hintergrundzonen        │
└────────────────────────┘ └────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABELLE: Kundendetail (sortiert nach Menge)         │
│  Spalten: Kunde | Archetyp | Segment | Menge |       │
│  Preis | Marge% | Preiszone | Margenzone | Trend     │
└─────────────────────────────────────────────────────┘
```

### Streudiagramme
- Daten: `11_Customer_Portfolio.csv`
- X-Achse: `Volume_MT`, Y-Achse: `Price_EUR_MT` (links) / `Margin_Pct` (rechts)
- Größe: `Margin_Pct`
- Farbe nach `Segment`:
  - Ackerbau = `#173B7A`
  - Spezialkulturen = `#1a8754`
  - Gartenbau = `#d49a1a`
  - Industrie = `#667885`

**Referenzlinien** (Analysebereich verwenden):
- Linkes Diagramm: Y = 310 (Ziel, grün gestrichelt), Y = 260 (Limit, rot gestrichelt)
- Rechtes Diagramm: Y = 28 (Ziel, grün gestrichelt), Y = 18 (Limit, rot gestrichelt)

**Hintergrundzonen**: **Konstante Linie + Band** im Analysebereich verwenden, oder halbtransparente Rechtecke überlagern

### Preiswarnungen
- **Power BI Alternative**: **Tabelle** mit bedingter Zeilenformatierung
- Kritische Zeilen: heller roter Hintergrund, Warnzeilen: heller gelber Hintergrund
- Oder **KPI-Visual** mit bedingten Symbolen

### Kundendetail-Tabelle
- Standardsortierung: Menge absteigend
- Bedingte Formatierung auf Preiszone / Margenzone-Spalten (Hintergrundfarbregeln)
- Trend-Spalte: KPI-Symbole verwenden (Pfeil hoch grün, Pfeil runter rot, Strich grau)

---

## SEITE 5: Preise & Konditionen

### Layout
```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Ø-Preis │ │ Ø-Marge │ │Kond.-Ausg│ │ gg. VJ% │
└─────────┘ └─────────┘ └─────────┘ └─────────┘

┌─────────────────────────────────────────────────────┐
│  TABELLE: Preisanalyse nach Produktkategorie         │
│  Daten: 05_Pricing_by_Product.csv                    │
└─────────────────────────────────────────────────────┘

┌────────────────────────┐ ┌────────────────────────┐
│ GRUPPIERTES BALKENDIA.: │ │ TABELLE: Konditions-   │
│ Monatliche Konditions-  │ │ aufschlüsselung        │
│ ausgaben                │ │ Daten: 07_Condition_   │
│ Ist vs. Vorjahr         │ │ Breakdown.csv          │
│ Daten: 06_Condition_    │ │ Summenzeile unten      │
│ Spending_Monthly.csv    │ │                        │
└────────────────────────┘ └────────────────────────┘
```

### Konditionsausgaben-Diagramm
- **Gruppiertes Balkendiagramm** (vertikal)
- Ist = `#173B7A`, Vorjahr = `#b8c2cf`
- Abgerundete Ecken (über Design)

---

## SEITE 6: Betrieb & Produktion

### Layout
```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Ges.Menge│ │ Prog.Erf│ │Ges.Kosten│ │ Abw. %  │
└─────────┘ └─────────┘ └─────────┘ └─────────┘

┌────────────────────────┐ ┌────────────────────────┐
│ LINIE: Monatliche Menge│ │ HOR. BALKEN: Kosten    │
│ Ist + Prognose +       │ │ nach Kategorie         │
│ Vorjahr                │ │ Ist vs. Budget          │
│ Daten: 09_Volume_      │ │ Daten: 10_Cost_by_     │
│ Monthly.csv            │ │ Category.csv            │
└────────────────────────┘ └────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABELLE: Produktionsstandort-Performance             │
│  Daten: 17_Production_Sites.csv                      │
│  Auslastung: Datenbalken + %-Wert                    │
│  Status-Badge: grün/gelb/rot                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABELLE: Kostenabweichungsdetail                     │
│  Daten: 10_Cost_by_Category.csv                      │
│  Summenzeile unten                                    │
└─────────────────────────────────────────────────────┘
```

### Mengen-Liniendiagramm
- 3 Reihen: Ist = `#173B7A` (dick), Prognose = `#1a8754` (gestrichelt), Vorjahr = `#667885` (dünn)

### Kosten-Balkendiagramm
- **Horizontales Balkendiagramm** (Kategorien auf Y-Achse)
- Ist = `#173B7A`, Budget = `#b8c2cf`

### Produktionsstandort-Tabelle
- Datenbalken auf Auslastungsspalte
- Farbregeln: ≥85% grün, 75–85% gelb, <75% rot
- Status-Spalte: bedingte Hintergrundformatierung

---

## SEITE 7: Preisdetail (Deep-Dive)

### Layout
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Ø-Preis/MT   │ │ Ø-Marge      │ │ Gesamtmenge  │
│ + gg. VJ %   │ │ + gg. VJ Pp  │ │              │
└──────────────┘ └──────────────┘ └──────────────┘

┌─────────────────────────────────────────────────────┐
│  WASSERFALL: Nettoumsatz — Brutto zu Netto (M€)      │
│  Daten: 08_Net_Revenue_Waterfall.csv                 │
│  Bruttoumsatz & Nettoumsatz = Summe (blau)           │
│  Abzüge = rote Balken                                │
│  Datenbeschriftungen EIN                              │
│  Fußzeile: Ges. Konditionen | Kond.-Quote | Netto/Brutto │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABELLE: Preisanalyse nach Produktkategorie          │
│  Daten: 05_Pricing_by_Product.csv (wie Seite 5)     │
└─────────────────────────────────────────────────────┘
```

### Nettoumsatz-Wasserfall
- Gleicher Ansatz wie SCO-Wasserfall (Seite 2)
- „Gross Revenue" und „Net Revenue" als **Summe** markieren
- Alle Zwischenschritte sind Abnahmen (rot)
- Farben: Summe = `#173B7A`, Abnahme = `#c43e3e`

---

## SEITE 8: Kostendetail (Deep-Dive)

### Layout
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Gesamt Ist   │ │ Gesamt Budget│ │ Abweichung % │
└──────────────┘ └──────────────┘ └──────────────┘

┌─────────────────────────────────────────────────────┐
│  HOR. BALKEN: Kosten nach Kategorie (M€)             │
│  Daten: 10_Cost_by_Category.csv                      │
│  Ist (#173B7A) vs. Budget (#b8c2cf)                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  TABELLE: Abweichungsdetail                          │
│  Spalten: Kategorie | Ist | Budget | Abw. M€ | Abw.%│
│  Bed. Formatierung: >2% rot, >0% gelb, ≤0 grün      │
└─────────────────────────────────────────────────────┘
```

---

## Tipps & Workarounds für Power BI Einschränkungen

### 1. Wasserfalldiagramme
Power BI hat ein **natives Wasserfall-Visual**. Start-/End-Elemente als „Summe" festlegen per Rechtsklick auf den Balken im Visual. Keine benutzerdefinierten Visuals nötig.

### 2. Streudiagramm mit Hintergrundzonen
Power BIs Streudiagramm unterstützt **Konstante Linien** (Analysebereich), aber keine gefüllten Zonen. Workarounds:
- **Konstante Linien** bei Ziel- und Limit-Schwellen verwenden (gestrichelt, farbig)
- Für Hintergrundfüllungen das **„Charticulator"**-Custom-Visual verwenden oder halbtransparente Formen überlagern
- Alternativ bedingte Einfärbung der Datenpunkte selbst

### 3. Hero-Verlaufskarte
Power BI unterstützt keine Verlaufs-Kartenhintergründe nativ. Alternativen:
- Ein **Rechteck** mit dunkler Volltonfarbe (`#0f2654`) als Hintergrund verwenden
- Karten-/Mehrzeilige Karten-Visuals darüber mit transparentem Hintergrund
- Oder ein **Bild** des Verlaufs als Hintergrund

### 4. Ein-/ausblendbare Warnbanner
Power BI unterstützt keine auf-/zuklappbaren Bereiche. Alternativen:
- **Lesezeichen + Schaltflächen** zum Umschalten der Warnungssichtbarkeit verwenden
- Oder Warnungen auf eine separate **QuickInfo-Seite** setzen, die beim Darüberfahren erscheint

### 5. Tab-artige Zeitraumauswahl
Power BI hat keine Tab-Schaltflächen nativ. Alternativen:
- **Schaltflächengruppe** mit Lesezeichen (ein Lesezeichen pro Zeitraum)
- Oder einen **horizontalen Datenschnitt** als Kacheln/Schaltflächen gestalten

### 6. Marktsignal-Karten
Für die 4 Marktsignal-Karten mit farbigem linken Rand:
- **Tabelle** mit bedingter Formatierung (linker Rand) verwenden
- Oder 4 **Karten-Visuals** in einem 2×2-Raster anordnen

### 7. Dynamische Daten (wie die Web-App)
Die Web-App nutzt eine Hash-Funktion, um Daten je nach Filterauswahl zu variieren. In Power BI:
- Die CSVs enthalten die **Basis-/Standardwerte (YTD, Alle Regionen, etc.)**
- Für vollständig dynamisches Verhalten CSVs durch eine **SQL-/API-Datenquelle** ersetzen
- Alternativ mehrere CSV-Varianten erstellen und **Power-Query-Parameter** zum Umschalten nutzen

---

## Datei-Checkliste

```
powerbi/
├── KS_MarginControl_Theme.json      ← Als Power BI Design importieren
├── DAX_Measures.md                   ← Alle DAX-Formeln
├── SETUP_GUIDE.md                    ← Diese Datei
├── COPILOT_PROMPTS.md                ← Fertige Prompts für Copilot in Power BI
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
