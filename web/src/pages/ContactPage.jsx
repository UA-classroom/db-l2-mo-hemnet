export default function ContactPage() {
    return (
        <div className="mh-page">
            <div
                className="mh-hero hero-large"
                style={{
                    backgroundImage:
                        "linear-gradient(180deg, rgba(15,61,60,0.7) 0%, rgba(15,61,60,0.8) 60%, rgba(15,61,60,0.9) 100%), url('https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1600&q=80')",
                }}
            >
                <div className="mh-heroContent">
                    <p className="mh-eyebrow" style={{ color: "#f6f5f1" }}>
                        Moonhem · Contact
                    </p>
                    <h1>Get in touch.</h1>
                    <p className="mh-muted">
                        We help with listings, viewings, and valuations. Send a message or book a consultation.
                    </p>
                </div>
            </div>

            <div className="mh-main" style={{ gridTemplateColumns: "1.1fr 1fr" }}>
                <section className="mh-panel">
                    <div className="mh-panelHead">
                        <h3>Send a message</h3>
                    </div>
                    <form className="mh-contactForm" onSubmit={(e) => handleSubmit(e)}>
                        <label className="mh-field">
                            <span>Name</span>
                            <input className="mh-input" name="name" required placeholder="Your name" />
                        </label>
                        <label className="mh-field">
                            <span>Email</span>
                            <input className="mh-input" name="email" type="email" required placeholder="name@email.com" />
                        </label>
                        <label className="mh-field">
                            <span>Subject</span>
                            <input className="mh-input" name="subject" placeholder="e.g. Schedule a viewing" />
                        </label>
                        <label className="mh-field">
                            <span>Message</span>
                            <textarea
                                className="mh-textarea"
                                name="message"
                                rows={4}
                                required
                                placeholder="Tell us what you need help with..."
                            />
                        </label>
                        <button className="mh-btn" type="submit">
                            Send
                        </button>
                    </form>
                </section>

                <aside className="mh-panel">
                    <div className="mh-panelHead">
                        <h3>Contact details</h3>
                    </div>
                    <div className="mh-contactList">
                        <div>
                            <div className="mh-footerTitle">Telefon</div>
                            <div className="mh-muted">+46 70 123 45 67</div>
                        </div>
                        <div>
                            <div className="mh-footerTitle">E-post</div>
                            <div className="mh-muted">hello@moonhem.com</div>
                        </div>
                        <div>
                            <div className="mh-footerTitle">Kontor</div>
                            <div className="mh-muted">Sveavägen 9</div>
                            <div className="mh-muted">111 57 Stockholm</div>
                        </div>
                    </div>

                    <div className="mh-tip" style={{ marginTop: 14 }}>
                        <div className="mh-tipTitle">Book a meeting</div>
                        We book digital or on-site within 24 hours.
                    </div>
                </aside>
            </div>
        </div>
    );
}

function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name") || "";
    const email = data.get("email") || "";
    const subject = data.get("subject") || "Contact";
    const message = data.get("message") || "";
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:hello@moonhem.com?subject=${encodeURIComponent(subject)}&body=${body}`;
}
