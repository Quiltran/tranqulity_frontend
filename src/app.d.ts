// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	interface Guild {
		id: number;
		name: string;
		description: string;
		owner_id: number;
		channels: Channel[];
		created_date: Date;
		updated_date: Date;
	}

	interface Channel {
		id: number;
		name: string;
		guild_id: number;
		created_date: Date;
		updated_date: Date;
	}

	interface Message {
		id: number,
		author: string,
		author_id: number,
		content: string,
		attachments: string[],
		created_date: Date,
		updated_date: Date,
	}
}

export { };
