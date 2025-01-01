<script lang="ts">
	import { getMessages } from '$lib/requests/channels';
	import { authStore } from '$lib/stores/auth.svelte';

	interface Props {
		guildId: number;
		channelId: number;
		sendMessageCallback: () => void;
	}
	let { guildId, channelId, sendMessageCallback }: Props = $props();

	let authState = authStore.authState;
	let messages = $state<Message[]>([]);

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

		getMessages(guildId.toString(), channelId.toString(), pageNumber, authState?.token || '').then(
			(m) => (messages = m)
		);
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
