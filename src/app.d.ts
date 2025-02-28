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

	interface WebsocketMessage {
		type: "message" | "channel"
		data: Message | Channel
	}
	interface Guild {
		id: number;
		name: string;
		description: string;
		owner_id: number;
		channels: Channel[];
		members: Member[];
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
		guild: string,
		channel: string,
		channel_id: number,
		attachments: string[],
		created_date: Date,
		updated_date: Date,
	}

	interface Member {
		id: number,
		username: string,
	}
}

export { };
