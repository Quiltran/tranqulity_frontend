<script lang="ts">
	let {
		ref,
		index,
		message,
		showFrom
	}: {
		ref: HTMLDivElement | null;
		index: number;
		message: Message;
		showFrom: boolean;
	} = $props();
</script>

<div class="flex flex-col">
	{#if index == 0}
		<div bind:this={ref} data-fetching="true"></div>
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
	{#each message.attachments as attachment}
		<img
			class="aspect-auto h-1/6 max-w-64"
			alt={attachment}
			src={`${import.meta.env.VITE_API_URL}${attachment}`}
		/>
	{/each}
</div>
