const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function fetchListings(params = {}) {
    const qs = new URLSearchParams();

    for (const [k, v] of Object.entries(params)) {
        if (v === "" || v === null || v === undefined || v === "all") continue;
        qs.set(k, v);
    }

    const res = await fetch(`${API}/listings?${qs.toString()}`);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${text || "Request failed"}`);
    }
    return res.json();
}

export async function login(email, password) {
    const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${btoa(`${email}:${password}`)}`,
        },
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Invalid credentials");
    }
    const data = await res.json();
    return data.user;
}

export async function sendMessage({ sender_id, receiver_id, listing_id, content }) {
    const res = await fetch(`${API}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ sender_id, receiver_id, listing_id, content }),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to send message");
    }
    return res.json();
}
