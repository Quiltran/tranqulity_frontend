<script lang="ts">
	import type { Snippet } from 'svelte';

	let { closeCallback, children }: { closeCallback: () => void; children: Snippet<[]> } = $props();

	let background = $state<HTMLDivElement>();

	function handleInnerClick(e: MouseEvent) {
		e.stopPropagation();
	}

	$effect(() => {
		if (!background) return;
		background.addEventListener('mousedown', (e) => {
			if (e.target !== background) return;
			closeCallback();
		});
	});
</script>

<div
	role="presentation"
	class="fixed left-0 top-0 z-50 h-screen w-screen bg-black bg-opacity-50"
	bind:this={background}
>
	<div
		role="button"
		aria-label="Close Modal"
		tabindex="0"
		onmousedown={handleInnerClick}
		class="max-w-screen fixed left-1/2 top-1/2 flex min-h-44 w-1/3 min-w-52 -translate-x-1/2 cursor-default
                -translate-y-1/2 flex-col items-center justify-center gap-2 rounded-lg border-2 border-primary p-4 bg-background"
	>
		{@render children()}
	</div>
</div>
