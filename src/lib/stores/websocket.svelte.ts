import { authStore } from "./auth.svelte";

export interface WebsocketCallbackProps {
    failCallback: () => void;
    disconnectCallback?: (retryCount: number) => Promise<string>;
    reconnectCallback: () => void;
    messageReceivedCallback: (message: WebsocketMessage) => void;
}

class WebsocketStore {
    private ws = $state<WebSocket | null>(null);
    private url: string = `${import.meta.env.VITE_WS_URL}/ws`;
    private options = $state<WebsocketCallbackProps | null>(null);
    private pingTimeout: number = 0;
    private retryTries: number = 0;
    private maxRetry: number = 5;
    private disconnectCallback = async () => {
        if (this.options?.disconnectCallback) this.options.disconnectCallback(this.retryTries);
		await authStore.refreshToken();
		if (!authStore.authState?.websocket_token) {
			throw new Error('Unable to get new websocket token.');
		}
    }

    maxRetryAttempts() {
        return this.maxRetry;
    }

    connect(options: WebsocketCallbackProps) {
        if (this.ws && (this.ws.readyState == this.ws.OPEN || this.ws.readyState == this.ws.CONNECTING)) {
            return;
        };
        if (!this.options) this.options = options;

        if (!authStore.authState) {
            throw new Error("User is not authenticated cannot connect to websocket");
        }

        this.ws = new WebSocket(`${this.url}/${authStore.authState.id}/${authStore.authState.websocket_token}`);

        this.ws.onopen = () => {
            this.options?.reconnectCallback();
            this.retryTries = 0;

            console.log("starting timeout")
            this.pingTimeout = setInterval(() => {
                console.log("timeout")
                this.ws?.send(JSON.stringify({ "type": "Ping" }))
            }, 5000);
        }

        this.ws.onclose = async () => {
            clearInterval(this.pingTimeout);
            if (this.ws?.readyState == this.ws?.OPEN) {
                return;
            }

            this.retryTries += 1;
            if (this.retryTries == this.maxRetry) {
                this.options?.failCallback();
                this.disconnect();
                return;
            }

            try {
                await this.disconnectCallback();
            } catch (err) {
                return;
            }
        }

        this.ws.onmessage = (event) => {
            console.log("HIT", event);
            const data = JSON.parse(event.data);
            console.log(data)
            this.options?.messageReceivedCallback(data);
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            clearInterval(this.pingTimeout);
        }
    }

    sendMessage(channelId: number, content: string, attachments: number[]) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: "message",
                data: {
                    channel_id: channelId,
                    content,
                    attachment_ids: attachments,
                }
            }));
        } else {
            console.log(this.ws?.readyState)
        }
    }

    setOptions(options: WebsocketCallbackProps) {
        this.options = options;
    }

    setMessageOption(messageCallback: WebsocketCallbackProps["messageReceivedCallback"]) {
        if (!this.options) {
            this.options = {
                messageReceivedCallback: messageCallback,
                failCallback: () => {},
                disconnectCallback: () => new Promise(() => ""),
                reconnectCallback: () => {},
            }
            return;
        }
        this.options.messageReceivedCallback = messageCallback
    }
}

export const websocketStore = new WebsocketStore();