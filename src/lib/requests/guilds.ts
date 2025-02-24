export async function getGuilds(token: string) {
    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/guild`, {
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
    if (!response.ok) {
        console.error(response.status, response.statusText);
        Promise.reject("An error occurred while creating your guild.");
    }

    let data = await response.json();
    return data as Guild
}