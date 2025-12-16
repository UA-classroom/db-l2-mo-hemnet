import Guides from "../Guides.jsx";

export default function GuidePage({ onOpenArticle }) {
    return (
        <div className="mh-page">
            <div className="mh-hero compact">
                <div>
                    <p className="mh-eyebrow">Moonhem · Guide</p>
                    <h1>How to buy a home with Moonhem.</h1>
                    <p className="mh-muted">A quick overview from alerts to contracts so you know each step.</p>
                </div>
            </div>

            <div className="mh-panel">
                <div className="mh-panelHead">
                    <h3>Step by step</h3>
                </div>
                <ol className="mh-guideList">
                    <li>
                        <b>Track your area.</b> Use search and save filters to catch new listings instantly.
                    </li>
                    <li>
                        <b>Book a viewing.</b> Message the agent on the detail page and propose times that work.
                    </li>
                    <li>
                        <b>Run your numbers.</b> Compare mortgage rates and costs early to know your budget.
                    </li>
                    <li>
                        <b>Place a bid.</b> Align with the agent on rules and timeline before bidding.
                    </li>
                    <li>
                        <b>Contract & inspection.</b> Make sure conditions (move-in, inspection, financing) are included.
                    </li>
                </ol>
            </div>

            <div className="mh-featureStrip">
                <div className="mh-featureCard">
                    <div className="mh-featureTitle">Fast contact</div>
                    <div className="mh-muted">Messages go straight to the agent from the listing.</div>
                </div>
                <div className="mh-featureCard">
                    <div className="mh-featureTitle">Safe steps</div>
                    <div className="mh-muted">Clear checkpoints so you don’t miss anything important.</div>
                </div>
                <div className="mh-featureCard">
                    <div className="mh-featureTitle">Rates & budget</div>
                    <div className="mh-muted">Have your budget ready before bidding for a faster deal.</div>
                </div>
            </div>

            <section className="mt-6 mb-2">
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-green-900 m-0">Guides & inspiration</h2>
                        <div className="text-muted text-sm mt-1">Short tips to keep buyers informed.</div>
                    </div>
                </div>
                <Guides onOpenArticle={onOpenArticle} />
            </section>
        </div>
    );
}
