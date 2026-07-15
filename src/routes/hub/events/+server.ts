import { json } from '@sveltejs/kit';
import { UnifiedPipelineEngine } from '$lib/server/unified-pipeline';
import prisma from '$lib/server/db';
import { evalDemotion } from '$lib/server/scoring/demotion';

const bucketPriority = ['emergency', 'active', 'comparison', 'research', 'unclassified'];
function upgradeBucket(current: string, next: string): string {
    const curIdx = bucketPriority.indexOf(current);
    const nxtIdx = bucketPriority.indexOf(next);
    if (curIdx === -1 || next === 'unclassified') return current;
    if (nxtIdx === -1) return current;
    return nxtIdx < curIdx ? next : current;
}

export async function POST({ request }) {
	try {
		const data = await request.json();

		const eventType = data.event || data.eventType || 'clearsky.website.activity';
		const bucket = data.bucket || data.intentBucket || 'unclassified';
		const pageUrl = data.pageUrl || data.page || '';

		if (pageUrl.includes('/marketing-automation/admin')) {
			return json({ success: true, message: 'Ignored profile page activity.' });
		}
		
		const payload = {
			provider: 'clearsky_pixel',
			event_type: eventType,
			external_id: (data.session_id || data.sessionId || 'anon') + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
			customer_email: data.email || null,
			customer_phone: data.phone || null,
			customer_name: data.name || null,
			session_id: data.session_id || data.sessionId || null,
			text_content: '',
			occurred_at: new Date(data.timestamp || Date.now()),
			metadata: data
		};

		// Always print the Hub Event Stream JSON for ALL events
		const hubLog = {
			event: "clearsky.website.activity",
			version: "1.0",
			timestamp: payload.occurred_at,
			anonymousId: data.session_id || data.sessionId || null,
			hubProfileId: null,
			sessionId: data.session_id || data.sessionId || null,
			eventType: eventType,
			intentBucket: bucket,
			engagementScore: data.score || 0,
			pageUrl: data.pageUrl || data.page || '',
			pixelEvent: data.event || eventType
		};
		
		console.log(`\n[hub-event-stream] -> DB Write (WebsiteEvent)`);
		console.log(JSON.stringify(hubLog, null, 2));

		let profileId = null;
		const sid = data.session_id || data.sessionId;
		const fingerprintId = data.fingerprint_id || null;
		let fingerprintProfile = null;

		if (fingerprintId) {
			fingerprintProfile = await prisma.fingerprintProfile.findUnique({
				where: { fingerprint_id: fingerprintId }
			});

			if (!fingerprintProfile) {
				fingerprintProfile = await prisma.fingerprintProfile.create({
					data: {
						fingerprint_id: fingerprintId,
						score_raw: data.score || 0,
						bucket: bucket,
						last_event_at: new Date(),
					}
				});
			} else {
				const updatedScore = Math.max(data.score || 0, fingerprintProfile.score_raw);
				const updatedBucket = upgradeBucket(fingerprintProfile.bucket, bucket);
				
				fingerprintProfile = await prisma.fingerprintProfile.update({
					where: { fingerprint_id: fingerprintId },
					data: {
						score_raw: updatedScore,
						bucket: updatedBucket,
						last_event_at: new Date(),
					}
				});

				if (fingerprintProfile.customer_profile_id && !profileId) {
					profileId = fingerprintProfile.customer_profile_id;
				}

				const { demoted, newBucket, scoreLive } = evalDemotion(
					fingerprintProfile.score_raw,
					fingerprintProfile.bucket,
					fingerprintProfile.last_event_at
				);

				if (demoted) {
					await prisma.fingerprintProfile.update({
						where: { fingerprint_id: fingerprintId },
						data:  { bucket: newBucket }
					});

					await prisma.websiteEvent.create({
						data: {
							event_id:         `evt_sys_${Math.random().toString(36).slice(2, 9)}`,
							session_id:       sid,
							fingerprint_id:   fingerprintId,
							event_type:       'bucket_demotion',
							intent_bucket:    newBucket,
							engagement_score: scoreLive,
							payload: {
								system_event: true,
								from_bucket:  fingerprintProfile.bucket,
								to_bucket:    newBucket,
								score_live:   scoreLive,
								score_raw:    fingerprintProfile.score_raw,
							},
							occurred_at:         new Date(),
							customer_profile_id: profileId,
						}
					});
				}
			}
		}

		if (data.email || data.phone || data.name) {
			const profileQuery = [];
			if (data.email) profileQuery.push({ email: data.email });
			if (data.phone) profileQuery.push({ phone_number: data.phone });

			let existingProfile = null;
			if (profileQuery.length > 0) {
				existingProfile = await prisma.customerProfile.findFirst({
					where: { OR: profileQuery }
				});
			}

			if (!existingProfile && sid) {
				const linkedEvent = await prisma.websiteEvent.findFirst({
					where: { session_id: sid, customer_profile_id: { not: null } }
				});
				if (linkedEvent && linkedEvent.customer_profile_id) {
					existingProfile = await prisma.customerProfile.findUnique({
						where: { id: linkedEvent.customer_profile_id }
					});
				}
			}

			if (!existingProfile && (data.email || data.phone)) {
				const fallbackBusiness = await prisma.business.findFirst();
				if (fallbackBusiness) {
					existingProfile = await prisma.customerProfile.create({
						data: {
							business_id: fallbackBusiness.id,
							email: data.email || null,
							phone_number: data.phone || null,
							first_name: data.name ? data.name.split(' ')[0] : null,
							last_name: data.name && data.name.includes(' ') ? data.name.split(' ').slice(1).join(' ') : null,
							tags: ["Website Visitor"]
						}
					});
				}
			} else if (existingProfile) {
				const updates: any = {};
				if (data.email && !existingProfile.email) updates.email = data.email;
				if (data.phone && !existingProfile.phone_number) updates.phone_number = data.phone;
				if (data.name && (!existingProfile.first_name || existingProfile.first_name === 'Unknown')) {
					updates.first_name = data.name.split(' ')[0];
					updates.last_name = data.name.includes(' ') ? data.name.split(' ').slice(1).join(' ') : null;
				}

				if (Object.keys(updates).length > 0) {
					existingProfile = await prisma.customerProfile.update({
						where: { id: existingProfile.id },
						data: updates
					});
				}
			}

			if (existingProfile) {
				profileId = existingProfile.id;
				if (sid) {
					// Retroactively link past events in this session
					await prisma.websiteEvent.updateMany({
						where: {
							session_id: sid,
							customer_profile_id: null
						},
						data: { customer_profile_id: profileId }
					});
				}
				if (fingerprintId && fingerprintProfile && fingerprintProfile.customer_profile_id !== profileId) {
					await prisma.fingerprintProfile.update({
						where: { fingerprint_id: fingerprintId },
						data: { customer_profile_id: profileId }
					});
				}
			}
		} else if (sid) {
			// No new identity info, but check if the session is already linked to a profile
			const linkedEvent = await prisma.websiteEvent.findFirst({
				where: { session_id: sid, customer_profile_id: { not: null } }
			});
			if (linkedEvent) {
				profileId = linkedEvent.customer_profile_id;
			}
		}

		const websiteEvent = await prisma.websiteEvent.create({
			data: {
				event_id: `evt_web_${Math.random().toString(36).substring(2, 9)}`,
				session_id: sid,
				fingerprint_id: fingerprintId,
				event_type: eventType,
				intent_bucket: bucket,
				engagement_score: data.score || 0,
				page_url: data.pageUrl || data.page || null,
				customer_email: data.email || null,
				customer_phone: data.phone || null,
				customer_name: data.name || null,
				payload: data,
				occurred_at: payload.occurred_at,
				customer_profile_id: profileId
			}
		});

		return json({ success: true, message: 'Activity logged to WebsiteEvent Stream.' });
	} catch (e: any) {
		console.error('[Hub Events Error]:', e);
		return json({ success: false, error: e.message, stack: e.stack }, { status: 422 });
	}
}
