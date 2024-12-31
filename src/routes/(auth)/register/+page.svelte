<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	function register(e: SubmitEvent) {
		e.preventDefault();
		authStore.register(username, email, password, confirmPassword);
	}
</script>

<div class="flex w-full items-center justify-center">
	<form class="rounded-xl border-2 border-accent p-6" onsubmit={(e) => register(e)}>
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
			<label for="password" class="flex flex-col md:col-span-2">
				Password
				<input
					type="password"
					name="password"
					bind:value={password}
					class="h-12 rounded-xl border border-accent bg-background p-2"
				/>
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

			<button type="submit" class="h-12 rounded-xl bg-primary md:col-span-2">Submit</button>
			<div class="md:col-span-2">
				<span>Already have an account? </span>
				<a href="/login" class="text-center text-accent hover:underline md:col-span-2"> Log In </a>
			</div>
		</div>
	</form>
</div>
