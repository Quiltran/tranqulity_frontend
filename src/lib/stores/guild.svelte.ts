export interface GuildState {
    guilds: Guild[],
    currentGuild: Guild | null,
    currentChannel: Channel | null
}

class GuildStore {
    guildState = $state<GuildState>({
        guilds: [],
        currentGuild: null,
        currentChannel: null
    });

    constructor() { }

    async getGuilds(token: string) {
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
        this.guildState = {
            ...this.guildState,
            guilds: data,
        };
    }

    setSelectedGuild(guild: Guild, channel: Channel | null) {
        if (guild.id == this.guildState.currentGuild?.id && channel?.id == this.guildState.currentChannel?.id) {
            return;
        }
        this.guildState = {
            ...this.guildState,
            currentGuild: guild,
            currentChannel: channel
        }
    }
}

export const guildStore = new GuildStore();