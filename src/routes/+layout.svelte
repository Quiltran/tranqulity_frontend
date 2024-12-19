<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import { auth, type AuthState } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';

	let authStore = $state<AuthState | null>(null);
	$effect(() => {
		const unsubscribe = auth.subscribe((v) => (authStore = v));
		return unsubscribe();
	});
</script>

<div class="flex h-screen flex-col gap-2">
	<div class={`flex h-14 items-center justify-between gap-7 px-10 ${authStore?.id && "border-b border-primary"}`}>
		<button class="text-lg font-bold" onclick={() => goto('/')}>Tranquility</button>
		<div class="flex items-center justify-center gap-3">
			{#if authStore?.id}
				<button
					class="flex items-center justify-center rounded-lg bg-primary px-2 py-1"
					onclick={() => auth.clear()}>Logout</button
				>
				<span>{authStore.username}</span>
			{:else}
				<button
					class="flex items-center justify-center rounded-lg bg-primary px-2 py-1"
					onclick={() => goto('/login')}>Login</button
				>
			{/if}
		</div>
	</div>
	<div class="flex flex-1 flex-col">
		{@render children()}
	</div>
</div>
