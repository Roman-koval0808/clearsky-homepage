import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');

import { dev } from '$app/environment';

/**
 * Singleton pattern for PrismaClient in SvelteKit/Vite.
 * Using createRequire to avoid ESM/CommonJS bundling issues on VPS.
 * This ensures Prisma is loaded at runtime from node_modules.
 */
const existingPrisma = /** @type {any} */ (globalThis).prisma;
const prisma = existingPrisma?.feedbackRecord?.findMany ? existingPrisma : new PrismaClient();

if (dev) {
	/** @type {any} */ (globalThis).prisma = prisma;
}

export default prisma;
