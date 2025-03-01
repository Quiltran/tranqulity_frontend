<script lang="ts">
	import { browser, dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import Toaster from '$lib/components/toast/toaster.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { guildStore } from '$lib/stores/guild.svelte';
	import { websocketStore } from '$lib/stores/websocket.svelte';
	import { subscribeToPush } from '$lib/requests/pushNotifications';
	import '../app.css';
	let { children } = $props();

	let authenticated = $derived(authStore.authState?.token);

	if (browser && authStore.isAuthenticated() && 'serviceWorker' in navigator) {
		navigator.serviceWorker
			.register('/service-worker.js', {
				type: dev ? 'module' : 'classic'
			})
			.then((registration) => {
				console.log('Service worker registered:', registration);
				navigator.serviceWorker.ready.then((registration) => {
					console.log('Service worker ready:', registration);
					setTimeout(() => {
						subscribeToPush(registration, authStore.authState?.token ?? '').catch((err) =>
							console.error(err)
						);
					}, 250);
				});
			})
			.catch((error) => {
				console.error('Service worker registration failed:', error);
			});
	}

	$effect(() => {
		if (authenticated) {
			guildStore.getGuilds(authenticated);
			websocketStore.connect(
				`${import.meta.env.VITE_WS_URL}/ws`,
				authStore.authState?.id ?? -1,
				authStore.authState?.websocket_token ?? '',
				{
					failCallback: () => {},
					reconnectCallback: () => {},
					messageReceivedCallback: () => {}
				}
			);
		}
	});
</script>

<div class="flex h-screen flex-col gap-2">
	<div
		class={`flex h-14 items-center justify-between gap-7 px-10 ${authStore.authState?.id && 'border-b border-primary'}`}
	>
		<button class="text-lg font-bold" onclick={() => goto('/')}>Tranquility</button>
		<div class="flex items-center justify-center gap-3">
			{#if authStore.authState?.id}
				<button
					class="flex items-center justify-center rounded-lg bg-primary px-2 py-1"
					onclick={() => authStore.logout()}
				>
					Logout
				</button>
				<span>{authStore.authState.username}</span>
			{:else}
				<button
					class="flex items-center justify-center rounded-lg bg-primary px-2 py-1"
					onclick={() => goto('/login')}>Login</button
				>
			{/if}
		</div>
	</div>
	<Toaster />
	<div class="flex flex-1 flex-col">
		{@render children()}
	</div>
</div>
