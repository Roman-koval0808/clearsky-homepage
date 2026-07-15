import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
server: {
    host: '0.0.0.0',
    port: 5173,
  },
	ssr: {
		external: ['@prisma/client', '.prisma/client']
	},
	build: {
		rollupOptions: {
			external: ['@prisma/client', '.prisma/client']
		}
	},
	test: {
		include: ['src/**/*.test.{js,ts}'],
		setupFiles: ['./src/test-setup.js'],
		alias: {
			'$lib': '/src/lib'
		}
	}
});
