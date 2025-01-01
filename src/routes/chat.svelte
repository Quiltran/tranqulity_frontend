<script lang="ts">
	import { swipe, type SwipePointerEventDetail } from 'svelte-gestures';
	import { isMobile } from '$lib/utils/detectDevice';
	import { getMessages } from '$lib/requests/channels';
	import { WebSocketClient } from '$lib/websocket';
	import { authStore } from '$lib/stores/auth.svelte';
	import { getGuilds } from '$lib/requests/guilds';

	let onMobile = isMobile();
	let direction = $state<SwipePointerEventDetail['direction'] | null>(null);

	function handler(event: CustomEvent<SwipePointerEventDetail>) {
		if (!onMobile) {
			return;
		}
		direction = event.detail.direction;
	}

	let error = $state<{ message: string } | null>(null);
	let guilds = $state<Guild[]>([]);
	let selectedGuild = $state<Guild | null>(null);
	let selectedChannel = $state<Channel | null>(null);

	function failCallback() {
		error = {
			message:
				'Failed to reconnect to the websocket. Please log out and back in to re-establish your connection.'
		};
	}
	async function disconnectCallback() {
		console.log('refreshing auth');
		await authStore.refreshToken();
		if (!authStore.authState?.websocket_token) {
			return Promise.reject('Unable to get new websocket token.');
		}
		return authStore.authState?.websocket_token;
	}
	function reconnectCallback() {
		error = null;
	}

	if (!authStore.authState?.websocket_token) {
		error = { message: 'No token was provided for auth.' };
	}
	if (!authStore.authState?.id) {
		error = { message: 'User ID was not provided for auth.' };
	}
	let wsClient = new WebSocketClient(`${import.meta.env.VITE_API_URL}/ws`, {
		failCallback,
		disconnectCallback,
		reconnectCallback
	});
	wsClient.connect(authStore.authState!.id || -1, authStore.authState!.websocket_token || '');

	function sendMessage(message: string) {
		if (!selectedChannel?.id) {
			return;
		}
		wsClient.sendMessage(selectedChannel?.id, message, []);
		messages.push({
			attachments: [],
			author: authStore.authState?.username || '',
			author_id: authStore.authState?.id || -1,
			content: message,
			created_date: new Date(),
			id: -1,
			updated_date: new Date()
		} satisfies Message);
		message = '';
	}
	let messages = $state<Message[]>([]);

	let message = $state<string>('');

	let messageBox = $state<HTMLTextAreaElement>();
	let pageNumber = $state(0);

	$effect(() => {
		if (!messageBox) {
			return;
		}
		messageBox.addEventListener('input', () => {
			messageBox!.style.height = 'auto';
			messageBox!.style.height = messageBox!.scrollHeight + 'px';
		});

		if (!selectedGuild?.id || !selectedChannel?.id) {
			return;
		}
		getMessages(
			selectedGuild?.id.toString(),
			selectedChannel.id.toString(),
			pageNumber,
			authStore.authState?.token || ''
		).then((m) => (messages = m));
	});

	$effect(() => {
		getGuilds(authStore.authState?.token || '').then((g) => (guilds = g));

		return () => {
			wsClient?.disconnect();
		};
	});
</script>

{#if error}
	<span>{error.message}</span>
{:else}
	<div
		class="grid h-full flex-1 gap-2 px-2 md:grid-cols-guildView"
		use:swipe={{ timeframe: 300, minSwipeDistance: 100, touchAction: 'pan-y' }}
		onswipe={handler}
	>
		<div
			class={`${onMobile && direction == 'right' ? 'fixed left-0 w-24' : 'hidden md:grid'} grid h-full grid-cols-guildChannelView px-2`}
		>
			<div
				class={`flex h-full w-full flex-col items-center gap-2 justify-self-center overflow-y-auto border-r border-accent bg-background pr-2`}
			>
				<span>Guilds</span>
				{#each guilds as guild}
					<button
						class="flex aspect-square w-full items-center justify-center rounded-full bg-primary transition-all duration-200 hover:rounded-lg"
						onclick={() => {
							selectedGuild = guild;
						}}
					>
						{guild.name
							.split(' ')
							.map((part) => part[0].toUpperCase())
							.join('')}
					</button>
				{/each}
			</div>
			<div class="flex w-full flex-col gap-3 border-r border-accent bg-background p-2 md:flex">
				<span>Channels</span>
				{#each selectedGuild?.channels || [] as channel}
					<button onclick={() => (selectedChannel = channel)}>{channel.name}</button>
				{:else}
					<span>This guild doesn't have a channel yet.</span>
				{/each}
				<button class="aspect-video w-full rounded-2xl bg-gradient-to-br from-primary to-accent">
					Create a Channel
				</button>
			</div>
		</div>
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
				<button class="h-16 w-20 rounded-2xl bg-accent" onclick={() => sendMessage(message)}>
					Send
				</button>
			</div>
		</div>
	</div>
{/if}
