**CLEARSKY SOFTWARE**

**Layer 1 & Layer 2**

Comprehensive Developer Specification

Session 18 — April 2026 — Confidential

_Supersedes all previous Layer 1 and Layer 2 documentation_

Rory Dredhart · r.dredhart@clearskysoftware.net · 705-274-9564

# **Part A — Overview and Locked Constants**

## **A.1 — What This Document Is**

This is the single authoritative specification for Layer 1 (Google Business Profile health) and Layer 2 (local pack rank gap). It consolidates all changes from Sessions 14 through 18 into one document. All previous Layer 1 and Layer 2 documents are superseded. Do not implement from any prior spec.

## **A.2 — Layer Responsibilities**

|     |     |     |     |
| --- | --- | --- | --- |
| **Layer** | **What it measures** | **Output** | **Status** |
| Layer 1 | GBP listing health — 9 signals, 100-point composite score | gbpGap ($) + composite score + repair list | ✅ Model locked — Bugs 1 and 2 pending |
| Layer 2 | Local pack rank gap — 5 keywords per trade, up to 2 trades | rankGap ($) per trade, summed | ✅ Fully locked Session 17 |
| Layer 3 | Site performance — PSI score → siteRetentionRate modifier | siteRetentionRate (0.80 – 1.00) | ✅ Locked Session 15 — feeds into L1 and L2 |

## **A.3 — All Locked Constants**

_These values are fixed in the engine. They are not user inputs. Do not make them configurable. Do not change them without a new session decision._

|     |     |     |
| --- | --- | --- |
| **Constant** | **Value** | **Source / Notes** |
| callToPurchaseRate | 0.024 | 6% site-to-call × 40% win rate. Locked Session 17. Replaces 0.40 everywhere. |
| websiteToCallRate | 0.06 | Component only — not applied separately in formula. |
| winRate | 0.40 | Component only — not applied separately in formula. |
| positionOneCTR | 0.44 | Layer 1 GBP gap and Layer 2 rank gap. BrightLocal / Local SEO Guide. |
| sudburyHouseholds | 73,000 | 2021 census 71,476 — rounded up for stability. Reference market. |
| captiveMarketUplift | 1.20 | Applied in all city scaling formulas. |
| plumbingAvgSaleValue | $1,500 | Locked Session 17. Default for plumbing if not overridden by intake form. |
| hvacAvgSaleValue | $3,000 | Locked Session 17. Default for HVAC. |
| ultraConservativeDiscount | 0.85 | ultraConservative = totalRecoverable × 0.85. |
| adminHoursPerYear | 480 | 40 hours/month × 12. Fixed — not a user input. |
| annualAdminSaving | $5,760 | 480 × 0.40 × $30. Same for every business. |
| gbpMaxPenaltyCap | 0.85 | No GBP penalty can exceed 85% regardless of composite score. |
| gbpNoListingPenalty | 0.60 | Fixed 60% penalty when gbpExists = false. |

# **Part B — Layer 1: Google Business Profile**

## **B.1 — What Layer 1 Measures**

Layer 1 measures the health of the business Google Business Profile listing. A weak GBP costs the business in two ways: fewer clicks because prospects see a poor listing, and lower local pack ranking because Google deprioritises incomplete profiles.

The output is a composite score out of 100. That score produces a penalty percentage which multiplies into the GBP gap formula. The gap is the annual revenue the business is losing because their GBP is underperforming a perfect listing at position 1.

## **B.2 — GBP Existence Check**

Before any signal scoring runs, check whether a GBP listing exists.

|     |     |     |
| --- | --- | --- |
| **Condition** | **Penalty** | **Behaviour** |
| gbpExists = true | Composite signal scoring | All 9 signals scored. Points deducted per weakness. Composite score drives the GBP penalty. Cap: 85%. |
| gbpExists = false | 60% fixed penalty | Business unknown to Google. No signal scoring. Gap calculated at 60% of available traffic. Cannot exceed 60%. |

_A business with no GBP is unknown — not bad. A business with a terrible GBP is actively destroying its reputation with every impression. This is why a poor GBP can produce a higher penalty than no GBP at all._

## **B.3 — The 9 Signals: Final Weights**

Every business starts at 100. Points are deducted for each signal weakness. The remaining total is the composite GBP score.

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Signal** | **Max pts** | **Data source** | **Status** |
| 1   | Star rating | 35  | Google Places API | ✅ Live |
| 2   | Review count | 25  | Google Places API | ✅ Live |
| 3   | Photos | 8   | Google Places API | ✅ Live |
| 4   | Hours complete | 5   | Google Places API | ✅ Live |
| 5   | Owner response rate | 7   | Google Places API | ✅ Live |
| 6   | Website linked | 5   | Google Places API | ✅ Live |
| 7   | GBP Q&A activity | 4   | GMB API | ⚠️ Needs wiring — mocked at 0 |
| 8   | Description present | 4   | Google Places API | ✅ Live |
| 9   | Services listed | 7   | DataForSEO My Business Info | ⚠️ Needs wiring — mocked at 0 |
|     | TOTAL | 100 |     |     |

## **B.4 — Signal Formulas**

### **Signal 1 — Star Rating (35 points)**

Accelerating curve. Small drops at the top cost proportionally less than the same drop near the bottom. Reflects real prospect psychology — a 4.8-star drop to 4.7 matters less than a 3.5-star drop to 3.4.

