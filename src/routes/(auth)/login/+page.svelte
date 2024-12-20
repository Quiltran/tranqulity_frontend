<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth.svelte';
	let username = $state('');
	let password = $state('');

	function login(e: SubmitEvent) {
		e.preventDefault();
		fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				username: `${$state.snapshot(username)}`,
				password: `${$state.snapshot(password)}`
			})
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error('Unable to login.');
				}

				return response.json();
			})
			.then((body) => {
				auth.setAuth(body);
				goto('/');
			})
			.catch((error) => {
				console.error(error);
				alert('Unable to log you in at this time.');
			});
	}
</script>

<div class="flex w-full items-center justify-center">
	<form class="rounded-xl border-2 border-accent p-6" onsubmit={(e) => login(e)}>
		<div class="flex flex-col gap-4 pb-10">
			<h1 class="text-xl font-bold">Login</h1>
			<span class="md:col-span-2">Login to gain full access to Tranquility</span>
		</div>
		<div class="grid gap-5 grid-cols-1 md:grid-cols-2">
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

			<button type="submit" class="md:col-span-2 h-12 rounded-xl bg-primary">Submit</button>
			<div class="md:col-span-2">
				<span>Don't have an account? </span>
				<a href="/register" class="md:col-span-2 text-center text-accent hover:underline"> Sign Up </a>
			</div>
		</div>
	</form>
</div>
