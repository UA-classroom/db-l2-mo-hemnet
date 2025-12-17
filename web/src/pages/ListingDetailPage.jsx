import { useState } from "react";
import { sendMessage } from "../api";

const sample = {
    title: "Lakeside Plot",
    city: "Arvika, Värmland",
    address: "Sjöhaget, Arvika",
    price: 490000,
    property_type: "Plot",
    living_area: 0,
    lot_size: 1148,
    description:
        "Build your dream home in a calm lakeside area near Arvika center. Close to water and nature with easy access to the city.",
    image_url:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1500&q=80",
    agent: {
        name: "Vanessa Wingstrand",
        phone: "+46 70 123 45 67",
        email: "vanessa@moonhem.com",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80",
    },
    realtor_id: 1,
};

export default function ListingDetailPage({ listing, onBack, user }) {
    const l = listing ?? sample;
    const mapQuery = [l.address, l.city].filter(Boolean).join(", ") || "Sweden";
    // Use maps.google.com embed (works without API key); include zoom for clarity.
    const mapSrc = `https://maps.google.com/maps?hl=en&q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=B&output=embed`;
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("idle"); // idle | sending | error | sent
    const [error, setError] = useState("");

    const handleSend = async (e) => {
        e.preventDefault();
        if (!user) {
            setError("Please log in to send a message.");
            return;
        }
        if (!l.realtor_id) {
            setError("No realtor attached to this listing.");
            return;
        }
        if (!message.trim()) return;

        setStatus("sending");
        setError("");
        try {
            await sendMessage({
                sender_id: user.id,
                receiver_id: l.realtor_id,
                listing_id: l.id ?? 0,
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
        <div className="mh-page detail">
            <div className="mh-breadcrumb">
                {onBack && (
                    <button className="mh-link" type="button" onClick={onBack}>
                        ← Back to homepage
                    </button>
                )}
            </div>

            <div className="mh-detailHero">
                <div className="mh-detailMedia">
                    <img src={l.image_url} alt="" />
                    <div className="mh-detailTag">{l.property_type}</div>
                    <div className="mh-detailSave">♡ Save</div>
                </div>
                <div className="mh-detailInfo">
                    <div className="mh-price">{formatSEK(l.price)}</div>
                    <div className="mh-detailMeta">
                        {[
                            l.property_type && { label: "Type", value: l.property_type },
                            l.living_area && { label: "Living", value: `${l.living_area} m²` },
                            l.lot_size && { label: "Lot", value: `${l.lot_size} m²` },
                            l.rooms && { label: "Rooms", value: `${l.rooms}` },
                            l.year_built && { label: "Built", value: l.year_built },
                            l.city && { label: "City", value: l.city },
                        ]
                            .filter(Boolean)
                            .map((item, idx) => (
                                <span key={idx} className="mh-metaPill">
                                    <span className="mh-muted">{item.label}</span> {item.value}
                                </span>
                            ))}
                    </div>
                    <h1 className="mh-detailTitle">{l.title ?? l.address}</h1>
                    <div className="mh-muted">{l.address}</div>
                    <div className="mh-detailAgent">
                        <img className="mh-agentAvatar" src={l.agent?.avatar ?? sample.agent.avatar} alt="" />
                        <div>
                            <div className="mh-agentName">{l.agent?.name ?? sample.agent.name}</div>
                            <div className="mh-muted">Moonhem Real Estate</div>
                        </div>
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
                        <div className="mh-detailActions">
                            <button className="mh-btn" type="submit" disabled={status === "sending"}>
                                {status === "sending"
                                    ? "Sending..."
                                    : status === "sent"
                                      ? "Sent!"
                                      : "Send message"}
                            </button>
                            {!user && <div className="mh-muted" style={{ fontSize: 12 }}>Log in to send messages.</div>}
                        </div>
                    </form>
                </div>
            </div>

            <div className="mh-detailBody">
                <div className="mh-detailSection">
                    <h3>About the home</h3>
                    <p className="mh-dialogText">{l.description ?? sample.description}</p>
                    <button className="mh-ghost" type="button">
                        View full description
                    </button>
                </div>
                <div className="mh-detailSection">
                    <h3>Key figures</h3>
                    <div className="mh-keyGrid">
                        <div>
                            <div className="mh-muted">Price</div>
                            <div className="mh-strong">{formatSEK(l.price)}</div>
                        </div>
                        <div>
                            <div className="mh-muted">Living area</div>
                            <div className="mh-strong">{l.living_area || "—"} m²</div>
                        </div>
                        <div>
                            <div className="mh-muted">Lot</div>
                            <div className="mh-strong">{l.lot_size || "—"} m²</div>
                        </div>
                        <div>
                            <div className="mh-muted">Type</div>
                            <div className="mh-strong">{l.property_type}</div>
                        </div>
                        {l.year_built ? (
                            <div>
                                <div className="mh-muted">Year built</div>
                                <div className="mh-strong">{l.year_built}</div>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="mh-detailSection">
                    <h3>Location</h3>
                    <div className="mh-muted">{mapQuery}</div>
                    <div className="mh-mapEmbed">
                        <iframe
                            title="Listing location"
                            className="mh-mapIframe"
                            src={mapSrc}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                    <a
                        className="mh-link"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ marginTop: 6, display: "inline-block" }}
                    >
                        Open in Google Maps
                    </a>
                </div>
            </div>

            <LoanCalculator price={l.price} />
        </div>
    );
}

function LoanCalculator({ price }) {
    const [downPct, setDownPct] = useState(15);
    const [rate, setRate] = useState(3.5);
    const [years, setYears] = useState(30);

    const principal = Math.max(0, Number(price || 0) * (1 - downPct / 100));
    const monthly = calcMonthly(principal, rate, years);
    const downPayment = Math.max(0, Number(price || 0) * (downPct / 100));

    return (
        <div className="mh-detailSection mh-loanCard">
            <h3>Estimate your loan</h3>
            <div className="mh-loanGrid">
                <label className="mh-field">
                    <span>Home price (SEK)</span>
                    <input
                        className="mh-input"
                        type="number"
                        value={price ?? 0}
                        readOnly
                        style={{ background: "#f5f5f5" }}
                    />
                </label>
                <label className="mh-field">
                    <span>Down payment (%)</span>
                    <input
                        className="mh-input"
                        type="number"
                        min="0"
                        max="100"
                        value={downPct}
                        onChange={(e) => setDownPct(Number(e.target.value) || 0)}
                    />
                </label>
                <label className="mh-field">
                    <span>Interest rate (%)</span>
                    <input
                        className="mh-input"
                        type="number"
                        min="0"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value) || 0)}
                    />
                </label>
                <label className="mh-field">
                    <span>Term (years)</span>
                    <input
                        className="mh-input"
                        type="number"
                        min="1"
                        max="50"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value) || 0)}
                    />
                </label>
            </div>

            <div className="mh-loanGrid values">
                <div className="mh-loanRow">
                    <span className="mh-muted">Down payment</span>
                    <span className="mh-loanValue">{formatSEK(downPayment)}</span>
                </div>
                <div className="mh-loanRow">
                    <span className="mh-muted">Estimated monthly</span>
                    <span className="mh-loanValue">{formatSEK(monthly)}</span>
                </div>
            </div>
            <div className="mh-muted" style={{ fontSize: 12, marginTop: 6 }}>
                Simple annuity estimate; exclude fees/insurance. Adjust rate/term for your bank offer.
            </div>
        </div>
    );
}

function calcMonthly(principal, annualRatePct, years) {
    const r = (annualRatePct / 100) / 12;
    const n = years * 12;
    if (r === 0) return n > 0 ? principal / n : 0;
    return principal * (r / (1 - Math.pow(1 + r, -n)));
}

function formatSEK(n) {
    return new Intl.NumberFormat("sv-SE").format(Number(n || 0)) + " kr";
}
