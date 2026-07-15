/**
 * Live API Orchestrator — Session 14 (v2.5)
 */

import {
	DataForSEOError,
	fetchIndexMarketKeywordVolumes,
	resolveGoogleAdsLocationCode
} from './dataforseo-google-ads.js';
import { logDataForSEORequest, logDataForSEOResponse } from './dataforseo-logger.js';
import { recordRevenueReportCall } from './revenue-report-context.js';
import { getLockedKeywords } from './trade-keywords.js';

async function fetchWithTimeout(url, options = {}, timeout = 45000) {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);
	try {
		console.log(`[API] FETCH ${options.method || 'GET'} ${url}`);
		const response = await fetch(url, { ...options, signal: controller.signal });
		clearTimeout(id);
		return response;
	} catch (err) {
		clearTimeout(id);
		throw err;
	}
}

// ─── 1B. DATAFORSEO (Q&A and Search Volume) ──────────────────────────────

export async function fetchDataForSEOLayer(
	identifier,
	city,
	trade,
	login,
	password,
	businessName = null
) {
	if (!login || !password) {
		throw new DataForSEOError('Missing DataForSEO credentials', 'MISSING_CREDENTIALS');
	}

	try {
		const auth = Buffer.from(`${login}:${password}`).toString('base64');

		const locationCode = await resolveGoogleAdsLocationCode(login, password, city);
		const indexPack = await fetchIndexMarketKeywordVolumes(login, password, trade);
		const searchVolume = indexPack.keywords.reduce(
			(s, k) => s + (Number(k.volume) || 0),
			0
		);

		// 1. Q&A Search
		const qaUrl = 'https://api.dataforseo.com/v3/business_data/google/questions_and_answers/live';
		const identifierKeyword =
			identifier.startsWith('cid:') || identifier.startsWith('place_id:')
				? identifier
				: `place_id:${identifier}`;

		const makeQaPayload = (kw) => [
			{
				language_code: 'en',
				keyword: kw,
				location_code: locationCode,
				depth: 20
			}
		];

		// 2. Business Info (Services)
		const infoUrl = 'https://api.dataforseo.com/v3/business_data/google/my_business_info/live';
		const infoPayload = [
			{
				keyword: identifierKeyword,
				language_code: 'en',
				location_code: locationCode
			}
		];

		const qaBodyInitial = makeQaPayload(identifierKeyword);
		logDataForSEORequest('business_data/google/questions_and_answers/live', {
			method: 'POST',
			url: qaUrl,
			body: qaBodyInitial
		});
		logDataForSEORequest('business_data/google/my_business_info/live', {
			method: 'POST',
			url: infoUrl,
			body: infoPayload
		});

		// Parallel calls for Q&A and Business Info
		let [qaRes, infoRes] = await Promise.all([
			fetch(qaUrl, {
				method: 'POST',
				headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
				body: JSON.stringify(qaBodyInitial)
			}),
			fetch(infoUrl, {
				method: 'POST',
				headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
				body: JSON.stringify(infoPayload)
			})
		]);

		let qaData = await qaRes.json();
		let infoData = await infoRes.json();
		logDataForSEOResponse('business_data/google/questions_and_answers/live', {
			httpStatus: qaRes.status,
			statusText: qaRes.statusText,
			data: qaData
		});
		logDataForSEOResponse('business_data/google/my_business_info/live', {
			httpStatus: infoRes.status,
			statusText: infoRes.statusText,
			data: infoData
		});

		let qaTask = qaData.tasks?.[0];
		const infoTask = infoData.tasks?.[0];

		// Q&A FALLBACK to Name if ID lookup returned 0 results or failed, and name is available
		const hasResults = (task) =>
			task &&
			task.status_code === 20000 &&
			task.result?.[0] &&
			((task.result[0].items?.length || 0) > 0 ||
				(task.result[0].items_without_answers?.length || 0) > 0);

		if (!hasResults(qaTask) && businessName && identifierKeyword !== businessName) {
			console.log(`[DataForSEO] Q&A ID lookup empty/failed, falling back to name: ${businessName}`);
			const fbBody = makeQaPayload(businessName);
			logDataForSEORequest('business_data/google/questions_and_answers/live (fallback by name)', {
				method: 'POST',
				url: qaUrl,
				body: fbBody
			});
			const fbRes = await fetch(qaUrl, {
				method: 'POST',
				headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
				body: JSON.stringify(fbBody)
			});
			qaData = await fbRes.json();
			logDataForSEOResponse('business_data/google/questions_and_answers/live (fallback by name)', {
				httpStatus: fbRes.status,
				statusText: fbRes.statusText,
				data: qaData
			});
			qaTask = qaData.tasks?.[0];
		}

		const parseQaResult = (task) => {
			if (task && task.status_code === 20000 && task.result?.[0]) {
				const result = task.result[0];
				const answeredItems = result.items || [];
				const unansweredItems = result.items_without_answers || [];
				const totalCount = answeredItems.length + unansweredItems.length;

				return {
					count: totalCount,
					answeredCount: answeredItems.length
				};
			}
			return { count: 0, answeredCount: 0 };
		};

		const qaResult = parseQaResult(qaTask);

		// Parse Services from Business Info
		const services =
			infoTask && infoTask.status_code === 20000 && infoTask.result?.[0]?.items?.[0]
				? infoTask.result[0].items[0].service_categories || []
				: [];

		return { qa: qaResult, searchVolume, services };
	} catch (err) {
		if (err instanceof DataForSEOError) throw err;
		console.error('[DataForSEO] Layer Error:', err);
		throw new DataForSEOError(String(err?.message || err), 'DATAFORSEO_LAYER_FAILED');
	}
}

