<script lang="ts">
	let {
		value = $bindable(),
		name,
		type,
		disabled
	}: { value: string; name: string; type: string; disabled?: boolean } = $props();
</script>

<input
	{disabled}
	{type}
	{name}
	bind:value
	class={`h-12 rounded-xl border p-2 ${disabled ? 'border-secondary bg-black cursor-default' : 'border-accent bg-background'}`}
/>
