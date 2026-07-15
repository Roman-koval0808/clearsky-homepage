/**
 * Vitest: mock DataForSEO Google Ads module so unit tests do not call the live API.
 * Production and dev still use real credentials and real endpoints.
 */
import { vi } from 'vitest';

const plumbingKeywords = [
	{ keyword: 'plumber', volume: 339 },
	{ keyword: 'emergency plumber', volume: 26 },
	{ keyword: 'plumbing repair', volume: 20 },
	{ keyword: 'drain cleaning', volume: 3 },
	{ keyword: 'water heater repair', volume: 3 }
];

const hvacKeywords = [
	{ keyword: 'hvac', volume: 219 },
	{ keyword: 'furnace repair', volume: 52 },
	{ keyword: 'air conditioning', volume: 27 },
	{ keyword: 'heating and cooling', volume: 27 },
	{ keyword: 'ac repair', volume: 17 }
];

vi.mock('$lib/clearsky/dataforseo-google-ads.js', () => {
	class DataForSEOError extends Error {
		constructor(message, code) {
			super(message);
			this.name = 'DataForSEOError';
			this.code = code || 'DATAFORSEO_ERROR';
		}
	}

	function mockIndexPack(trade) {
		const t = String(trade || '').toLowerCase();
		const keywords =
			t.includes('hvac') || t.includes('heating') || t.includes('cooling')
				? hvacKeywords
				: plumbingKeywords;
		return {
			keywords,
			indexLocationCode: 1002124,
			source: 'dataforseo',
			indexMarketName: 'Sudbury,Ontario,Canada'
		};
	}

	return {
		INDEX_MARKET_DISPLAY: 'Sudbury,Ontario,Canada',
		DataForSEOError,
		fetchGoogleAdsLocations: vi.fn(async () => [
			{ location_code: 1002124, location_name: 'Sudbury,Ontario,Canada' }
		]),
		findLocationCodeByName: vi.fn(() => 1002124),
		fetchSearchVolumesForKeywords: vi.fn(async (login, password, keywords) => {
			const m = new Map();
			for (const k of keywords) m.set(k, 50);
			return m;
		}),
		resolveGoogleAdsLocationCode: vi.fn(async () => 1002124),
		fetchIndexMarketKeywordVolumes: vi.fn(async (login, password, trade) => mockIndexPack(trade)),
		fetchIndexMarketTotalVolume: vi.fn(async (login, password, trade) => {
			const p = mockIndexPack(trade);
			return p.keywords.reduce((s, k) => s + k.volume, 0);
		})
	};
});
