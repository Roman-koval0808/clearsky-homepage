import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/db';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	try {
		const form = await prisma.form.findUnique({
			where: { id },
			select: { id: true, title: true, description: true, config: true }
		});

		if (!form) {
			return json({ success: false, error: 'Form not found' }, { status: 404 });
		}

		return json({ success: true, form });
	} catch (err) {
		return json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
	}
};
