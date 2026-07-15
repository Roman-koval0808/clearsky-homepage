/**
 * Field explainers for API JSON responses.
 * For `/api/calc/*`, use `calc-response-explainers.js` (request-aware formulas) when `requestBody` is passed.
 *
 * attachExplainer(routeId, body, requestBody?) → { ...body, explainer }
 */

import { explainCalcRoute } from './calc-response-explainers.js';

/** @typedef {{ title: string, howWeGetIt: string, usedFor: string, valueInThisResponse?: string }} ExplainerLeaf */

/** @type {(title: string, howWeGetIt: string, usedFor: string) => ExplainerLeaf} */
const L = (title, howWeGetIt, usedFor) => ({
	title,
	howWeGetIt,
	usedFor
});

/** @param {string[]} path */
function pathKey(path) {
	const j = path.join('.');
	return j.replace(/^root\./, '') || 'root';
}

/** Common keys seen across many routes
 * @type {Record<string, ExplainerLeaf>}
 */
const BY_KEY = {
	success: L(
		'Did the server finish the job?',
		'The route sets this to true when your inputs were OK and the math or live API calls finished without throwing. If false, read `error`.',
		'Lets apps and humans know at a glance whether to trust the numbers below.'
	),
	error: L(
		'What went wrong?',
		'Filled when `success` is false — or sometimes alongside partial success (e.g. PageSpeed) — from the server or an upstream API (DataForSEO, Google).',
		'Use this string to fix the request or show a friendly message to the user.'
	),
	code: L(
		'Error code (optional)',
		'Some failures (especially DataForSEO) add a short machine code next to the message.',
		'Helps support and logs match the failure to the right subsystem.'
	),
	mode: L(
		'Which Google Places variant ran?',
		'`light` asks for fewer fields (faster). `full` asks for photos, hours, editorial summary, etc.',
		'Layer 2 usually uses light; Layer 1 style reports often use full.'
	),
	data: L(
		'Main payload',
		'Everything the calculator or live API produced for this request — numbers, objects, and nested details.',
		'This is what your UI or spreadsheet should read.'
	),
	value: L(
		'Dollar gap or main score (number)',
		'Comes from the Clearsky engine: formulas use searches, CTR, penalties, retention, conversion, and average job size, depending on the endpoint.',
		'Usually the headline “how much money is left on the table” or the core metric for that layer.'
	),
	displayValue: L(
		'Human-friendly money string',
		'Formatted with `formatCurrency` / `$44K` style rounding so people do not stare at long integers.',
		'Show this on cards and PDFs; keep `value` for charts and math.'
	),
	status: L(
		'Traffic light bucket',
		'Often `green`, `amber`, or `red` (sometimes lowercase) from comparing a score or gap to cutoffs in the engine.',
		'Quick visual cue for dashboards and alerts.'
	),
	note: L(
		'Extra explanation from the server',
		'Written by the route to remind you about assumptions (e.g. “volumes are from Sudbury index”).',
		'Good for tooltips and documentation inside the product.'
	),
	detail: L(
		'Breakdown object',
		'Nested object with per-keyword, per-signal, or per-step numbers that explain the top-level `value`.',
		'Use when someone asks “why is this number so big?” — open `detail`.'
	),
	gbpExists: L(
		'Did we find a real Google Business Profile?',
		'False if there was no `place_id` or listing; the engine then uses a “no listing” penalty instead of a 9-signal score.',
		'If false, teach the user to claim or fix their GBP before trusting gap numbers.'
	),
	compositeScore: L(
		'GBP health score out of 100',
		'Sum of earned points across rating, reviews, photos, hours, responses, website, Q&A, description, and services.',
		'Higher means more of the search opportunity “flows through” the listing (throughput).'
	),
	appliedPenalty: L(
		'How much demand is blocked by weak GBP (0–1)',
		'Derived from `(100 − compositeScore) / 100`, capped by `gbpMaxPenaltyCap` in the engine.',
		'Multiplied by opportunity in the gap formula — worse listing, more money left on the table.'
	),
	signals: L(
		'List of GBP signals',
		'Each row: name, earned points, max points, sometimes `pointsLost` and percentage.',
		'Shows exactly which issues to fix first (biggest gaps).'
	),
	keywords: L(
		'Per-keyword rows',
		'Often keyword text, map-pack position, `sudburyVolume`, and annual gap contribution.',
		'Lets you drill into which searches drive the rank gap.'
	),
	households: L(
		'Homes in the city (for scaling)',
		'Looked up from `MARKET_CLUSTERS` / city table (or fallback) — not fetched from Google each time.',
		'Used to scale Sudbury index search volumes to local demand.'
	),
	siteRetentionRate: L(
		'Share of visitors who stay after the page loads (0–1)',
		'Mapped from PageSpeed / PSI score using bands in `getSiteRetentionRate` — not a separate Google API field.',
		'Multiplied into revenue formulas: slow site → fewer people stay → less revenue.'
	),
	retentionRate: L(
		'Same idea as site retention (alias in some routes)',
		'From PSI bands (see site-retention endpoint).',
		'Used to turn “speed score” into a conversion multiplier.'
	),
	psiScore: L(
		'PageSpeed Insights performance score (0–100)',
		'You send it, or we average mobile + desktop, or PageSpeed returns it from Google’s API.',
		'Feeds into the retention table — higher score usually means higher retention.'
	),
	trade: L(
		'Trade vertical',
		'Normalised string like `plumber` or `hvac` from your input.',
		'Chooses which five locked keywords and seasonal rules apply.'
	),
	trades: L(
		'Multiple trades in one request',
		'Array of objects with `trade`, `rank`, `avgSaleValue`, `weightPct` for dual-trade Layer 2.',
		'Lets you model primary + secondary revenue split.'
	),
	rank: L(
		'Where you show up for each keyword',
		'Built from SERP / map-pack data: `keywords` with `position` string and `sudburyVolume` per row.',
		'Feeds `calcRankGap` / `calcWeightedRankGap`.'
	),
	website: L(
		'Business website URL',
		'From Google Places or your form input.',
		'Used for PageSpeed and to match the business online.'
	),
	business: L(
		'Who we are talking about',
		'Name, city, sometimes website; copied from Places or your JSON.',
		'Display and reporting — not used in math except indirectly through identifiers.'
	),
	layer1: L(
		'Layer 1 GBP result',
		'Combined `calcGbpGap` output plus UI scores, modifiers, and keyword breakdown from the pipeline.',
		'Shows Google Business Profile opportunity after scaling and penalties.'
	),
	layer2: L(
		'Layer 2 local rank result',
		'Output of `calcWeightedRankGap` (and related display fields) using SERP ranks and Sudbury volumes.',
		'Shows how much revenue is lost to worse map-pack positions vs #1.'
	),
	metrics: L(
		'Quick numbers for the UI',
		'Search volume sums, retention %, call-to-purchase % — whatever the route surfaced alongside gaps.',
		'Report cards and “METRICS” block in downloadable reports.'
	),
	reportText: L(
		'Downloadable text report',
		'Big string built by `buildLayer1ReportTxt` / `buildLayer2ReportTxt` with inputs and API log.',
		'Save as `.txt` for the customer or support.'
	),
	keywordBreakdown: L(
		'Each keyword’s Sudbury volume and scaled demand',
		'For each locked keyword: keyword name, Sudbury volume, scaled volume, uplift factor.',
		'Proves how scaled monthly searches were built from the index market.'
	),
	scores: L(
		'Percent strength per GBP signal',
		'Each signal’s earned/max as a 0–100 style percent for charts.',
		'Radar charts and “what to fix” lists.'
	),
	weightedContribution: L(
		'Raw points per signal',
		'Earned points (not yet divided by max) for star rating, reviews, photos, etc.',
		'Stacked bar charts and weighted scoring views.'
	),
	lookupTable: L(
		'Lookup table we copied into the response',
		'Static tiers (PSI retention, tenure, economic) so you can see the full ladder without opening code.',
		'Education and debugging — compare your score to the row that applied.'
	),
	formula: L(
		'One-line formula string',
		'The route prints the math with numbers inserted so you can audit.',
		'Copy into docs or show “show your work” in the UI.'
	),
	interpretation: L(
		'Plain-language sentence',
		'Human sentence summarizing CTR gap or similar.',
		'Tooltips for non-technical readers.'
	),
	source: L(
		'Where live data came from',
		'Usually `dataforseo` for Google Ads volumes or similar.',
		'Audits and support — know which vendor to blame if numbers look wrong.'
	),
	liveVolume: L(
		'Scaled search volume helper object',
		'From `fetchSearchVolume` — structure depends on helper (may include per-keyword breakdown).',
		'Used to sanity-check demand before running full Layer 1.'
	),
	address: L(
		'Street address from Google',
		'From Places `formatted_address` when the route returns a business block.',
		'Shown in report headers and “where we analyzed” copy; not a direct input to dollar math.'
	),
	name: L(
		'Business or entity name',
		'From your request, Google Places, or the engine’s business object.',
		'Labels charts, PDFs, and `reportText` so every export matches the right company.'
	),
	city: L(
		'City / market name',
		'From the intake form or resolved through `getCityHouseholds` / location lookups.',
		'Drives household scaling, economic tier, and which DataForSEO `location_code` we use.'
	),
	years: L(
		'Years in business (shortcut)',
		'Often mirrors `yearsInBusiness` from the client for display.',
		'Shown in business cards; same number feeds tenure modifiers in Layer 1 when applicable.'
	),
	url: L(
		'Page URL',
		'From your body or resolved website field.',
		'PageSpeed and canonical checks use this URL; Layer 2 ties site speed to retention.'
	),
	id: L(
		'Identifier string',
		'API-specific id (task id, place id fragment, etc.) when present.',
		'Support/debug correlation — usually not shown to end users.'
	),
	keyword: L(
		'Search keyword label',
		'Built from trade + city or a locked-keyword row.',
		'Labels volume rows and ties DataForSEO tasks back to what the user asked for.'
	),
	mobile: L(
		'Mobile PSI score',
		'From your JSON when averaging with desktop for retention.',
		'Feeds `getSiteRetentionRate` when you do not send a single `psiScore`.'
	),
	desktop: L(
		'Desktop PSI score',
		'From your JSON when averaging with mobile for retention.',
		'Feeds `getSiteRetentionRate` when you do not send a single `psiScore`.'
	),
	averageFormula: L(
		'Shown work for PSI average',
		'String built as `(mobile + desktop) / 2` when both scores exist.',
		'Lets auditors verify the score we mapped to retention without opening server logs.'
	),
	abandonment: L(
		'Share of users who leave (inverse of retention)',
		'Computed as `(1 − retentionRate)` and shown as a percent string.',
		'Risk language in UI: pairs with retention for “speed tax” storytelling.'
	),
	baseValue: L(
		'Gap before modifiers',
		'Usually the raw `calcGbpGap` dollar output before tenure/economic/discount.',
		'Starting point for `/api/calc/modifiers` — same role as “base gap” in Layer 1 reports.'
	),
	adjustedValue: L(
		'Gap after tenure + market multipliers',
		'From `applyModifiers(baseValue, years, tier)` in the modifiers route.',
		'Intermediate step before the optional 0.85 “ultra conservative” discount.'
	),
	withUltraConservativeDiscount: L(
		'Gap after optional 15% haircut',
		'`adjustedValue` × 0.85 when discount is on — matches Layer 1 `finalGap` style reporting.',
		'The number leadership sees when we deliberately under-promise recovery.'
	),
	breakdown: L(
		'Modifier components',
		'Tenure rate/label, economic rate/label, market tier, discount label.',
		'Explains *why* `adjustedValue` and `withUltraConservativeDiscount` changed from `baseValue`.'
	),
	tenureRate: L(
		'Brand tenure multiplier component',
		'From `brandTenureTiers` by years in business.',
		'Applied inside `applyModifiers` and echoed in Layer 1 report PART E–style traces.'
	),
	tenureLabel: L(
		'Human label for tenure tier',
		'String from the same tier row as `tenureRate`.',
		'Copy for PDFs and tooltips next to the numeric tenure effect.'
	),
	economicRate: L(
		'Local market multiplier component',
		'From `marketDemandTiers` using city → tier lookup.',
		'Applied inside `applyModifiers` next to tenure.'
	),
	economicLabel: L(
		'Human label for economic tier',
		'Describes active/slow/neutral demand for that city.',
		'Sales narrative: why two identical businesses in different towns get different uplift.'
	),
	marketTier: L(
		'Demand tier key',
		'Resolved city name → `marketDemandLookup` bucket.',
		'Selects which `economicRate` row runs in the modifier chain.'
	),
	discountApplied: L(
		'Whether 15% discount was applied',
		'`15%` or `none` depending on `applyDiscount` flag.',
		'Compliance / transparency when comparing “raw” vs “conservative” numbers.'
	),
	rawPenalty: L(
		'GBP penalty before cap',
		'`(100 − compositeScore) / 100` from composite-score route.',
		'Compared to `maxPenaltyCap` to produce `cappedPenalty`.'
	),
	cappedPenalty: L(
		'GBP penalty after cap',
		'`min(rawPenalty, gbpMaxPenaltyCap)`.',
		'Feeds `throughput = 1 − cappedPenalty` in gap and composite-score explanations.'
	),
	throughput: L(
		'Share of demand that “gets through” a weak GBP',
		'`1 − cappedPenalty` after penalty cap.',
		'Multiplied in `calcGbpGap` revenue line — higher throughput, smaller dollar gap from listing quality.'
	),
	maxPenaltyCap: L(
		'Engine ceiling on GBP penalty',
		'Constant from `BENCHMARKS.gbpMaxPenaltyCap` echoed for transparency.',
		'Explains why very bad listings still cap how much the formula can punish.'
	),
	maxScore: L(
		'Maximum composite points',
		'Always 100 for the nine-signal model.',
		'Denominator for percent bars in the composite-score UI.'
	),
	penaltyFormula: L(
		'Printed penalty math',
		'String with substituted numbers for audit.',
		'Support and power users: verify penalty matches engine without reading code.'
	),
	throughputFormula: L(
		'Printed throughput math',
		'Shows `1 − cappedPenalty`.',
		'Pairs with penalty line on the composite-score response.'
	),
	position: L(
		'Map pack slot (or organic stand-in)',
		'String `1`–`3` or `none` from rank/SERP layers.',
		'Selects `mapPackCTR` in rank and CTR-gap math — drives Layer 2 dollar gaps.'
	),
	positionOneCTR: L(
		'CTR benchmark for position #1',
		'Constant `BENCHMARKS.positionOneCTR` (0.44).',
		'Top of the funnel in CTR-gap: “what #1 gets” vs your slot.'
	),
	currentCTR: L(
		'CTR for your slot',
		'From `mapPackCTR[position]` or `none`.',
		'Subtracted from `positionOneCTR` to get gap (with floor).'
	),
	rawCtrGap: L(
		'CTR gap before floor',
		'`positionOneCTR − currentCTR`.',
		'Compared to `minGapFloor` to see if floor applies.'
	),
	minGapFloor: L(
		'Minimum CTR gap (floor)',
		'Session-locked constant (0.1) so rank math never assumes zero opportunity.',
		'Applied in `ranking-ctr` and `calcRankGap` so “being #1” still leaves modeled headroom.'
	),
	appliedCtrGap: L(
		'CTR gap after floor',
		'`max(rawCtrGap, minGapFloor)`.',
		'This is what downstream revenue formulas multiply by volume.'
	),
	floorApplied: L(
		'Whether the floor bumped the gap',
		'True when raw gap was below the floor.',
		'Debugging: explains why #1 still shows opportunity in the model.'
	),
	indexCity: L(
		'Name of the index market',
		'Always “Sudbury” for Google Ads volume benchmarks in this codebase.',
		'Documentation: volumes are not the prospect city unless scaled.'
	),
	indexHouseholds: L(
		'Households in the index market',
		'Constant 73,000 used as the Sudbury divisor.',
		'Denominator in `cityHouseholds / 73,000` scaling everywhere.'
	),
	indexLocationCode: L(
		'Google Ads location code for Sudbury',
		'From DataForSEO location resolution for the index market.',
		'Must match the `search_volume` tasks in saved reports.'
	),
	volumeSource: L(
		'Vendor tag for volumes',
		'Usually `dataforseo`.',
		'Support: proves numbers are live Google Ads via DataForSEO, not scraped SERP volume.'
	),
	resolvedTradeKey: L(
		'Normalised trade slug',
		'From `getTradeKey(trade)` so “plumbing” and “plumber” map the same.',
		'Selects locked keywords and seasonal divisor in the engine.'
	),
	totalSudburyVolume: L(
		'Sum of five locked-keyword volumes',
		'Adds Sudbury Google Ads volumes for that trade.',
		'Benchmark demand before multiplying by city/household scaling.'
	),
	scalingFactor: L(
		'City / Sudbury household ratio',
		'`households ÷ sudburyHouseholds`.',
		'Core multiplier when turning index volumes into local estimates.'
	),
	captiveMarketUplift: L(
		'Fixed uplift multiplier (1.2)',
		'From `BENCHMARKS.captiveMarketUplift`.',
		'Applied after scaling to reflect captive local demand in the product’s model.'
	),
	scalingFactorWithUplift: L(
		'Combined scale × uplift',
		'`scalingFactor × captiveMarketUplift`.',
		'Single factor some routes print for “effective” local multiplier.'
	),
	tier: L(
		'Market activity tier',
		'From `MARKET_CLUSTERS` — active / slow / unknown.',
		'Product storytelling and sometimes economic modifiers — not the same as `marketTier` string in modifiers.'
	),
	locationCode: L(
		'Geo code for the prospect city',
		'From `MARKET_CLUSTERS` when known.',
		'Feeds DataForSEO location-aware calls (Q&A, SERP) for that city.'
	),
	effect: L(
		'One-line human effect string',
		'Built from tenure or economic rate for display.',
		'Copy block in tooltips (“+X% uplift” vs reduction).'
	),
	cityLookup: L(
		'City → tier reference table',
		'From `marketDemandLookup` in the engine.',
		'Explains which tier a city maps to without opening source.'
	),
	performance: L(
		'Lighthouse performance score',
		'From PageSpeed API (0–100).',
		'Primary input to `getSiteRetentionRate` in Layer 2 and `/api/calc/pagespeed`.'
	),
	siteRetentionRatePct: L(
		'Retention as a percent string',
		'`Math.round(siteRetentionRate * 100) + "%"`.',
		'UI labels where a percent string reads better than 0.85.'
	),
	place_id: L(
		'Google Places id',
		'Stable id for the listing from Places API.',
		'Required for Details requests; ties Q&A and business_info tasks to the right entity.'
	),
	cid: L(
		'Google CID (customer id)',
		'Parsed from `url` or Places — used as `cid:…` in DataForSEO.',
		'Primary key for many DataForSEO business endpoints in our orchestrator.'
	),
	rating: L(
		'Star rating',
		'From Places or your diagnostic payload.',
		'Feeds GBP rating signal and trust displays.'
	),
	reviewCount: L(
		'Total reviews',
		'From Places `user_ratings_total` or diagnostic.',
		'GBP review signal and response-rate denominator.'
	),
	photos: L(
		'Photo list or count proxy',
		'Array of photo refs or length used for photo score.',
		'GBP photos signal in composite and Layer 1.'
	),
	opening_hours: L(
		'Hours present flag / object',
		'From Places; truthy means hours complete signal.',
		'Hours portion of the nine-signal GBP model.'
	),
	editorialSummary: L(
		'Google editorial / description presence',
		'Truthy counts toward description signal.',
		'Composite score and repair list “add description”.'
	),
	services: L(
		'Listed services',
		'Array from Places or business_info — length feeds services signal.',
		'Layer 2 compares to selected services in UI.'
	),
	ownerResponseCount: L(
		'Owner replies to reviews',
		'Numerator for owner-response-rate signal vs `reviewCount`.',
		'GBP engagement signal in composite.'
	),
	qa: L(
		'Q&A counts',
		'`count` / `answeredCount` from DataForSEO or Places.',
		'Q&A signal in GBP scoring and Layer 2 narrative.'
	),
	reviews: L(
		'Review objects or count from Places',
		'Full mode Places returns review text for display.',
		'Not always used in math — mostly UX and social proof.'
	),
	formatted_address: L(
		'Full formatted address',
		'Standard Places line.',
		'Reports and verification of market.'
	),
	html_attributions: L(
		'Google attribution HTML',
		'Required when showing certain Maps data.',
		'Compliance display — keep if you render Google-sourced snippets.'
	),
	types: L(
		'Google place types array',
		'Categories returned by Places.',
		'Debugging / classification — rarely in revenue formulas.'
	),
	geometry: L(
		'Lat/lng geometry',
		'From Places when fields request it.',
		'Maps widgets — not used in current dollar math.'
	),
};

