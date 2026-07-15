/**
 * Locked per-trade keyword lists (same strings used for SERP rank checks and Google Ads volume).
 */

export const LOCKED_KEYWORD_SETS = {
	plumbing: [
		'plumber',
		'emergency plumber',
		'plumbing repair',
		'drain cleaning',
		'water heater repair'
	],
	hvac: [
		'hvac',
		'furnace repair',
		'air conditioning',
		'heating and cooling',
		'ac repair'
	],
	electrician: [
		'electrician',
		'electrical panel upgrade',
		'ev charger installation',
		'generator installation',
		'electrical troubleshooting'
	],
	roofer: [
		'roofer',
		'roof replacement',
		'roof repair',
		'flat roof repair',
		'shingle installation'
	]
};

export function normalizeTradeKey(trade = '') {
	const t = trade.toLowerCase();
	if (t.includes('hvac') || t.includes('heating') || t.includes('cooling')) return 'hvac';
	if (t.includes('electric')) return 'electrician';
	if (t.includes('roof')) return 'roofer';
	if (t && !t.includes('plumb')) {
		console.warn(
			`[TradeNormalization] Unknown trade "${trade}" - falling back to plumbing keyword set.`
		);
	}
	return 'plumbing';
}

export function getLockedKeywords(trade) {
	const tradeKey = normalizeTradeKey(trade);
	return LOCKED_KEYWORD_SETS[tradeKey] || LOCKED_KEYWORD_SETS.plumbing;
}
