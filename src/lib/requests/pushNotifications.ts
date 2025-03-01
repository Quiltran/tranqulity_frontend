import { browser } from "$app/environment";

export async function subscribeToPush(token: string) {
    if (browser && 'serviceWorker' in navigator) {
        const publicKey = import.meta.env.VITE_VAPID_PUBLIC;

        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
            existingSubscription.unsubscribe();
        }

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        try {
            let resp = await fetch(`${import.meta.env.VITE_API_URL}/api/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${token}`
                },
                body: JSON.stringify(subscription)
            });
            if (!resp.ok) {
                throw new Error("an error occurred while registring for subscribe");
            }
        } catch (error) {
            console.log(error);
            alert("An error occurred while registering you for notifications. Please refresh to try again.")
            registration.pushManager.getSubscription().then((sub) => {
                if (!sub) return;
                sub.unsubscribe();
            });
        }
    } else {
        location.reload();
    }
}

export async function removeSubscription(token: string) {
    try {
        if (browser && 'serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.ready;
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/subscribe`, {
                method: "DELETE",
                headers: {
                    "authorization": `Bearer ${token}`
                }
            })
            if (!resp.ok) {
                throw new Error("an error occurred while unsubscribing");
            }
            const sub = await reg.pushManager.getSubscription()
            if (!sub) return;
            sub?.unsubscribe();
        }
    } catch (err) {
        alert('An error occurred while unregistering push notifications.')
    }
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}