/**
 * Project-specific "used for" when no PATH_DOCS / BY_KEY entry exists.
 * @param {string} routeId
 * @param {string} normPath
 * @param {string} key
 */
function inferUsedForProject(routeId, normPath, key) {
	const p = `${normPath}.`.toLowerCase();
	const k = key.toLowerCase();

	// Path-shaped hints (diagnostic & engine)
	if (p.includes('rawgaps.')) {
		return 'Exposes the underlying `clearsky-engine` numbers for each revenue layer so the diagnostic UI, exports, and `/api/calc/diagnostic` clients can show “show your work” and debug without re-running pipelines.';
	}
	if (p.includes('healthscores.')) {
		return 'Drives the traffic-light health tiles in the diagnostic experience and tells sales which layer (GBP, rank, site, etc.) to talk about first.';
	}
	if (p.includes('gaps.') && routeId === 'diagnostic') {
		return 'Human-readable dollar strings for each gap category in customer-facing diagnostic summaries and printable views.';
	}
	if (p.includes('scenarios.')) {
		return 'Feeds the recovery scenario picker (optimistic / realistic / conservative) after `calcScenarioRecovery` — used in pitch decks and the product’s “what if we fix X?” flows.';
	}
	if (p.includes('meta.')) {
		return 'Populates the diagnostic meta strip (multipliers, confidence, demand labels) so the UI can explain *why* totals moved beyond the raw gaps.';
	}
	if (p.includes('business.')) {
		return 'Binds the whole report to one company in the ClearSky UI, PDFs, and `reportText` headers so exports never mix clients.';
	}
	if (p.includes('capacityinsight') || p.includes('growthstatement')) {
		return 'Narrative paragraphs in the full diagnostic output — used in executive summaries and proposal copy, not in core gap arithmetic.';
	}
	if (p.includes('keywordbreakdown') || p.includes('keywords')) {
		return 'Powers drill-down tables (per-keyword demand and rank) and validates the same rows we print in `layer1-report.txt` / `layer2-report.txt`.';
	}
	if (p.includes('inputs.')) {
		return 'Echoes or resolves inputs the engine actually used (households, retention) so API clients can audit frozen bodies against live `/api/calc` helpers.';
	}
	if (p.includes('gapderivation')) {
		return 'Step-by-step audit trail for GBP gap math — used in support tickets and when legal/compliance asks how a dollar figure was derived.';
	}
	if (p.includes('repairlist')) {
		return 'Ordered “fix this signal first” list in Layer 1 outputs — ties dollar impact to specific GBP actions in the product.';
	}
	if (p.includes('tradebreakdown')) {
		return 'Splits Layer 2 dollars by trade for stacked charts and revenue-split storytelling in Layer 2 reports.';
	}

	// Route defaults
	/** @type {Record<string, string>} */
	const routeBlurbs = {
		diagnostic:
			'Part of the full digital health diagnostic payload consumed by internal tools and any integration calling `POST /api/calc/diagnostic` to mirror production scoring.',
		'gbp-gap':
			'Returned by `POST /api/calc/gbp-gap` for calculator QA and the same `calcGbpGap` logic that Layer 1 uses after volumes and GBP are known.',
		'weighted-rank-gap':
			'Returned by `POST /api/calc/weighted-rank-gap` to validate Layer 2 rank math and to power tooling that replays frozen rank rows.',
		'revenue-layer1':
			'Shipped to the Layer 1 revenue UI and bundled into `buildLayer1ReportTxt` for the downloadable audit customers save from the app.',
		'revenue-layer2':
			'Shipped to the Layer 2 revenue UI and `buildLayer2ReportTxt` so rank-gap + metrics match what sales presents in live meetings.',
		'google-identity':
			'Feeds every downstream step that needs a resolved listing (cid, place_id, website) before DataForSEO or gap math runs.',
		'dataforseo-layer':
			'Matches the Q&A + business_info + index volume bundle our orchestrator uses in real Layer 1/2 runs — for replaying or debugging API shapes.',
		'rank-lookup':
			'Same rank object shape the Layer 2 pipeline passes into `calcWeightedRankGap` — use it to verify SERP positions against a live run.',
		pagespeed:
			'Aligns with `fetchPageSpeedLayer` + retention mapping used in Layer 2 when we tie site speed to dollars.',
		'search-volume':
			'Quick demand probe used by admins and the `search-volume` helper path before committing to a full Layer 1 pull.',
		'benchmark-volumes':
			'Documents the five Sudbury Google Ads volumes per trade — the same index pack Layer 1 scaling starts from.',
		'city-households':
			'Documents household scaling inputs used everywhere we convert Sudbury index demand into a local city.',
		'composite-score':
			'Standalone nine-signal GBP score used by QA and by `/api/calc/gbp-gap` internally for throughput.',
		'modifiers':
			'Isolates tenure + economic + discount chain for Layer 1 style reporting and what-if sliders.',
		'site-retention':
			'Documents PSI → retention bands used in every revenue formula that multiplies by `siteRetentionRate`.',
		'ranking-ctr':
			'Documents map-pack CTR and gap floor used inside `calcRankGap` / `calcGbpGap`.',
		'tenure-rate':
			'Documents tenure tiers used in `applyModifiers` and printed in Layer 1 traces.',
		'economic-rate':
			'Documents city → market tier rates used in `applyModifiers` and economic storytelling.'
	};
	const rb = routeBlurbs[routeId];
	if (rb) {
		return rb;
	}

	// Key-shaped hints
	if (/^id$/i.test(k) || k.endsWith('id') || k.endsWith('_id')) {
		return 'Correlates this row with upstream APIs (Google, DataForSEO, internal logs) when support replays a case — usually not shown to the business owner.';
	}
	if (k.includes('url') || k === 'website') {
		return 'Grounds PageSpeed, link checks, and “visit site” actions in the app; Layer 2 retention depends on loading this URL in PSI.';
	}
	if (k.includes('count') || k.endsWith('count')) {
		return 'Usually feeds a score component (reviews, photos, Q&A) or a list length in the UI — bigger counts often mean stronger trust signals in our GBP model.';
	}
	if (k.includes('rate') || k.includes('ctr') || k.includes('penalty') || k.includes('throughput')) {
		return 'Enters multiplication steps in `clearsky-engine` revenue formulas — changing it directly changes headline dollar gaps in Layer 1 or Layer 2.';
	}
	if (k.includes('score') || k.includes('rating')) {
		return 'Feeds composite health, traffic-light status, or PSI→retention mapping in the product’s scoring and copy.';
	}
	if (k.includes('volume') || k.includes('search')) {
		return 'Feeds demand-side inputs (scaled monthly searches, keyword rows) that drive opportunity sizing before CTR and conversion.';
	}
	if (k.includes('gap') || k.includes('value') || k.includes('revenue')) {
		return 'Surfaces dollar outcomes for cards, PDFs, and “total recoverable” storylines in ClearSky revenue reporting.';
	}
	if (k.includes('time') || k.includes('date') || k.includes('at')) {
		return 'Timestamps and audit fields for reports (`reportText`, API logs) — helps prove when a number was generated.';
	}

	return `Consumed wherever this endpoint’s response is wired in ClearSky (revenue pages, \`reportText\` builders, Postman collections, and partner API clients) — this field is part of that contract at "${normPath}".`;
}

