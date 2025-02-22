<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import Chat from '../chat.svelte';

	$effect(() => {
		if (!authStore.isAuthenticated()) {
			goto('/');
		}
	});
</script>

<Chat />
