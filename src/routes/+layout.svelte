<script lang="ts">
	import { goto } from '$app/navigation';
	import Toaster from '$lib/components/toast/toaster.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { guildStore } from '$lib/stores/guild.svelte';
	import { websocketStore } from '$lib/stores/websocket.svelte';
	import '../app.css';
	let { children } = $props();

	$effect(() => {
		if (!authStore.isAuthenticated()) {
			goto('/');
			return;
		}
		guildStore.getGuilds(authStore.authState?.token ?? '');
		websocketStore.connect({
			failCallback: () => {},
			reconnectCallback: () => {},
			messageReceivedCallback: () => {}
		});
	});
</script>

<div class="flex h-screen flex-col gap-2">
	<div
		class={`flex h-14 items-center justify-between gap-7 px-10 ${authStore.authState?.id && 'border-b border-primary'}`}
	>
		<button class="text-lg font-bold" onclick={() => goto('/')}>Quiltran</button>
		<div class="flex items-center justify-center gap-3">
			{#if authStore.isAuthenticated()}
				<button
					class="flex items-center justify-center rounded-lg bg-primary px-2 py-1"
					onclick={() => authStore.logout()}
				>
					Logout
				</button>
				<button type="button" onclick={() => goto('/profile')}>
					{authStore.authState!.username}
				</button>
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
