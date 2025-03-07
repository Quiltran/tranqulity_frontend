<script lang="ts">
	import StyledButton from '$lib/components/styledButton.svelte';
	import StyledInput from '$lib/components/styledInput.svelte';
	import { getUserProfile } from '$lib/requests/profile';
	import { removeSubscription, subscribeToPush } from '$lib/requests/pushNotifications';
	import { loginWebAuthn, registerWebAuthn } from '$lib/requests/webauthn';
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

	function registerToWebAuthn() {
		registerWebAuthn(authStore.authState?.token ?? '')
			.then(() => {
				alert('WebAuthn has been registered');
			})
			.catch((err) => {
				alert(`An error occurred while registering for WebAuthn: ${err}`);
			});
	}

	function loginToWebAuthn() {
		loginWebAuthn()
			.then(() => {
				alert('Login test was successful.');
			})
			.catch((err) => {
				alert(`An error occurred while logging in with WebAuthn: ${err}`);
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
		<div class="flex max-w-80 flex-col items-center gap-2">
			<h2 class="text-lg font-bold">User Information</h2>
			<div class="grid grid-cols-2">
				<label for="username" class="text-lg font-bold">Username:</label>
				<StyledInput name="username" bind:value={profile.username} type="text" disabled />
				<label for="username" class="text-lg font-bold">Email:</label>
				<StyledInput name="username" bind:value={profile.email} type="text" disabled />
			</div>

			<label for="notification-register" class="text-lg font-bold">Push Notifications</label>
			{#if profile.notification_registered}
				<StyledButton text="Unregister" onclick={unregisterNotifications} />
			{:else}
				<StyledButton text="Register" onclick={registerNotifications} />
			{/if}

			<label for="notification-register" class="text-lg font-bold">Passwordless Login</label>
			<div class="flex flex-col gap-2">
				<StyledButton text="Register" onclick={registerToWebAuthn} />
				<StyledButton text="Test Login" onclick={loginToWebAuthn} />
			</div>
		</div>
	</div>
{/if}
