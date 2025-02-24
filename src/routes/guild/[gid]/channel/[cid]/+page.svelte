<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authStore } from '$lib/stores/auth.svelte';
	import Chat from '$lib/components/chat.svelte';

	$effect(() => {
		if (!authStore.isAuthenticated()) {
			console.error("Not authenticated")
			goto('/');
		}
	});

	const gid = $derived(page.params['gid']);
	const cid = $derived(page.params['cid']);
	$inspect(gid, cid)
</script>

<Chat gid={Number(gid)} cid={Number(cid)} />
