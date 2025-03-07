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
    async login(username: string, password: string, turnstile: string) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                turnstile,
            })
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Invalid credentials were provided.")
            }
            throw new Error("An error occurred while logging you in.")
        }

        const data = await response.json();
        this.authState = data as AuthState;
        localStorage.setItem('auth', JSON.stringify(data));
    }
    async register(username: string, email: string, password: string, confirmPassword: string, turnstile: string) {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirm_password: confirmPassword,
                    turnstile
                })
            });
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("The password you provided did not follow the correct format.");
                }
                throw new Error("An error occurred while registering you.");
            }

            const data = await response.json();
            this.authState = data as AuthState;
            localStorage.setItem('auth', JSON.stringify(data));
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
    async refreshToken() {
        try {
            let refresh_token = this.authState?.refresh_token;
            let response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${this.authState?.token}`,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    "refresh_token": refresh_token
                })
            });

            if (!response.ok) {
                console.error(response.status, response.statusText);
                if (authStore.authState) {
                    throw new Error("An error occurred while refreshing your session. Please log in again.")
                }
                this.logout();
            }
            let data = await response.json() as AuthState;
            this.authState = data;
            localStorage.setItem('auth', JSON.stringify(data));
        } catch (err) {
            console.error(err);
            this.logout()
            alert("An error occurred while refreshing your session. Please log in again.");
        }
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