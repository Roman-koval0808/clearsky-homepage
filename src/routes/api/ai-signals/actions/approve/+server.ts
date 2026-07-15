import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { id, edited } = await request.json();
		
		await sql.begin(async (sql) => {
			const [approval] = await sql`SELECT * FROM approvals WHERE id = ${id}`;
			if (!approval) throw new Error('Approval not found');

			// Mark approval as completed
			await sql`UPDATE approvals SET status = 'approved' WHERE id = ${id}`;
			
			// Update action status
			await sql`UPDATE action_queue SET status = 'completed' WHERE id = ${approval.action_id}`;

			// Record outcome (pseudocode for metrics)
			// await sql`INSERT INTO outcomes (action_id, status, human_intervened) VALUES (...)`;
		});

		return json({ success: true });
	} catch (err) {
		return json({ success: false, error: String(err) }, { status: 500 });
	}
};
