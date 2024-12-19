<script lang="ts">
	let props = $props<{ channels: Channel[], sendMessageCallback:() => void }>();

	let messages = $state<Message[]>([]);

	let message = $state<string>('');

	let messageBox: HTMLTextAreaElement;

	$effect(() => {
		if (!messageBox) {
			return;
		}
		messageBox.addEventListener('input', () => {
			messageBox.style.height = 'auto';
			messageBox.style.height = messageBox.scrollHeight + 'px';
		});
	});
</script>

<div class="grid h-full w-full grid-cols-channelView">
	<div class="mx-auto flex w-full flex-col gap-3 border-r border-accent">
		<span>Channels</span>
		{#each props.channels as channel}
			<span>{channel.name}</span>
		{:else}
			<span>This guild doesn't have a channel yet.</span>
		{/each}
		<button class="aspect-video w-5/6 rounded-2xl bg-gradient-to-br from-primary to-accent"
			>Create a Channel</button
		>
	</div>
	<div class="flex flex-col justify-end">
		{#each messages as message}
			<div>
				<span>{message.author_id}</span>
				<span>{message.content}</span>
			</div>
		{:else}
			<span>No messages have been posted in this channel yet.</span>
		{/each}
		<div class="flex items-end gap-2 p-4">
			<textarea
				class="h-auto max-h-36 w-full resize-none rounded-2xl border border-accent bg-background p-2 outline-none"
				placeholder="What do you want to say?"
				bind:this={messageBox}
				id="text"
				bind:value={message}
			></textarea>
			<button class="h-16 w-20 rounded-2xl bg-accent">Send</button>
		</div>
	</div>
</div>
