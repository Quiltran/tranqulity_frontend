<script lang="ts">
	import { getMessages } from '$lib/requests/channels';
	import { authStore } from '$lib/stores/auth.svelte';
	import { guildStore } from '$lib/stores/guild.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { websocketStore } from '$lib/stores/websocket.svelte';
	import { tick } from 'svelte';
	import MessageElement from './message.svelte';
	import Paperclip from '$lib/svgs/paperclip.svelte';

	let selectedChannel = $derived(guildStore.guildState.currentChannel);
	let selectedGuild: Guild | null = $derived(guildStore.guildState.currentGuild);

	let stopFetching = false;
	let messages = $state<Message[]>([]);
	let message = $state<string>('');
	let pageNumber = $state(0);
	let scrollElement = $state<HTMLDivElement>();
	let fetchElement = $state<HTMLDivElement | null>(null);
	let messageBox = $state<HTMLTextAreaElement>();
	let fileElement = $state<HTMLInputElement>();
	let debouncer = $state(false);
	let submitted = $state(false);

	let selectedFileCount = $state(0);

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		sendMessage();
	}
	async function sendFiles() {
		try {
			let output: number[] = [];
			if (!fileElement || !fileElement.files) return;
			for (let file of fileElement.files) {
				let formData = new FormData();
				formData.append('name', file.name);
				formData.append('file', file);

				let response = await fetch(`${import.meta.env.VITE_API_URL}/api/attachment`, {
					method: 'POST',
					headers: {
						authorization: `Bearer ${authStore.authState?.token ?? ''}`
					},
					body: formData
				});
				if (!response.ok) {
					alert('An error occurred while uploading your attachments.');
					throw new Error('Unable to upload attachments.');
				}

				if (response.status !== 201) {
					alert('The server responded with an error while uploading your attachment.');
					throw new Error('Unable to upload attachments.');
				}

				let data = (await response.json()) as Attachment;
				output.push(data.id);
			}

			return output;
		} catch (err) {
			console.error(err);
			alert('An error occurred while trying to upload your file.\n' + err);
		}
	}
	async function sendMessage() {
		try {
			if (!selectedChannel?.id) {
				return;
			}
			let attachments = await sendFiles();
			websocketStore.sendMessage(selectedChannel?.id, message, attachments ?? []);
			message = '';
			submitted = true;
		} catch (err) {
			console.error(err);
			alert(err);
		}
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
			if (submitted) {
				tick().then(() => {
					if (scrollElement) {
						scrollElement.scrollTo(0, scrollElement.scrollHeight);
					}
				});
			}
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

	function handleScroll() {
		if (scrollElement && scrollElement.scrollTop <= 10 && !debouncer) {
			loadMoreMessages();
		}
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

	$effect(() => {
		if (scrollElement && scrollElement.scrollTop === 0) {
			loadMoreMessages();
		}
		if (scrollElement) {
			scrollElement.addEventListener('scroll', handleScroll);
		}
		return () => {
			if (scrollElement) {
				scrollElement.removeEventListener('scroll', handleScroll);
			}
		};
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
									ref={fetchElement}
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
			{#if selectedFileCount}
				<div>{selectedFileCount} files selected.</div>
			{/if}
			<form onsubmit={handleSubmit} class="relative flex items-center gap-2 py-4">
				<textarea
					class="h-auto max-h-36 w-full resize-none rounded-2xl border border-accent bg-background p-2 outline-none"
					placeholder="What do you want to say?"
					bind:this={messageBox}
					id="text"
					bind:value={message}
				></textarea>
				<button
					type="button"
					class="peer absolute bottom-full right-0 z-10 aspect-square h-1/2 rounded-2xl bg-primary md:relative md:bottom-0 md:hidden"
				>
					<span>^</span>
				</button>
				<div
					class="invisible absolute -right-4 bottom-full z-20 rounded-xl border border-accent bg-background p-2 opacity-0 transition-all duration-300 peer-focus:visible peer-focus:right-0 peer-focus:opacity-100
						md:visible md:relative md:bottom-0 md:right-0 md:border-none md:p-0 md:opacity-100
					"
				>
					<input
						type="file"
						accept="image/*"
						class="hidden"
						onchange={(e) => (selectedFileCount = e.currentTarget.files?.length || 0)}
						bind:this={fileElement}
					/>
					<button
						type="button"
						class="flex aspect-square h-16 items-center justify-center rounded-2xl bg-secondary"
						onclick={(e) => {
							e.preventDefault();
							fileElement?.click();
						}}
					>
						<Paperclip />
					</button>
				</div>
				<button type="submit" class="aspect-square h-16 rounded-2xl bg-accent"> Send </button>
			</form>
		</main>
	</div>
{:else}
	<div class="flex items-center justify-center">Select a channel to get started.</div>
{/if}
