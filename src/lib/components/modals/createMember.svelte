<script lang="ts">
	import { createMember, getMembers } from "$lib/requests/member";
	import { authStore } from "$lib/stores/auth.svelte";
    import { guildStore } from "$lib/stores/guild.svelte";
	import StyledButton from "../styledButton.svelte";
import Modal from "./modal.svelte";

    let { closeCallback }: { closeCallback: () => void } = $props();

    let selectedGuild = guildStore.guildState.currentGuild;
    if (!selectedGuild) closeCallback();

    let members = $state<Member[]>([]);
    let selectedMember = $state<Member | null>(null);

    $effect(() => {
        getMembers(authStore.authState?.token ?? "", selectedGuild?.id.toString() ?? "")
        .then((data) => (members = data))
        .catch((err) => {
            console.error(err);
            alert("Something went wrong while collecting members able to be added.");
        });
    })

    function submitAddMember() {
        if (!selectedMember) {
            alert("No member has been selected.");
            return;
        }
        createMember(authStore.authState?.token ?? "", selectedMember.id, selectedGuild?.id ?? -1)
        .then((data) => {
            selectedGuild?.members.push(data)
        })
        .catch((err) => {
            console.error(err);
            alert("Something went wrong while adding member.");
        })
        .finally(closeCallback)
    }
</script>

<Modal {closeCallback}>
    <h2 class="text-xl">Add Member</h2>
    <div class="grid grid-cols-1 gap-2">
        <div class="flex flex-col">
            <label for="memberName">User</label>
            <select name="memberName" class="border border-accent rounded-lg bg-background p-2"
            bind:value={selectedMember}
            >
                <option value={null}>Select member to add</option>
                {#each members as member}
                    <option value={member}>{member.username}</option>
                {/each}
            </select>
        </div>
		<div class="flex justify-around gap-4">
			<StyledButton text="submit" onclick={submitAddMember} />
			<StyledButton text="cancel" onclick={closeCallback} />
		</div>
    </div>
</Modal>