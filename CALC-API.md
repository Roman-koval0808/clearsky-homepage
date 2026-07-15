# Calculation API Reference

All endpoints are `POST` and accept JSON bodies. Each corresponds to a discrete step in the Layer 1 or Layer 2 revenue model pipeline.

Base URL: `/api/calc`

---

## GBP Gap Master Formula

```
GBP Gap = sudburyVolume × (cityHouseholds ÷ 73,000) × 1.20
        × max(0.44 − currentCTR, 0.15)
        × (1 − min((100 − compositeScore) ÷ 100, 0.85))
        × siteRetentionRate
        × 0.10
        × avgSaleValue × 12
        × (1 + tenureRate + economicRate)
        × 0.85
```

Each keyword in a trade runs this formula independently. The results are summed, then modifiers and discount are applied.

### Variable Verification Endpoints

| Variable          | Endpoint                       | What it returns                              |
| ----------------- | ------------------------------ | -------------------------------------------- |
| sudburyVolume     | `/api/calc/benchmark-volumes`  | Per-keyword Sudbury search volumes for trade |
| cityHouseholds    | `/api/calc/city-households`    | Households, scaling factor for any city      |
| compositeScore    | `/api/calc/composite-score`    | 9-signal GBP health score breakdown          |
| siteRetentionRate | `/api/calc/site-retention`     | PSI score → retention rate lookup            |
| currentCTR        | `/api/calc/ranking-ctr`        | Map pack position → CTR + gap from #1        |
| tenureRate        | `/api/calc/tenure-rate`        | Years in business → brand tenure rate        |
| economicRate      | `/api/calc/economic-rate`      | City/market tier → economic rate             |
| **Full breakdown**| `/api/calc/gbp-gap-breakdown`  | **Step-by-step per-keyword with all intermediates** |

### PSI Score → Retention Rate Table

| PSI Score  | Retention Rate | Abandonment | Status |
| ---------- | -------------- | ----------- | ------ |
| 90 – 100   | 1.00           | 0%          | Green  |
| 70 – 89    | 0.90           | 10%         | Amber  |
| 50 – 69    | 0.85           | 15%         | Amber  |
| 0 – 49     | 0.80           | 20%         | Red    |

### Map Pack CTR Table (with min floor)

| Position | CTR   | Raw Gap from #1 | Applied Gap (min 0.15) |
| -------- | ----- | ---------------- | ---------------------- |
| 1        | 0.44  | 0.00             | **0.15** (floor)       |
| 2        | 0.24  | 0.20             | 0.20                   |
| 3        | 0.17  | 0.27             | 0.27                   |
| none     | 0.03  | 0.41             | 0.41                   |

### Formula Changes from Original

1. **CTR gap floor**: Position #1 now uses min 0.15 instead of 0 (there is always some opportunity)
2. **Call conversion rate**: Changed from 0.024 to 0.10 (6%×40% → closer to reality)

---

## Variable Verification Endpoints

### `POST /api/calc/benchmark-volumes`

Returns the hardcoded Sudbury benchmark search volumes per keyword for a trade.

**Body:**

| Field   | Type   | Required | Description                        |
| ------- | ------ | -------- | ---------------------------------- |
| `trade` | string | yes      | Trade name (e.g. `"plumbing"`, `"hvac"`) |

**Response:**

```json
{
  "success": true,
  "data": {
    "trade": "plumbing",
    "resolvedTradeKey": "plumbing",
    "indexCity": "Sudbury",
    "indexHouseholds": 73000,
    "keywords": [
      { "keyword": "plumber", "volume": 287 },
      { "keyword": "emergency plumber", "volume": 26 },
      { "keyword": "plumbing repair", "volume": 20 },
      { "keyword": "drain cleaning", "volume": 3 },
      { "keyword": "water heater repair", "volume": 3 }
    ],
    "totalSudburyVolume": 339
  }
}
```

---

### `POST /api/calc/city-households`

Returns household count, scaling factor, and all known city clusters.

**Body:**

| Field  | Type   | Required | Description |
| ------ | ------ | -------- | ----------- |
| `city` | string | yes      | City name   |

**Response:**

