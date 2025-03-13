<script lang="ts">
	import { goto } from '$app/navigation';
	import Avatar from '$lib/components/avatar.svelte';
	import Toaster from '$lib/components/toast/toaster.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { guildStore } from '$lib/stores/guild.svelte';
	import { websocketStore } from '$lib/stores/websocket.svelte';
	import '../app.css';
	let { children } = $props();

	let showOptions = $state(false);

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
				<div class="relative">
					{#if showOptions}
						<button
							type="button"
							class="fixed bottom-0 left-0 right-0 top-0 z-40"
							aria-label="close options"
							onclick={() => (showOptions = false)}
						></button>
						<div
							class="absolute right-0 top-full z-40 flex h-auto flex-col gap-3 rounded-lg border border-secondary bg-background p-1"
						>
							<button
								class="flex items-center justify-center rounded-lg bg-primary px-2 py-1"
								onclick={() => {
									showOptions = false;
									goto('/profile');
								}}
							>
								Profile
							</button>
							<button
								class="flex items-center justify-center rounded-lg bg-primary px-2 py-1"
								onclick={() => {
									showOptions = false;
									authStore.logout();
								}}
							>
								Logout
							</button>
						</div>
					{/if}
					<button
						class="flex items-center gap-2"
						type="button"
						onclick={() => (showOptions = !showOptions)}
					>
						{#if authStore.authState?.avatar_url}
							<Avatar
								avatar_url={`${import.meta.env.VITE_API_URL}${authStore.authState.avatar_url}`}
							/>
						{:else}
							{authStore.authState?.avatar_url}
						{/if}
						<span>
							{authStore.authState!.username}
						</span>
					</button>
				</div>
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
