const ARTICLES = {
    buy: {
        title: "Buy a home: 5 steps",
        subtitle: "A clear path from first viewing to signed contract.",
        hero:
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
        sections: [
            {
                heading: "1) Set your search",
                bullets: [
                    "Save filters for area, price, and type to catch new listings fast.",
                    "Enable alerts so you see homes the moment they are listed.",
                ],
            },
            {
                heading: "2) View & compare",
                bullets: [
                    "Book viewings directly with the agent; prepare 2–3 options to compare.",
                    "Take notes on condition, light, noise, and potential renovations.",
                ],
            },
            {
                heading: "3) Run your numbers",
                bullets: [
                    "Align with your bank on max budget, rate, and amortization.",
                    "Include fees, insurance, and monthly costs in your estimate.",
                ],
            },
            {
                heading: "4) Bid with confidence",
                bullets: [
                    "Agree on bidding rules and timeline with the agent before you start.",
                    "Be ready to show financing confirmation if requested.",
                ],
            },
            {
                heading: "5) Contract & handover",
                bullets: [
                    "Include inspection, financing, and move-in terms in the contract.",
                    "Confirm utilities, keys, and final walk-through date.",
                ],
            },
        ],
    },
    sell: {
        title: "Sell faster",
        subtitle: "Raise impact with better visuals, copy, and timing.",
        hero:
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
        sections: [
            {
                heading: "Prep and styling",
                bullets: [
                    "Declutter, neutralize colors, and add light to key rooms.",
                    "Fix small defects; they reduce friction and boost perceived quality.",
                ],
            },
            {
                heading: "Photos & copy",
                bullets: [
                    "Hire a pro photographer; focus on first photo and living areas.",
                    "Write crisp copy: highlight light, layout, storage, and nearby transit.",
                ],
            },
            {
                heading: "Pricing & timing",
                bullets: [
                    "Align pricing with recent comparables; avoid overpricing early.",
                    "List mid-week for peak attention; coordinate viewings close together.",
                ],
            },
            {
                heading: "During showings",
                bullets: [
                    "Provide a fact sheet with fees, renovations, and floor plan.",
                    "Collect questions and answer quickly; momentum matters.",
                ],
            },
        ],
    },
    finance: {
        title: "Financing",
        subtitle: "Understand rate, amortization, and down payment basics.",
        hero:
            "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1600&q=80",
        sections: [
            {
                heading: "Down payment",
                bullets: [
                    "Typical minimum is 15% of the purchase price.",
                    "Higher down payment lowers your monthly cost and rate risk.",
                ],
            },
            {
                heading: "Interest rate",
                bullets: [
                    "Fixed rate gives predictability; variable can benefit in falling rate environments.",
                    "Run scenarios (±1–2%) to see how payment changes over time.",
                ],
            },
            {
                heading: "Amortization",
                bullets: [
                    "Longer terms reduce monthly cost but raise total interest paid.",
                    "Match term to your horizon; overpay when you can to cut interest.",
                ],
            },
            {
                heading: "Extra costs",
                bullets: [
                    "Include insurance, fees, taxes, and monthly charges in your budget.",
                    "Keep a buffer for maintenance and unexpected repairs.",
                ],
            },
        ],
    },
};

export default function ArticlePage({ slug = "buy", onBack }) {
    const article = ARTICLES[slug] || ARTICLES.buy;

    return (
        <div className="mh-page">
            <div
                className="mh-hero hero-large"
                style={{
                    backgroundImage: `linear-gradient(180deg, rgba(15,61,60,0.65) 0%, rgba(15,61,60,0.82) 100%), url('${article.hero}')`,
                }}
            >
                <div className="mh-heroContent">
                    <p className="mh-eyebrow">Guide</p>
                    <h1>{article.title}</h1>
                    <p className="mh-muted">{article.subtitle}</p>
                    {onBack && (
                        <button className="mh-btn" type="button" onClick={onBack} style={{ marginTop: 12 }}>
                            Back to listings
                        </button>
                    )}
                </div>
            </div>

            <div className="mh-detailBody" style={{ gridTemplateColumns: "1fr" }}>
                {article.sections.map((sec) => (
                    <div key={sec.heading} className="mh-detailSection">
                        <h3 style={{ marginTop: 0 }}>{sec.heading}</h3>
                        <ul style={{ paddingLeft: 18, margin: "8px 0", color: "var(--muted)", lineHeight: 1.5 }}>
                            {sec.bullets.map((b) => (
                                <li key={b}>{b}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
