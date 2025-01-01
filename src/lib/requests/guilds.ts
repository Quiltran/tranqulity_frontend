export async function getGuilds(token: string) {
    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/guild/`, {
        headers: {
            authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        console.error(response.status, response.statusText);
        Promise.reject("An error occurred while collecting your guilds.");
    }
    let data = await response.json();
    return data as Guild[]
}