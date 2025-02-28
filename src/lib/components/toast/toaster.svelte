<script lang="ts">
    import {toastStore} from '$lib/stores/toast.svelte';
	import { onMount } from 'svelte';
	import Toast from './toast.svelte';

    async function requestNotificationPermission() {
        if (!('Notification' in window)) {
            alert("The browser you opened this app in doesn't support notifications.");
            return;
        }

        if (Notification.permission === "granted") {
            return;
        }

        if (Notification.permission !== 'denied') {
            const permission = await window.Notification.requestPermission();
            if (permission === "granted") {
                alert("Your notifications permissions have been approved.");
            } else {
                alert("Notification permissions were rejected. You will not receive notifications.")
            }
        }
    }

    onMount(() => {
        requestNotificationPermission()
    })

    const notifications = $derived(toastStore.toastState.notifications)
</script>

<div class="absolute bottom-5 right-5 z-50">
    <ol class="flex flex-col gap-2">
        {#each notifications as notification}
            <Toast {notification} />
        {/each}
    </ol>
</div>