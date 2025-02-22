export interface WebSocketClientProps {
    userId: string;
    token: string;
};
export interface WebsocketCallbackProps {
    failCallback: () => void;
    disconnectCallback: () => Promise<string>;
    reconnectCallback: () => void;
    messageReceivedCallback: (message: WebsocketMessage) => void;
}

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private failCallback: () => void;
    private disconnectCallback: () => Promise<string>;
    private reconnectCallback: () => void;
    private messageReceivedCallback: (message: WebsocketMessage) => void;
    private pingTimeout: number;

    constructor(private readonly baseUrl: string, { failCallback, disconnectCallback, reconnectCallback, messageReceivedCallback }: WebsocketCallbackProps) {
        this.failCallback = failCallback;
        this.disconnectCallback = disconnectCallback;
        this.reconnectCallback = reconnectCallback;
        this.messageReceivedCallback = messageReceivedCallback;
        this.pingTimeout = 0;
    }

    async connect(userId: number, token: string) {
        console.log("Connecting with", userId, token);
        this.ws = new WebSocket(`${this.baseUrl}/${userId}/${token}`);

        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            this.reconnectCallback();

            this.pingTimeout = setInterval(() => {
                this.ws?.send(JSON.stringify({"type": "Ping"}))
                console.log("PING")
            }, 5000);
        }

        this.ws.onclose = async (event) => {
            clearInterval(this.pingTimeout);
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                if (this.ws?.readyState == this.ws?.OPEN) {
                    return;
                }
                let newToken = '';
                try {
                    newToken = await this.disconnectCallback();
                    console.log("setting config token:", newToken)
                }
                catch (err) {
                    alert(err);
                    this.failCallback();
                    return;
                }
                this.reconnectAttempts++;
                setTimeout(() => {
                    this.connect(userId, newToken)
                }, 1000 * this.reconnectAttempts);
            } else {
                this.failCallback();
                this.disconnect();
            }
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.messageReceivedCallback(data);
            console.log(data);
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            clearInterval(this.pingTimeout)
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
        }
    }
}