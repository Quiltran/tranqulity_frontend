<script lang="ts">
	import { getMessages } from '$lib/requests/channels';
	import { authStore } from '$lib/stores/auth.svelte';
	import { guildStore } from '$lib/stores/guild.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { websocketStore } from '$lib/stores/websocket.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import MessageElement from './message.svelte';

	let selectedChannel = $derived(guildStore.guildState.currentChannel);
	let selectedGuild: Guild | null = $derived(guildStore.guildState.currentGuild);

	let stopFetching = false;
	let messages = $state<Message[]>([]);
	let message = $state<string>('');
	let pageNumber = $state(0);
	let scrollElement = $state<HTMLDivElement>();
	let fetchElemenet = $state<HTMLDivElement | null>(null);
	let messageBox = $state<HTMLTextAreaElement>();
	let debouncer = $state(false);

	function sendMessage() {
		if (!selectedChannel?.id) {
			return;
		}
		websocketStore.sendMessage(selectedChannel?.id, message, []);
		message = '';
	}
	function showTime(message1: Message, message2: Message) {
		if (message1.author !== message2.author) {
			return true;
		}

		if (
			new Date(message1.updated_date).getTime() - new Date(message2.updated_date).getTime() >
			2000 * 60
		) {
			return true;
		}

		return false;
	}

	function messageReceivedCallback(data: WebsocketMessage) {
		if (data.type == 'message' && (data.data as Message).channel_id === selectedChannel?.id) {
			messages.push(data.data as Message);
		} else {
			toastStore.addNotification(data);
		}
	}
	websocketStore.setMessageOption(messageReceivedCallback);

	async function loadMoreMessages() {
		if (!selectedGuild?.id || !selectedChannel?.id || stopFetching || debouncer) return;

		debouncer = true;

		let previousHeight = 0,
			previousScrollTop = 0;
		if (scrollElement) {
			previousHeight = scrollElement.scrollHeight;
			previousScrollTop = scrollElement.scrollTop;
		}

		const newMessages = await getMessages(
			selectedGuild.id.toString(),
			selectedChannel.id.toString(),
			pageNumber,
			authStore.authState?.token || ''
		);

		if (newMessages.length === 0) {
			stopFetching = true;
		} else {
			pageNumber += 1;
			messages = [...newMessages, ...messages];
		}

		await tick();

		if (scrollElement) {
			scrollElement.scrollTop += scrollElement.scrollHeight - previousHeight;
		}

		debouncer = false;
	}
	$effect(() => {
		if (!messageBox) {
			return;
		}
		messageBox.addEventListener('input', () => {
			messageBox!.style.height = 'auto';
			messageBox!.style.height = messageBox!.scrollHeight + 'px';
		});
	});

	$effect(() => {
		if (selectedChannel?.id) {
			messages = [];
			pageNumber = 0;
			stopFetching = false;
		}
	});

	function handleScroll() {
		if (scrollElement && scrollElement.scrollTop <= 10 && !debouncer) {
			loadMoreMessages();
		}
	}

	$effect(() => {
		if (scrollElement) {
			scrollElement.addEventListener('scroll', handleScroll);
		}
		return () => {
			if (scrollElement) {
				scrollElement.removeEventListener('scroll', handleScroll);
			}
		};
	});

	$effect(() => {
		if (scrollElement && scrollElement.scrollTop === 0) {
			console.log('HIT');
			loadMoreMessages();
		}
		// if (!selectedGuild?.id || !selectedChannel?.id) {
		// 	return;
		// }
		// if (stopFetching) return;
		// let oldFetch = fetchElemenet;
		// getMessages(
		// 	selectedGuild?.id.toString(),
		// 	selectedChannel.id.toString(),
		// 	pageNumber,
		// 	authStore.authState?.token || ''
		// )
		// 	.then((m) => {
		// 		if (m.length == 0) {
		// 			stopFetching = true;
		// 		}
		// 		messages = [...m, ...messages];
		//         return tick()
		// 	})
		//     .then(() => {
		//     })
	});
</script>

{#if selectedGuild && selectedChannel}
	<div class="relative flex h-full flex-row items-stretch justify-stretch px-4 [flex:1_1_auto]">
		<main class="flex flex-col [flex:1_1_auto]" aria-label={selectedChannel.name}>
			<div class="relative z-0 flex [flex:1_1_auto]">
				<div
					bind:this={scrollElement}
					class="absolute bottom-0 left-0 right-0 top-0 overflow-y-auto overflow-x-hidden"
				>
					<div class="flex min-h-full flex-col-reverse [overflow-anchor:none]">
						<ol class="min-h-0 list-none overflow-hidden">
							{#each messages as message, index (message.id)}
								<MessageElement
									{index}
									ref={fetchElemenet}
									{message}
									showFrom={index === 0 || showTime(message, messages[index - 1])}
								/>
							{:else}
								<span>No messages have been posted in this channel yet.</span>
							{/each}
						</ol>
					</div>
				</div>
			</div>
			<div class="flex items-end gap-2 py-4">
				<textarea
					class="h-auto max-h-36 w-full resize-none rounded-2xl border border-accent bg-background p-2 outline-none"
					placeholder="What do you want to say?"
					bind:this={messageBox}
					id="text"
					bind:value={message}
				></textarea>
				<button class="h-16 w-20 rounded-2xl bg-accent" onclick={() => sendMessage()}>
					Send
				</button>
			</div>
		</main>
	</div>
{:else}
	<div class="flex items-center justify-center">Select a channel to get started.</div>
{/if}
