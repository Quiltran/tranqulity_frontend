<script lang="ts">
	import { browser } from '$app/environment'
	import { turnstileStore } from '$lib/stores/turnstile.svelte';
	import { createEventDispatcher } from 'svelte'
	import { onMount } from 'svelte'

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
    } : {
        fieldName?: string,
        action?: undefined,
        cData?: undefined,
        retryInterval?: number,
        retry?: string,
        theme?: string,
        size?: string,
        forms?: boolean,
        tabIndex?: number
    } = $props();

	const dispatch = createEventDispatcher()

	let mounted = $state(false)
	onMount(() => {
		mounted = true
		return () => {
			mounted = false
		}
	})

	function turnstileCallback() {
        turnstileStore.setTurnstileLoaded(true)
	}

	function error() {
		dispatch('turnstile-error', {})
	}

	function expired() {
		dispatch('turnstile-expired', {})
	}

	function timeout() {
		dispatch('turnstile-timeout', {})
	}

	function callback(token: string) {
		dispatch('turnstile-callback', { token })
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
			})
			return {
				destroy: () => {
					window.turnstile.remove(id)
				}
			}
		} catch (error) {
			console.error(error)
		}
	}
</script>

<svelte:head>
	{#if browser && turnstileStore.turnstileLoaded == false}
		<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" on:load={turnstileCallback} async></script>
	{/if}
</svelte:head>

{#if mounted && turnstileStore.turnstileLoaded}
	{#key fieldName}
		<div use:turnstile></div>
	{/key}
{/if}