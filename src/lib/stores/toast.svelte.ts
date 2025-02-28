export interface ToastState {
    notifications: WebsocketMessage[],
}

class ToastStore {
    toastState = $state<ToastState>({
        notifications: []
    })

    constructor() { }

    addNotification(notification: WebsocketMessage) {
        this.toastState.notifications.push(notification)
    }

    removeNotification(notification: WebsocketMessage) {
        this.toastState.notifications = this.toastState.notifications.filter((x) => x != notification);
    }
}

export const toastStore = new ToastStore();