function getGbpRatingScore(rating) {

if (!rating || rating >= 4.5) return 35;

if (rating < 3.0) return 0;

const t = (4.5 - rating) / 1.5;

const penalty = Math.min(1.0, Math.pow(t, 1.1));

return Math.round(35 \* (1 - penalty));

}

|     |     |     |     |
| --- | --- | --- | --- |
| **Rating** | **Points earned** | **Points lost** | **Zone** |
| 5.0 – 4.5 | 35  | 0   | Excellent — no deduction |
| 4.4 | 32  | 3   | Good — slight deduction |
| 4.2 | 29  | 6   | Good — meaningful hesitation |
| 4.0 | 25  | 10  | Good — prospect reads reviews first |
| 3.5 | 17  | 18  | Weak — serious damage |
| 3.0 | 0   | 35  | Critical — maximum deduction |
| Below 3.0 | 0   | 35  | Critical — effectively dead |

### **Signal 2 — Review Count (25 points)**

Dynamic benchmark tied to years in business. A 14-year business needs 84 reviews. A 2-year business needs 12. Accelerating curve — being far below benchmark is penalised more than a small shortfall.

function getGbpReviewScore(reviewCount, yearsInBusiness) {

const expected = (yearsInBusiness || 5) \* 6;

const ratio = Math.min(reviewCount / expected, 1.0);

if (ratio >= 1.0) return 25;

const gap = 1.0 - ratio;

const penalty = Math.min(1.0, Math.pow(gap, 0.8));

return Math.round(25 \* (1 - penalty));

}

// Benchmark: expected reviews = yearsInBusiness × 6

// Manito (14 yrs): expected = 84. Actual = 137. Full 25 points.

_Bug 1: yearsInBusiness defaults to 5 for every business because it is not being passed from the request body to the engine. Fix this before testing Signal 2. A 14-year business scored against a 5-year benchmark gives wrong results._

### **Signal 3 — Photos (8 points)**

Straight lookup table. Benchmark is 8+ photos based on BrightLocal research.

function getGbpPhotoScore(photoCount) {

if (photoCount >= 8) return 8;

if (photoCount >= 4) return 6;

if (photoCount >= 1) return 3;

return 0;

}

|     |     |     |
| --- | --- | --- |
| **Photos** | **Points earned** | **Points lost** |
| 8+  | 8   | 0 — benchmark, no penalty |
| 4 – 7 | 6   | 2   |
| 1 – 3 | 3   | 5   |
| 0   | 0   | 8   |

### **Signal 4 — Hours Complete (5 points)**

Binary. Either hours are published or they are not. Missing hours = invisible to all "open now" searches (15–20% of local searches).

function getGbpHoursScore(hoursPublished) {

return hoursPublished ? 5 : 0;

}

### **Signal 5 — Owner Response Rate (7 points)**

Measures how often the owner responds to reviews. Formula: ownerResponseCount ÷ totalReviewCount.

function getGbpResponseScore(ownerResponseCount, reviewCount) {

if (!reviewCount || reviewCount === 0) return 7;

const rate = ownerResponseCount / reviewCount;

if (rate >= 0.40) return 7;

if (rate >= 0.20) return 4;

if (rate > 0) return 2;

return 0;

}

|     |     |     |     |
| --- | --- | --- | --- |
| **Response rate** | **Points earned** | **Points lost** | **Notes** |
| 40%+ | 7   | 0   | Benchmark — no penalty |
| 20 – 39% | 4   | 3   | Responding but inconsistently |
| 1 – 19% | 2   | 5   | Rarely responds |
| 0%  | 0   | 7   | Complete silence |

_Manito example: 137 reviews, 23 responses = 17% rate. Falls in 1–19% band. 2 points earned, 5 points lost._

### **Signal 6 — Website Linked (5 points)**

Binary. Either the GBP listing has a website URL or it does not.

function getGbpWebsiteScore(websiteLinked) {

return websiteLinked ? 5 : 0;

}

_Secondary impact: no website linked also breaks Layer 3. ClearSky cannot run PageSpeed Insights without a URL. The diagnostic falls back to mock siteRetentionRate. One missing field costs 5 GBP points AND leaves Layer 3 inaccurate._

### **Signal 7 — GBP Q&A Activity (4 points)**

Percentage model. Measures owner answer rate across all questions posted on the GBP listing. No questions = full marks by default.

function getGbpQaScore(totalQuestions, ownerAnswered) {

if (!totalQuestions || totalQuestions === 0) return 4;

const rate = ownerAnswered / totalQuestions;

if (rate >= 0.60) return 4;

if (rate >= 0.40) return 3;

if (rate >= 0.20) return 2;

return 0;

}

|     |     |     |
| --- | --- | --- |
| **Answer rate** | **Points earned** | **Points lost** |
| No questions on listing | 4   | 0 — default, nothing to answer |
| 60%+ | 4   | 0 — benchmark |
| 40 – 59% | 3   | 1   |
| 20 – 39% | 2   | 2   |
| Below 20% | 0   | 4   |

_Data source not yet wired. Q&A data requires the GMB API. Currently mocked at 0 answered for all businesses — every business loses all 4 points on this signal until wired._

### **Signal 8 — Description Present (4 points)**

