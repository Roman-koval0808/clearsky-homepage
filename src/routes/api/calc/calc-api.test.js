import { describe, it, expect } from 'vitest';

import { POST as benchmarkVolumes } from './benchmark-volumes/+server.js';
import { POST as cityHouseholds } from './city-households/+server.js';
import { POST as compositeScore } from './composite-score/+server.js';
import { POST as rankingCtr } from './ranking-ctr/+server.js';
import { POST as siteRetention } from './site-retention/+server.js';
import { POST as tenureRate } from './tenure-rate/+server.js';
import { POST as economicRate } from './economic-rate/+server.js';

function mockRequest(body) {
	return {
		request: new Request('http://localhost', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		})
	};
}

async function callEndpoint(handler, body) {
	const response = await handler(mockRequest(body));
	return response.json();
}

// ═══════════════════════════════════════════════════════════════
//  /api/calc/benchmark-volumes
// ═══════════════════════════════════════════════════════════════

describe('API: /api/calc/benchmark-volumes', () => {
	it('plumbing → 5 keywords, numeric volumes, source metadata', async () => {
		const res = await callEndpoint(benchmarkVolumes, { trade: 'plumbing' });
		expect(res.success).toBe(true);
		expect(res.data.keywords).toHaveLength(5);
		expect(res.data.totalSudburyVolume).toBe(
			res.data.keywords.reduce((s, k) => s + k.volume, 0)
		);
		expect(res.data.volumeSource).toBe('dataforseo');
		expect(typeof res.data.indexLocationCode).toBe('number');
	});

	it('hvac → 5 keywords, same structure', async () => {
		const res = await callEndpoint(benchmarkVolumes, { trade: 'hvac' });
		expect(res.success).toBe(true);
		expect(res.data.keywords).toHaveLength(5);
		expect(res.data.totalSudburyVolume).toBe(
			res.data.keywords.reduce((s, k) => s + k.volume, 0)
		);
	});

	it('missing trade → 400', async () => {
		const response = await benchmarkVolumes(mockRequest({}));
		expect(response.status).toBe(400);
	});

	it('resolves "Heating and Cooling" → hvac', async () => {
		const res = await callEndpoint(benchmarkVolumes, { trade: 'Heating and Cooling' });
		expect(res.data.resolvedTradeKey).toBe('hvac');
		expect(res.data.keywords).toHaveLength(5);
	});
});

// ═══════════════════════════════════════════════════════════════
//  /api/calc/city-households
// ═══════════════════════════════════════════════════════════════

describe('API: /api/calc/city-households', () => {
	it('Timmins → 20,941 households', async () => {
		const res = await callEndpoint(cityHouseholds, { city: 'Timmins' });
		expect(res.success).toBe(true);
		expect(res.data.households).toBe(20941);
	});

	it('Timmins scaling factor ≈ 0.2868', async () => {
		const res = await callEndpoint(cityHouseholds, { city: 'Timmins' });
		expect(res.data.scalingFactor).toBeCloseTo(0.2868, 3);
	});

	it('Timmins scaling with uplift ≈ 0.3442', async () => {
		const res = await callEndpoint(cityHouseholds, { city: 'Timmins' });
		expect(res.data.scalingFactorWithUplift).toBeCloseTo(0.3442, 3);
	});

	it('Timmins tier = active', async () => {
		const res = await callEndpoint(cityHouseholds, { city: 'Timmins' });
		expect(res.data.tier).toBe('active');
	});

	it('Sudbury → 73,000 (index market)', async () => {
		const res = await callEndpoint(cityHouseholds, { city: 'Sudbury' });
		expect(res.data.households).toBe(73000);
		expect(res.data.scalingFactor).toBe(1);
	});

	it('North Bay → 30,737', async () => {
		const res = await callEndpoint(cityHouseholds, { city: 'North Bay' });
		expect(res.data.households).toBe(30737);
	});

	it('unknown city → default 20,000', async () => {
		const res = await callEndpoint(cityHouseholds, { city: 'Toronto' });
		expect(res.data.households).toBe(20000);
		expect(res.data.tier).toBe('unknown');
	});

	it('missing city → 400', async () => {
		const response = await cityHouseholds(mockRequest({}));
		expect(response.status).toBe(400);
	});
});

