<script lang="ts">
	let {
		value = $bindable(),
		name,
		type,
		disabled,
		placeholder,
		classes
	}: {
		value: string;
		name: string;
		type: string;
		disabled?: boolean;
		placeholder?: string;
		classes?: string
	} = $props();
</script>

<input
	{disabled}
	{type}
	{name}
	{placeholder}
	bind:value
	class={`h-12 rounded-xl border p-2 ${disabled ? 'cursor-default border-secondary bg-black' : 'border-accent bg-background'} ${classes}`}
/>
