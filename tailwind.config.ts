import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				text: 'var(--text)',
				background: 'var(--background)',
				primary: 'var(--primary)',
				secondary: 'var(--secondary)',
				accent: 'var(--accent)',
			},
			gridTemplateColumns: {
				guildView: '5rem 1fr',
				channelView: '10rem 1fr'
			}
		}
	},

	plugins: []
} satisfies Config;
