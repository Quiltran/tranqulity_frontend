<script lang="ts">
	let {
		ref,
		index,
		message,
        showFrom
	}: {
		ref: HTMLDivElement | null;
		index: number,
		message: Message;
        showFrom: boolean
	} = $props();
</script>

<div class="flex flex-col">
    {#if index == 0}
        <div bind:this={ref} data-fetching=true></div>
    {/if}
	{#if showFrom}
		<div>
			<span class="text-xl">{message.author}</span>
			<span class="text-xs">
				{new Date(message.created_date).toLocaleDateString('en-us')}
			</span>
		</div>
	{/if}
	<span class="pl-8">{message.content}</span>
</div>