/**
 * @param {string} routeId
 * @param {string} normPath path without leading root.
 * @param {string} key
 */
function lookupDoc(routeId, normPath, key) {
	const tryKeys = [`${routeId}::${normPath}`, `${routeId}::${key}`, `*::${normPath}`, `*::${key}`];
	for (const k of tryKeys) {
		const fromPath = PATH_DOCS[k];
		if (fromPath) return fromPath;
	}
	const fromKey = BY_KEY[key];
	if (fromKey) return fromKey;
	return L(
		prettyTitle(key),
		`Field at "${normPath}" on route "${routeId}" — produced by this handler and/or ` + '`clearsky-engine.js`' + ` / live helpers (Google, DataForSEO) as wired in that route’s +server.`,
		inferUsedForProject(routeId, normPath, key)
	);
}

/** @param {string} key */
function prettyTitle(key) {
	const spaced = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
	return spaced.charAt(0).toUpperCase() + spaced.slice(1).trim();
}

/** Keys: "routeId::path" — path has no `root.` prefix
 * @type {Record<string, ExplainerLeaf>}
 */
const PATH_DOCS = {
	'*::success': BY_KEY.success,
	'*::error': BY_KEY.error,
	'*::code': BY_KEY.code,

	'weighted-rank-gap::data.inputs.households': L(
		'Households used in the math',
		'Either from your JSON body or from `getCityHouseholds(city)` when you omitted households.',
		'Scales Sudbury keyword volumes to local market size.'
	),
	'weighted-rank-gap::data.inputs.siteRetentionRate': L(
		'Site retention used in the formula',
		'From your body `siteRetentionRate`, else from `getSiteRetentionRate(psiScore)`.',
		'Multiplied in every keyword’s monthly revenue — models people who leave a slow site.'
	),
	'weighted-rank-gap::data.inputs.tradeCount': L(
		'How many trades were in the request',
		'Simply `trades.length` from your JSON.',
		'Confirms the engine expected one or two trades.'
	),
	'weighted-rank-gap::data.detail.avgPosition': L(
		'Average “position number” across trades',
		'For each keyword, `parseInt(position)` or 99 if missing/`none`; average per trade, then average trades (weights are 1 in code today).',
		'Rough summary of “how bad is rank overall” — not a dollar amount.'
	),
	'weighted-rank-gap::data.detail.tradeBreakdown': L(
		'Per-trade gap totals',
		'Each trade: `value` is rank-gap dollars; `weight` is the revenue % label (informational; sum is not multiplied by weight in current engine).',
		'See how much plumber vs HVAC contributes to the total.'
	),
	'weighted-rank-gap::data.detail.keywordBreakdown': L(
		'Per keyword annual gap',
		'Each row: keyword, position, `annualGap`, and `trade`.',
		'Identify which keyword moves the needle when you improve rank.'
	),

	'gbp-gap::data.gapDerivation': L(
		'Step-by-step math (when present)',
		'Shows CTR branch, penalties, throughput, and revenue line items for the no-listing or full listing path.',
		'Audit trail for “show your work” in support.'
	),
	'gbp-gap::data.signals': L(
		'Nine GBP signals before modifiers',
		'Same structure as composite-score — earned vs max points.',
		'Explains `compositeScore` and penalty inside `calcGbpGap`.'
	),

	'revenue-layer1::layer1': L(
		'Full Layer 1 object for the frontend',
		'Merges `calcGbpGap` with modifiers (tenure, economic tier, 0.85 conservative discount), `keywordBreakdown`, `scores`, and `metrics`.',
		'Everything the revenue Layer 1 page needs to render cards and charts.'
	),
	'revenue-layer1::layer1.value': L(
		'Final gap after discounts',
		'`finalGap` — base gap after `applyModifiers` and `× ultraConservativeDiscount` (15% haircut).',
		'This is the headline dollar number shown to the customer.'
	),
	'revenue-layer1::layer1.appliedDiscount': L(
		'Label for the conservative discount',
		'Human-readable string like “15% (Conservative)”.',
		'Transparency in reports.'
	),
	'revenue-layer1::business': L(
		'Business snapshot from Google',
		'Name, formatted address, website from Places after we resolved the listing.',
		'Header block in the UI and PDF.'
	),

	'revenue-layer2::layer2': L(
		'Weighted rank gap result (Layer 2)',
		'Spread of `calcWeightedRankGap` plus `displayValue` — same engine as `/api/calc/weighted-rank-gap` but ranks come from live SERP.',
		'Headline “local rank” opportunity for the business.'
	),
	'revenue-layer2::layer1': L(
		'Small GBP slice inside Layer 2 response',
		'`rawGaps.gbp` from `calculateDiagnostic` — lightweight GBP gap reference.',
		'Cross-check Layer 1 style number without running the full Layer 1 pipeline.'
	),

	'diagnostic::data.business': L(
		'Business snapshot in the diagnostic',
		'Echoes and enriches name, city, trade, website, stars, review count, map pack position.',
		'Summary band at top of diagnostic UI.'
	),
	'diagnostic::data.healthScores': L(
		'Scores for each layer (traffic lights)',
		'Computed from gaps, thresholds, and errors — see engine `healthScores` build.',
		'Dashboard tiles and “what’s on fire” list.'
	),
	'diagnostic::data.gaps': L(
		'Formatted gap strings per category',
		'Human-readable dollar strings for GBP, rank, performance, etc.',
		'Print-friendly summary.'
	),
	'diagnostic::data.rawGaps': L(
		'Raw engine objects for every layer',
		'Includes `gbp`, `rank`, `performance`, `core`, `brandTenure`, `marketOpportunity`, etc.',
		'Developers and power users — full numbers and statuses.'
	),
	'diagnostic::data.scenarios': L(
		'Recovery scenarios',
		'From `calcScenarioRecovery` — optimistic / realistic / conservative paths.',
		'Planning and sales conversations.'
	),
	'diagnostic::data.meta': L(
		'Multipliers and benchmark labels',
		'Seasonal, AI risk, engagement, citation, canonical multipliers, confidence, etc.',
		'Explains how baseline gaps were adjusted for context.'
	),
	'diagnostic::data.capacityInsight': L(
		'Paragraph about admin time and capacity',
		'String built from capacity math — hours saved, idle capacity dollars.',
		'Narrative upsell in the report.'
	),
	'diagnostic::data.growthStatement': L(
		'Growth narrative string',
		'From `calcGrowthScore` pipeline.',
		'Marketing copy block.'
	),

	'google-identity::data': L(
		'Raw Google Places object',
		'Everything the helper returned: `place_id`, `cid`, `rating`, `reviews`, `website`, photos, hours, etc.',
		'Pass to composite-score, GBP gap, or DataForSEO (cid / place_id).'
	),

	'dataforseo-layer::data': L(
		'Q&A + business info + index volume',
		'Object with `qa`, `services`, `searchVolume` (sum of Sudbury index keywords for that trade).',
		'Layer 2 intake: fills diagnostic and rank context.'
	),

	'rank-lookup::data': L(
		'Rank object for SERP layer',
		'Shape from `fetchDataForSEORankLayer`: `keywords` with positions and volumes.',
		'Feeds `calcWeightedRankGap` when you run the full pipeline.'
	),

	'pagespeed::data': L(
		'Lighthouse + retention',
		'Spread of `fetchPageSpeedLayer` performance/SEO/etc. plus `siteRetentionRate` from PSI.',
		'Shows exactly which Core Web Vitals scores fed retention.'
	),

	'search-volume::data': L(
		'Live volume helper',
		'`liveVolume` from `fetchSearchVolume` — structure depends on helper (may include breakdown).',
		'Quick demand check for a trade + city.'
	),

	'benchmark-volumes::data.keywords': L(
		'Per-keyword Sudbury volumes',
		'Each item: keyword text and volume from DataForSEO Google Ads at the index market.',
		'These are the building blocks before city scaling.'
	),
	'benchmark-volumes::data.totalSudburyVolume': L(
		'Sum of the five locked keywords',
		'Adds all `volume` fields from the Sudbury index pack.',
		'Compare cities by comparing scaled totals, not raw Sudbury.'
	),

	'city-households::data.knownClusters': L(
		'All cities in the lookup table',
		'Each row: name, households, tier — from `MARKET_CLUSTERS` in the engine.',
		'Pick a city you support and see its reference household count.'
	),

	'composite-score::data.signals': L(
		'Nine GBP signals with loss',
		'Each signal’s earned, max, points lost, and percentage.',
		'Prioritise fixes: biggest `pointsLost` first.'
	),

	'ranking-ctr::data.lookupTable': L(
		'Every map-pack slot CTR',
		'Shows position, CTR, raw gap vs #1, applied gap after floor.',
		'Education: why “none” still has a gap floor.'
	),

	'site-retention::data.lookupTable': L(
		'PSI band → retention',
		'Green / amber / red bands with retention and abandonment %.',
		'Explain why a score of 62 maps to 0.85 retention.'
	),

	'modifiers::data.breakdown': L(
		'Tenure + economic + discount',
		'Rates and labels applied after `baseValue`.',
		'Matches the Layer 1 modifier chain in the report.'
	)
};

