/**
 * DataForSEO Keywords Data API — Google Ads locations + live search volume.
 * No benchmark or static fallbacks: failures throw DataForSEOError.
 */

import { getLockedKeywords } from './trade-keywords.js';
import { logDataForSEORequest, logDataForSEONote, logDataForSEOResponse } from './dataforseo-logger.js';

const GOOGLE_ADS_LOCATIONS_URL = 'https://api.dataforseo.com/v3/keywords_data/google_ads/locations';
const SEARCH_VOLUME_LIVE_URL = 'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live';

/** Index market for D.6 scaling (households benchmark lives in BENCHMARKS). */
export const INDEX_MARKET_DISPLAY = 'Sudbury,Ontario,Canada';

export class DataForSEOError extends Error {
	/**
	 * @param {string} message
	 * @param {string} [code]
	 */
	constructor(message, code) {
		super(message);
		this.name = 'DataForSEOError';
		this.code = code || 'DATAFORSEO_ERROR';
	}
}

let locationsCache = null;
let locationsCacheAt = 0;
const LOCATIONS_TTL_MS = 60 * 60 * 1000;

function authHeader(login, password) {
	return Buffer.from(`${login}:${password}`).toString('base64');
}

function flattenLocationResults(task) {
	if (!task || task.status_code !== 20000 || !task.result) return [];
	const r = task.result;
	const first = r[0];
	if (Array.isArray(first)) {
		return first.flat().filter(Boolean);
	}
	return Array.isArray(r) ? r : [];
}

/**
 * Strip the giant `result` array from locations API JSON before logging / Layer 1 report.
 * The matched row is logged separately in {@link resolveGoogleAdsLocationCode}.
 * @param {unknown} data
 */
function summarizeLocationsResponseForLog(data) {
	if (!data || typeof data !== 'object' || !('tasks' in data)) return data;
	const tasks = /** @type {{ tasks?: unknown[] }} */ (data).tasks;
	if (!Array.isArray(tasks) || !tasks[0] || typeof tasks[0] !== 'object') return data;
	const task = /** @type {Record<string, unknown>} */ (tasks[0]);
	const rows = flattenLocationResults(/** @type {Parameters<typeof flattenLocationResults>[0]} */ (task));
	const { result: _omit, ...taskMeta } = task;
	return {
		...data,
		tasks: [
			{
				...taskMeta,
				result_omitted: true,
				result_row_count: rows.length,
				result_note:
					'Full location list omitted from logs. See the following note for the resolved location_code and name.'
			}
		]
	};
}

/**
 * Fetch and cache the full Google Ads locations list (for location_code resolution).
 */
export async function fetchGoogleAdsLocations(login, password) {
	if (!login || !password) {
		throw new DataForSEOError('Missing DataForSEO credentials', 'MISSING_CREDENTIALS');
	}
	const now = Date.now();
	if (locationsCache && now - locationsCacheAt < LOCATIONS_TTL_MS) {
		logDataForSEONote(
			'keywords_data/google_ads/locations',
			`cache hit (${locationsCache.length} rows, TTL ${LOCATIONS_TTL_MS}ms)`
		);
		return locationsCache;
	}
	const ep = 'keywords_data/google_ads/locations';
	logDataForSEORequest(ep, { method: 'GET', url: GOOGLE_ADS_LOCATIONS_URL, body: null });
	const res = await fetch(GOOGLE_ADS_LOCATIONS_URL, {
		method: 'GET',
		headers: {
			Authorization: `Basic ${authHeader(login, password)}`,
			'Content-Type': 'application/json'
		}
	});
	const data = await res.json();
	logDataForSEOResponse(ep, {
		httpStatus: res.status,
		statusText: res.statusText,
		data: summarizeLocationsResponseForLog(data)
	});
	if (!res.ok) {
		throw new DataForSEOError(`Google Ads locations HTTP ${res.status}`, 'LOCATIONS_HTTP');
	}
	const task = data.tasks?.[0];
	if (!task || task.status_code !== 20000) {
		throw new DataForSEOError(
			`Google Ads locations task failed: ${task ? JSON.stringify(task.status_message || task) : 'no task'}`,
			'LOCATIONS_TASK_FAILED'
		);
	}
	const rows = flattenLocationResults(task);
	if (!rows.length) {
		throw new DataForSEOError('Google Ads locations returned no rows', 'LOCATIONS_EMPTY');
	}
	locationsCache = rows;
	locationsCacheAt = now;
	return rows;
}

/**
 * Pick a location_code whose location_name matches a Canadian city (best-effort).
 */
export function findLocationCodeByName(locations, cityPhrase) {
	if (!locations?.length || !cityPhrase) return null;
	const q = cityPhrase.toLowerCase().trim();
	const tokens = q.split(/[\s,]+/).filter((t) => t.length > 1);
	const scored = locations
		.map((row) => {
			const name = (row.location_name || row.canonical_name || '').toLowerCase();
			if (!name.includes('canada')) return null;
			let score = 0;
			for (const tok of tokens) {
				if (name.includes(tok)) score += 2;
			}
			if (name.includes('ontario')) score += 1;
			return score > 0 ? { code: row.location_code, score, name: row.location_name } : null;
		})
		.filter(Boolean);
	scored.sort((a, b) => b.score - a.score);
	return scored[0]?.code ?? null;
}

