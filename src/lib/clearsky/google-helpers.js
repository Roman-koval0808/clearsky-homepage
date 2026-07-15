/**
 * Google Places + DataForSEO helper functions.
 * Extracted from layer route handlers so individual calc routes can reuse them.
 */

import {
	DataForSEOError,
	fetchSearchVolumesForKeywords,
	resolveGoogleAdsLocationCode
} from './dataforseo-google-ads.js';
import { logDataForSEORequest, logDataForSEOResponse } from './dataforseo-logger.js';
import { recordRevenueReportCall } from './revenue-report-context.js';

function redactGoogleKey(url) {
	return typeof url === 'string' ? url.replace(/key=[^&]+/g, 'key=REDACTED') : url;
}

function logGooglePlacesFetch(label, url, res, data) {
	recordRevenueReportCall({
		source: 'Google Maps',
		label,
		request: { method: 'GET', url: redactGoogleKey(url) },
		response: { httpStatus: res.status, statusText: res.statusText, data }
	});
}

/**
 * Fetch Live Search Volume from DataForSEO for a trade+city keyword (Google Ads geo).
 * @throws {DataForSEOError}
 */
export async function fetchSearchVolume(trade, city, login, password) {
	if (!login || !password) {
		throw new DataForSEOError('Missing DataForSEO credentials', 'MISSING_CREDENTIALS');
	}
	const locationCode = await resolveGoogleAdsLocationCode(login, password, city);
	const kw = `${trade} ${city}`.trim();
	const map = await fetchSearchVolumesForKeywords(login, password, [kw], locationCode);
	return map.get(kw) ?? 0;
}

