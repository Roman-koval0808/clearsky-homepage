# ClearSky — How to Test Every Calculation

All requests are **POST** to `http://localhost:5173`. Copy the body into Postman (or the Postman collection), hit Send, and check the numbers.

---

## Step 1 — How many searches does each trade get?

> **Source:** Absolute doc — "339 searches for plumber", "219 searches for HVAc"
> **Also:** newDocs.md § D.6 — Keyword Sets (Session 17 Sudbury volume estimates)

**Send to:** `http://localhost:5173/api/calc/benchmark-volumes`

**Body:**
```json
{
  "trade": "plumbing"
}
```

**You should see:**

| Keyword              | Volume |
| -------------------- | ------ |
| plumber              | 287    |
| emergency plumber    | 26     |
| plumbing repair      | 20     |
| drain cleaning       | 3      |
| water heater repair  | 3      |
| **Total**            | **339**|

Now change `"trade"` to `"hvac"` and send again:

**Body:**
```json
{
  "trade": "hvac"
}
```

**You should see:**

| Keyword              | Volume |
| -------------------- | ------ |
| hvac                 | 96     |
| furnace repair       | 52     |
| air conditioning     | 27     |
| heating and cooling  | 27     |
| ac repair            | 17     |
| **Total**            | **219**|

---

## Step 2 — How many households does the city have?

> **Source:** Absolute doc — Q1: "What number of households do we use for Timmins?"
> **Also:** newDocs.md § D.5 — City Scaling, MARKET_CLUSTERS Table
> **Constants:** newDocs.md § A.3 — sudburyHouseholds = 73,000, captiveMarketUplift = 1.20

**Send to:** `http://localhost:5173/api/calc/city-households`

**Body:**
```json
{
  "city": "Timmins"
}
```

