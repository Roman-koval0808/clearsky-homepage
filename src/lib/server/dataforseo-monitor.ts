/**
 * DataForSEO Reviews Monitoring Utility
 * 
 * Logic to register recurring monitoring tasks with DataForSEO.
 */

import { DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD } from '$env/static/private';

const MONITOR_URL = 'https://api.dataforseo.com/v3/business_data/google/reviews/task_post';

export async function registerReviewMonitor(locationId: string, city: string, domain: string) {
    if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
        throw new Error('Missing DataForSEO credentials in environment');
    }

    const auth = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');
    
    // The bridge URL we created earlier
    const postbackUrl = `${domain}/api/signals/google/review/postback`;

    const payload = [
        {
            "keyword": `place_id:${locationId}`,
            "location_name": city,
            "language_code": "en",
            "postback_url": postbackUrl,
            "depth": 10,
            "sort_by": "newest"
        }
    ];

    console.log(`[DataForSEO Monitor] Registering task for ${locationId}...`);

    try {
        const response = await fetch(MONITOR_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (result.status_code === 20000) {
            return {
                success: true,
                task_id: result.tasks?.[0]?.id,
                message: 'Monitoring task created successfully'
            };
        } else {
            return {
                success: false,
                error: result.status_message || 'Failed to create task'
            };
        }
    } catch (err) {
        console.error('[DataForSEO Monitor Error]', err);
        return { success: false, error: 'Network error or invalid response' };
    }
}
