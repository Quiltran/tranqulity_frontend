<script lang="ts">
	import type { ChatProps } from '$lib/props/chat';
	import GuildContent from '$lib/components/guildView.svelte';
	import { WebSocketClient } from '$lib/websocket';
	import type { WebSocketClientProps } from '$lib/websocket';

	let { auth, sendMessageCallback }: ChatProps = $props();
	$inspect(auth);

	const websocketToken = $state.snapshot(auth.websocket_token);
	const userId = $state.snapshot(auth.id);
	let error = $state<{ message: string } | null>(null);
	let guilds = $state<Guild[]>([]);
	let selectedGuild = $state<Guild>();
	$inspect(selectedGuild);

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
	<div class="grid h-full flex-1 grid-cols-guildView gap-2 px-2">
		<div
			class="flex h-full w-full flex-col gap-2 justify-self-center overflow-y-auto border-r border-accent pr-2"
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
		<GuildContent channels={selectedGuild?.channels || []} {sendMessageCallback} />
	</div>
{/if}
