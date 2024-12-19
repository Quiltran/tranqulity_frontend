export interface WebSocketClientProps {
    userId: string;
    token: string;
    failCallback: () => void;
    disconnectCallback: () => void;
    reconnectCallback: () => void;
};

export class WebSocketClient {
    private baseUrl: string;
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private token: string | null = null;
    private userId: string | null = null;
    private failCallback: () => void;
    private disconnectCallback: () => void;
    private reconnectCallback: () => void;

    constructor(baseUrl: string, { token, userId, failCallback, disconnectCallback, reconnectCallback }: WebSocketClientProps) {
        this.token = token;
        this.baseUrl = baseUrl;
        this.userId = userId;
        this.failCallback = failCallback;
        this.disconnectCallback = disconnectCallback;
        this.reconnectCallback = reconnectCallback;
    }

    connect() {
        if (!this.token) {
            throw new Error("No authentication token available");
        }

        this.ws = new WebSocket(`${this.baseUrl}/${this.userId}/${this.token}`);


        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            this.reconnectCallback();

            this.ws?.send(JSON.stringify({
                data: 'ack'
            }));
        }

        this.ws.onclose = (event) => {
            // this.disconnectCallback();
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                setTimeout(() => {
                    this.connect()
                }, 1000 * this.reconnectAttempts);
            } else {
                // this.failCallback();
            }
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    sendMessage(message: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }
}