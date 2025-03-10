<script lang="ts">
	import H2Separator from '$lib/components/h2Separator.svelte';
	import StyledButton from '$lib/components/styledButton.svelte';
	import StyledInput from '$lib/components/styledInput.svelte';
	import { uploadAttachment } from '$lib/requests/attachment';
	import { getUserProfile } from '$lib/requests/profile';
	import { removeSubscription, subscribeToPush } from '$lib/requests/pushNotifications';
	import { loginWebAuthn, registerWebAuthn } from '$lib/requests/webauthn';
	import { authStore } from '$lib/stores/auth.svelte';
	import Paperclip from '$lib/svgs/paperclip.svelte';

	let error = $state<string | null>(null);
	let profile = $state<Profile | null>(null);
	let searchValue = $state<string>('');
	let profilePictureInput = $state<HTMLInputElement>();

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

	async function updateProfile() {
		let attachment: number | null = null;
		if (!profile) return;
		if (profilePictureInput && profilePictureInput.files && profilePictureInput.files[0]) {
			const response = await uploadAttachment(
				authStore.authState?.token ?? '',
				profilePictureInput.files[0]
			);
			attachment = response.id;
		}
		const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
			method: 'PATCH',
			headers: {
				authorization: `Bearer ${authStore.authState?.token ?? ''}`,
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				username: profile?.username,
				email: profile?.email,
				avatar_id: attachment
			} as Profile)
		});

		if (!resp.ok) {
			alert(`An error occurred while updating profile information: ${resp.status}`);
			return;
		}

		const profileData = await resp.json();
		if (profileData.avatar_url) {
			profileData.avatar_url = `${import.meta.env.VITE_API_URL}${profileData.avatar_url}`;
		}

		profile = profileData;
	}

	$effect(() => {
		getUserProfile(authStore.authState?.token ?? '')
			.then((data) => {
				if (data.avatar_url) {
					data.avatar_url = `${import.meta.env.VITE_API_URL}${data.avatar_url}`;
				}
				profile = data;
			})
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
	<div class="p-3 md:p-10">
		<div class="flex flex-col items-center justify-center gap-2">
			<StyledInput
				name="search"
				bind:value={searchValue}
				type="text"
				placeholder="search"
				classes="w-full mb-8 border-4"
			/>
			<H2Separator labelValue="User Information" />
			<div class="grid grid-cols-2 items-center gap-y-3">
				<label for="profile-picture" class="text-lg font-semibold">Profile Picture:</label>
				<div class="flex justify-center py-2">
					<input
						type="file"
						class="invisible hidden"
						accept="image/*"
						name="profile-picture"
						onchange={(e) => {
							if (!e.currentTarget.files || !e.currentTarget.files[0] || !profile) {
								return;
							}
							const file = e.currentTarget.files[0];

							if (file) {
								try {
									const imageUrl = URL.createObjectURL(file);
									profile.avatar_url = imageUrl;
								} catch (err) {
									console.error(err);
								}
							} else {
								profile.avatar_url = '#';
							}
						}}
						bind:this={profilePictureInput}
					/>
					<button
						type="button"
						class="flex aspect-square h-20 items-center justify-center overflow-clip rounded-full bg-primary"
						onclick={() => {
							profilePictureInput?.click();
						}}
					>
						{#if profile.avatar_url}
							<img class="border-primary h-full aspect-auto" alt="profile" src={profile.avatar_url} />
						{:else}
							<Paperclip classes="size-8" />
						{/if}
					</button>
				</div>
				<label for="username" class="text-lg font-semibold">Username:</label>
				<StyledInput name="username" bind:value={profile.username} type="text" disabled />
				<label for="username" class="text-lg font-semibold">Email:</label>
				<StyledInput name="username" bind:value={profile.email} type="text" disabled />
				<div class="col-span-2 flex justify-center">
					<StyledButton text="Update" onclick={updateProfile} />
				</div>
			</div>

			<H2Separator labelValue="Push Notifications" />
			{#if profile.notification_registered}
				<StyledButton text="Unregister" onclick={unregisterNotifications} />
			{:else}
				<StyledButton text="Register" onclick={registerNotifications} />
			{/if}

			<H2Separator labelValue="Passwordless Login" />
			<div class="flex flex-col gap-2">
				<StyledButton text="Register" onclick={registerToWebAuthn} />
				<StyledButton text="Test Login" onclick={loginToWebAuthn} />
			</div>
		</div>
	</div>
{/if}
