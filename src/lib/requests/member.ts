import { authStore } from "$lib/stores/auth.svelte";

export async function getMembers(token: string, guildId: string) {
    let response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/member?exclude=${guildId}`,
        {
            headers: {
                authorization: `Bearer ${token}`,
            }
        }
    );
    if (response.status === 401) {
        await authStore.refreshToken();
        return [];
    } else if (!response.ok) {
        console.error(response.status, response.statusText);
        Promise.reject("An error occurred while getting members.");
    }
    let data = await response.json();
    return data as Member[];
}

export async function createMember(token: string, userId: number, guildId: number) {
    let response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/guild/${guildId}/member`,
        {
            method: "POST",
            headers: {
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                "user_id": userId,
                "guild_id": guildId,
            })
        }
    );
    if (response.status === 401) {
        await authStore.refreshToken();
        throw new Error("User is not authorized to add member.")
    } else if (!response.ok) {
        console.error(response.status, response.statusText);
        throw new Error("An error occurred whiel adding member: " + response.status)
    }
    let data = await response.json();
    return data as Member;
}