import { authStore } from "$lib/stores/auth.svelte";

export async function getMessages(guildId: string, channelId: string, pageNumber: number, token: string) {
    let response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/guild/${guildId}/channel/${channelId}/message/page/${pageNumber}`,
        {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    );
    if (response.status === 401) {
        await authStore.refreshToken();
        return [];
    } else if (!response.ok) {
        console.error(response.status, response.statusText);
        throw new Error("An error occurred while getting messages.");
    }
    let data = await response.json();
    return data as Message[];
}

export async function createChannel(guildId: number, name: string, token: string) {
    let response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/guild/${guildId}/channel`,
        {
            method: "POST",
            headers: {
                authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                "name": name,
                "guild_id": guildId
            })
        }
    );
    if (response.status === 401) {
        await authStore.refreshToken();
        return [];
    } else if (!response.ok) {
        console.error(response.status, response.statusText);
        throw new Error("An error occurred while creating messages.");
    }
    let newChannel = await response.json();
    return newChannel as Channel;
}