/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;

const ASSETS = [
    ...build,
    ...files
];

self.addEventListener('install', (event) => {
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);
    }

    event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
    }

    event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    async function respond() {
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);

        if (ASSETS.includes(url.pathname)) {
            const response = await cache.match(url.pathname);
            if (response) {
                return response;
            }
        }

        try {
            const response = await fetch(event.request);

            if (!(response instanceof Response)) {
                throw new Error('invalid response from fetch');
            }

            if (response.status === 200) {
                cache.put(event.request, response.clone());
            }

            return response;
        } catch (err) {
            const response = await cache.match(event.request);

            if (response) {
                return response;
            }

            throw err;
        }
    }

    event.respondWith(respond());
});


self.addEventListener("push", (event) => {
    try {
        let data = event.data.json();
        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: data.icon || "/favicon.png", // Default icon
                tag: data.tag || "push-notification",
                vibrate: [100, 50, 100], // Vibration pattern
                data: data, // Store URL for click event
                actions: data.actions
            })
        );
    } catch (e) {
        console.error('Error showing notifications:', e)
    }
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close()

    const data = event.notification.data;

    if (data && data.url) {
        event.waitUntil(
            clients.openWindow(data.url)
        );
    } else {
        event.waitUntil(
            clients.openWindow('/')
        )
    }
});