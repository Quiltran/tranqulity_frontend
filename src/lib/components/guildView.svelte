<script lang="ts">
	interface Props {
		guildId: number;
		channelId: number;
		auth: AuthState;
		sendMessageCallback: () => void;
	}
	import type { AuthState } from '$lib/stores/auth.svelte';

	let { guildId, channelId, auth, sendMessageCallback }: Props = $props();

	let messages = $state<Message[]>([]);
	$inspect(messages);

	let message = $state<string>('');

	let messageBox: HTMLTextAreaElement;
	let pageNumber = $state(0);

	$effect(() => {
		if (!messageBox) {
			return;
		}
		messageBox.addEventListener('input', () => {
			messageBox.style.height = 'auto';
			messageBox.style.height = messageBox.scrollHeight + 'px';
		});

		fetch(
			`${import.meta.env.VITE_API_URL}/api/guild/${guildId}/channel/${channelId}/message/page/${pageNumber}`,
			{
				headers: {
					authorization: `Bearer ${auth.token}`
				}
			}
		)
		.then((response) => {
			if (!response.ok) {
				throw Error("Invalid response from message request.");
			}

			return response.json()
		})
		.then((data) => messages = data as Message[]);
	});
</script>

<div class="flex flex-col justify-end px-4">
	<div class="px-2">
		{#each messages as message}
			<div>
				<span>{message.author}</span>:
				<span>{message.content}</span>
			</div>
		{:else}
			<span>No messages have been posted in this channel yet.</span>
		{/each}
	</div>
	<div class="flex items-end gap-2 py-4">
		<textarea
			class="h-auto max-h-36 w-full resize-none rounded-2xl border border-accent bg-background p-2 outline-none"
			placeholder="What do you want to say?"
			bind:this={messageBox}
			id="text"
			bind:value={message}
		></textarea>
		<button class="h-16 w-20 rounded-2xl bg-accent" onclick={() => sendMessageCallback()}
			>Send</button
		>
	</div>
</div>