Binary. The description field is either populated or blank. Carries 4 points because it does two jobs: tells Google what the business does (ranking signal) and tells the prospect who to call (conversion signal).

function getGbpDescriptionScore(descriptionPresent) {

return descriptionPresent ? 4 : 0;

}

_Manito: no description on listing. Loses all 4 points. Five-minute fix worth ~$900 per point on the GBP repair list._

### **Signal 9 — Services Listed (7 points)**

Measures how many services the business has populated on their GBP listing. Data from DataForSEO My Business Info endpoint — returns service_categories array directly from the GBP profile.

function getGbpServicesScore(serviceCount) {

if (serviceCount >= 5) return 7;

if (serviceCount >= 3) return 5;

if (serviceCount >= 1) return 2;

return 0;

}

// DataForSEO endpoint: /v3/business_data/google/my_business_info/live

// Pass place_id. Map returned service_categories array length to bands above.

|     |     |     |     |
| --- | --- | --- | --- |
| **Services on GBP** | **Points earned** | **Points lost** | **Notes** |
| 5+  | 7   | 0   | Benchmark — no penalty |
| 3 – 4 | 5   | 2   | Partial coverage |
| 1 – 2 | 2   | 5   | Minimal listing |
| 0   | 0   | 7   | Invisible to service-specific searches |

_Data source not yet wired. Hardcoded to pass (0 deduction) until DataForSEO My Business Info is integrated._

## **B.5 — Composite Score to Gap Calculation**

### **Step 1 — Sum all signal scores**

const compositeScore =

ratingScore + reviewScore + photoScore + hoursScore +

responseScore + websiteScore + qaScore +

descriptionScore + servicesScore;

### **Step 2 — Calculate composite penalty**

const compositePenalty = (100 - compositeScore) / 100;

### **Step 3 — Apply max penalty cap**

const MAX_PENALTY = 0.85;

const appliedPenalty = Math.min(compositePenalty, MAX_PENALTY);

// When gbpExists = false: appliedPenalty = 0.60 (fixed). Signal scoring does not run.

### **Step 4 — GBP gap formula per keyword**

keywordGbpGap =

scaledMonthlySearches

× positionOneCTR // 0.44

× appliedPenalty // (100 - compositeScore) / 100, capped at 0.85

× siteRetentionRate // from Layer 3 PSI score

× callToPurchaseRate // 0.024 — LOCKED

× tradeAvgSaleValue // $1,500 plumbing / $3,000 HVAC

× 12

_Trade revenue split is display-only. It is NOT applied inside the gap formula. Apply it after the total is calculated, for reporting purposes only._

## **B.6 — GBP Repair List**

The GBP repair list calculates the annual dollar cost of each individual signal weakness and surfaces it on the results screen ranked highest to lowest cost.

// Cost per point lost

function calcCostPerPoint(gbpGap, pointsLost) {

if (!pointsLost || pointsLost === 0) return 0;

return Math.round(gbpGap / pointsLost);

}

// Build ranked repair list

function calcGbpRepairList(signals, costPerPoint) {

return signals

.filter(s => s.pointsLost > 0)

.map(s => ({

signal: s.name,

pointsLost: s.pointsLost,

annualCost: s.pointsLost \* costPerPoint

}))

.sort((a, b) => b.annualCost - a.annualCost);

}

// Results screen label: "Your GBP repair list"

// Show: signal name + annual cost only. No fix instructions. No explanations.

## **B.7 — Data Sources and API Calls**

|     |     |     |     |
| --- | --- | --- | --- |
| **Signal** | **API** | **Field / Endpoint** | **Status** |
| Rating, review count, photos, hours, response rate, website, description | Google Places API — Place Details | rating, user_ratings_total, photos, opening_hours, website, editorial_summary | ✅ Live — fix Bug 2 (wrong business returned) |
| GBP Q&A activity | GMB API | Returns totalQuestions + ownerAnsweredCount | ⚠️ Not wired — mocked at 0 |
| Services listed | DataForSEO My Business Info | /v3/business_data/google/my_business_info/live — service_categories array | ⚠️ Not wired — mocked at pass |

### **Bug 2 Fix — Place ID Lookup (required before going live)**

The current implementation uses findplacefromtext which returns the wrong business when multiple businesses share similar names. Replace with a Place ID lookup using the website URL.

// STEP 1 — Find Place ID using website URL (run once, cache result)

