<script lang="ts">
    let {
        text,
        onclick,
    } : {
        text: string,
        onclick: () => void
    } = $props();
</script>

<button class="flex items-center justify-center rounded-lg bg-primary px-2 py-1" {onclick}>
    {text}
</button>