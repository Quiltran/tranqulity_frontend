<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	function login(e: SubmitEvent) {
		e.preventDefault();
		fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				username: `${$state.snapshot(username)}`,
				email: `${$state.snapshot(email)}`,
				password: `${$state.snapshot(password)}`,
				confirm_password: `${$state.snapshot(confirmPassword)}`
			})
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error('Unable to register user.');
				}
				return response.json();
			})
			.then((data) => {
				auth.setAuth(data);
				window.location.href = '/';
			})
			.catch((error) => {
				console.error(error);
				alert('An error occurred while registering user.');
			});
	}
</script>

<div class="flex w-full items-center justify-center">
	<form class="rounded-xl border-2 border-accent p-6" onsubmit={(e) => login(e)}>
		<div class="flex flex-col gap-4 pb-10">
			<h1 class="text-xl font-bold">Register</h1>
			<span class="md:col-span-2">Register to gain full access to Tranquility</span>
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
			<label for="password" class="md:col-span-2 flex flex-col">
				Password
				<input
					type="password"
					name="password"
					bind:value={password}
					class="h-12 rounded-xl border border-accent bg-background p-2"
				/>
			</label>
			<label for="confirm-password" class="md:col-span-2 flex flex-col">
				Confirm Password
				<input
					type="password"
					name="confirm-password"
					bind:value={confirmPassword}
					class="h-12 rounded-xl border border-accent bg-background p-2"
				/>
			</label>

			<button type="submit" class="md:col-span-2 h-12 rounded-xl bg-primary">Submit</button>
			<div class="md:col-span-2">
				<span>Already have an account? </span>
				<a href="/login" class="md:col-span-2 text-center text-accent hover:underline"> Log In </a>
			</div>
		</div>
	</form>
</div>
