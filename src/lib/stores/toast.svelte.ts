export interface ToastState {
    notifications: ApiNotification[],
}

class ToastStore {
    toastState = $state<ToastState>({
        notifications: []
    })

    constructor() { }

    addNotification(notification: ApiNotification) {
        this.toastState.notifications.push(notification)
        console.log(this.toastState)
    }

    removeNotification(notification: ApiNotification) {
        this.toastState.notifications = this.toastState.notifications.filter((x) => x != notification);
        console.log(this.toastState)
    }
}

export const toastStore = new ToastStore();