**You should see:**
- **households:** 20,941
- **scalingFactor:** 0.2868 (that's 20,941 ÷ 73,000)
- **scalingFactorWithUplift:** 0.3442 (that's 0.2868 × 1.20)
- **tier:** active

Try other cities (all from newDocs.md § D.5 MARKET_CLUSTERS Table):

| City          | Households | Tier   |
| ------------- | ---------- | ------ |
| Sudbury       | 73,000     | active |
| North Bay     | 30,737     | active |
| Kirkland Lake | 4,064      | active |
| Cochrane      | 8,360      | slow   |

---

## Step 3 — What is the ranking CTR and gap?

> **Source:** Absolute doc — Q4: "If you are number 1 you will get .44 ... 44-3 = 41% if we place 2nd we lose 44-24=20, for third we lose 44-17"
> **Also:** newDocs.md § D.3 — CTR Table
> **REVISED by absolute doc:** "if you are number 1 we give you a value of .15 instead of 0" — newDocs.md says "Benchmark — no gap" for position 1, but the absolute doc overrides this with a 0.15 floor.

This tells you how many clicks you lose because you're not #1 in the map pack.

**Send to:** `http://localhost:5173/api/calc/ranking-ctr`

**Body (test position 1):**
```json
{
  "position": 1
}
```

**You should see:**
- **currentCTR:** 0.44 (44% of people click on #1)
- **rawCtrGap:** 0 (you ARE #1)
- **appliedCtrGap:** 0.15 (but we use a minimum of 15% — there's always some opportunity)
- **floorApplied:** true

Now try the others:

| Body                       | currentCTR | appliedCtrGap |
| -------------------------- | ---------- | ------------- |
| `{ "position": 1 }`       | 0.44       | **0.15** (floor) |
| `{ "position": 2 }`       | 0.24       | **0.20** |
| `{ "position": 3 }`       | 0.17       | **0.27** |
| `{ "position": "none" }`  | 0.03       | **0.41** |

---

## Step 4 — What is the GBP composite score?

> **Source:** Absolute doc — Q5: "min((100-composite score) / 100, .85) min= (100-80)/100 =.20 the number can not exceed .85"
> **Throughput from absolute doc:** "15 x (1-.20)=12 we lost 3 people because our GBP was not 100" — meaning multiply by (1 − penalty), not by penalty directly.
> **Also:** newDocs.md § B.3 — The 9 Signals: Final Weights (signal names + max points)
> **Also:** newDocs.md § B.5 — Composite Score to Gap Calculation (penalty formula + 0.85 cap)
> **Also:** newDocs.md § B.2 — GBP Existence Check (no GBP = 60% fixed penalty)

The 9 signals that make up the GBP health score. Send the business's GBP data and get back the score and penalty.

**Send to:** `http://localhost:5173/api/calc/composite-score`

**Body (Manito example — from newDocs.md § B.8):**
```json
{
  "gbp": {
    "rating": 4.8,
    "reviewCount": 137,
    "photos": [1, 1, 1, 1, 1, 1, 1],
    "opening_hours": true,
    "website": "https://manitoplumbing.ca",
    "qa": { "count": 0, "answeredCount": 0 },
    "editorialSummary": false,
    "services": [1, 1, 1, 1, 1, 1, 1],
    "ownerResponseCount": 23
  },
  "yearsInBusiness": 14
}
```

**You should see:**
- 9 signals with points earned vs max
- **compositeScore:** the total out of 100
- **cappedPenalty:** `(100 − score) / 100`, capped at 0.85
- **throughput:** `1 − penalty` (this is what the formula multiplies by)

If you want to skip the signal details and just test a specific score, the breakdown endpoint (Step 8) accepts `"compositeScore": 80` directly.

**No GBP at all?** Send an empty body `{}` and you'll get penalty = 0.60 (fixed — from newDocs.md § B.2).

---

## Step 5 — What is the site retention rate?

> **Source:** Absolute doc — PSI table: "90–100 → 1.00, 70–89 → 0.90, 50–69 → 0.85, 0–49 → 0.80"
> **Also:** newDocs.md § C.1 — Abandonment Table (identical table)
> **Note:** The absolute doc walkthrough says "74 = .85%" but the absolute doc's own table says 70–89 = 0.90. PSI 74 is in the 70–89 band, so the correct value is **0.90**. The table takes precedence.

Based on PageSpeed performance score. You can send one score or send mobile + desktop and it averages them.

**Send to:** `http://localhost:5173/api/calc/site-retention`

**Body (single score):**
```json
{
  "psiScore": 74
}
```

**You should see:** retentionRate = **0.90**

**Body (mobile + desktop, it averages — from absolute doc Q6: "67mobile + 81desktop ... 148/2= 74"):**
```json
{
  "mobile": 67,
  "desktop": 81
}
```

**You should see:** psiScore = **74** (average), retentionRate = **0.90**

**Full lookup table (absolute doc + newDocs.md § C.1):**

| PSI Score | Retention | What it means                |
| --------- | --------- | ---------------------------- |
| 90–100    | 1.00      | Fast site, no one leaves     |
| 70–89     | 0.90      | 10% of visitors leave        |
| 50–69     | 0.85      | 15% of visitors leave        |
| 0–49      | 0.80      | 20% of visitors leave (slow) |

---

## Step 6 — What is the tenure rate?

> **Source:** Absolute doc — Step 8: "tenure: 24960 x 1.09" (12 years = Trusted = +9%)
> **Also:** newDocs.md § D.8 — Brand Tenure Modifier table

How long the business has been around affects the final number.

**Send to:** `http://localhost:5173/api/calc/tenure-rate`

**Body:**
```json
{
  "yearsInBusiness": 12
}
```

**You should see:** tenureRate = **0.09**, tenureLabel = **"Trusted"**

**Full lookup table (newDocs.md § D.8):**

| Years | Rate  | Label       |
| ----- | ----- | ----------- |
| 16+   | +16%  | Legacy      |
| 11–15 | +9%   | Trusted     |
| 6–10  | +4%   | Established |
| 2–5   | −5%   | Building    |
| 0–1   | −15%  | New         |

---

## Step 7 — What is the economic rate?

> **Source:** Absolute doc — Step 9: "economic lift 24960 x 1.05" (Timmins = Active = +5%)
> **Also:** newDocs.md § D.8 — Economic Modifier table + assigned cities

Based on the city's market condition.

**Send to:** `http://localhost:5173/api/calc/economic-rate`

**Body:**
```json
{
  "city": "Timmins"
}
```

**You should see:** marketTier = **"active"**, economicRate = **0.05**

**Full lookup table (newDocs.md § D.8):**

| Tier      | Rate  | Cities (from newDocs.md § D.8)                |
| --------- | ----- | --------------------------------------------- |
| Booming   | +15%  | (none assigned yet)                           |
| Active    | +5%   | Timmins, Sudbury, North Bay, Kirkland Lake    |
| Neutral   | 0%    | Any unknown city                              |
| Slow      | −15%  | Cochrane, Kapuskasing, Hearst, Englehart, New Liskeard, Cobalt |
| Depressed | −30%  | (none assigned yet)                           |

---

## Step 8 — Run the FULL formula breakdown (the big one)

> **Source:** Absolute doc — full walkthrough steps 1–10
> **Formula base from:** newDocs.md § B.5 — GBP gap formula per keyword
> **City scaling from:** newDocs.md § D.5 — City Scaling formula
> **REVISED by absolute doc:**
> - Conversion rate changed from 0.024 (newDocs.md § A.3) to **0.10** — "We changed the 0.024 to .10 this phone call conversion was originally based on initial traffic which was 6% and 40% closing rate. Approximately 4 times the value is closer to reality."
> - CTR floor added — "if you are number 1 we give you a value of .15 instead of 0" (overrides newDocs.md § D.3 "Benchmark — no gap")
> - GBP throughput = (1 − penalty) — "15 x (1-.20)=12" (absolute doc walkthrough step 5)
> **Modifiers from:** newDocs.md § D.8 + absolute doc steps 8–10
> **Discount from:** newDocs.md § A.3 — ultraConservativeDiscount = 0.85

This calculates the GBP Gap for every keyword, step by step, then adds modifiers and the 15% discount. It shows you every intermediate number.

**Send to:** `http://localhost:5173/api/calc/gbp-gap-breakdown`

**Body (uses numbers from Steps 1–7 above):**
```json
{
  "trade": "plumbing",
  "city": "Timmins",
  "compositeScore": 80,
  "psiScore": 74,
  "yearsInBusiness": 12,
  "avgSaleValue": 2000
}
```

**What to look for in the response:**

Under `inputs` — confirm these match what you got in the earlier steps:
- households = **20,941** (Step 2 — newDocs.md § D.5)
- scalingFactor = **0.3442** (Step 2 — newDocs.md § D.5 formula)
- gbpPenalty = **0.20**, gbpThroughput = **0.80** (Step 4 — absolute doc Q5)
- siteRetentionRate = **0.90** (Step 5 — absolute doc PSI table)
- tenureRate = **0.09** (Step 6 — newDocs.md § D.8)
- economicRate = **0.05** (Step 7 — newDocs.md § D.8)
- callConversionRate = **0.10** (absolute doc — revised from 0.024)
- ultraConservativeDiscount = **0.85** (newDocs.md § A.3)

Under `keywordBreakdown` — each keyword shows every step. For the first keyword ("plumber", 287 volume, default position "none"):

| Step | What happens | Number | Source |
| ---- | ------------ | ------ | ------ |
| 1 | Sudbury volume | 287 | Absolute doc "339 searches for plumber"; newDocs.md § D.6 |
| 2 | Scale to Timmins: 287 × 0.3442 | ≈ 98.8 | newDocs.md § D.5 formula |
| 3 | Not ranked → CTR gap = 0.41 | 0.41 | Absolute doc Q4; newDocs.md § D.3 |
| 4 | People lost: 98.8 × 0.41 | ≈ 40.5 | Absolute doc Q4 |
| 5 | After GBP: 40.5 × 0.80 | ≈ 32.4 | Absolute doc "15 x (1-.20)=12" pattern |
| 6 | After retention: 32.4 × 0.90 | ≈ 29.2 | Absolute doc PSI table (74 → 0.90) |
| 7 | After conversion: 29.2 × 0.10 | ≈ 2.92 customers | Absolute doc "x .10" (revised from 0.024) |
| 8 | Monthly revenue: 2.92 × $2,000 | ≈ $5,832 | Absolute doc Q7 pattern |
| 9 | Annual revenue: $5,832 × 12 | ≈ $69,987 | Absolute doc Q7 "x 12" |

Under `totals` (from absolute doc steps 8–10 + newDocs.md § D.8):
- **sumAnnualRevenue** = sum of all 5 keywords
- **tenureLift** = sum × 0.09 (absolute doc step 8: "24960 x 1.09")
- **economicLift** = sum × 0.05 (absolute doc step 9: "24960 x 1.05")
- **beforeDiscount** = sum + tenureLift + economicLift (absolute doc step 10: "24960 + 2246.4 + 1248")
- **finalGbpGap** = beforeDiscount × 0.85 (absolute doc step 10: "28454.4 x.85 = 24186.24")

### Want to test with a specific position?

Use the `keywords` field to control positions. For example, ranked #1 for "plumber" and not ranked for the rest:

```json
{
  "trade": "plumbing",
  "city": "Timmins",
  "compositeScore": 80,
  "psiScore": 74,
  "yearsInBusiness": 12,
  "avgSaleValue": 2000,
  "keywords": [
    { "keyword": "plumber", "sudburyVolume": 287, "position": 1 },
    { "keyword": "emergency plumber", "sudburyVolume": 26, "position": "none" },
    { "keyword": "plumbing repair", "sudburyVolume": 20, "position": "none" },
    { "keyword": "drain cleaning", "sudburyVolume": 3, "position": "none" },
    { "keyword": "water heater repair", "sudburyVolume": 3, "position": "none" }
  ]
}
```

With "plumber" at position 1, that keyword uses the **0.15 floor** (absolute doc: "if .44-.44=cannot be less than .15") instead of 0.41, so its gap is smaller.

### Want to test HVAC?

Change `"trade"` to `"hvac"`. It auto-picks the HVAC keywords (219 total — absolute doc) and default sale value $3,000 (newDocs.md § A.3):

```json
{
  "trade": "hvac",
  "city": "Timmins",
  "compositeScore": 80,
  "psiScore": 74,
  "yearsInBusiness": 12
}
```

---

## Step 9 — Test the modifiers on any number

> **Source:** Absolute doc — steps 8–10:
> - Step 8: "tenure: 24960 x 1.09= 27206.4 difference 27206.4- 24960 = 2246.4"
> - Step 9: "economic lift 24960 x 1.05 = 26208 Diff = 26208 -24960=1248"
> - Step 10: "24960 + 2246.4 + 1248 = 28454.4 x.85 = 24186.24"
> **Also:** newDocs.md § D.8 — Modifiers: Applied to Combined Total
> **Discount:** newDocs.md § A.3 — ultraConservativeDiscount = 0.85

Take any base dollar value and see what tenure + economic + discount does to it.

**Send to:** `http://localhost:5173/api/calc/modifiers`

**Body (using the absolute doc example: $24,960):**
```json
{
  "baseValue": 24960,
  "yearsInBusiness": 12,
  "city": "Timmins"
}
```

**You should see:**
- Tenure lift: $24,960 × 0.09 = **+$2,246.40** (absolute doc step 8)
- Economic lift: $24,960 × 0.05 = **+$1,248.00** (absolute doc step 9)
- adjustedValue = $24,960 + $2,246.40 + $1,248.00 = **$28,454.40** (absolute doc step 10)
- withUltraConservativeDiscount = $28,454.40 × 0.85 = **$24,186.24** (absolute doc step 10)

---

## Step 10 — Full Pipeline (Live API calls)

> **Source:** newDocs.md § B.7 — Data Sources and API Calls
> **Also:** newDocs.md § D.7 — DataForSEO Integration
> **Also:** newDocs.md § F.3 — Environment Variables

These hit Google, DataForSEO, and PageSpeed for real data. You need API keys set up in `.env`.

### Layer 1 — GBP Health Gap

> **Source:** newDocs.md § B.1 — What Layer 1 Measures
> **Signals:** newDocs.md § B.3 — The 9 Signals
> **Formula:** newDocs.md § B.5 — GBP gap formula per keyword

**Send to:** `http://localhost:5173/revenue-model-layer1`

**Body:**
```json
{
  "businessName": "Manito Plumbing and Heating Ltd.",
  "city": "Timmins",
  "trade": "plumbing",
  "yearsInBusiness": 12,
  "websiteUrl": "https://manitoplumbing.ca",
  "psiScore": 74
}
```

This does everything: looks up the business on Google, scores all 9 signals, gets search volumes, and calculates the full GBP gap.

### Layer 2 — Local Rank Gap

> **Source:** newDocs.md § D.1 — What Layer 2 Measures
> **Formula:** newDocs.md § D.2 — Rank Gap Formula
> **Rank data:** newDocs.md § D.7 — DataForSEO Integration

**Send to:** `http://localhost:5173/revenue-model-layer2`

**Body:**
```json
{
  "businessName": "Manito Plumbing and Heating Ltd.",
  "city": "Timmins",
  "trade": "plumbing",
  "secondaryTrade": "hvac",
  "revenueSplit": { "primary": 70, "secondary": 30 },
  "websiteUrl": "https://manitoplumbing.ca",
  "yearsInBusiness": 12,
  "annualRevenue": 300000,
  "avgSaleValue": 1500,
  "avgSaleValueSecondary": 3000
}
```

This does everything: Google Places, DataForSEO rank lookup for 5 keywords per trade, PageSpeed, and the full diagnostic.

---

## The Two Formula Changes

> **Source:** Absolute doc (takes precedence over newDocs.md § A.3 and § D.3)

1. **CTR floor for #1:** If the business is ranked #1, the gap used to be 0 (newDocs.md § D.3: "Benchmark — no gap"). Now it's a minimum of **0.15** (15%). Absolute doc: "if .44-.44=cannot be less than .15"

2. **Call conversion rate:** Changed from 0.024 (newDocs.md § A.3: "6% site-to-call × 40% win rate. Locked Session 17.") to **0.10**. Absolute doc: "We changed the 0.024 to .10 this phone call conversion was originally based on initial traffic which was 6% and 40% closing rate. Approximately 4 times the value is closer to reality."

---

## Quick Reference

| Step | What it checks                | Endpoint                            | Needs API keys? | Primary source |
| ---- | ----------------------------- | ----------------------------------- | --------------- | -------------- |
| 1    | Keyword search volumes        | `/api/calc/benchmark-volumes`       | No              | Absolute doc + newDocs.md § D.6 |
| 2    | City households + scaling     | `/api/calc/city-households`         | No              | Absolute doc Q1 + newDocs.md § D.5 |
| 3    | Ranking CTR + gap             | `/api/calc/ranking-ctr`             | No              | Absolute doc Q4 (revises newDocs.md § D.3) |
| 4    | GBP 9-signal composite score  | `/api/calc/composite-score`         | No              | Absolute doc Q5 + newDocs.md § B.3, B.5 |
| 5    | PSI → site retention rate     | `/api/calc/site-retention`          | No              | Absolute doc PSI table + newDocs.md § C.1 |
| 6    | Years → tenure rate           | `/api/calc/tenure-rate`             | No              | Absolute doc step 8 + newDocs.md § D.8 |
| 7    | City → economic rate          | `/api/calc/economic-rate`           | No              | Absolute doc step 9 + newDocs.md § D.8 |
| 8    | **Full formula breakdown**    | **`/api/calc/gbp-gap-breakdown`**   | No              | Absolute doc steps 1–10 (revises newDocs.md § A.3, D.3) |
| 9    | Modifiers on any base value   | `/api/calc/modifiers`               | No              | Absolute doc steps 8–10 + newDocs.md § D.8 |
| 10   | Full pipeline (live data)     | `/revenue-model-layer1` or `layer2` | Yes             | newDocs.md § B.7, D.7, F.3 |
