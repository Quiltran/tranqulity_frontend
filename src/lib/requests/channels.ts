export async function getMessages(guildId: string, channelId: string, pageNumber: number, token: string) {
    let response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/guild/${guildId}/channel/${channelId}/message/page/${pageNumber}`,
        {
            headers: {
                authorization: `Bearer ${token}`
            }
        }
    );
    if (!response.ok) {
        console.error(response.status, response.statusText);
        Promise.reject("An error occurred while getting messages.");
    }
    let data = await response.json();
    return data as Message[];
}