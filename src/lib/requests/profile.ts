import { authStore } from "$lib/stores/auth.svelte";

export async function getUserProfile(token: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: {
            authorization: `Bearer ${token}`
        }
    });
    if (response.status === 401) {
        await authStore.refreshToken();
        return {} as Profile;
    } else if (!response.ok) {
        console.error(response.status, response.statusText);
        throw new Error("an error occurred while getting profile")
    }
    let data = await response.json();
    return data as Profile;
}