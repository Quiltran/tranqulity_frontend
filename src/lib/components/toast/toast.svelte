<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte';

	const {
		notification
	}: {
		notification: ApiNotification;
	} = $props();

	let notificationMessage = $state('');
	switch (notification.type) {
		case 'message':
			notificationMessage = `${(notification.data as Message).author} sent a message in ${(notification.data as Message).channel}`;
		case 'channel':
			notificationMessage = `You were added to ${(notification.data as Channel).name}`;
	}

	$effect(() => {
		setTimeout(() => {
			toastStore.removeNotification(notification);
		}, 5000);
	});
</script>

<div class="rounded-xl border border-secondary bg-background px-5 py-3">
	<div class="flex justify-between">
		<h3 class="text-lg font-bold">{notification.type}</h3>
		<button type="button" onclick={() => toastStore.removeNotification(notification)}>x</button>
	</div>
	<span>{notificationMessage}</span>
</div>