```json
{
  "success": true,
  "data": {
    "city": "timmins",
    "households": 20941,
    "indexCity": "Sudbury",
    "indexHouseholds": 73000,
    "scalingFactor": 0.2868,
    "captiveMarketUplift": 1.2,
    "scalingFactorWithUplift": 0.3442,
    "tier": "active",
    "knownClusters": [
      { "city": "timmins", "households": 20941, "tier": "active" },
      { "city": "sudbury", "households": 73000, "tier": "active" },
      { "city": "north bay", "households": 30737, "tier": "active" }
    ],
    "formula": "scaledVolume = sudburyVolume × (20941 ÷ 73000) × 1.2"
  }
}
```

---

### `POST /api/calc/composite-score`

Calculates the 9-signal GBP composite score with per-signal breakdown.

**Body:**

| Field             | Type   | Required | Description                       |
| ----------------- | ------ | -------- | --------------------------------- |
| `gbp`             | object | no       | GBP data (see shape below). Omit for "no listing" |
| `yearsInBusiness` | number | no       | Years in business (default: 5)    |

**GBP object shape:**

```json
{
  "rating": 4.5,
  "reviewCount": 42,
  "photos": [1,2,3,4,5],
  "opening_hours": true,
  "website": "https://example.com",
  "qa": { "count": 5, "answeredCount": 3 },
  "editorialSummary": "A great plumber",
  "services": ["Plumbing", "Drain Cleaning"],
  "ownerResponseCount": 10
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "gbpExists": true,
    "compositeScore": 72,
    "maxScore": 100,
    "rawPenalty": 0.28,
    "cappedPenalty": 0.28,
    "maxPenaltyCap": 0.85,
    "status": "amber",
    "signals": [
      { "name": "Star rating", "earned": 35, "max": 35, "pointsLost": 0, "percentage": "100%" },
      { "name": "Review count", "earned": 18, "max": 25, "pointsLost": 7, "percentage": "72%" }
    ],
    "formula": "compositePenalty = min((100 − 72) ÷ 100, 0.85) = 0.28"
  }
}
```

---

### `POST /api/calc/site-retention`

Looks up the site retention rate from a PSI performance score.

**Body:**

| Field      | Type   | Required | Description                                |
| ---------- | ------ | -------- | ------------------------------------------ |
| `psiScore` | number | no       | Direct PSI score (0-100)                   |
| `mobile`   | number | no       | Mobile PSI score (averaged with desktop)   |
| `desktop`  | number | no       | Desktop PSI score (averaged with mobile)   |

Provide either `psiScore` directly, or `mobile` + `desktop` to auto-average.

**Response:**

```json
{
  "success": true,
  "data": {
    "psiScore": 74,
    "mobile": 67,
    "desktop": 81,
    "averageFormula": "(67 + 81) / 2 = 74",
    "retentionRate": 0.9,
    "abandonment": "10%",
    "status": "Amber",
    "lookupTable": [
      { "range": "90 – 100", "retentionRate": 1.0, "abandonment": "0%", "status": "Green" },
      { "range": "70 – 89", "retentionRate": 0.9, "abandonment": "10%", "status": "Amber" },
      { "range": "50 – 69", "retentionRate": 0.85, "abandonment": "15%", "status": "Amber" },
      { "range": "0 – 49", "retentionRate": 0.8, "abandonment": "20%", "status": "Red" }
    ]
  }
}
```

---

### `POST /api/calc/ranking-ctr`

Returns the CTR for a map pack position and the gap from position #1.

**Body:**

| Field      | Type           | Required | Description                      |
| ---------- | -------------- | -------- | -------------------------------- |
| `position` | number/string  | yes      | Map pack position (1, 2, 3, or "none") |

**Response:**

```json
{
  "success": true,
  "data": {
    "position": "1",
    "positionOneCTR": 0.44,
    "currentCTR": 0.44,
    "rawCtrGap": 0,
    "minGapFloor": 0.15,
    "appliedCtrGap": 0.15,
    "floorApplied": true,
    "interpretation": "At position 1: 44% CTR vs 44% at #1 → 15% gap used in formula",
    "lookupTable": [
      { "position": "1", "ctr": 0.44, "rawGap": 0, "appliedGap": 0.15, "floorApplied": true },
      { "position": "2", "ctr": 0.24, "rawGap": 0.2, "appliedGap": 0.2, "floorApplied": false },
      { "position": "3", "ctr": 0.17, "rawGap": 0.27, "appliedGap": 0.27, "floorApplied": false },
      { "position": "none", "ctr": 0.03, "rawGap": 0.41, "appliedGap": 0.41, "floorApplied": false }
    ],
    "note": "If #1 in map pack, CTR gap would be 0 but we apply a floor of 0.15 (15%)"
  }
}
```

