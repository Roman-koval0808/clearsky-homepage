/**
 * Per-request capture for downloadable diagnostic reports (Layer 1 / Layer 2).
 * Uses AsyncLocalStorage so concurrent POSTs do not mix.
 */
import { AsyncLocalStorage } from 'node:async_hooks';

const revenueReportAls = new AsyncLocalStorage();

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 */
export function runWithRevenueReport(fn) {
	const store = {
		calls: []
	};
	return revenueReportAls.run(store, fn);
}

/**
 * @returns {{ calls: Array<{ at: string, source: string, label: string, request?: unknown, response?: unknown, note?: string }> } | undefined}
 */
export function getRevenueReportStore() {
	return revenueReportAls.getStore();
}

/**
 * @param {{ source: string, label: string, request?: unknown, response?: unknown, note?: string }} entry
 */
export function recordRevenueReportCall(entry) {
	const s = getRevenueReportStore();
	if (!s) return;
	s.calls.push({
		at: new Date().toISOString(),
		...entry
	});
}
