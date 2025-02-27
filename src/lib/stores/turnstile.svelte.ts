class TurnstileStore {
    turnstileLoaded = $state(false);

    constructor() {}

    setTurnstileLoaded(value: boolean) {
        this.turnstileLoaded = value;
    }
}

export const turnstileStore = new TurnstileStore();