import { authStore } from "./auth.svelte";

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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/guild`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        });
        if (response.ok) {
            this.guildState = {
                ...this.guildState,
                guilds: await response.json(),
            }
            return;
        } else if (response.status === 401) {
            await authStore.refreshToken();
        } else {
            throw new Error(`Request failed with status: ${response.status}`)
        }
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