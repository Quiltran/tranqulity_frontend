<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import Chat from '$lib/components/chat.svelte';
	import Home from './home.svelte';
</script>

{#if !authStore.isAuthenticated()}
	<Home />
{:else}
	<Chat />
{/if}