---

### `POST /api/calc/tenure-rate`

Returns the brand tenure rate for a number of years in business.

**Body:**

| Field             | Type   | Required | Description          |
| ----------------- | ------ | -------- | -------------------- |
| `yearsInBusiness` | number | yes      | Years in business    |

**Response:**

```json
{
  "success": true,
  "data": {
    "yearsInBusiness": 12,
    "tenureRate": 0.09,
    "tenureLabel": "Trusted",
    "effect": "+9% uplift (brand trust bonus)",
    "lookupTable": [
      { "minYears": 16, "rate": 0.16, "label": "Legacy", "percentage": "+16%" },
      { "minYears": 11, "rate": 0.09, "label": "Trusted", "percentage": "+9%" },
      { "minYears": 6, "rate": 0.04, "label": "Established", "percentage": "+4%" },
      { "minYears": 2, "rate": -0.05, "label": "Building", "percentage": "-5%" },
      { "minYears": 0, "rate": -0.15, "label": "New", "percentage": "-15%" }
    ]
  }
}
```

---

### `POST /api/calc/economic-rate`

Returns the economic rate for a city or market tier.

**Body:**

| Field        | Type   | Required | Description                               |
| ------------ | ------ | -------- | ----------------------------------------- |
| `city`       | string | no       | City name (auto-looks up tier)            |
| `marketTier` | string | no       | Override: `booming`, `active`, `neutral`, `slow`, `depressed` |

Provide either `city` or `marketTier`.

**Response:**

```json
{
  "success": true,
  "data": {
    "city": "timmins",
    "marketTier": "active",
    "economicRate": 0.05,
    "economicLabel": "Active",
    "effect": "+5% uplift",
    "lookupTable": [
      { "tier": "booming", "rate": 0.15, "label": "Booming", "percentage": "+15%" },
      { "tier": "active", "rate": 0.05, "label": "Active", "percentage": "+5%" },
      { "tier": "neutral", "rate": 0, "label": "Neutral", "percentage": "+0%" },
      { "tier": "slow", "rate": -0.15, "label": "Slow", "percentage": "-15%" },
      { "tier": "depressed", "rate": -0.3, "label": "Depressed", "percentage": "-30%" }
    ],
    "cityLookup": [
      { "city": "timmins", "tier": "active", "rate": 0.05 },
      { "city": "sudbury", "tier": "active", "rate": 0.05 }
    ]
  }
}
```

---

## Full Step-by-Step Breakdown

### `POST /api/calc/gbp-gap-breakdown`

**This is the main verification endpoint.** It runs the complete GBP Gap formula per keyword and shows every intermediate value so the client can follow the math step by step.

**Body:**

| Field             | Type   | Required | Description                                                   |
| ----------------- | ------ | -------- | ------------------------------------------------------------- |
| `trade`           | string | yes      | Trade name (e.g. `"plumbing"`, `"hvac"`)                      |
| `city`            | string | yes      | City name                                                     |
| `avgSaleValue`    | number | no       | Override average sale value (auto: plumbing=1500, hvac=3000)  |
| `yearsInBusiness` | number | no       | Years in business (default: 5)                                |
| `compositeScore`  | number | no       | Override GBP composite score 0-100 (skips signal calculation) |
| `gbp`             | object | no       | GBP data to calculate composite score from                    |
| `psiScore`        | number | no       | Direct PSI score 0-100                                        |
| `psiMobile`       | number | no       | Mobile PSI (averaged with desktop)                            |
| `psiDesktop`      | number | no       | Desktop PSI (averaged with mobile)                            |
| `keywords`        | array  | no       | Per-keyword ranking data (see below). Falls back to benchmarks if omitted |

**keywords array shape:**

```json
[
  { "keyword": "plumber", "position": "1", "sudburyVolume": 287 },
  { "keyword": "emergency plumber", "position": "none", "sudburyVolume": 26 }
]
```

