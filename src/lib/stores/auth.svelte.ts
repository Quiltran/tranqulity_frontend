import { browser } from "$app/environment";
import { writable } from "svelte/store";

export interface AuthState {
    id: number | null,
    username: string | null,
    refresh_token: string | null,
    token: string | null,
    websocket_token: string | null,
}

// class AuthStore {
//     value = $state<AuthState>({ token: null, user: null })
//     #store
//     constructor(token: AuthState['token'], user: AuthState['user']) {
//         this.value = { token: token, user: user };
//         this.#store = writable<AuthState>();
//         this.#store.subscribe(v => this.value = v);
//     }

//     clear() {
//         this.#store.set({ token: null, user: null });
//     }

//     set(state: AuthState) {
//         this.#store.set(state);
//     }
// }

// const authStore = new AuthStore(null, null);
// export { authStore };

function createAuthStore() {
    const initialState: AuthState = browser ? JSON.parse(localStorage.getItem('auth') || '{"token": null, "user": null}') : { token: null, user: null };

    const { subscribe, set } = writable<AuthState>(initialState);

    return {
        subscribe,
        setAuth: (user: AuthState) => {
            set(user);

            if (browser) {
                localStorage.setItem('auth', JSON.stringify(user))
            }
        },
        clear: () => {
            set({
                id: null,
                username: null,
                refresh_token: null,
                token: null,
                websocket_token: null
            });
            if (browser) {
                localStorage.removeItem('auth');
            }
        }
    };
}

export const auth = createAuthStore();