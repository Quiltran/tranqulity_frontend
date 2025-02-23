<script lang="ts">
	import { createChannel } from '$lib/requests/channels';
	import { authStore } from '$lib/stores/auth.svelte';
	import { guildStore } from '$lib/stores/guild.svelte';
	import StyledButton from '../styledButton.svelte';
	import StyledInput from '../styledInput.svelte';
	import Modal from './modal.svelte';

	let { closeCallback }: { closeCallback: () => void } = $props();

	let selectedGuild = guildStore.guildState.currentGuild;
	if (!selectedGuild) closeCallback();

	let channelName = $state('');

	function submitNewChannel() {
		createChannel(selectedGuild?.id ?? -1, channelName, authStore.authState?.token ?? '')
			.then((channel) => {
				guildStore.guildState.currentGuild?.channels.push(channel);
			})
			.catch((err) => {
				alert('An error occurred while creating your channel.');
				console.error(err);
			});
	}
</script>

<Modal {closeCallback}>
	<h2 class="text-xl">Create Channel</h2>
	<div class="grid grid-cols-1 gap-2">
		<div class="flex flex-col">
			<label for="newChannelName"> Channel Name </label>
			<StyledInput type="text" bind:value={channelName} name="newChannelName" />
		</div>
		<div class="flex flex-col">
			<label for="guildName"> Guild Name </label>
			<StyledInput
				type="text"
				value={selectedGuild?.name ?? 'No Guild Selected'}
				name="guildName"
				disabled
			/>
		</div>
		<div class="flex justify-around gap-4">
			<StyledButton text="submit" onclick={submitNewChannel} />
			<StyledButton text="cancel" onclick={closeCallback} />
		</div>
	</div>
</Modal>
