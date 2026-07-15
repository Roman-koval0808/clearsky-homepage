import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { id } = await request.json();
		
		await sql.begin(async (sql) => {
			const [approval] = await sql`SELECT * FROM approvals WHERE id = ${id}`;
			if (!approval) throw new Error('Approval not found');

			// Mark approval as discarded
			await sql`UPDATE approvals SET status = 'discarded' WHERE id = ${id}`;
			
			// Update action status
			await sql`UPDATE action_queue SET status = 'discarded' WHERE id = ${approval.action_id}`;
		});

		return json({ success: true });
	} catch (err) {
		return json({ success: false, error: String(err) }, { status: 500 });
	}
};
