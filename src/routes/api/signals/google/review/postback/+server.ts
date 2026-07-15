import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { processGbpReview } from '$lib/server/review-pipeline';

/**
 * DATAFORSEO GOOGLE REVIEWS POSTBACK BRIDGE
 * 
 * This endpoint catches the postback from DataForSEO's monitoring task,
 * translates their specific format into the ClearSky Raw Input format,
 * and triggers the 9-step processing pipeline.
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        const d4seoPayload = await request.json();
        const origin = new URL(request.url).origin;

        console.log(`[DataForSEO Bridge] Postback Received. Task ID: ${d4seoPayload.tasks?.[0]?.id}`);

        // 1. Extract the reviews from the DataForSEO result
        // Note: DataForSEO may send multiple tasks or multiple items per result.
        // We process the first item of the first result for this bridge example.
        const task = d4seoPayload.tasks?.[0];
        const result = task?.result?.[0];
        const item = result?.items?.[0];

        if (!item) {
            return json({ success: false, error: 'No review items found in DataForSEO payload' }, { status: 400 });
        }

        // 2. Translate to ClearSky Raw Input Format (Step 1 Mapping)
        const translatedPayload = {
            provider: 'google_business_profile',
            provider_event_name: 'review.created',
            review_id: item.review_id,
            location_id: result.location_id || 'gbp_location_1199', // Fallback for simulation
            author_name: item.author_name,
            rating: item.rating?.value,
            comment: item.text,
            created_time: item.timestamp,
            // Meta info for trace
            bridge_source: 'dataforseo_postback',
            dataforseo_task_id: task.id
        };

        console.log(`[DataForSEO Bridge] Translated Payload:`, translatedPayload);

        // 3. Hand off to the 9-step Pipeline
        const resultPipeline = await processGbpReview(translatedPayload, origin);

        return json({
            success: resultPipeline.success,
            message: 'DataForSEO postback processed',
            pipeline_result: resultPipeline
        });

    } catch (err) {
        console.error(`[DataForSEO Bridge Error]`, err);
        return json({ success: false, error: 'Bridge processing failed' }, { status: 500 });
    }
};
