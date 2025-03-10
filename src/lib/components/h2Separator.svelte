<script lang="ts">
	const { labelValue }: { labelValue: string } = $props();
</script>

<div class="relative w-full py-3">
	<hr class="h-px border-0 bg-secondary" />
	<h2 class="absolute left-0 top-1/2 -translate-y-1/2 bg-background text-lg font-bold px-3">
		{labelValue}
	</h2>
</div>
