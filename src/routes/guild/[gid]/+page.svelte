<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authStore } from '$lib/stores/auth.svelte';
	import Chat from '../../chat.svelte';

	$effect(() => {
		if (!authStore.isAuthenticated()) {
			goto('/');
		}
	});

	let gid: number = $derived(Number(page.params['gid']));
</script>

<Chat {gid} />
