import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/db';
import { z } from 'zod';

const FormSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1),
	description: z.string().nullable().optional(),
	config: z.record(z.any())
});

export const GET: RequestHandler = async () => {
	try {
		const forms = await prisma.form.findMany({
			orderBy: { created_at: 'desc' }
		});
		return json({ success: true, forms });
	} catch (err) {
		return json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const parsed = FormSchema.safeParse(body);
		
		if (!parsed.success) {
			return json({ success: false, error: 'Invalid form data', details: parsed.error.flatten() }, { status: 400 });
		}

		const { id, title, description, config } = parsed.data;
		const formId = id || crypto.randomUUID();

		const form = await prisma.form.upsert({
			where: { id: formId },
			update: {
				title,
				description: description || null,
				config: config as any,
				updated_at: new Date()
			},
			create: {
				id: formId,
				title,
				description: description || null,
				config: config as any,
				created_at: new Date(),
				updated_at: new Date()
			}
		});

		return json({ success: true, id: form.id });
	} catch (err) {
		return json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
	}
};
