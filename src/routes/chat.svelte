<script lang="ts">
	import { swipe, type SwipePointerEventDetail } from 'svelte-gestures';
	import { isMobile } from '$lib/utils/detectDevice';
	import type { ChatProps } from '$lib/props/chat';
	import GuildContent from '$lib/components/guildView.svelte';
	import { WebSocketClient } from '$lib/websocket';
	import type { WebSocketClientProps } from '$lib/websocket';

	let { auth }: ChatProps = $props();

	let onMobile = isMobile();
	let direction = $state<SwipePointerEventDetail['direction'] | null>(null);

	function handler(event: CustomEvent<SwipePointerEventDetail>) {
		if (!onMobile) {
			return;
		}
		direction = event.detail.direction;
	}

	const websocketToken = $state.snapshot(auth.websocket_token);
	const userId = $state.snapshot(auth.id);
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
	function disconnectCallback() {
		error = {
			message:
				"You've lost connection to the server. Please wait while we try to re-establish a connection."
		};
	}
	function reconnectCallback() {
		error = null;
	}

	if (!websocketToken) {
		error = { message: 'No token was provided for auth.' };
	}
	if (!userId) {
		error = { message: 'User ID was not provided for auth.' };
	}
	let wsClient = new WebSocketClient(`${import.meta.env.VITE_API_URL}/ws`, {
		userId: userId?.toString(),
		token: websocketToken,
		failCallback,
		disconnectCallback,
		reconnectCallback
	} as WebSocketClientProps);

	function sendMessageCallback() {
		wsClient.sendMessage({});
	}

	$effect(() => {
		fetch(`${import.meta.env.VITE_API_URL}/api/guild/`, {
			headers: {
				authorization: `Bearer ${auth.token}`
			}
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				}
			})
			.then((data) => {
				guilds = data as Guild[];
			})
			.catch((err) => {
				alert('An error occurred while collecting guilds.');
				console.error(err);
			});

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
			class={`${onMobile && direction == 'right' ? 'fixed left-0 w-24' : 'hidden md:grid'} grid-cols-guildChannelView grid h-full px-2`}
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
			<div class="flex w-full flex-col gap-3 border-r border-accent bg-background md:flex p-2">
				<span>Channels</span>
				{#each selectedGuild?.channels || [] as channel}
					<button onclick={() => selectedChannel = channel}>{channel.name}</button>
				{:else}
					<span>This guild doesn't have a channel yet.</span>
				{/each}
				<button class="aspect-video w-full rounded-2xl bg-gradient-to-br from-primary to-accent"
					>Create a Channel</button
				>
			</div>
		</div>
		<GuildContent {auth} guildId={selectedGuild?.id || -1} channelId={selectedChannel?.id || -1} {sendMessageCallback} />
	</div>
{/if}
