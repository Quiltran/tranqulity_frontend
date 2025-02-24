<script lang="ts">
	import { createGuild } from '$lib/requests/guilds';
	import { authStore } from '$lib/stores/auth.svelte';
	import { guildStore } from '$lib/stores/guild.svelte';
	import StyledButton from '../styledButton.svelte';
	import StyledInput from '../styledInput.svelte';
	import Modal from './modal.svelte';

	let { closeCallback }: { closeCallback: () => void } = $props();

	let guildName = $state('');
	let guildDescription = $state('');

	function submitNewGuild() {
		createGuild(guildName, guildDescription, authStore.authState?.token ?? '')
			.then((guild) => {
				guildStore.guildState.guilds.push(guild);
				closeCallback();
			})
			.catch((err) => {
				alert('An error occurred while creating your guild.');
				console.error(err);
			});
	}
</script>

<Modal {closeCallback} >
    <h2 class="text-xl">Create Guild</h2>
    <div class="grid grid-cols-1 gap-2">
        <div class="flex flex-col">
            <label for="newGuildName">Name</label>
            <StyledInput type="text" bind:value={guildName} name="newGuildName" />
        </div>
        <div class="flex flex-col">
            <label for="newGuildDescription">Description</label>
            <StyledInput type="text" bind:value={guildDescription} name="newGuildDescription" />
        </div>
        <div class="flex justify-around gap-4">
            <StyledButton text="submit" onclick={submitNewGuild} />
            <StyledButton text="cancel" onclick={closeCallback} />
        </div>
    </div>
</Modal>