export async function fetchGoogleServices(identifier, city, login, password) {
	if (!login || !password) return [];
	try {
		const auth = Buffer.from(`${login}:${password}`).toString('base64');
		const url = 'https://api.dataforseo.com/v3/business_data/google/my_business_info/live';
		const identifierKeyword =
			identifier.startsWith('cid:') || identifier.startsWith('place_id:')
				? identifier
				: `place_id:${identifier}`;

		const body = [
			{
				language_code: 'en',
				keyword: identifierKeyword,
				location_name: `${city},Ontario,Canada`
			}
		];
		logDataForSEORequest('business_data/google/my_business_info/live (helpers)', {
			method: 'POST',
			url,
			body
		});
		const res = await fetch(url, {
			method: 'POST',
			headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		const data = await res.json();
		logDataForSEOResponse('business_data/google/my_business_info/live (helpers)', {
			httpStatus: res.status,
			statusText: res.statusText,
			data
		});
		const result = data.tasks?.[0]?.result?.[0]?.items?.[0];
		return result?.service_categories || [];
	} catch (err) {
		console.error('[DataForSEO] Services Error:', err);
		return [];
	}
}

export async function fetchGoogleQA(identifier, city, login, password, businessName = null) {
	if (!login || !password) {
		return { count: 0, answeredCount: 0 };
	}

	try {
		const auth = Buffer.from(`${login}:${password}`).toString('base64');
		const liveUrl =
			'https://api.dataforseo.com/v3/business_data/google/questions_and_answers/live';

		const identifierKeyword =
			identifier.startsWith('cid:') || identifier.startsWith('place_id:')
				? identifier
				: `place_id:${identifier}`;

		const makePayload = (kw) => [
			{
				language_code: 'en',
				keyword: kw,
				location_name: `${city},Ontario,Canada`,
				depth: 20
			}
		];

		const idPayload = makePayload(identifierKeyword);
		logDataForSEORequest('business_data/google/questions_and_answers/live (helpers, id)', {
			method: 'POST',
			url: liveUrl,
			body: idPayload
		});
		let res = await fetch(liveUrl, {
			method: 'POST',
			headers: {
				Authorization: `Basic ${auth}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(idPayload)
		});

		let data = await res.json();
		logDataForSEOResponse('business_data/google/questions_and_answers/live (helpers, id)', {
			httpStatus: res.status,
			statusText: res.statusText,
			data
		});
		let task = data.tasks?.[0];

		const hasResults = (t) =>
			t &&
			t.status_code === 20000 &&
			t.result?.[0] &&
			((t.result[0].items?.length || 0) > 0 ||
				(t.result[0].items_without_answers?.length || 0) > 0);

		if (!hasResults(task) && businessName && identifierKeyword !== businessName) {
			const namePayload = makePayload(businessName);
			logDataForSEORequest('business_data/google/questions_and_answers/live (helpers, name fallback)', {
				method: 'POST',
				url: liveUrl,
				body: namePayload
			});
			const fbRes = await fetch(liveUrl, {
				method: 'POST',
				headers: {
					Authorization: `Basic ${auth}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(namePayload)
			});
			const fbData = await fbRes.json();
			logDataForSEOResponse('business_data/google/questions_and_answers/live (helpers, name fallback)', {
				httpStatus: fbRes.status,
				statusText: fbRes.statusText,
				data: fbData
			});
			const fbTask = fbData.tasks?.[0];
			if (hasResults(fbTask)) {
				task = fbTask;
			}
		}

		if (task && task.status_code === 20000 && task.result && task.result[0]) {
			const result = task.result[0];
			const answeredItems = result.items || [];
			const unansweredItems = result.items_without_answers || [];
			return { count: answeredItems.length + unansweredItems.length, answeredCount: answeredItems.length };
		}

		return { count: 0, answeredCount: 0 };
	} catch (err) {
		console.error('[DataForSEO] Q&A Error:', err);
		return { count: 0, answeredCount: 0 };
	}
}

function normalizeWebsite(url) {
	if (!url) return null;
	try {
		const parsed = new URL(
			url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
		);
		return parsed.hostname.toLowerCase().replace(/^www\./, '');
	} catch {
		return null;
	}
}

async function findPlaceCandidate(name, city, key, normalizedWebsite) {
	const query = encodeURIComponent(`${name} ${city}`);
	let findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total&key=${key}`;
	let findRes = await fetch(findUrl);
	let findData = await findRes.json();
	logGooglePlacesFetch('Places API — findplacefromtext (business name + city)', findUrl, findRes, findData);

	if ((findData.status !== 'OK' || findData.candidates?.length === 0) && normalizedWebsite) {
		const webQuery = encodeURIComponent(normalizedWebsite);
		findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${webQuery}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total&key=${key}`;
		findRes = await fetch(findUrl);
		findData = await findRes.json();
		logGooglePlacesFetch('Places API — findplacefromtext (website fallback)', findUrl, findRes, findData);
	}

	if (findData.status !== 'OK' || !findData.candidates?.[0]) {
		return null;
	}

	let candidate = findData.candidates[0];

	if (normalizedWebsite && findData.candidates?.length > 1) {
		for (const cand of findData.candidates) {
			const websiteCheckUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${cand.place_id}&fields=website&key=${key}`;
			const websiteCheckRes = await fetch(websiteCheckUrl);
			const websiteCheckData = await websiteCheckRes.json();
			logGooglePlacesFetch(
				`Places API — place/details (website disambiguation, place_id=${cand.place_id})`,
				websiteCheckUrl,
				websiteCheckRes,
				websiteCheckData
			);
			const candidateWebsite = normalizeWebsite(websiteCheckData.result?.website);

			if (
				candidateWebsite &&
				(candidateWebsite.includes(normalizedWebsite) ||
					normalizedWebsite.includes(candidateWebsite))
			) {
				candidate = cand;
				break;
			}
		}
	}

	return candidate;
}

/**
 * Full Google Identity lookup (Layer 1 style).
 * Returns rich GBP data including photos, hours, editorial summary, Q&A, services.
 */
export async function fetchGoogleDetailsFull(
	name,
	city,
	key,
	dataforseoLogin,
	dataforseoPassword,
	websiteUrl = null
) {
	const normalizedWebsite = normalizeWebsite(websiteUrl);
	const candidate = await findPlaceCandidate(name, city, key, normalizedWebsite);

	if (!candidate) {
		throw new Error(`Google Places: No candidate found for "${name}" in "${city}"`);
	}

	const placeId = candidate.place_id;

	const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,website,photos,opening_hours,editorial_summary,reviews,name,formatted_address,url&key=${key}`;
	const detailsRes = await fetch(detailsUrl);
	const detailsData = await detailsRes.json();
	logGooglePlacesFetch('Places API — place/details (full GBP fields)', detailsUrl, detailsRes, detailsData);

	if (detailsData.status !== 'OK' || !detailsData.result) {
		throw new Error(`Google Places: Details failed for place_id ${placeId}`);
	}

	const result = detailsData.result;

	let identifier = `place_id:${placeId}`;
	if (result.url && result.url.includes('cid=')) {
		const cid = result.url.split('cid=')[1]?.split('&')[0];
		if (cid) identifier = `cid:${cid}`;
	}

	const [qaData, services] = await Promise.all([
		fetchGoogleQA(identifier, city, dataforseoLogin, dataforseoPassword, result.name),
		fetchGoogleServices(identifier, city, dataforseoLogin, dataforseoPassword)
	]);

	const now = Date.now() / 1000;
	const sixtyDaysAgo = now - 60 * 24 * 60 * 60;
	const hasRecentReview = (result.reviews || []).some((r) => r.time > sixtyDaysAgo);

	return {
		...result,
		rating: candidate.rating || 0,
		reviewCount: candidate.user_ratings_total || 0,
		hasRecentReview,
		editorialSummary: result.editorial_summary?.overview || '',
		qa: qaData,
		services,
		place_id: result.place_id || placeId
	};
}

/**
 * Light Google Identity lookup (Layer 2 style).
 * Returns only CID, rating, reviewCount, name, website.
 */
export async function fetchGoogleDetailsLight(name, city, key, websiteUrl = null) {
	const normalizedWebsite = normalizeWebsite(websiteUrl);
	const candidate = await findPlaceCandidate(name, city, key, normalizedWebsite);

	if (!candidate) {
		return null;
	}

	const placeId = candidate.place_id;

	const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=website,url,reviews,name,formatted_address&key=${key}`;
	const detailsRes = await fetch(detailsUrl);
	const detailsData = await detailsRes.json();
	logGooglePlacesFetch('Places API — place/details (Layer 2 light)', detailsUrl, detailsRes, detailsData);
	const result = detailsData.result || {};

	let cid = null;
	if (result.url && result.url.includes('cid=')) {
		cid = result.url.split('cid=')[1]?.split('&')[0];
	}

	return {
		cid,
		rating: candidate.rating || 0,
		reviewCount: candidate.user_ratings_total || 0,
		name: result.name || candidate.name,
		website: result.website || websiteUrl
	};
}
