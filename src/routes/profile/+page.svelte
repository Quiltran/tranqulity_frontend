<script lang="ts">
	import StyledButton from '$lib/components/styledButton.svelte';
	import StyledInput from '$lib/components/styledInput.svelte';
	import { getUserProfile } from '$lib/requests/profile';
	import { removeSubscription, subscribeToPush } from '$lib/requests/pushNotifications';
	import { authStore } from '$lib/stores/auth.svelte';

	let error = $state<string | null>(null);
	let profile = $state<Profile | null>(null);

	function unregisterNotifications() {
		removeSubscription(authStore.authState?.token ?? '').then(() => {
			alert("You've been unregistered to push notifications.");
			if (profile) {
				profile.notification_registered = false;
			}
		});
	}

	function registerNotifications() {
		subscribeToPush(authStore.authState?.token ?? '').then(() => {
			alert("You've been registered to push notifications.");
			if (profile) {
				profile.notification_registered = true;
			}
		});
	}

	$effect(() => {
		getUserProfile(authStore.authState?.token ?? '')
			.then((data) => (profile = data))
			.catch((err) => {
				console.error(err);
				error =
					'An error occurred while collecting your profile information. Pleas try again alter.';
			});
	});
</script>

{#if error}
	<span>{error}</span>
{:else if !profile}
	<span>No profile information</span>
{:else}
	<div class="md:p-10">
		<div class="grid max-w-80 grid-cols-2 items-center gap-2">
			<label for="username" class="text-lg font-bold">Username:</label>
			<StyledInput name="username" bind:value={profile.username} type="text" disabled />
			<label for="username" class="text-lg font-bold">Email:</label>
			<StyledInput name="username" bind:value={profile.email} type="text" disabled />

			<label for="notification-register" class="text-lg font-bold">Notification Register:</label>
			{#if profile.notification_registered}
				<StyledButton text="Unregister" onclick={unregisterNotifications} />
			{:else}
				<StyledButton text="Register" onclick={registerNotifications} />
			{/if}
		</div>
	</div>
{/if}
