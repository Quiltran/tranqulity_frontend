<script lang="ts">
	import { goto } from '$app/navigation';
	import Turnstile from '$lib/components/turnstile.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { turnstileStore } from '$lib/stores/turnstile.svelte';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (authStore.isAuthenticated()) {
			goto('/');
		}
	})

	$effect(() => {
		if (turnstileStore.isExpired() || turnstileStore.isTimeout()) {
			alert('Turnstile returned an error of some kind.');
			location.reload();
		}
	})

	function register() {
		submitting = true;
		if (!turnstileStore.token()) {
			alert('Please wait until turnstile is done validating your session.')
			submitting = false;
			return;
		}
		authStore.register(username, email, password, confirmPassword, turnstileStore.token())
		.then(() => goto('/'))
		.catch((err: Error) => {
			alert(err.message)
			location.reload();
		})
		.finally(() => {
			submitting = false;
		});
	}
</script>

<div class="flex h-full w-full items-center justify-center">
	<form class="rounded-xl border-2 border-accent p-6" onsubmit={(e) => e.preventDefault()}>
		<div class="flex flex-col gap-4 pb-10">
			<h1 class="text-xl font-bold">Register</h1>
			<span class="md:col-span-2">Register to gain full access to Quiltran</span>
		</div>
		<div class="grid gap-5 md:grid-cols-2">
			<label for="username" class="flex flex-col">
				Username
				<input
					type="text"
					name="username"
					bind:value={username}
					class="h-12 rounded-xl border border-accent bg-background p-2"
				/>
			</label>
			<label for="email" class="flex flex-col">
				Email
				<input
					type="text"
					name="email"
					bind:value={email}
					class="h-12 rounded-xl border border-accent bg-background p-2"
				/>
			</label>
			<label for="password" class="flex flex-col md:col-span-2 relative">
				Password
				<input
					type="password"
					name="password"
					bind:value={password}
					class="h-12 rounded-xl border border-accent bg-background p-2 peer"
				/>
				<div class="absolute z-10 invisible opacity-0 peer-focus:visible peer-focus:opacity-100 bg-primary p-2 max-w-56 border border-accent rounded-lg transition-opacity duration-300 bottom-full left-0 transform mb-2">
					<span>Passwords require the following:</span>
					<ul class="pl-4">
						<li>Uppercase letter</li>
						<li>Lowercase letter</li>
						<li>A special character</li>
						<li>At least 10 characters long</li>
					</ul>
				</div>
			</label>
			<label for="confirm-password" class="flex flex-col md:col-span-2">
				Confirm Password
				<input
					type="password"
					name="confirm-password"
					bind:value={confirmPassword}
					class="h-12 rounded-xl border border-accent bg-background p-2"
				/>
			</label>

			<button
				type="submit"
				class="h-12 rounded-xl bg-primary md:col-span-2"
				onclick={() => register()}
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
				<span>Already have an account? </span>
				<a href="/login" class="text-center text-accent hover:underline md:col-span-2"> Log In </a>
			</div>
		</div>
		<div class="flex justify-center">
			<Turnstile />
		</div>
	</form>
</div>
