import { useEffect, useMemo, useState } from "react";
import { sendMessage } from "../api";
import Guides from "../Guides.jsx";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=800&q=80",
];

function scrollToId(id) {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function MainPage({ onOpenListing, onOpenArticle, user }) {
    const [filters, setFilters] = useState({
        q: "",
        type: "all",
        roomsMin: "",
        roomsMax: "",
        priceMin: "",
        priceMax: "",
        sort: "newest",
    });

    const [rawItems, setRawItems] = useState([]);
    const [status, setStatus] = useState("idle"); // idle | loading | error
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null); // used when no onOpenListing is provided
    const [page, setPage] = useState(1);
    const pageSize = 9;

    const queryString = useMemo(() => {
        const p = new URLSearchParams();
        if (filters.q.trim()) p.set("q", filters.q.trim());
        if (filters.type !== "all") p.set("property_type", filters.type);

        const roomsMin = toNumber(filters.roomsMin);
        const roomsMax = toNumber(filters.roomsMax);
        const priceMin = toNumber(filters.priceMin);
        const priceMax = toNumber(filters.priceMax);

        if (roomsMin != null) p.set("rooms_min", String(roomsMin));
        if (roomsMax != null) p.set("rooms_max", String(roomsMax));
        if (priceMin != null) p.set("price_min", String(priceMin));
        if (priceMax != null) p.set("price_max", String(priceMax));

        if (filters.sort) p.set("sort", filters.sort);
        return p.toString();
    }, [filters]);

    useEffect(() => {
        let ignore = false;
        async function load() {
            setStatus("loading");
            setError("");
            try {
                const res = await fetch(`${API}/listings?${queryString}`);
                if (!res.ok) {
                    const text = await res.text().catch(() => "");
                    throw new Error(`API ${res.status}: ${text || "Request failed"}`);
                }
                const data = await res.json();
                if (!ignore) {
                    const raw = Array.isArray(data) ? data : data?.listings ?? [];
                    const normalized = raw.map((item, idx) => normalizeListing(item, idx));
                    setRawItems(normalized);
                    setStatus("idle");
                }
            } catch (e) {
                if (!ignore) {
                    setStatus("error");
                    setError(e?.message || "Failed to load listings");
                    setRawItems([]);
                }
            }
        }
        load();
        return () => {
            ignore = true;
        };
    }, [queryString]);

    // Reset to first page when filters change
    useEffect(() => {
        setPage(1);
    }, [filters.q, filters.type, filters.roomsMin, filters.roomsMax, filters.priceMin, filters.priceMax, filters.sort]);

    const items = useMemo(() => {
        let list = rawItems;
        const q = filters.q.trim().toLowerCase();
        if (q) {
            list = list.filter((it) => {
                const hay = [
                    it.address,
                    it.city,
                    labelType(it.property_type),
                    it.description,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return hay.includes(q);
            });
        }
        if (filters.type && filters.type !== "all") {
            list = list.filter((it) => {
                const t = labelType(it.property_type).toLowerCase();
                if (filters.type === "apartment") return t === "apartment";
                if (filters.type === "house") return t === "house";
                if (filters.type === "townhouse") return t === "townhouse";
                if (filters.type === "plot") return t === "plot";
                return true;
            });
        }
        const rMin = toNumber(filters.roomsMin);
        const rMax = toNumber(filters.roomsMax);
        const pMin = toNumber(filters.priceMin);
        const pMax = toNumber(filters.priceMax);
        if (rMin != null) list = list.filter((it) => it.rooms >= rMin);
        if (rMax != null) list = list.filter((it) => it.rooms <= rMax);
        if (pMin != null) list = list.filter((it) => it.price >= pMin);
        if (pMax != null) list = list.filter((it) => it.price <= pMax);

        if (filters.sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
        else if (filters.sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
        else if (filters.sort === "area_desc") list = [...list].sort((a, b) => b.living_area - a.living_area);

        return list;
    }, [rawItems, filters]);

    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const pagedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleDetails = (listing) => {
        if (onOpenListing) {
            onOpenListing(listing);
        } else {
            setSelected(listing);
        }
    };

    return (
        <div className="mh-page">
            <div
                className="mh-hero hero-large"
                style={{
                    backgroundImage:
                        "linear-gradient(180deg, rgba(15,61,60,0.55) 0%, rgba(15,61,60,0.78) 40%, rgba(15,61,60,0.82) 100%), url('https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80')",
                }}
            >
                <div className="mh-heroContent">
                    <p className="mh-eyebrow">Moonhem · Premium Realty</p>
                    <h1>Real estate innovators under the moonlight.</h1>
                    <p className="mh-muted">
                        Discover curated listings across Sweden, from waterfront villas to city apartments. Filter, save,
                        and connect with agents instantly.
                    </p>
                    <div className="mh-searchWrap wide glass">
                        <input
                            className="mh-search"
                            placeholder="Search city, address, area..."
                            value={filters.q}
                            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                        />
                        <button className="mh-pill" type="button" onClick={() => setFilters((f) => ({ ...f, q: f.q.trim() }))}>
                            Search
                        </button>
                    </div>
                    <div className="mh-heroPills">
                        <button className="mh-chip mh-chipActive" type="button" onClick={() => scrollToId("listings")}>
                            For sale
                        </button>
                        <button className="mh-chip" type="button" onClick={() => scrollToId("articles")}>
                            Sold prices
                        </button>
                        <button className="mh-chip" type="button" onClick={() => scrollToId("agents-section")}>
                            Find agents
                        </button>
                    </div>
                </div>
                <div className="mh-heroBadge">
                    <div className="mh-heroNumber">{items.length}</div>
                    <div className="mh-muted">Homes available</div>
                </div>
            </div>

            <div className="mh-inlineFilters">
                <input
                    className="mh-input"
                    placeholder="Area or address"
                    value={filters.q}
                    onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                />
                <select
                    className="mh-input"
                    value={filters.type}
                    onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                >
                    <option value="all">Alla typer</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="plot">Plot</option>
                </select>
                <input
                    className="mh-input"
                    placeholder="Price min"
                    inputMode="numeric"
                    value={filters.priceMin}
                    onChange={(e) => setFilters((f) => ({ ...f, priceMin: e.target.value }))}
                />
                <input
                    className="mh-input"
                    placeholder="Price max"
                    inputMode="numeric"
                    value={filters.priceMax}
                    onChange={(e) => setFilters((f) => ({ ...f, priceMax: e.target.value }))}
                />
                <button className="mh-btn" type="button" onClick={() => setFilters((f) => ({ ...f, q: f.q.trim() }))}>
                    Find homes
                </button>
            </div>

            <div className="mh-featureStrip">
                <div className="mh-featureCard">
                    <div className="mh-featureTitle">Map & alerts</div>
                    <div className="mh-muted">Combine filters with map view for the right spot.</div>
                </div>
                <div className="mh-featureCard">
                    <div className="mh-featureTitle">Agent contact</div>
                    <div className="mh-muted">Send messages straight from the listing.</div>
                </div>
                <div className="mh-featureCard">
                    <div className="mh-featureTitle">Quick filters</div>
                    <div className="mh-muted">Adjust type, price, and rooms in one click.</div>
                </div>
            </div>

            <div className="mh-main single-column">
                <section className="mh-results" id="listings">
                    <div className="mh-resultsHead">
                        <div>
                            <h2>Homes for sale</h2>
                            <div className="mh-muted">
                                {status === "loading" ? (
                                    <>Loading…</>
                                ) : (
                                    <>
                                        Showing <b>{items.length}</b> results
                                    </>
                                )}
                            </div>

                            {status === "error" && (
                                <div style={{ marginTop: 8, color: "crimson", fontWeight: 700 }}>
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="mh-viewToggles">
                            <span className="mh-chip mh-chipActive">List</span>
                        </div>
                    </div>

                    <div className="mh-grid">
                        {pagedItems.map((x) => (
                            <ListingCard key={x.id} item={x} onDetails={() => handleDetails(x)} />
                        ))}

                        {status !== "loading" && pagedItems.length === 0 && status !== "error" && (
                            <div className="mh-muted" style={{ marginTop: 10 }}>
                                No results. Try changing filters.
                            </div>
                        )}
                    </div>

                    <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} total={items.length} />
                </section>
            </div>

            <section className="mt-16 mb-12" id="articles">
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-extrabold text-green-900 m-0">Guides & inspiration</h2>
                        <div className="text-muted text-sm mt-1">Short tips to keep buyers informed.</div>
                    </div>
                </div>
                <Guides onOpenArticle={onOpenArticle} />
            </section>

            <footer className="mh-footer">
                <div>
                    <div className="mh-brandRow">
                        <div className="mh-logo small" aria-hidden="true">
                            <img src="/logo-moonhem.png" alt="Moonhem" />
                        </div>
                        <div>
                            <div className="mh-name">MOONHEM</div>
                            <div className="mh-muted">Real Estate</div>
                        </div>
                    </div>
                    <div className="mh-muted">Finding your next home under the moonlight.</div>
                </div>
                <div>
                    <div className="mh-footerTitle">Contact</div>
                    <div className="mh-muted">hello@moonhem.com</div>
                    <div className="mh-muted">+46 70 123 45 67</div>
                </div>
                <div>
                    <div className="mh-footerTitle">Guides</div>
                    <div className="mh-muted">Buying</div>
                    <div className="mh-muted">Selling</div>
                    <div className="mh-muted">Financing</div>
                </div>
                <div>
                    <div className="mh-footerTitle">Follow</div>
                    <div className="mh-muted">@moonhem</div>
                    <div className="mh-muted">Instagram · LinkedIn</div>
                </div>
            </footer>

            {selected && !onOpenListing && (
                <ListingDetails listing={selected} onClose={() => setSelected(null)} user={user} />
            )}
        </div>
    );
}

function ListingCard({ item, onDetails }) {
    const [saved, setSaved] = useState(false);
    const brokerInitial = item.realtor_id ? `R${item.realtor_id}` : "MH";

    return (
        <article className="mh-card">
            <div className="mh-thumb">
                <img
                    src={item.image_url ?? "/placeholder.jpg"}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = "/placeholder.jpg";
                    }}
                />

                <button
                    className="mh-fav"
                    type="button"
                    aria-label={saved ? "Remove from saved" : "Save listing"}
                    onClick={() => setSaved((s) => !s)}
                >
                    {saved ? "♥" : "♡"}
                </button>

                <div className="mh-pillTag">{labelType(item.property_type)}</div>
            </div>

            <div className="mh-cardBody">
                <div className="mh-price" style={{ fontSize: 14, fontWeight: 800 }}>
                    {formatSEK(item.price)}
                </div>
                <div className="mh-meta">
                    {item.rooms} rooms · {item.living_area} m² · {item.city || "—"} · {labelType(item.property_type)}
                </div>
                <div className="mh-addr" style={{ fontSize: 14, fontWeight: 700 }}>
                    {item.address}
                </div>

                <div className="mh-brokerRow">
                    <div className="mh-muted">Moonhem agent</div>
                </div>

                <div className="mh-cardActions">
                    <button className="mh-ghost" type="button" onClick={onDetails}>
                        Details
                    </button>
                    <button className="mh-btn" type="button" onClick={onDetails}>
                        Contact agent
                    </button>
                </div>
            </div>
        </article>
    );
}

function normalizeListing(x, idx = 0) {
    const fallbackImage = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
    return {
        id: x.id ?? x.listing_id ?? cryptoFallbackId(x),
        realtor_id: x.realtor_id ?? x.realtor ?? null,
        address: x.address ?? x.street ?? x.location ?? x.title ?? "Unknown address",
        city: x.city ?? x.municipality ?? x.area ?? x.region ?? x.address_city ?? "",
        price: numberOrZero(x.price ?? x.list_price ?? x.asking_price),
        rooms: numberOrZero(
            x.rooms ?? x.room_count ?? x.number_of_rooms ?? x.rum ?? x.room ?? x.roomcount ?? x.room_count
        ),
        living_area: numberOrZero(x.living_area ?? x.boarea ?? x.area_living ?? x.area),
        lot_size: numberOrZero(x.lot_size ?? x.plot_area ?? x.area_plot),
        year_built: x.year_built ?? x.built_year ?? null,
        description: x.description ?? x.summary ?? "No description added yet.",
        property_type: x.property_type ?? x.property_type_name ?? x.type ?? "home",
        image_url: x.image_url ?? x.cover_image_url ?? x.image ?? x.main_image_url ?? fallbackImage,
    };
}

function formatSEK(n) {
    return new Intl.NumberFormat("sv-SE").format(Number(n || 0)) + " kr";
}

function toNumber(v) {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}

function numberOrZero(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function labelType(t) {
    if (!t) return "Home";
    const s = String(t).toLowerCase();
    if (s.includes("house") || s.includes("villa")) return "House";
    if (s.includes("apartment") || s.includes("lägenhet")) return "Apartment";
    if (s.includes("town")) return "Townhouse";
    if (s.includes("plot") || s.includes("tomt")) return "Plot";
    return "Home";
}

function cryptoFallbackId(x) {
    return `tmp_${Math.abs(hash(JSON.stringify(x)))}`;
}

function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
    return h | 0;
}

function ListingDetails({ listing, onClose, user }) {
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("idle"); // idle | sending | error | sent
    const [error, setError] = useState("");

    const handleSend = async (e) => {
        e.preventDefault();
        if (!user) {
            setError("Please log in to send a message.");
            return;
        }
        if (!listing?.realtor_id) {
            setError("No realtor attached to this listing.");
            return;
        }
        if (!message.trim()) return;

        setStatus("sending");
        setError("");
        try {
            await sendMessage({
                sender_id: user.id,
                receiver_id: listing.realtor_id,
                listing_id: listing.id,
                content: message.trim(),
            });
            setStatus("sent");
            setMessage("");
        } catch (err) {
            setStatus("error");
            setError(err.message || "Failed to send message");
        } finally {
            setTimeout(() => setStatus("idle"), 1200);
        }
    };

    return (
        <div className="mh-dialogShell" role="dialog" aria-modal="true" aria-label="Listing details">
            <div className="mh-dialog">
                <button className="mh-dialogClose" type="button" onClick={onClose} aria-label="Close details">
                    ×
                </button>
                <div className="mh-dialogBody">
                    <div className="mh-dialogMedia">
                        <img src={listing.image_url} alt="" />
                        <div className="mh-pillTag">{labelType(listing.property_type)}</div>
                    </div>
                    <div className="mh-dialogContent">
                        <div className="mh-price" style={{ fontSize: 24 }}>
                            {formatSEK(listing.price)}
                        </div>
                        <div className="mh-meta" style={{ marginTop: 6 }}>
                            {listing.rooms} rooms · {listing.living_area} m²
                            {listing.lot_size ? ` · Lot ${listing.lot_size} m²` : ""}{" "}
                            {listing.year_built ? `· Built ${listing.year_built}` : ""}
                            {listing.city ? ` · ${listing.city}` : ""}
                        </div>
                        <div className="mh-addr" style={{ fontSize: 18, marginTop: 8 }}>
                            {listing.address} {listing.city ? `, ${listing.city}` : ""}
                        </div>
                        <p className="mh-dialogText">{listing.description}</p>

                        <div className="mh-dialogActions">
                            <button className="mh-ghost" type="button" onClick={onClose}>
                                Close
                            </button>
                        </div>

                        <form className="mh-messageBox" onSubmit={handleSend}>
                            <label className="mh-field" style={{ margin: 0 }}>
                                <span>Message the agent</span>
                                <textarea
                                    className="mh-textarea"
                                    placeholder="Hi, I'm interested in this property. Could we schedule a viewing?"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={3}
                                />
                            </label>
                            {error && <div className="mh-error">{error}</div>}
                            <div className="mh-dialogActions" style={{ marginTop: 8 }}>
                                <button className="mh-btn" type="submit" disabled={status === "sending"}>
                                    {status === "sending"
                                        ? "Sending..."
                                        : status === "sent"
                                            ? "Sent!"
                                            : "Send message"}
                                </button>
                                {!user && (
                                    <div className="mh-muted" style={{ fontSize: 12 }}>
                                        Log in to send messages.
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Pagination({ page, pageCount, onChange, total }) {
    const pages = [];
    for (let i = 1; i <= pageCount; i++) pages.push(i);
    return (
        <div className="mh-pagination">
            <div className="mh-muted">{total} results</div>
            <div className="mh-pageButtons">
                <button className="mh-ghost" type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
                    Prev
                </button>
                {pages.map((p) => (
                    <button
                        key={p}
                        className={`mh-chip ${p === page ? "mh-chipActive" : ""}`}
                        type="button"
                        onClick={() => onChange(p)}
                    >
                        {p}
                    </button>
                ))}
                <button
                    className="mh-ghost"
                    type="button"
                    disabled={page >= pageCount}
                    onClick={() => onChange(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

// Removed placeholder map for now