/**
 * @param {string} routeId
 * @param {unknown} value
 * @param {string[]} path
 * @returns {unknown}
 */
function buildMirror(routeId, value, path) {
	const norm = pathKey(path);
	const key = path[path.length - 1] || 'root';

	if (value === null) {
		return { ...lookupDoc(routeId, norm, key), valueInThisResponse: 'null' };
	}
	if (value === undefined) {
		return { ...lookupDoc(routeId, norm, key), valueInThisResponse: 'undefined' };
	}

	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
		const d = lookupDoc(routeId, norm, key);
		const v =
			typeof value === 'string' && value.length > 200
				? value.slice(0, 200) + '…'
				: String(value);
		return { ...d, valueInThisResponse: v };
	}

	if (Array.isArray(value)) {
		const max = Math.min(value.length, 10);
		/** @type {unknown[]} */
		const items = [];
		for (let i = 0; i < max; i++) {
			items.push(buildMirror(routeId, value[i], [...path, String(i)]));
		}
		if (value.length > 10) {
			items.push(
				L(
					'More array items not expanded',
					`This array has ${value.length} entries; only the first 10 are explained in full.`,
					'Each extra row follows the same shape as index 0.'
				)
			);
		}
		return items;
	}

	if (typeof value === 'object') {
		/** @type {Record<string, unknown>} */
		const o = /** @type {Record<string, unknown>} */ (value);
		/** @type {Record<string, unknown>} */
		const out = {};
		for (const k of Object.keys(o)) {
			out[k] = buildMirror(routeId, o[k], [...path, k]);
		}
		return out;
	}

	return { ...lookupDoc(routeId, norm, key), valueInThisResponse: String(value) };
}

/**
 * Attach a parallel `explainer` tree to any JSON response.
 * @param {string} routeId e.g. `weighted-rank-gap`, `revenue-layer1`, `diagnostic`
 * @param {Record<string, unknown>} responseBody
 * @param {Record<string, unknown> | null | undefined} [requestBody] When set, `/api/calc` routes use formula-based explainers.
 */
export function attachExplainer(routeId, responseBody, requestBody) {
	if (!responseBody || typeof responseBody !== 'object') {
		return responseBody;
	}
	const calcExpl = explainCalcRoute(routeId, responseBody, requestBody ?? {});
	if (calcExpl != null) {
		return {
			...responseBody,
			explainer: calcExpl
		};
	}
	const mirror = /** @type {Record<string, unknown>} */ (
		buildMirror(routeId, responseBody, ['root'])
	);
	return {
		...responseBody,
		explainer: mirror
	};
}
