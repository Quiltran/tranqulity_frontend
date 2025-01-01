<script lang="ts">
	import { swipe, type SwipePointerEventDetail } from 'svelte-gestures';
	import { isMobile } from '$lib/utils/detectDevice';
	import GuildContent from '$lib/components/guildView.svelte';
	import { WebSocketClient } from '$lib/websocket';
	import type { WebSocketClientProps } from '$lib/websocket';
	import { authStore } from '$lib/stores/auth.svelte';
	import { getGuilds } from '$lib/requests/guilds';

	let authState = authStore.authState;
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
	function disconnectCallback() {
		authStore.refreshToken();
	}
	function reconnectCallback() {
		error = null;
	}

	if (!authState?.websocket_token) {
		error = { message: 'No token was provided for auth.' };
	}
	if (!authState?.id) {
		error = { message: 'User ID was not provided for auth.' };
	}
	let wsClient = new WebSocketClient(`${import.meta.env.VITE_API_URL}/ws`, {
		userId: authState?.id?.toString(),
		token: authState?.websocket_token,
		failCallback,
		disconnectCallback,
		reconnectCallback
	} as WebSocketClientProps);

	function sendMessageCallback() {
		wsClient.sendMessage({});
	}

	$effect(() => {
		getGuilds(authState?.token || '').then((g) => (guilds = g));

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
				<button class="aspect-video w-full rounded-2xl bg-gradient-to-br from-primary to-accent"
					>Create a Channel</button
				>
			</div>
		</div>
		<GuildContent
			guildId={selectedGuild?.id || -1}
			channelId={selectedChannel?.id || -1}
			{sendMessageCallback}
		/>
	</div>
{/if}