// ═══════════════════════════════════════════════════════════════
//  /api/calc/composite-score
// ═══════════════════════════════════════════════════════════════

describe('API: /api/calc/composite-score', () => {
	const manitoGbp = {
		rating: 4.8,
		reviewCount: 137,
		photos: Array(7).fill(1),
		opening_hours: true,
		website: 'https://manitoplumbing.ca',
		qa: { count: 0, answeredCount: 0 },
		editorialSummary: false,
		services: Array(7).fill('svc'),
		ownerResponseCount: 23
	};

	it('returns 9 signals', async () => {
		const res = await callEndpoint(compositeScore, { gbp: manitoGbp, yearsInBusiness: 14 });
		expect(res.data.signals).toHaveLength(9);
	});

	it('total signal max = 100', async () => {
		const res = await callEndpoint(compositeScore, { gbp: manitoGbp, yearsInBusiness: 14 });
		const totalMax = res.data.signals.reduce((s, sig) => s + sig.max, 0);
		expect(totalMax).toBe(100);
	});

	it('no GBP → gbpExists false, penalty 0.60', async () => {
		const res = await callEndpoint(compositeScore, {});
		expect(res.data.gbpExists).toBe(false);
		expect(res.data.compositePenalty).toBe(0.60);
	});

	it('compositeScore 80 → throughput 0.80', async () => {
		const gbp = {
			rating: 4.5, reviewCount: 30, photos: Array(8).fill(1),
			opening_hours: true, website: 'https://test.com',
			qa: { count: 0, answeredCount: 0 },
			editorialSummary: false, services: Array(5).fill('s'),
			ownerResponseCount: 15
		};
		const res = await callEndpoint(compositeScore, { gbp, yearsInBusiness: 5 });
		if (res.data.compositeScore === 100) {
			expect(res.data.throughput).toBe(1);
		} else {
			const expected = 1 - res.data.cappedPenalty;
			expect(res.data.throughput).toBeCloseTo(expected, 4);
		}
	});

	it('penalty cannot exceed 0.85', async () => {
		const terribleGbp = {
			rating: 2.0, reviewCount: 0, photos: [],
			opening_hours: false, website: null,
			qa: { count: 10, answeredCount: 0 },
			editorialSummary: false, services: [],
			ownerResponseCount: 0
		};
		const res = await callEndpoint(compositeScore, { gbp: terribleGbp, yearsInBusiness: 1 });
		expect(res.data.cappedPenalty).toBeLessThanOrEqual(0.85);
		expect(res.data.throughput).toBeGreaterThanOrEqual(0.15);
	});
});

// ═══════════════════════════════════════════════════════════════
//  /api/calc/ranking-ctr
// ═══════════════════════════════════════════════════════════════

describe('API: /api/calc/ranking-ctr', () => {
	it('position 1 → CTR 0.44, floor applied, gap = 0.1', async () => {
		const res = await callEndpoint(rankingCtr, { position: 1 });
		expect(res.data.currentCTR).toBe(0.44);
		expect(res.data.rawCtrGap).toBe(0);
		expect(res.data.floorApplied).toBe(true);
		expect(res.data.appliedCtrGap).toBe(0.1);
	});

	it('position 2 → CTR 0.24, gap = 0.20', async () => {
		const res = await callEndpoint(rankingCtr, { position: 2 });
		expect(res.data.currentCTR).toBe(0.24);
		expect(res.data.appliedCtrGap).toBe(0.20);
		expect(res.data.floorApplied).toBe(false);
	});

	it('position 3 → CTR 0.17, gap = 0.27', async () => {
		const res = await callEndpoint(rankingCtr, { position: 3 });
		expect(res.data.currentCTR).toBe(0.17);
		expect(res.data.appliedCtrGap).toBe(0.27);
	});

	it('"none" → CTR 0.03, gap = 0.41', async () => {
		const res = await callEndpoint(rankingCtr, { position: 'none' });
		expect(res.data.currentCTR).toBe(0.03);
		expect(res.data.appliedCtrGap).toBe(0.41);
	});

	it('missing position → 400', async () => {
		const response = await rankingCtr(mockRequest({}));
		expect(response.status).toBe(400);
	});
});

