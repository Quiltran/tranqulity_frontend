<script lang="ts">
	const { avatar_url }: { avatar_url: string } = $props();
</script>

<div class="max-h-10 aspect-square overflow-clip rounded-full">
	<img class="aspect-auto h-full border-primary" alt="profile" src={avatar_url} />
</div>
