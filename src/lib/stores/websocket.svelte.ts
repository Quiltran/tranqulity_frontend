import { authStore } from "./auth.svelte";

export interface WebsocketCallbackProps {
    failCallback: () => void;
    disconnectCallback?: () => Promise<string>;
    reconnectCallback: () => void;
    messageReceivedCallback: (message: WebsocketMessage) => void;
}


class WebsocketStore {
    private ws = $state<WebSocket | null>(null);
    private url: string = "";
    private options = $state<WebsocketCallbackProps | null>(null);
    private pingTimeout: number = 0;
    private retryTries: number = 0;
    private maxRetry: number = 5;
    private disconnectCallback = async () => {
		await authStore.refreshToken();
		if (!authStore.authState?.websocket_token) {
			return Promise.reject('Unable to get new websocket token.');
		}
		return authStore.authState?.websocket_token;
    }

    connect(url: string, userId: number, token: string, options: WebsocketCallbackProps) {
        if (this.ws && (this.ws.readyState == this.ws.OPEN || this.ws.readyState == this.ws.CONNECTING)) {
            return;
        };
        this.url = url;
        if (!this.options) this.options = options;

        this.ws = new WebSocket(`${this.url}/${userId}/${token}`);

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
                return;
            }

            try {
                await this.disconnectCallback();
            } catch (err) {
                this.options?.failCallback();
                this.disconnect();
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
                    // attachments
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