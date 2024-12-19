<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import type { AuthState } from '$lib/stores/auth.svelte';
	import Chat from './chat.svelte';
	import Home from './home.svelte';

	let authState = $state<AuthState>({ id: null, username: null, token: null, refresh_token: null, websocket_token: null });
	let isAuthenticated = $derived<boolean>(authState.id != null && authState.refresh_token != null && authState.token != null);
	auth.subscribe((v) => (authState = v));
</script>

{#if !isAuthenticated}
	<Home />
{:else}
	<Chat auth={authState} />
{/if}
