<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import Turnstile from '$lib/components/turnstile.svelte';
	import { loginWebAuthn } from '$lib/requests/webauthn';
	import { authStore } from '$lib/stores/auth.svelte';
	import { turnstileStore } from '$lib/stores/turnstile.svelte';
	let username = $state('');
	let password = $state('');
	let submitting = $state(false);
	let hasWebauthnCredential = $state(false);

	$effect(() => {
		if (authStore.isAuthenticated()) {
			goto('/');
		}
	});

	$effect(() => {
		if (!browser) {
			return;
		}
		if (!('PublicKeyCredential' in window)) {
			return;
		}

		navigator.credentials
			.get({
				publicKey: {
					challenge: new Uint8Array(32),
					allowCredentials: [],
					userVerification: 'discouraged'
				},
				mediation: 'silent'
			})
			.then((credential) => {
				if (credential) {
					hasWebauthnCredential = true;
				}
			})
			.catch((error) => {
				if (error.name === 'NotAllowedError') {
					console.log(`WebAuthn access denied or no credentials: ${error}`);
					return;
				}
			});
	});

	$effect(() => {
		if (hasWebauthnCredential && turnstileStore.token()) {
			loginWebAuthn()
				.then((creds) => {
					authStore.authState = creds;
				})
				.catch((err) => {
					console.error(err);
					alert(
						'An error occurred while logging you in using your device credential. Please log in using your username/password.'
					);
					hasWebauthnCredential = false;
				});
		}
	});

	$effect(() => {
		if (turnstileStore.isExpired() || turnstileStore.isTimeout()) {
			alert('Turnstile returned an error of some kind.');
			location.reload();
		}
	});

	function login() {
		submitting = true;
		if (!turnstileStore.token()) {
			alert('Please wait until turnstile is done validating your session.');
			submitting = false;
			return;
		}
		authStore
			.login(username, password, turnstileStore.token())
			.then(() => goto('/'))
			.catch((err: Error) => {
				alert(err.message);
				location.reload();
			});
	}
</script>

<div class="flex h-full w-full items-center justify-center">
	<form class="rounded-xl border-2 border-accent p-6" onsubmit={(e) => e.preventDefault()}>
		<div class="flex flex-col gap-4 pb-10">
			<h1 class="text-xl font-bold">Login</h1>
			<span class="md:col-span-2">Login to gain full access to Quiltran</span>
		</div>
		<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
			{#if !hasWebauthnCredential}
				<label for="username" class="flex flex-col">
					Username
					<input
						type="text"
						name="username"
						bind:value={username}
						class="h-12 rounded-xl border border-accent bg-background p-2"
					/>
				</label>
				<label for="username" class="flex flex-col">
					Password
					<input
						type="password"
						name="password"
						bind:value={password}
						class="h-12 rounded-xl border border-accent bg-background p-2"
					/>
				</label>

				<button
					type="submit"
					class="h-12 rounded-xl bg-primary md:col-span-2"
					onclick={() => login()}
				>
					{#if submitting}
						<div
							class="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
							role="status"
						>
							<span
								class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
							>
								Loading...</span
							>
						</div>
					{:else}
						Submit
					{/if}
				</button>
				<div class="md:col-span-2">
					<span>Don't have an account? </span>
					<a href="/register" class="text-center text-accent hover:underline md:col-span-2">
						Sign Up
					</a>
				</div>
			{:else}
				<div class="flex justify-center font-bold md:col-span-2">
					We've detected you've registered a credential with your device.
				</div>
				<div class="flex justify-center pb-5 md:col-span-2">
					Please wait for Turnstile to verify and we'll log you in.
				</div>
			{/if}
		</div>
		<div class="flex justify-center">
			<Turnstile />
		</div>
	</form>
</div>