/**
 * Google Ads search_volume/live: `tasks[0].result` is an array of keyword rows
 * (`keyword`, `search_volume`, …). Some responses nest rows under `result[0].items`.
 * @param {unknown} result
 * @returns {Array<{ keyword?: string, search_volume?: number | null }>}
 */
function extractGoogleAdsSearchVolumeRows(result) {
	if (!Array.isArray(result) || result.length === 0) return [];
	const first = result[0];
	if (first && typeof first === 'object' && Array.isArray(first.items)) {
		return first.items;
	}
	if (first && typeof first === 'object' && first.keyword != null) {
		return result;
	}
	return [];
}

export async function resolveGoogleAdsLocationCode(login, password, city) {
	if (!login || !password) {
		throw new DataForSEOError('Missing DataForSEO credentials', 'MISSING_CREDENTIALS');
	}
	if (!city?.trim()) {
		throw new DataForSEOError('City is required for location resolution', 'MISSING_CITY');
	}
	const locations = await fetchGoogleAdsLocations(login, password);
	const code = findLocationCodeByName(locations, `${city},Ontario,Canada`);
	if (code == null) {
		throw new DataForSEOError(
			`No Google Ads location match for "${city}" (Ontario, Canada).`,
			'LOCATION_NOT_FOUND'
		);
	}
	const row = locations.find((r) => Number(r.location_code) === Number(code));
	logDataForSEONote(
		'keywords_data/google_ads/locations',
		`Resolved "${city.trim()}" → location_code=${code}${row?.location_name ? ` — ${row.location_name}` : ''}`
	);
	return code;
}

/**
 * Live search volumes for many keywords at one Google Ads geo (monthly search_volume).
 */
export async function fetchSearchVolumesForKeywords(login, password, keywords, locationCode) {
	if (!login || !password) {
		throw new DataForSEOError('Missing DataForSEO credentials', 'MISSING_CREDENTIALS');
	}
	if (!keywords?.length) {
		throw new DataForSEOError('No keywords for search volume request', 'MISSING_KEYWORDS');
	}
	if (locationCode == null) {
		throw new DataForSEOError('location_code is required', 'MISSING_LOCATION_CODE');
	}

	const ep = 'keywords_data/google_ads/search_volume/live';
	const requestBody = [
		{
			keywords,
			location_code: locationCode,
			language_code: 'en'
		}
	];
	logDataForSEORequest(ep, { method: 'POST', url: SEARCH_VOLUME_LIVE_URL, body: requestBody });
	const res = await fetch(SEARCH_VOLUME_LIVE_URL, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${authHeader(login, password)}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(requestBody)
	});
	const data = await res.json();
	logDataForSEOResponse(ep, { httpStatus: res.status, statusText: res.statusText, data });
	if (!res.ok) {
		throw new DataForSEOError(`Search volume HTTP ${res.status}`, 'SEARCH_VOLUME_HTTP');
	}
	const task = data.tasks?.[0];
	if (!task || task.status_code !== 20000) {
		throw new DataForSEOError(
			`Search volume task failed: ${task ? JSON.stringify(task.status_message || task) : 'no task'}`,
			'SEARCH_VOLUME_TASK_FAILED'
		);
	}
	// Live API returns `result` as an array of rows: [{ keyword, search_volume, ... }, ...]
	// (not result[0].items — that was a different shape).
	const items = extractGoogleAdsSearchVolumeRows(task.result);
	if (!items.length) {
		throw new DataForSEOError('Search volume returned no items', 'SEARCH_VOLUME_EMPTY');
	}

	const out = new Map();
	for (const item of items) {
		const kw = item.keyword;
		if (kw != null) {
			const vol = item.search_volume;
			out.set(kw, vol == null ? 0 : Number(vol));
		}
	}
	for (const k of keywords) {
		if (!out.has(k)) {
			throw new DataForSEOError(`Missing search_volume row for keyword "${k}"`, 'KEYWORD_VOLUME_MISSING');
		}
	}
	return out;
}

/**
 * Index-market keyword volumes for a trade: live Google Ads at Sudbury.
 */
export async function fetchIndexMarketKeywordVolumes(login, password, trade) {
	const keywords = getLockedKeywords(trade);
	const indexCode = await resolveGoogleAdsLocationCode(login, password, 'Sudbury');
	const volMap = await fetchSearchVolumesForKeywords(login, password, keywords, indexCode);
	const live = keywords.map((kw) => ({
		keyword: kw,
		volume: volMap.get(kw) ?? 0
	}));
	return {
		keywords: live,
		indexLocationCode: indexCode,
		source: 'dataforseo',
		indexMarketName: INDEX_MARKET_DISPLAY
	};
}

/**
 * Total monthly search volume for a trade at the index market (sum of the locked keywords).
 */
export async function fetchIndexMarketTotalVolume(login, password, trade) {
	const { keywords } = await fetchIndexMarketKeywordVolumes(login, password, trade);
	return keywords.reduce((s, k) => s + (Number(k.volume) || 0), 0);
}
