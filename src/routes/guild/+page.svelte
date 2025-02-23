<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import Chat from '$lib/components/chat.svelte';

	$effect(() => {
		if (!authStore.isAuthenticated()) {
			goto('/');
		}
	});
</script>

<Chat />
