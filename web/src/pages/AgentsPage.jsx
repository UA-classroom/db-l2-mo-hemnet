import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const AVATARS = [
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80",
    "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=240&q=80",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=80",
];

export default function AgentsPage() {
    const [agents, setAgents] = useState([]);
    const [status, setStatus] = useState("idle"); // idle | loading | error
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("");

    useEffect(() => {
        let ignore = false;
        async function load() {
            setStatus("loading");
            setError("");
            try {
                const res = await fetch(`${API}/users`);
                if (!res.ok) {
                    const text = await res.text().catch(() => "");
                    throw new Error(`API ${res.status}: ${text || "Request failed"}`);
                }
                const data = await res.json();
                if (ignore) return;
                const raw = Array.isArray(data) ? data : data?.users ?? [];
                // Realtor role_id seems to be 2 per seed data; filter those primarily
                const normalized = raw
                    .map((u, idx) => normalizeAgent(u, idx))
                    .filter((u) => u.role_id === 2 || u.role === "Realtor" || u.role === "Broker");
                setAgents(normalized.length ? normalized : raw.map((u, idx) => normalizeAgent(u, idx)));
                setStatus("idle");
            } catch (e) {
                if (!ignore) {
                    setStatus("error");
                    setError(e?.message || "Failed to load agents");
                    setAgents([]);
                }
            }
        }
        load();
        return () => {
            ignore = true;
        };
    }, []);

    const filteredAgents = useMemo(() => {
        const q = filter.trim().toLowerCase();
        if (!q) return agents;
        return agents.filter(
            (a) =>
                a.name.toLowerCase().includes(q) ||
                (a.agency || "").toLowerCase().includes(q) ||
                (a.city || "").toLowerCase().includes(q)
        );
    }, [agents, filter]);

    return (
        <div className="mh-page">
            <div className="mh-hero compact">
                <div>
                    <p className="mh-eyebrow">Find an agent</p>
                    <h1>Meet the Moonhem brokers.</h1>
                    <p className="mh-muted">We match you with the best local experts for selling or buying.</p>
                </div>
                <div className="mh-heroStat">
                    <div className="mh-heroNumber">{filteredAgents.length}</div>
                    <div className="mh-muted">Available agents</div>
                </div>
            </div>

            <div className="mh-panel">
                <div className="mh-panelHead">
                    <h3>Agents</h3>
                    <input
                        className="mh-search"
                        style={{ maxWidth: 260 }}
                        placeholder="Filter by name or city"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>

                {status === "error" && <div style={{ color: "crimson", fontWeight: 700 }}>{error}</div>}
                {status === "loading" && <div className="mh-muted">Loading agents…</div>}

                <div className="mh-agentList">
                    {filteredAgents.map((agent) => (
                        <div key={agent.id} className="mh-agentCard">
                            <img className="mh-agentAvatar" src={agent.avatar} alt="" />
                            <div className="mh-agentInfo">
                                <div className="mh-agentName">{agent.name}</div>
                                <div className="mh-muted">{agent.agency || "Moonhem Real Estate"}</div>
                                <div className="mh-agentStats">
                                    <span>{agent.city || "Sweden"}</span>
                                    <span style={{ marginLeft: 8, color: "#888" }}>
                                        {agent.sales ? `${agent.sales} sales` : "Realtor"}
                                    </span>
                                </div>
                                <div className="mh-agentActions stack">
                                    <a className="mh-contactBtn outline" href={`tel:${agent.phone || ""}`}>
                                        {agent.phone || "Phone not listed"}
                                    </a>
                                    <a className="mh-contactBtn primary" href={`mailto:${agent.email || ""}`}>
                                        <span className="mh-contactIcon">✉</span>
                                        Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                    {status === "idle" && filteredAgents.length === 0 && (
                        <div className="mh-muted">No agents found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function normalizeAgent(u, idx = 0) {
    const name = [u.first_name, u.surname].filter(Boolean).join(" ").trim() || "Moonhem Agent";
    return {
        id: u.id ?? idx,
        name,
        email: u.mail ?? u.email ?? "",
        phone: u.phone_number ?? "",
        agency: u.company_name ?? u.agency ?? "",
        city: u.city ?? "",
        sales: u.sales ?? null,
        role_id: u.role_id ?? null,
        role: u.role ?? u.role_name ?? "",
        avatar: AVATARS[idx % AVATARS.length],
    };
}
