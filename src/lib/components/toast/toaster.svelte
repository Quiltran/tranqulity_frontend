<script lang="ts">
    import {toastStore} from '$lib/stores/toast.svelte';
	import Toast from './toast.svelte';

    const notifications = $derived(toastStore.toastState.notifications)
</script>

<div class="absolute bottom-5 right-5 z-50">
    <ol class="flex flex-col gap-2">
        {#each notifications as notification}
            <Toast {notification} />
        {/each}
    </ol>
</div>