/**
 * Debug logging for DataForSEO API calls (request URL/method/body and full JSON responses).
 * Does not log Authorization headers.
 */

import { recordRevenueReportCall } from './revenue-report-context.js';

const PREFIX = '[DataForSEO]';

/**
 * @param {string} endpoint Short label, e.g. `keywords_data/google_ads/search_volume/live`
 * @param {{ method?: string, url: string, body?: unknown }} detail
 */
export function logDataForSEORequest(endpoint, detail) {
	console.log(PREFIX, 'REQUEST', endpoint, JSON.stringify(detail, null, 2));
	recordRevenueReportCall({
		source: 'DataForSEO',
		label: `${endpoint} (request)`,
		request: detail
	});
}

/**
 * @param {string} endpoint
 * @param {{ httpStatus?: number, statusText?: string, data: unknown }} detail
 */
export function logDataForSEOResponse(endpoint, detail) {
	console.log(PREFIX, 'RESPONSE', endpoint, JSON.stringify(detail, null, 2));
	recordRevenueReportCall({
		source: 'DataForSEO',
		label: `${endpoint} (response)`,
		response: detail
	});
}

/**
 * @param {string} endpoint
 * @param {string} note
 */
export function logDataForSEONote(endpoint, note) {
	console.log(PREFIX, 'NOTE', endpoint, note);
	recordRevenueReportCall({
		source: 'DataForSEO',
		label: `${endpoint} (note)`,
		note
	});
}
