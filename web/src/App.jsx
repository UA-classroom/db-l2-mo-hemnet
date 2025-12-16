import { useState } from "react";
import AgentsPage from "./pages/AgentsPage.jsx";
import ListingDetailPage from "./pages/ListingDetailPage.jsx";
import MainPage from "./pages/MainPage.jsx";
import GuidePage from "./pages/GuidePage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import ArticlePage from "./pages/ArticlePage.jsx";
import { login } from "./api";

const NAV = [
    { id: "search", label: "Home" },
    { id: "agents", label: "Agents" },
    { id: "guide", label: "Buyer guide" },
    { id: "contact", label: "Contact" },
];

export default function App() {
    const [route, setRoute] = useState("search");
    const [activeListing, setActiveListing] = useState(null);
    const [user, setUser] = useState(null);
    const [articleSlug, setArticleSlug] = useState(null);

    const openListing = (listing) => {
        setActiveListing(listing);
        setRoute("listing");
    };

    const openArticle = (slug) => {
        setArticleSlug(slug || "buy");
        setRoute("article");
    };

    const renderPage = () => {
        if (route === "agents") return <AgentsPage />;
        if (route === "listing")
            return <ListingDetailPage listing={activeListing} onBack={() => setRoute("search")} user={user} />;
        if (route === "guide") return <GuidePage onOpenArticle={openArticle} />;
        if (route === "contact") return <ContactPage />;
        if (route === "article") return <ArticlePage slug={articleSlug} onBack={() => setRoute("search")} />;
        return <MainPage onOpenListing={openListing} onOpenArticle={openArticle} user={user} />;
    };

    return (
        <div className="mh-shell">
            <TopBar current={route} onNavigate={setRoute} user={user} onLogin={setUser} onLogout={() => setUser(null)} />
            <div className="mh-content">{renderPage()}</div>
        </div>
    );
}

function TopBar({ current, onNavigate, user, onLogin, onLogout }) {
    return (
        <header className="mh-topbar">
            <div className="mh-brand">
                <div className="mh-logo" aria-hidden="true">
                    <img src="/logo-moonhem.png" alt="Moonhem" />
                </div>
                <div className="mh-brandText">
                    <div className="mh-name">MOONHEM</div>
                    <div className="mh-tag">Real Estate</div>
                </div>
            </div>

            <nav className="mh-nav">
                {NAV.map((item) => (
                    <button
                        key={item.id}
                        className={`mh-navItem ${current === item.id ? "active" : ""}`}
                        type="button"
                        onClick={() => onNavigate(item.id)}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="mh-actions">
                <LoginPopover user={user} onLogin={onLogin} onLogout={onLogout} />
            </div>
        </header>
    );
}

function LoginPopover({ user, onLogin, onLogout }) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const toggle = () => setOpen((o) => !o);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const u = await login(email, password);
            onLogin(u);
            setOpen(false);
            setPassword("");
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    if (user) {
        return (
            <div className="mh-loginWrap">
                <div className="mh-userBadge">
                    <div className="mh-avatar">{(user.first_name || "M")[0]}</div>
                    <div>
                        <div className="mh-userName">
                            {user.first_name} {user.surname}
                        </div>
                        <div className="mh-muted">{user.mail}</div>
                    </div>
                </div>
                <button className="mh-ghost" type="button" onClick={onLogout}>
                    Log out
                </button>
            </div>
        );
    }

    return (
        <div className="mh-loginWrap">
            <button className="mh-btn" type="button" onClick={toggle}>
                {open ? "Close" : "Log in"}
            </button>
            {open && (
                <form className="mh-loginCard" onSubmit={handleSubmit}>
                    <input
                        className="mh-input"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                    />
                    <input
                        className="mh-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                    />
                    {error && <div className="mh-error">{error}</div>}
                    <button className="mh-btn" type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Log in"}
                    </button>
                </form>
            )}
        </div>
    );
}
