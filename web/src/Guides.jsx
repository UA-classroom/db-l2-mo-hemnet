export default function Guides({ onOpenArticle }) {
    const cards = [
        {
            title: "Buy a home: 5 steps",
            text: "Checklist for viewing, bidding, and contracts.",
            category: "Guide",
            slug: "buy",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=60",
        },
        {
            title: "Sell faster",
            text: "Boost your listing with stronger photos and copy.",
            category: "Selling",
            slug: "sell",
            image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=60",
        },
        {
            title: "Financing",
            text: "What interest, amortization, and down payment mean.",
            category: "Finance",
            slug: "finance",
            image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=60",
        },
    ];

    return (
        <div className="mh-articleGrid">
            {cards.map((a) => (
                <button
                    key={a.title}
                    className="mh-articleCard"
                    type="button"
                    onClick={() => onOpenArticle && onOpenArticle(a.slug)}
                >
                    <div className="mh-articleImage" style={{ backgroundImage: `url(${a.image})` }} />
                    <div className="mh-articleBody">
                        <div className="mh-muted" style={{ fontSize: 12, textTransform: "uppercase" }}>
                            {a.category}
                        </div>
                        <div className="mh-articleTitle">{a.title}</div>
                        <div className="mh-articleText">{a.text}</div>
                    </div>
                </button>
            ))}
        </div>
    );
}
