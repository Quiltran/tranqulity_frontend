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
				guildView: '15rem 1fr',
				guildChannelView: '5rem 10rem'
			}
		}
	},

	plugins: []
} satisfies Config;