**Example Request (Timmins plumber, compositeScore=80, PSI=74, ranked #1):**

```bash
curl -X POST http://localhost:5173/api/calc/gbp-gap-breakdown \
  -H 'Content-Type: application/json' \
  -d '{
    "trade": "plumbing",
    "city": "timmins",
    "compositeScore": 80,
    "psiMobile": 67,
    "psiDesktop": 81,
    "avgSaleValue": 2000,
    "yearsInBusiness": 12,
    "keywords": [
      { "keyword": "plumber", "position": "1", "sudburyVolume": 287 },
      { "keyword": "emergency plumber", "position": "none", "sudburyVolume": 26 },
      { "keyword": "plumbing repair", "position": "none", "sudburyVolume": 20 },
      { "keyword": "drain cleaning", "position": "none", "sudburyVolume": 3 },
      { "keyword": "water heater repair", "position": "none", "sudburyVolume": 3 }
    ]
  }'
```

**Response (abbreviated):**

```json
{
  "success": true,
  "formula": "GBP Gap = sudburyVolume × ... × (1 − min((100 − compositeScore) ÷ 100, 0.85)) × ...",
  "inputs": {
    "trade": "plumbing",
    "city": "timmins",
    "households": 20941,
    "sudburyHouseholds": 73000,
    "scalingFactor": 0.3442,
    "avgSaleValue": 2000,
    "compositeScore": 80,
    "gbpPenalty": 0.2,
    "gbpThroughput": 0.8,
    "gbpNote": "penalty = 0.2, throughput = 1 − 0.2 = 0.8",
    "psiScore": 74,
    "siteRetentionRate": 0.9,
    "yearsInBusiness": 12,
    "tenureRate": 0.09,
    "tenureLabel": "Trusted",
    "economicRate": 0.05,
    "economicLabel": "Active",
    "callConversionRate": 0.1,
    "ultraConservativeDiscount": 0.85
  },
  "keywordBreakdown": [
    {
      "keyword": "plumber",
      "position": "1",
      "steps": {
        "1_sudburyVolume": 287,
        "2_scaledVolume": 98.7956,
        "2_formula": "287 × (20941 ÷ 73000) × 1.2 = 98.7956",
        "3_currentCTR": 0.44,
        "3_appliedCtrGap": 0.15,
        "3_floorApplied": true,
        "4_peopleLost": 14.8193,
        "4_formula": "98.7956 × 0.15 = 14.8193",
        "5_gbpPenalty": 0.2,
        "5_gbpThroughput": 0.8,
        "5_afterGbp": 11.8555,
        "5_formula": "14.8193 × (1 − 0.2) = 14.8193 × 0.8 = 11.8555",
        "5_lostFromGbp": 2.9639,
        "6_siteRetentionRate": 0.9,
        "6_afterRetention": 10.6699,
        "7_callConversionRate": 0.1,
        "7_monthlyCustomers": 1.067,
        "8_avgSaleValue": 2000,
        "8_monthlyRevenue": 2133.99,
        "9_annualRevenue": 25607.83
      }
    }
  ],
  "totals": {
    "sumAnnualRevenue": 38289.8,
    "tenureLift": 3446.08,
    "tenureFormula": "38289.8 × 0.09 = 3446.08",
    "economicLift": 1914.49,
    "economicFormula": "38289.8 × 0.05 = 1914.49",
    "beforeDiscount": 43650.37,
    "finalGbpGap": 37102.81,
    "finalFormula": "43650.37 × 0.85 = 37102.81"
  }
}
```

### Walkthrough: How to Read the Breakdown

For each keyword, the steps trace the formula left to right:

| Step | What it calculates | Formula element |
| ---- | ------------------ | --------------- |
| 1 | Raw Sudbury volume for keyword | `sudburyVolume` |
| 2 | Scaled to city size | `× (cityHouseholds ÷ 73,000) × 1.20` |
| 3 | CTR gap from map pack position | `× max(0.44 − currentCTR, 0.15)` |
| 4 | People lost from ranking | Step 2 × Step 3 |
| 5 | After GBP health penalty (throughput) | `× (1 − min((100 − compositeScore) ÷ 100, 0.85))` — e.g. score 80 → penalty 0.20 → throughput 0.80 |
| 6 | After site speed retention | `× siteRetentionRate` |
| 7 | Monthly converting customers | `× 0.10` (call conversion rate) |
| 8 | Monthly revenue gap per keyword | `× avgSaleValue` |
| 9 | Annual revenue gap per keyword | `× 12` |
| **Sum** | All keywords combined | Sum of all step 9 values |
| **Tenure** | Brand trust modifier | `+ sum × tenureRate` |
| **Economic** | Market demand modifier | `+ sum × economicRate` |
| **Final** | Ultra-conservative discount | `× 0.85` |

### Client Walkthrough Verification (Simplified Example)

Using compositeScore=80, position #1 for "plumber", PSI 74, avgSaleValue=2000, 12 years in business, Timmins:

| Step | Calculation | Result |
| ---- | ----------- | ------ |
| Scaled volume | ~100 (simplified) | 100 searchers |
| × CTR gap (pos #1, floor 0.15) | 100 × 0.15 | 15 people lost |
| × GBP throughput (1 − 0.20) | 15 × 0.80 | 12 (lost 3 from imperfect GBP) |
| × Site retention (PSI 74 → 0.90) | 12 × 0.90 | 10.8 |
| × Call conversion | 10.8 × 0.10 | 1.08 |
| × Avg sale value | 1.08 × 2000 | 2160/mo |
| × 12 months | 2160 × 12 | **25,920/yr** |
| + Tenure lift (×1.09) | 25,920 × 0.09 | +2,332.80 |
| + Economic lift (×1.05) | 25,920 × 0.05 | +1,296.00 |
| Before discount | 25,920 + 2,332.80 + 1,296 | 29,548.80 |
| × 0.85 discount | 29,548.80 × 0.85 | **$25,116.48** |

---

## Pipeline Overview

### Layer 1 (GBP Health Gap)

```
google-identity (full) → search-volume → gbp-gap → modifiers
```

### Layer 2 (Local Rank Gap)

```
google-identity (light) → dataforseo-layer → rank-lookup → pagespeed
                                ↓                  ↓            ↓
                           diagnostic    weighted-rank-gap  (retention rate)
```

---

## API Data Endpoints

These endpoints call external APIs (Google, DataForSEO) and return raw data.

### `POST /api/calc/google-identity`

Looks up a business on Google Places and returns its GBP profile.

**Body:**

| Field          | Type   | Required | Description                                  |
| -------------- | ------ | -------- | -------------------------------------------- |
| `businessName` | string | yes      | Business name to search                      |
| `city`         | string | yes      | City name                                    |
| `websiteUrl`   | string | no       | Website URL for disambiguation               |
| `mode`         | string | no       | `"full"` (L1 style, includes Q&A/services/photos) or `"light"` (L2 style, CID/rating/reviews only). Default: `"light"` |

**Response (light mode):**

```json
{
  "success": true,
  "mode": "light",
  "data": {
    "cid": "1234567890",
    "rating": 4.5,
    "reviewCount": 42,
    "name": "Acme Plumbing",
    "website": "https://acmeplumbing.ca"
  }
}
```

**Response (full mode):** Returns the complete Google Places result including `photos`, `opening_hours`, `editorial_summary`, `reviews`, `qa` (DataForSEO Q&A), `services` (DataForSEO business info), `hasRecentReview`, and `place_id`.

---

### `POST /api/calc/search-volume`

Fetches live keyword search volume from DataForSEO and provides an estimated fallback.

**Body:**

| Field        | Type   | Required | Description                           |
| ------------ | ------ | -------- | ------------------------------------- |
| `trade`      | string | yes      | Trade name (e.g. `"plumbing"`)        |
| `city`       | string | yes      | City name                             |
| `population` | number | no       | City population for estimate fallback (default: 50000) |

**Response:**

```json
{
  "success": true,
  "data": {
    "liveVolume": 287,
    "estimatedVolume": 250,
    "usedVolume": 287,
    "source": "dataforseo",
    "keyword": "plumbing sudbury"
  }
}
```

---

### `POST /api/calc/dataforseo-layer`

Combined DataForSEO lookup: Q&A activity, search volume, and GBP services.

**Body:**

| Field          | Type   | Required | Description                                      |
| -------------- | ------ | -------- | ------------------------------------------------ |
| `identifier`   | string | yes      | Business identifier (`cid:123` or `place_id:abc`) |
| `city`         | string | yes      | City name                                        |
| `trade`        | string | yes      | Trade name                                       |
| `businessName` | string | no       | Fallback name for Q&A lookup                     |

**Response:**

```json
{
  "success": true,
  "data": {
    "qa": { "count": 5, "answeredCount": 3 },
    "searchVolume": 287,
    "services": ["Plumbing", "Drain Cleaning"]
  }
}
```

---

### `POST /api/calc/rank-lookup`

Fetches SERP rank positions for a business across 5 locked keywords using DataForSEO.

**Body:**

| Field            | Type   | Required | Description                                  |
| ---------------- | ------ | -------- | -------------------------------------------- |
| `businessName`   | string | yes      | Business name to match in results            |
| `trade`          | string | yes      | Trade name (determines keyword set)          |
| `city`           | string | yes      | City name                                    |
| `sudburyVolumes` | object | no       | Per-keyword Sudbury volumes for scaling      |

**Response:**

```json
{
  "success": true,
  "data": {
    "keywords": [
      { "keyword": "plumber", "position": "1", "source": "pack", "sudburyVolume": 287 },
      { "keyword": "emergency plumber", "position": "none", "source": "none", "sudburyVolume": 26 }
    ],
    "localPackRank": "1",
    "foundInPackCount": 3
  }
}
```

---

### `POST /api/calc/pagespeed`

Runs Google PageSpeed Insights on a URL and returns performance score + site retention rate.

**Body:**

| Field | Type   | Required | Description       |
| ----- | ------ | -------- | ----------------- |
| `url` | string | yes      | Full website URL  |

**Response:**

```json
{
  "success": true,
  "data": {
    "performance": 72,
    "score": 72,
    "lcp": { "value": "2.1 s", "pass": true },
    "cls": { "value": "0.05", "pass": true },
    "cwvPass": true,
    "siteRetentionRate": 0.9,
    "siteRetentionRatePct": "90%"
  }
}
```

---

## Engine Calculation Endpoints

These endpoints run pure calculations with no external API calls. Pass the data in and get the result.

### `POST /api/calc/gbp-gap`

Calculates the Layer 1 GBP Health Gap: revenue lost due to issues across 9 GBP signals.

**Body:**

| Field               | Type   | Required | Description                                       |
| ------------------- | ------ | -------- | ------------------------------------------------- |
| `gbp`               | object | no       | GBP data object (rating, reviewCount, photos, etc.). `null` = no listing. |
| `monthlySearches`   | number | yes      | Monthly search volume for the trade+city keyword  |
| `avgSaleValue`      | number | yes      | Average sale value in dollars                     |
| `yearsInBusiness`   | number | no       | Years in business (default: 5)                    |
| `siteRetentionRate` | number | no       | Retention rate 0-1 (overrides psiScore)           |
| `psiScore`          | number | no       | PageSpeed score 0-100 (used if siteRetentionRate not provided) |
| `vertical`          | string | no       | Business vertical (default: `"trades"`)           |

**GBP object shape:**

```json
{
  "place_id": "abc123",
  "rating": 4.5,
  "reviewCount": 42,
  "photos": [1,2,3,4,5],
  "opening_hours": true,
  "website": "https://example.com",
  "qa": { "count": 5, "answeredCount": 3 },
  "editorial_summary": { "overview": "..." },
  "services": ["Plumbing", "Drain Cleaning"],
  "ownerResponseCount": 10
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "value": 12500,
    "gbpExists": true,
    "compositeScore": 72,
    "appliedPenalty": 0.28,
    "signals": [
      { "name": "Star rating", "earned": 35, "max": 35 },
      { "name": "Review count", "earned": 18, "max": 25 }
    ],
    "repairList": [
      { "signal": "Review count", "pointsLost": 7, "annualCost": 3125 }
    ],
    "detail": { "status": "amber", "score": 72, "pointsLost": 28 }
  }
}
```

---

### `POST /api/calc/weighted-rank-gap`

Calculates the Layer 2 Weighted Rank Gap across one or more trades.

**Body:**

| Field               | Type   | Required | Description                                       |
| ------------------- | ------ | -------- | ------------------------------------------------- |
| `trades`            | array  | yes      | Array of trade objects (see below)                |
| `city`              | string | no       | City name (used to look up households if not provided) |
| `households`        | number | no       | Override city household count                     |
| `siteRetentionRate` | number | no       | Retention rate 0-1 (overrides psiScore)           |
| `psiScore`          | number | no       | PageSpeed score 0-100                             |

**Trade object:**

```json
{
  "trade": "plumbing",
  "rank": { "keywords": [...], "localPackRank": "1", "foundInPackCount": 3 },
  "avgSaleValue": 1500,
  "weightPct": 70
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "value": 45000,
    "displayValue": "$45K",
    "detail": {
      "status": "amber",
      "avgPosition": 2.4,
      "tradeBreakdown": [...],
      "keywordBreakdown": [...]
    },
    "inputs": { "households": 73000, "siteRetentionRate": 0.9, "tradeCount": 2 }
  }
}
```

---

### `POST /api/calc/modifiers`

Applies tenure and economic modifiers to a base gap value with optional 15% ultra-conservative discount.

**Body:**

| Field             | Type    | Required | Description                                      |
| ----------------- | ------- | -------- | ------------------------------------------------ |
| `baseValue`       | number  | yes      | Raw gap value to adjust                          |
| `yearsInBusiness` | number  | no       | Years in business (default: 5)                   |
| `marketTier`      | string  | no       | Override tier: `booming`, `active`, `neutral`, `slow`, `depressed` |
| `city`            | string  | no       | City name (used to look up tier if not provided) |
| `applyDiscount`   | boolean | no       | Apply 15% ultra-conservative discount (default: true) |

**Response:**

```json
{
  "success": true,
  "data": {
    "baseValue": 10000,
    "adjustedValue": 10900,
    "withUltraConservativeDiscount": 9265,
    "breakdown": {
      "tenureRate": 0.04,
      "tenureLabel": "Established",
      "yearsInBusiness": 8,
      "economicRate": 0.05,
      "economicLabel": "Active",
      "marketTier": "active",
      "discountApplied": "15%"
    }
  }
}
```

---

### `POST /api/calc/diagnostic`

Runs the full diagnostic engine. This is the master calculation that combines all layers internally.

**Body:**

| Field            | Type   | Required | Description                                    |
| ---------------- | ------ | -------- | ---------------------------------------------- |
| `diagnosticData` | object | yes      | Complete diagnostic data object (see below)    |
| `intakeInputs`   | object | no       | Override inputs (annualRevenue, yearsInBusiness) |

**diagnosticData shape:**

```json
{
  "business": { "name": "...", "city": "...", "trade": "...", "monthlySearchVolume": 287, "vertical": "trades" },
  "revenue": { "annualRevenue": 300000, "avgSaleValue": 1500 },
  "operations": { "yearsInBusiness": 8 },
  "selfReported": { "annualRevenue": 300000, "avgSaleValue": 1500, "yearsInBusiness": 8 },
  "gbp": { "rating": 4.5, "reviewCount": 42, "qa": {}, "services": [], "place_id": "..." },
  "rank": { "keywords": [], "localPackRank": "1", "foundInPackCount": 3 }
}
```

**Response:** Returns the full diagnostic result including `healthScores`, `gaps`, `rawGaps`, `scenarios`, `meta`, `capacityInsight`, and `growthStatement`.

---

## Usage with curl

### Quick variable checks

```bash
# What are the Sudbury benchmark volumes for plumbing?
curl -X POST http://localhost:5173/api/calc/benchmark-volumes \
  -H 'Content-Type: application/json' \
  -d '{"trade":"plumbing"}'

# What are the Sudbury benchmark volumes for HVAC?
curl -X POST http://localhost:5173/api/calc/benchmark-volumes \
  -H 'Content-Type: application/json' \
  -d '{"trade":"hvac"}'

# How many households does Timmins have?
curl -X POST http://localhost:5173/api/calc/city-households \
  -H 'Content-Type: application/json' \
  -d '{"city":"timmins"}'

# What retention rate for PSI mobile=67, desktop=81?
curl -X POST http://localhost:5173/api/calc/site-retention \
  -H 'Content-Type: application/json' \
  -d '{"mobile":67,"desktop":81}'

# What CTR does position 1 get? What's the gap?
curl -X POST http://localhost:5173/api/calc/ranking-ctr \
  -H 'Content-Type: application/json' \
  -d '{"position":1}'

# What's the tenure rate for 12 years in business?
curl -X POST http://localhost:5173/api/calc/tenure-rate \
  -H 'Content-Type: application/json' \
  -d '{"yearsInBusiness":12}'

# What's the economic rate for Timmins?
curl -X POST http://localhost:5173/api/calc/economic-rate \
  -H 'Content-Type: application/json' \
  -d '{"city":"timmins"}'

# Calculate GBP composite score from raw data
curl -X POST http://localhost:5173/api/calc/composite-score \
  -H 'Content-Type: application/json' \
  -d '{"gbp":{"rating":4.5,"reviewCount":42,"photos":[1,2,3,4,5],"opening_hours":true,"website":"https://example.com","qa":{"count":5,"answeredCount":3},"editorialSummary":"Great plumber","services":["Plumbing","Drain Cleaning"],"ownerResponseCount":10},"yearsInBusiness":12}'
```

### Full GBP Gap Breakdown (step by step)

```bash
curl -X POST http://localhost:5173/api/calc/gbp-gap-breakdown \
  -H 'Content-Type: application/json' \
  -d '{
    "trade": "plumbing",
    "city": "timmins",
    "compositeScore": 80,
    "psiMobile": 67,
    "psiDesktop": 81,
    "avgSaleValue": 2000,
    "yearsInBusiness": 12,
    "keywords": [
      { "keyword": "plumber", "position": "1", "sudburyVolume": 287 },
      { "keyword": "emergency plumber", "position": "none", "sudburyVolume": 26 },
      { "keyword": "plumbing repair", "position": "none", "sudburyVolume": 20 },
      { "keyword": "drain cleaning", "position": "none", "sudburyVolume": 3 },
      { "keyword": "water heater repair", "position": "none", "sudburyVolume": 3 }
    ]
  }'
```

---

## File Map

| Route                          | Source File                                              | Type              | Purpose                               |
| ------------------------------ | -------------------------------------------------------- | ----------------- | ------------------------------------- |
| `/api/calc/benchmark-volumes`  | `src/routes/api/calc/benchmark-volumes/+server.js`       | Lookup            | Sudbury keyword volumes per trade     |
| `/api/calc/city-households`    | `src/routes/api/calc/city-households/+server.js`         | Lookup            | Households + scaling factor per city  |
| `/api/calc/composite-score`    | `src/routes/api/calc/composite-score/+server.js`         | Engine            | 9-signal GBP composite score          |
| `/api/calc/site-retention`     | `src/routes/api/calc/site-retention/+server.js`          | Lookup            | PSI → retention rate                  |
| `/api/calc/ranking-ctr`        | `src/routes/api/calc/ranking-ctr/+server.js`             | Lookup            | Position → CTR + gap                  |
| `/api/calc/tenure-rate`        | `src/routes/api/calc/tenure-rate/+server.js`             | Lookup            | Years → tenure rate                   |
| `/api/calc/economic-rate`      | `src/routes/api/calc/economic-rate/+server.js`           | Lookup            | City → economic rate                  |
| `/api/calc/gbp-gap-breakdown`  | `src/routes/api/calc/gbp-gap-breakdown/+server.js`       | **Full calc**     | Step-by-step per-keyword breakdown    |
| `/api/calc/google-identity`    | `src/routes/api/calc/google-identity/+server.js`         | API call          | Google Places lookup                  |
| `/api/calc/search-volume`      | `src/routes/api/calc/search-volume/+server.js`           | API call          | Live DataForSEO volume                |
| `/api/calc/dataforseo-layer`   | `src/routes/api/calc/dataforseo-layer/+server.js`        | API call          | Combined DataForSEO data              |
| `/api/calc/rank-lookup`        | `src/routes/api/calc/rank-lookup/+server.js`             | API call          | SERP rank positions                   |
| `/api/calc/pagespeed`          | `src/routes/api/calc/pagespeed/+server.js`               | API call          | Google PageSpeed Insights             |
| `/api/calc/gbp-gap`            | `src/routes/api/calc/gbp-gap/+server.js`                 | Engine            | L1 GBP health gap                     |
| `/api/calc/weighted-rank-gap`  | `src/routes/api/calc/weighted-rank-gap/+server.js`       | Engine            | L2 weighted rank gap                  |
| `/api/calc/modifiers`          | `src/routes/api/calc/modifiers/+server.js`               | Engine            | Tenure + economic modifiers           |
| `/api/calc/diagnostic`         | `src/routes/api/calc/diagnostic/+server.js`              | Engine            | Full diagnostic engine                |

**Shared Libraries:**

| File                                    | Purpose                                          |
| --------------------------------------- | ------------------------------------------------ |
| `src/lib/clearsky/clearsky-engine.js`   | All pure calculation functions and benchmarks     |
| `src/lib/clearsky/api-orchestrator.js`  | DataForSEO rank, PageSpeed, and Q&A API wrappers |
| `src/lib/clearsky/google-helpers.js`    | Google Places lookup and search volume helpers    |
