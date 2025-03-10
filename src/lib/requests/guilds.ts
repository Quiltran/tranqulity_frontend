import { authStore } from "$lib/stores/auth.svelte";

export async function createGuild(guildName: string, description: string, token: string) {
    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/guild`, {
        method: "POST",
        headers: {
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            "name": guildName,
            "description": description,
        })
    })
    if (response.status === 401) {
        await authStore.refreshToken();
        return [];
    } else if (!response.ok) {
        console.error(response.status, response.statusText);
        throw new Error("An error occurred while creating your guild.");
    }

    let data = await response.json();
    return data as Guild
}