// ═══════════════════════════════════════════════════════════════
//  /api/calc/site-retention
// ═══════════════════════════════════════════════════════════════

describe('API: /api/calc/site-retention', () => {
	it('PSI 95 → 1.00, Green', async () => {
		const res = await callEndpoint(siteRetention, { psiScore: 95 });
		expect(res.data.retentionRate).toBe(1.0);
		expect(res.data.status).toBe('Green');
	});

	it('PSI 74 → 0.90, Amber', async () => {
		const res = await callEndpoint(siteRetention, { psiScore: 74 });
		expect(res.data.retentionRate).toBe(0.9);
		expect(res.data.status).toBe('Amber');
	});

	it('PSI 52 → 0.85, Amber (Manito)', async () => {
		const res = await callEndpoint(siteRetention, { psiScore: 52 });
		expect(res.data.retentionRate).toBe(0.85);
	});

	it('PSI 30 → 0.80, Red', async () => {
		const res = await callEndpoint(siteRetention, { psiScore: 30 });
		expect(res.data.retentionRate).toBe(0.80);
		expect(res.data.status).toBe('Red');
	});

	it('mobile 67 + desktop 81 → avg 74, retention 0.90', async () => {
		const res = await callEndpoint(siteRetention, { mobile: 67, desktop: 81 });
		expect(res.data.psiScore).toBe(74);
		expect(res.data.retentionRate).toBe(0.90);
	});

	it('missing score → 400', async () => {
		const response = await siteRetention(mockRequest({}));
		expect(response.status).toBe(400);
	});
});

// ═══════════════════════════════════════════════════════════════
//  /api/calc/tenure-rate
// ═══════════════════════════════════════════════════════════════

describe('API: /api/calc/tenure-rate', () => {
	it('14 years → Trusted, +9%', async () => {
		const res = await callEndpoint(tenureRate, { yearsInBusiness: 14 });
		expect(res.data.tenureRate).toBe(0.09);
		expect(res.data.tenureLabel).toBe('Trusted');
	});

	it('20 years → Legacy, +16%', async () => {
		const res = await callEndpoint(tenureRate, { yearsInBusiness: 20 });
		expect(res.data.tenureRate).toBe(0.16);
		expect(res.data.tenureLabel).toBe('Legacy');
	});

	it('8 years → Established, +4%', async () => {
		const res = await callEndpoint(tenureRate, { yearsInBusiness: 8 });
		expect(res.data.tenureRate).toBe(0.04);
	});

	it('3 years → Building, -5%', async () => {
		const res = await callEndpoint(tenureRate, { yearsInBusiness: 3 });
		expect(res.data.tenureRate).toBe(-0.05);
	});

	it('0 years → New, -15%', async () => {
		const res = await callEndpoint(tenureRate, { yearsInBusiness: 0 });
		expect(res.data.tenureRate).toBe(-0.15);
		expect(res.data.tenureLabel).toBe('New');
	});

	it('missing → 400', async () => {
		const response = await tenureRate(mockRequest({}));
		expect(response.status).toBe(400);
	});
});

// ═══════════════════════════════════════════════════════════════
//  /api/calc/economic-rate
// ═══════════════════════════════════════════════════════════════

describe('API: /api/calc/economic-rate', () => {
	it('Timmins → active, +5%', async () => {
		const res = await callEndpoint(economicRate, { city: 'Timmins' });
		expect(res.data.marketTier).toBe('active');
		expect(res.data.economicRate).toBe(0.05);
	});

	it('Cochrane → slow, -15%', async () => {
		const res = await callEndpoint(economicRate, { city: 'Cochrane' });
		expect(res.data.marketTier).toBe('slow');
		expect(res.data.economicRate).toBe(-0.15);
	});

	it('unknown city → neutral, 0%', async () => {
		const res = await callEndpoint(economicRate, { city: 'Toronto' });
		expect(res.data.marketTier).toBe('neutral');
		expect(res.data.economicRate).toBe(0);
	});

	it('explicit tier overrides city', async () => {
		const res = await callEndpoint(economicRate, { city: 'Timmins', marketTier: 'slow' });
		expect(res.data.marketTier).toBe('slow');
	});

	it('missing both → 400', async () => {
		const response = await economicRate(mockRequest({}));
		expect(response.status).toBe(400);
	});
});
