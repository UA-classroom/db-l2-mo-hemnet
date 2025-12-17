import React from 'react';

export default function Guides() {
    const guides = [
        {
            category: 'Buying',
            title: 'Buying a home: 5 steps',
            description: 'Checklist for viewings, bidding, and contracts.',
            icon: '🔑',
            href: '#buying'
        },
        {
            category: 'Selling',
            title: 'Sell faster',
            description: 'How to boost your ad with better photos and text.',
            icon: '📸',
            href: '#selling'
        },
        {
            category: 'Economy',
            title: 'Financing',
            description: 'What do interest, amortization, and down payment mean?',
            icon: '💰',
            href: '#economy'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            {guides.map((guide, index) => (
                <a
                    key={index}
                    href={guide.href}
                    className="group block p-6 bg-white rounded-2xl border border-green-900/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold tracking-wider text-green-700 uppercase bg-green-900/5 px-2.5 py-1 rounded-md">{guide.category}</span>
                        <span className="text-2xl">{guide.icon}</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-green-900 mb-2 group-hover:text-green-700 transition-colors">{guide.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{guide.description}</p>
                </a>
            ))}
        </div>
    );
}