async function findPlaceIdByWebsite(websiteUrl, businessName, city) {

const query = encodeURIComponent(\`${businessName} ${city}\`);

const fields = "place_id,name,website";

const url = \`https://maps.googleapis.com/maps/api/place/findplacefromtext/json

?input=${query}&inputtype=textquery&fields=${fields}&key=${apiKey}\`;

const data = await fetch(url).then(r => r.json());

const candidates = data.candidates || \[\];

// Match by website domain if provided

if (websiteUrl) {

const domain = new URL(websiteUrl).hostname.replace("www.", "");

const match = candidates.find(c => c.website?.includes(domain));

if (match) return match.place_id;

}

return candidates\[0\]?.place_id ?? null;

}

// STEP 2 — Fetch full GBP data using Place ID

async function fetchGBPByPlaceId(placeId) {

const fields = "name,rating,user_ratings_total,photos,opening_hours,website,editorial_summary,reviews";

const url = \`https://maps.googleapis.com/maps/api/place/details/json

?place_id=${placeId}&fields=${fields}&key=${apiKey}\`;

// NO next: { revalidate: 3600 } — remove cache entirely

const data = await fetch(url).then(r => r.json());

return data.result ?? null;

}

// Owner response rate: count reviews with ownerResponse present

const ownerResponseCount = place.reviews?.filter(r => r.owner_response)?.length ?? 0;

## **B.8 — Manito Plumbing Worked Example**

14 years in business. Real GBP: 4.8 stars, 137 reviews, 7 photos, hours published, website linked, no description, ~17% response rate. Q&A and services not yet wired.

|     |     |     |     |
| --- | --- | --- | --- |
| **Signal** | **Value** | **Points lost** | **Points earned** |
| Star rating | 4.8 stars | 0   | 35  |
| Review count | 137 reviews (expected 84 at 14 yrs) | 0   | 25  |
| Photos | 7 photos | 2   | 6   |
| Hours complete | Published | 0   | 5   |
| Owner response rate | 17% (23/137) | 5   | 2   |
| Website linked | Yes | 0   | 5   |
| GBP Q&A activity | Not wired — mocked 0 answered | 4   | 0   |
| Description present | No  | 4   | 0   |
| Services listed | Not wired — mocked at pass | 0   | 7   |
| TOTAL |     | 15 / 100 | 85 / 100 |

_Note on the 78 vs 85 discrepancy: Session 16/17 handoff quotes 78/100 for Manito. That assumed Q&A mocked at 4 points lost and services at 7 points lost. With services mocked at pass (0 lost) and Q&A at 4 lost, composite is 85. The two wired-but-unmeasured signals (Q&A and services) produce different mock floors. The 78 score is the floor estimate used in the Session 17 reference numbers. The 85 score is what the engine currently returns with services mocked at pass. Lock this with Rory before finalising reference numbers._

Composite penalty (using Session 17 reference of 78): (100 − 78) ÷ 100 = 22%

Applied penalty: 22% — well below 85% cap.

Cost per GBP point: ~$900 (gbpGap ÷ points lost)

# **Part C — Layer 3: Site Retention Rate**

Layer 3 does not produce a standalone dollar gap. It produces a siteRetentionRate multiplier that is applied inside both the Layer 1 GBP gap formula and the Layer 2 rank gap formula. This section is included here because developers must understand how siteRetentionRate flows before implementing Layer 1 and Layer 2.

## **C.1 — Abandonment Table**

|     |     |     |     |
| --- | --- | --- | --- |
| **PSI performance score** | **Abandonment** | **siteRetentionRate** | **Interpretation** |
| 90+ | 0%  | 1.00 | Fast site — no penalty |
| 70 – 89 | 10% | 0.90 | 10% of clicks bail before seeing site |
| 50 – 69 | 15% | 0.85 | 15% of clicks wasted |
| Below 50 | 20% | 0.80 | 20% abandonment — slow mobile site |

function getSiteRetentionRate(performanceScore) {

const score = performanceScore || 0;

if (score >= 90) return 1.00;

if (score >= 70) return 0.90;

if (score >= 50) return 0.85;

return 0.80;

}

// Manito PSI score: 52 → siteRetentionRate = 0.85

# **Part D — Layer 2: Local Pack Rank Gap**

## **D.1 — What Layer 2 Measures**

Layer 2 measures the annual revenue the business is losing because they are not ranking at position 1 in the Google local pack for their key trade searches. It calculates this gap for up to 5 keywords per trade, for up to 2 trades. All gaps are summed.

_Keyword volumes are always sourced from Sudbury, Ontario — the index market — then scaled to the prospect's city using the MARKET_CLUSTERS household table. This is because small markets (Timmins, Kirkland Lake) do not produce reliable DataForSEO keyword volume data on their own._

## **D.2 — Rank Gap Formula**

### **Per keyword**

keywordRankGap =

scaledMonthlySearches // Sudbury volume × city scale factor

× (positionOneCTR - currentCTR) // CTR gap vs position 1 benchmark

× siteRetentionRate // from Layer 3 PSI score

× callToPurchaseRate // 0.024 — LOCKED

× tradeAvgSaleValue // per-trade, not blended

× 12 // annualise

÷ seasonalDivisor // trade-specific active months

// Sum across 5 keywords per trade

// Two trades = two separate calculations, summed

_Trade revenue split is NOT applied inside this formula. It is display-only, applied after the total is calculated for reporting purposes. Do not multiply by revenueSplit inside calcRankGap()._

## **D.3 — CTR Table**

|     |     |     |     |
| --- | --- | --- | --- |
| **Position** | **CTR** | **Gap vs position 1** | **Formula value** |
| Position 1 | 44% | 0%  | Benchmark — no gap |
| Position 2 | 24% | 20% gap | 0.44 − 0.24 = 0.20 |
| Position 3 | 17% | 27% gap | 0.44 − 0.17 = 0.27 |
| Not in pack | 3%  | 41% gap | 0.44 − 0.03 = 0.41 — maximum |

## **D.4 — Seasonal Divisors**

|     |     |     |     |
| --- | --- | --- | --- |
| **Trade** | **Seasonal divisor** | **Active months** | **Rationale** |
| Plumbing | ÷ 12 | 12  | Year-round emergency service |
| HVAC | ÷ 10 | 10  | Heating and cooling seasons — 2 shoulder months excluded |
| Roofing | ÷ 6 | 6   | May to October only |
| Electrical | ÷ 12 | 12  | Year-round emergency service |

_Roofing and electrical cannot go live until Rory runs DataForSEO Sudbury keyword research. Process: query 10 candidate terms + "sudbury ontario", pick top 5 by volume, hand to developer who updates FALLBACK_VOLUMES and TRADES_FALLBACK keyword arrays._

## **D.5 — City Scaling**

### **Formula**

// Scale Sudbury keyword volume to prospect city

scaledMonthlySearches =

sudburyMonthlyVolume

× (cityHouseholds / sudburyHouseholds) // 73,000 reference

× captiveMarketUplift; // 1.20

// Example: Timmins (20,941 households)

// scaledVolume = sudburyVolume × (20,941 / 73,000) × 1.20

// scaledVolume = sudburyVolume × 0.344

### **MARKET_CLUSTERS Table**

|     |     |     |     |
| --- | --- | --- | --- |
| **Cluster** | **Households** | **DataForSEO location code** | **Economic tier** |
| Timmins (+ Matheson + Iroquois Falls) | 20,941 | 1002836 | Active +0.05 |
| Cochrane – Kapuskasing – Hearst | 8,360 | 1002549 | Slow −0.15 |
| Kirkland Lake (+ McGarry Twp) | 4,064 | 1002557 | Active +0.05 |
| Englehart – New Liskeard – Cobalt | 5,401 | TBD — confirm this session | Slow −0.15 |
| North Bay (+ Sturgeon Falls + Mattawa) | 30,737 | 1002116 | Active +0.05 |
| Sudbury (+ Azilda + Chelmsford + Copper Cliff) | 71,476 | 1002124 | Active +0.05 — INDEX MARKET |

_Sudbury is always queried for keyword volumes regardless of the prospect's city. Never query the prospect city directly for keyword volume. Always query Sudbury (location code 1002124), then apply city scaling._

## **D.6 — Keyword Sets**

DataForSEO returns keyword volumes. Each trade has a base set of 5 keywords, queried as "keyword + sudbury ontario". The trades route (/api/trades) returns the keyword base terms. The /api/keywords route fetches live Sudbury volumes from DataForSEO.

|     |     |     |
| --- | --- | --- |
| **Trade** | **Base keyword set (Sudbury volume query)** | **Session 17 Sudbury volume estimate** |
| Plumbing | "plumber sudbury ontario", "emergency plumber sudbury ontario", "plumbing repair sudbury ontario", "drain cleaning sudbury ontario", "water heater repair sudbury ontario" | 287 / 26 / 20 / 3 / 3 — ESTIMATES, confirm with live DataForSEO |
| HVAC | "hvac sudbury ontario", "furnace repair sudbury ontario", "air conditioning sudbury ontario", "heating and cooling sudbury ontario", "ac repair sudbury ontario" | 96 / 52 / 27 / 27 / 17 — ESTIMATES, confirm with live DataForSEO |
| Roofing | Not yet researched | Pending — Rory to run DataForSEO research |
| Electrical | Not yet researched | Pending — Rory to run DataForSEO research |

## **D.7 — DataForSEO Integration**

ValueSERP is retired. DataForSEO is the only rank and keyword volume API. Two separate DataForSEO call types are used.

|     |     |     |     |
| --- | --- | --- | --- |
| **Call type** | **Endpoint** | **Used for** | **Auth** |
| Keyword volume | /v3/keywords_data/google_ads/search_volume/live | Monthly search volume for each keyword in Sudbury. Called by /api/keywords route. | DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD — Basic Auth |
| SERP / Rank lookup | /v3/serp/google/organic/live/advanced | Local pack position for each keyword in prospect city. Called in diagnostic route per trade. | Same credentials |
| My Business Info | /v3/business_data/google/my_business_info/live | Services listed count for Layer 1 Signal 9. | Same credentials |

// Keyword volume fetch (Sudbury) — /api/keywords route

async function fetchSudburyVolumes(keywords) {

const payload = keywords.map(kw => ({

keyword: \`${kw} sudbury ontario\`,

location_code: 1002124, // Sudbury

language_code: "en"

}));

const res = await fetch(

"https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",

{

method: "POST",

headers: {

"Authorization": "Basic " + btoa(\`${login}:${password}\`),

"Content-Type": "application/json"

},

body: JSON.stringify(payload)

}

);

const data = await res.json();

return data.tasks?.\[0\]?.result ?? \[\];

}

// SERP rank lookup (prospect city) — diagnostic route

async function fetchRankDataForSEO(keyword, locationCode) {

const payload = \[{

keyword: keyword,

location_code: locationCode, // prospect city code from MARKET_CLUSTERS

language_code: "en",

device: "mobile",

os: "android"

}\];

const res = await fetch(

"https://api.dataforseo.com/v3/serp/google/organic/live/advanced",

{ method: "POST", headers: { ... }, body: JSON.stringify(payload) }

);

// Extract local_pack items and organic items from result

const result = data.tasks?.\[0\]?.result?.\[0\];

const localPack = result?.items?.filter(i => i.type === "local_pack") ?? \[\];

return { localPackRank: findBusinessRank(localPack, businessName), ... };

}

## **D.8 — Modifiers: Applied to Combined Total**

Modifiers are applied to the combined Layer 1 + Layer 2 base gap. Not per layer. Not inside the gap formulas. Applied once after both layers are summed.

// Step 1: Calculate layer gaps

const layer1Gap = calcGbpGap(primary) + calcGbpGap(secondary);

const layer2Gap = calcRankGap(primary) + calcRankGap(secondary);

const baseGap = layer1Gap + layer2Gap;

// Step 2: Apply brand tenure modifier

const tenureModifier = getBrandTenureModifier(yearsInBusiness); // e.g. 1.09

const tenureUplift = baseGap \* tenureModifier;

// Step 3: Apply economic modifier

const economicRate = getEconomicModifier(city); // e.g. +0.05

const economicUplift = baseGap \* economicRate;

// Step 4: Total recoverable

const totalRecoverable = tenureUplift + economicUplift;

const ultraConservative = totalRecoverable \* 0.85;

// Step 5: Trade revenue split — DISPLAY ONLY

const primaryShare = totalRecoverable \* (primaryRevenueSplit / 100);

const secondaryShare = totalRecoverable \* (secondaryRevenueSplit / 100);

### **Brand Tenure Modifier**

|     |     |     |     |
| --- | --- | --- | --- |
| **Years in business** | **Label** | **Modifier** | **Manito (14 yrs)** |
| 16+ | Legacy | 1.16× | —   |
| 11 – 15 | Trusted | 1.09× | ✅ Manito — 14 years = Trusted |
| 6 – 10 | Established | 1.04× | —   |
| 2 – 5 | Building | 0.95× | —   |
| 0 – 1 | New | 0.85× | —   |

_Bug 1 impact: if yearsInBusiness defaults to 5 (Building tier, 0.95×) instead of 14 (Trusted, 1.09×), every tenure modifier is wrong. Fix Bug 1 first._

### **Economic Modifier**

|     |     |     |
| --- | --- | --- |
| **Label** | **Modifier** | **Assigned cities** |
| Booming | +0.15 | None assigned yet |
| Active | +0.05 | Timmins, Sudbury, North Bay, Kirkland Lake |
| Neutral | +0.00 | Default for unrecognised cities |
| Slow | −0.15 | Cochrane, Kapuskasing, Hearst, Englehart, New Liskeard, Cobalt |
| Depressed | −0.30 | None assigned yet |

## **D.9 — Manito Plumbing Worked Example**

### **Inputs**

|     |     |
| --- | --- |
| **Input** | **Value** |
| City | Timmins |
| City households | 20,941 |
| sudburyHouseholds | 73,000 |
| captiveMarketUplift | 1.20 |
| City scale factor | 20,941 ÷ 73,000 × 1.20 = 0.3441 |
| callToPurchaseRate | 0.024 |
| siteRetentionRate (PSI 52) | 0.85 |
| plumbingAvgSaleValue | $1,500 |
| hvacAvgSaleValue | $3,000 |
| Plumbing seasonal divisor | ÷ 12 |
| HVAC seasonal divisor | ÷ 10 |
| Manito rank position | Not in pack (CTR = 3%) |
| CTR gap (not in pack vs pos 1) | 0.44 − 0.03 = 0.41 |

### **Plumbing Rank Gap**

|     |     |     |     |
| --- | --- | --- | --- |
| **Keyword** | **Sudbury volume** | **Scaled (Timmins)** | **Annual gap** |
| "plumber sudbury ontario" | 287 | Math.round(287 × 0.3441) = 99 | 99 × 0.41 × 0.85 × 0.024 × $1,500 × 12 = ~$18,950 |
| "emergency plumber sudbury ontario" | 26  | 9   | ~$1,720 |
| "plumbing repair sudbury ontario" | 20  | 7   | ~$1,340 |
| "drain cleaning sudbury ontario" | 3   | 1   | ~$191 |
| "water heater repair sudbury ontario" | 3   | 1   | ~$191 |
| PLUMBING TOTAL |     |     | ~$22,392 |

_Session 17 reference number for plumbing rank gap is $52,000. The numbers above use volume estimates that require confirmation with live DataForSEO data — Track 2, Session 18. Confirm live Sudbury volumes before finalising reference numbers._

### **Session 17 Reference Numbers — Final**

|     |     |     |
| --- | --- | --- |
| **Component** | **Value** | **Notes** |
| Plumbing rank gap | $52,000 | Session 17 locked reference |
| HVAC rank gap | $26,000 | Session 17 locked reference |
| Plumbing GBP gap | $13,500 | Session 17 locked reference |
| HVAC GBP gap | $8,000 | Session 17 locked reference |
| Total base gap | $99,500 | L1 + L2 combined |
| Tenure modifier (14 yrs — Trusted) | 1.09× = +$8,955 |     |
| Economic modifier (Timmins — Active) | +0.05 = +$4,975 |     |
| Total recoverable | $113,430 | After modifiers |
| Ultra conservative | $96,415 | $113,430 × 0.85 |
| Cost per GBP point | ~$900 | gbpGap ÷ points lost |

# **Part E — Three Critical Bugs**

_Fix in this order. Bug 1 affects every calculation. Bug 2 makes all Layer 1 scores wrong. Bug 3 crashes the diagnostic._

## **Bug 1 — yearsInBusiness Not Reaching Engine (CRITICAL — Fix First)**

annualRevenue and yearsInBusiness are collected in the intake form but not passed from the diagnostic route request body through to the engine call. yearsInBusiness defaults to 5 for every business. Brand tenure tier is wrong for every diagnostic run.

|     |     |
| --- | --- |
| **Impact area** | **Effect** |
| Signal 2 — Review count | Expected reviews = yearsInBusiness × 6. At default 5, Manito expected = 30. At correct 14, expected = 84. Completely different score. |
| Brand tenure modifier | Manito at 14 years = Trusted (1.09×). At default 5 years = Building (0.95×). Every tenure modifier is wrong. |
| Total recoverable | Wrong modifier × base gap = wrong total for every business. |

// diagnostic-route.js — fix in POST handler

// BEFORE (broken):

const engineInputs = {

...inputs,

// yearsInBusiness never explicitly mapped

};

// AFTER (fixed):

const engineInputs = {

...inputs,

annualRevenue: body.business?.annualRevenue ?? null,

yearsInBusiness: body.business?.yearsInBusiness ?? null,

};

// Verify with console.log before and after:

console.log("\[Bug1 check\] yearsInBusiness from body:", body.business?.yearsInBusiness);

console.log("\[Bug1 check\] yearsInBusiness in engineInputs:", engineInputs.yearsInBusiness);

## **Bug 2 — Layer 1 Finding Wrong Business (CRITICAL)**

The current fetchGBPLayer() uses findplacefromtext which returns the first name-match result. Multiple trades businesses in the same city may share similar names. Also, the next: { revalidate: 3600 } cache means stale GBP data is returned for 1 hour.

|     |     |
| --- | --- |
| **Impact area** | **Effect** |
| All 9 GBP signals | Scores based on wrong business data. Star rating, review count, photos — all wrong. |
| GBP gap calculation | Penalty based on wrong composite score. Every Layer 1 gap is wrong. |
| GBP repair list | Repair list built from wrong signal values. Recommendations are for the wrong business. |

Fix: replace text query with Place ID lookup using websiteUrl. See Section B.7 for full code. Remove next: { revalidate: 3600 } from fetch call entirely.

## **Bug 3 — Layer 7/8 Crash on Undefined Property**

Social and paid gap calculations access nested properties without null guards. When the data object is undefined or has unexpected shape, the diagnostic crashes before returning any results. Social and paid gaps both return $0.

// Add null guards before all nested property access in social and paid calculations

// BEFORE (crashes):

const socialGap = socialVoice.sentiment.score \* multiplier;

// AFTER (safe):

const socialGap = (socialVoice?.sentiment?.score ?? 0) \* multiplier;

// Apply to every nested access in calcSocialAdjustment() and calcPaidGap()

// Check: any property access beyond one level deep needs optional chaining (?.) or ?? 0

# **Part F — Files That Change**

## **F.1 — Implementation Order**

Implement in this order. Each step depends on the one before.

|     |     |     |     |
| --- | --- | --- | --- |
| **Step** | **File** | **Change** | **Test** |
| 1   | app/api/diagnostic/route.js | Fix Bug 1: map yearsInBusiness and annualRevenue from request body to engineInputs | console.log both values. Verify Manito shows 14 years. |
| 2   | app/api/diagnostic/route.js | Fix Bug 2: replace fetchGBPLayer text query with Place ID lookup. Remove cache. | Verify \_gbpSource = "live" in results.meta. Check businessName in result matches Manito. |
| 3   | lib/clearsky-engine.js | Fix Bug 3: add null guards to social and paid gap calculations. | Full diagnostic completes without crash. Social and paid return values (not undefined). |
| 4   | lib/clearsky-engine.js | Replace callToPurchaseRate 0.40 with 0.024 everywhere. Add MARKET_CLUSTERS. Update calcGbpGap() and calcRankGap() with new formulas. Add applyModifiers(). Add calcGbpRepairList(). | Run Manito test. Verify: plumbing rank gap ~$52,000. GBP score 78/100. Total recoverable ~$113,430. |
| 5   | app/api/diagnostic/route.js | Replace ValueSERP with DataForSEO SERP calls. Two rank calls (primary + secondary trade). Pass keyword arrays from /api/keywords to engine. | Verify rank calls hit DataForSEO. Verify secondary trade gap is calculated. |
| 6   | components/ClearSkyIntakeForm.jsx | Add avgSaleValue per trade. Add secondaryTrade. Add revenueSplit. Add keyword pre-fetch on trade selection. Remove retired fields. | Submit form with Manito data. Verify all fields reach diagnostic route. |
| 7   | components/ClearSkyResultsModal.jsx | Add rank status pills. Add rank summary sentence. Add Layer 2 advisor block. Increase .cs-rep-panel.open max-height to 900px. | Results screen shows $113,430 total recoverable for Manito. |

## **F.2 — New File Required: /api/keywords/route.js**

This file does not exist yet. It must be created. It fetches keyword volumes from DataForSEO for a given trade, always querying Sudbury, and returns the top 5 keywords with their volumes.

// app/api/keywords/route.js — NEW FILE

// Called by intake form on trade selection (and again for secondary trade)

// Returns top 5 keywords + Sudbury volumes for the selected trade

export async function GET(request) {

const { searchParams } = new URL(request.url);

const trade = searchParams.get("trade");

const login = process.env.DATAFORSEO_LOGIN;

const password = process.env.DATAFORSEO_PASSWORD;

// Get base keyword terms from trades config

const tradeRes = await fetch(\`${baseUrl}/api/trades\`);

const trades = await tradeRes.json();

const config = trades.find(t => t.name.toLowerCase() === trade);

const keywords = config?.keywords ?? FALLBACK_KEYWORDS\[trade\] ?? \[\];

// Fetch Sudbury volumes from DataForSEO

const payload = keywords.map(kw => ({

keyword: \`${kw} sudbury ontario\`,

location_code: 1002124,

language_code: "en"

}));

const res = await fetch(

"https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",

{ method: "POST", headers: { ... }, body: JSON.stringify(payload) }

);

const data = await res.json();

const results = data.tasks?.\[0\]?.result ?? \[\];

const top5 = results

.sort((a, b) => b.search_volume - a.search_volume)

.slice(0, 5)

.map(r => ({ keyword: r.keyword, volume: r.search_volume }));

return Response.json({ trade, keywords: top5 });

}

## **F.3 — Environment Variables**

|     |     |     |
| --- | --- | --- |
| **Variable** | **Required for** | **Notes** |
| GOOGLE_PLACES_API_KEY | Layer 1 GBP — Place ID lookup + Place Details | Google Cloud Console. Enable Places API. Falls back to mock if not set. |
| DATAFORSEO_LOGIN | Layer 2 rank lookups + keyword volumes + My Business Info | DataForSEO account login email. Required for live data. |
| DATAFORSEO_PASSWORD | Layer 2 (same) | DataForSEO account password. Store in .env.local — never expose client-side. |
| PAGEINSIGHTS_KEY (optional) | Layer 3 PageSpeed higher quota | Not required for basic usage (25 req/day keyless). Free key if needed. |
| NEXT_PUBLIC_BASE_URL | /api/keywords route fetch | Base URL for internal API calls. e.g. http://localhost:3000 in dev. |

ClearSky Software — Layer 1 & Layer 2 Developer Specification — Session 18 — April 2026 — Confidential

Rory Dredhart · r.dredhart@clearskysoftware.net · 705-274-9564


### UPDATES AND OVERRIDES:

PSI ScoreRetention RateAbandonmentStatus90 – 1001.000%Green70 – 890.9010%Amber50 – 690.8515%Amber0 – 490.8020%Red

339 searches for plumber

219 searches for HVAc

**GBP Gap = sudburyVolume × (cityHouseholds ÷ 73,000) × 1.20 × 0.44 × min((100 − compositeScore) ÷ 100, 0.85) × siteRetentionRate(PSI) × 0.024 × avgSaleValue × 12 × (1 + tenureRate + economicRate) × 0.85**

1.  **What number of households do we use for Timmins?**
2.  **What is the keyword volume for plumber in Sudbury**
    1.  **For second key**
    2.  **For third ey**
    3.  **For 4th**
    4.  **For 5thh**
3.  **Calculate the value (keyword 1, 2 3 4 and 5 each keyword needs to do its own calculation) (cty households / 73000)x1.20 x ranking value.**
4.  **Ranking value determines how many clicks we lose because we are not number 1. If you are number 1 you will get .44 is the max the value we are going to get. Example we have 100 as a search volume. The max # of people who would visit our site is 44, we say we are not ranked locally so we get a score 3%, so what do we lose. 44-3 = 41% if we place 2nd we lose 44-24=20, for third we lose 44-17, for anything else we lose 44-3=41 If we are number 1 we get.44 we lost 0**
5.  **X min((100-composite score) / 100, .85) min= (100-80)/100 =.20 the number can not exceed .85**

**Recap**

**100 people searching for primary keyword after increasing it by 1.20 (the 1.20 is all of the other searches not included) so we started out wih 83 people searching then we x 1.20 = 100 we x by all of the people we are losing because we are not number 1 in pack 3. With Minato they came back #1 for plumber which would mean they would have a value of 0 which makes the balance incomplete. So we need to add a minimum value so we say .15 if .44-.44=cannot be less than .15)**

**In our example it would equal 100 people searching x .15 =15 people you have lost x .20(this number says what the penalty would be because you did not have a perfect score) so our equation is 15 x (1-.20)=12 we lost 3 people because our GBP was not 100.**

**Ok Moving forward;**

**6)We have 12 people searching and we get a score of**

**67mobile + 81desktop for Performance in Page Speed Index 148/2= 74 = .85% the calculation is 12 x.85 = 10.2 x .10 = 1.04 our number before we add the modifiers = 1.04 people**

**7)1.04 people x 2000 (average sales value) = 2080 x 12 = 24960**

**8)tenure: 24960 x 1.09= 27206.4 difference 27206.4- 24960 = 2246.4**

**9)economic lift 24960 x 1.05 = 26208 Diff = 26208 -24960=1248**

**10 final # 24960 + 2246.4 + 1248 = 28454.4 x.85 = 24186.24**

**Ok we changed two numbers if you are number 1 we give you a value of .15 instead of 0**

**We changed the 0.024 to .10 this phone call conversion was originally based on initial traffic which was 6% and 40 % closing rate. Approximately 4 times the value is closer to reality.**