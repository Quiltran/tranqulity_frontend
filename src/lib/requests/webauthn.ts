import { browser } from "$app/environment";

function base64URLToBuffer(base64URL: string) {
    const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    return Uint8Array.from(atob(base64.padEnd(base64.length + padLen, '=')), c => c.charCodeAt(0));
}

function bufferToBase64URL(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);
    let string = '';
    bytes.forEach(b => string += String.fromCharCode(b));

    const base64 = btoa(string);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function registerWebAuthn(token: string) {
    try {
        if (!browser) {
            throw new Error("registration for webauthn was attempted outside of the browser");
        }
        if (!('PublicKeyCredential' in window)) {
            throw new Error("User's browser doesn't support webauthn.")
        }

        const beginResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/webauthn/register/begin`, {
            method: "POST",
            headers: {
                authorization: `Bearer ${token}`,
            }
        });

        if (!beginResponse.ok) {
            throw new Error(`Failed to get webauthn registration options: ${beginResponse.status}`)
        }

        const options = await beginResponse.json();
        options.publicKey.challenge = base64URLToBuffer(options.publicKey.challenge);
        options.publicKey.user.id = base64URLToBuffer(options.publicKey.user.id);

        const credential = await navigator.credentials.create({
            publicKey: options.publicKey
        }) as PublicKeyCredential;
        if (!credential) {
            throw new Error("Failed to create new credential.")
        }

        const pubKeyCred = credential as PublicKeyCredential;
        const attestationResponse = pubKeyCred.response as AuthenticatorAttestationResponse

        const response = {
            id: pubKeyCred.id,
            rawId: bufferToBase64URL(pubKeyCred.rawId),
            type: pubKeyCred.type,
            response: {
                attestationObject: bufferToBase64URL(attestationResponse.attestationObject),
                clientDataJSON: bufferToBase64URL(attestationResponse.clientDataJSON),
            },
        };

        const completeResp = await fetch(`${import.meta.env.VITE_API_URL}/api/webauthn/register/complete`, {
            method: "POST",
            headers: {
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(response)
        });

        if (!completeResp.ok) {
            throw new Error(`Failed to complete registration: ${completeResp.status}`)
        }

        alert('Successfully registered for WebAuthn');
    } catch (err) {
        console.error(err)
        throw err;
    }
}

export async function loginWebAuthn() {
    try {
        if (!browser) {
            throw new Error("registration for webauthn was attempted outside of the browser");
        }

        const beginResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/webauthn/login/begin`, {
                method: "POST",
            }
        );
        if (!beginResponse.ok) {
            throw new Error(`failed to get webauthn login options: ${beginResponse.status}`)
        }

        const options = await beginResponse.json();
        options.publicKey.challenge = base64URLToBuffer(options.publicKey.challenge);

        const credential = await navigator.credentials.get(options) as PublicKeyCredential;
        if (!credential) {
            throw new Error("could not find credential for webauthn login")
        }
        let credResponse = credential.response as AuthenticatorAssertionResponse

        const response = {
            id: credential.id,
            rawId: bufferToBase64URL(credential.rawId),
            type: credential.type,
            response: {
                authenticatorData: bufferToBase64URL(credResponse.authenticatorData),
                clientDataJSON: bufferToBase64URL(credResponse.clientDataJSON),
                signature: bufferToBase64URL(credResponse.signature),
                userHandle: credResponse.userHandle ? bufferToBase64URL(credResponse.userHandle) : null
            }
        }

        const completeResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/webauthn/login/complete`, {
            method: "POST",
            headers: {
                "Session-ID": options.SessionID,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(response)
        })

        if (!completeResponse.ok) {
            throw new Error("failed to complete webauthn login");
        }

        return await completeResponse.json();
    } catch (err) {
        console.error(err)
        throw err;
    }
}