// ─── 4. RANKING & LOCAL PACK (DataForSEO) ────────────────────────────────────

export async function fetchDataForSEORankLayer(businessName, trade, city, login, password) {
	if (!login || !password) {
		throw new DataForSEOError('Missing DataForSEO credentials', 'MISSING_CREDENTIALS');
	}

	const keywords = getLockedKeywords(trade);
	const indexPack = await fetchIndexMarketKeywordVolumes(login, password, trade);
	const volumeMap = Object.fromEntries(indexPack.keywords.map((k) => [k.keyword, k.volume]));

	const rankResults = { keywords: [] };
	const businessNameLower = businessName.toLowerCase().trim();

	const getVolume = (kw) => {
		if (!kw) return 0;
		const v = volumeMap[kw];
		return v != null ? Number(v) : 0;
	};

	// Extract the unique brand name by stripping generic trade/corporate/connector words
	const coreBrand = businessNameLower
		.replace(
			/\b(plumbing|heating|electrical|hvac|mechanical|roofing|ventech|drain|sewer|water|air|conditioning|cooling)\b/gi,
			(match) => {
				// Keep "ventech" only if it's the start, but usually we want to strip trade words
				return match.toLowerCase() === 'ventech' ? match : '';
			}
		)
		.replace(
			/\b(the|a|an|and|&|of|in|at|by|for|ltd|limited|inc|incorporated|llc|corp|corporation|co|company|services|solutions|masters|pro|specialists|experts|group|pros|works)\b/gi,
			''
		)
		.replace(
			/\b(plumbing|heating|electrical|hvac|mechanical|roofing|drain|sewer|water|air|conditioning|cooling)\b/gi,
			''
		)
		.replace(/[^a-z0-9\s]/g, '')
		.trim()
		.split(' ')[0];

	console.log(`[DataForSEO-Rank] Profiling "${businessName}" -> Core Brand: "${coreBrand}"`);

	const auth = Buffer.from(`${login}:${password}`).toString('base64');
	const endpoint = 'https://api.dataforseo.com/v3/serp/google/organic/live/advanced';
	const serpLocationCode = await resolveGoogleAdsLocationCode(login, password, city);

	const isMatch = (target) => {
		if (!target) return false;
		const t = target
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '')
			.trim();
		const b = businessNameLower.replace(/[^a-z0-9\s]/g, '').trim();
		const c = coreBrand
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '')
			.trim();

		// Strict Inclusion Match: Target must contain the full business name
		// OR Fuzzy Match: Target must contain the core brand word (if length > 3)
		const match = t.includes(b) || (c.length > 3 && t.includes(c));

		return match;
	};

	try {
		const payload = keywords.map((kw) => ({
			keyword: kw,
			language_code: 'en',
			location_code: serpLocationCode,
			device: 'mobile',
			os: 'android',
			depth: 20
		}));

		logDataForSEORequest('serp/google/organic/live/advanced', {
			method: 'POST',
			url: endpoint,
			body: payload
		});

		const response = await fetchWithTimeout(endpoint, {
			method: 'POST',
			headers: {
				Authorization: `Basic ${auth}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		const data = await response.json();
		logDataForSEOResponse('serp/google/organic/live/advanced', {
			httpStatus: response.status,
			statusText: response.statusText,
			data
		});
		const tasks = data.tasks || [];

		for (const [i, task] of tasks.entries()) {
			const kw = keywords[i];
			const items = task?.result?.[0]?.items || [];
			let position = 'none';
			let source = 'none';

			const localPackItems = [];
			const organicItems = [];

			for (const item of items) {
				const type = item?.type || '';
				if (type.includes('local_pack')) {
					if (Array.isArray(item.items)) {
						for (const nested of item.items) {
							localPackItems.push(nested);
						}
					} else {
						localPackItems.push(item);
					}
				} else if (type === 'organic') {
					organicItems.push(item);
				}
			}

			const matchLocalIndex = localPackItems.findIndex((res) =>
				isMatch(res.title || res.domain || res.url || '')
			);
			if (matchLocalIndex !== -1) {
				position = (matchLocalIndex + 1).toString();
				source = 'pack';
			} else {
				const matchOrganicIndex = organicItems.findIndex((res) =>
					isMatch(res.title || res.domain || res.url || '')
				);
				if (matchOrganicIndex !== -1) {
					position = `organic${matchOrganicIndex + 1}`;
					source = 'organic';
				}
			}

			rankResults.keywords.push({
				keyword: kw,
				position,
				source,
				sudburyVolume: getVolume(kw)
			});
			console.log(
				`[DataForSEO-Rank] Keyword: "${kw}" | Position: ${position} (${source}) | Vol: ${getVolume(kw)}`
			);
		}
	} catch (error) {
		console.error('[DataForSEO-Rank] Fetch failed:', error);
	}

	return {
		data: {
			keywords: rankResults.keywords,
			localPackRank: rankResults.keywords[0].position,
			foundInPackCount: rankResults.keywords.filter((k) => k.source === 'pack').length
		},
		error: rankResults.keywords.length === 0 ? 'NO_RESULTS' : null
	};
}

// ─── 5. SITE SPEED (Google PageSpeed Insights) ──────────────────────────────

export async function fetchPageSpeedLayer(url, key) {
	if (!url) return { data: null, error: 'NO_URL' };
	if (!key) return { data: null, error: 'MISSING_KEY' };
	try {
		const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&strategy=MOBILE&key=${key}`;
		const res = await (await fetchWithTimeout(psiUrl)).json();

		const lighthouseResult = res.lighthouseResult;
		if (!lighthouseResult) return { data: null, error: 'PSI_NO_DATA' };

		const performanceScore = lighthouseResult.categories?.performance?.score * 100 || 0;
		recordRevenueReportCall({
			source: 'Google PageSpeed',
			label: 'PageSpeed Insights v5 (mobile, performance)',
			request: {
				method: 'GET',
				url: psiUrl.replace(/key=[^&]+/g, 'key=REDACTED')
			},
			response: {
				performance: performanceScore,
				note: 'Full Lighthouse payload omitted; score used for PSI → site retention.'
			}
		});
		const audits = lighthouseResult.audits || {};

		return {
			data: {
				performance: performanceScore,
				score: performanceScore,
				lcp: {
					value: audits['largest-contentful-paint']?.displayValue,
					pass: audits['largest-contentful-paint']?.score >= 0.9
				},
				cls: {
					value: audits['cumulative-layout-shift']?.displayValue,
					pass: audits['cumulative-layout-shift']?.score >= 0.9
				},
				cwvPass:
					audits['cumulative-layout-shift']?.score >= 0.9 &&
					audits['largest-contentful-paint']?.score >= 0.9
			},
			error: null
		};
	} catch (err) {
		return { data: null, error: err.message };
	}
}
