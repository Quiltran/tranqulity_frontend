export interface TurnstileState {
    loaded: boolean,
    error: boolean,
    expired: boolean,
    timeout: boolean,
    token: string
}

class TurnstileStore {
    state = $state<TurnstileState>({
        loaded: false,
        error: false,
        expired: false,
        timeout: false,
        token: '',
    });

    constructor() {}

    isLoaded() {
        return this.state.loaded;
    }
    setLoaded(value: boolean) {
        this.state.loaded = value;
    }

    isError() {
        return this.state.error;
    }
    setError(value: boolean) {
        this.state.error = value;
    }

    isExpired() {
        return this.state.expired;
    }
    setExpired(value: boolean) {
        this.state.expired = value;
    }

    isTimeout() {
        return this.state.timeout;
    }
    setTimeout(value: boolean) {
        this.state.timeout = value;
    }

    token() {
        return this.state.token;
    }
    setToken(value: string) {
        this.state.token = value;
    }
}

export const turnstileStore = new TurnstileStore();