import { browser } from "$app/environment";
import { goto } from "$app/navigation";

export interface AuthState {
    id: number | null,
    username: string | null,
    refresh_token: string | null,
    token: string | null,
    websocket_token: string | null,
}

class AuthStore {
    authState = $state<AuthState | null>(null);

    constructor() {
        let auth = browser && localStorage.getItem('auth') || null;
        this.authState = auth && JSON.parse(auth) || null;
   }
    login(username: string, password: string) {
        fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                username, password
            })
        })
            .then((response) => {
                if (!response.ok) {
                    console.error(response.status, response.statusText);
                    return Promise.reject("An error occurred while logging in.")
                }

                return response.json();
            })
            .then((data) => {
                this.authState = data as AuthState;
                localStorage.setItem('auth', JSON.stringify(data));
                goto('/');
            });
    }
    register(username: string, email: string, password: string, confirmPassword: string) {
        fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                username: `${$state.snapshot(username)}`,
                email: `${$state.snapshot(email)}`,
                password: `${$state.snapshot(password)}`,
                confirm_password: `${$state.snapshot(confirmPassword)}`
            })
        })
            .then((response) => {
                if (!response.ok) {
                    console.error(response.status, response.statusText);
                    return Promise.reject("An error occurred while registering you.");
                }

                return response.json()
            })
            .then((data) => {
                this.authState = data as AuthState;
                localStorage.setItem('auth', JSON.stringify(data));
                goto('/');
            });
    }
    logout() {
        localStorage.removeItem('auth');
        this.authState = null;
    }
    isAuthenticated() {
        return Boolean(this.authState);
    }
}

export const authStore = new AuthStore();