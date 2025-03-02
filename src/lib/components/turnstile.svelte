<script lang="ts">
	import { browser } from '$app/environment';
	import { turnstileStore } from '$lib/stores/turnstile.svelte';
	import { onMount } from 'svelte';

	const {
		fieldName = 'token',
		action,
		cData,
		retryInterval = 8000,
		retry = 'auto',
		theme = 'auto',
		size = 'normal',
		forms = true,
		tabIndex = 0
	}: {
		fieldName?: string;
		action?: undefined;
		cData?: undefined;
		retryInterval?: number;
		retry?: string;
		theme?: string;
		size?: string;
		forms?: boolean;
		tabIndex?: number;
	} = $props();

	let mounted = $state(false);
	let nonce = 
	onMount(() => {
		mounted = true;
		return () => {
			mounted = false;
		};
	});

	function turnstileCallback() {
		turnstileStore.setLoaded(true);
	}

	function error() {
		turnstileStore.setError(true);
	}

	function expired() {
		turnstileStore.setExpired(true);
	}

	function timeout() {
		turnstileStore.setTimeout(true);
	}

	function callback(token: string) {
		turnstileStore.setToken(token);
	}

	const turnstile = (node: HTMLElement) => {
		try {
			const id = window.turnstile.render(node, {
				sitekey: import.meta.env.VITE_SITE_KEY,
				'response-field-name': fieldName,
				'timeout-callback': timeout,
				'expired-callback': expired,
				'error-callback': error,
				callback,
				'retry-interval': retryInterval,
				'response-field': forms,
				tabindex: tabIndex,
				action,
				retry,
				theme,
				cData,
				size
			});
			return {
				destroy: () => {
					window.turnstile.remove(id);
				}
			};
		} catch (error) {
			console.error(error);
		}
	};
</script>

<svelte:head>
	{#if browser && turnstileStore.isLoaded() == false}
		<script
			src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
			onload={turnstileCallback}
			async
		></script>
	{/if}
</svelte:head>

{#if mounted && turnstileStore.isLoaded()}
	{#key fieldName}
		<div use:turnstile></div>
	{/key}
{/if}
