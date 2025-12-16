import React from 'react';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-40 flex items-center gap-3.5 px-[18px] py-3 bg-cream/95 backdrop-blur-md border-b border-green-900/10">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
                <div className="w-[46px] h-[46px] rounded-[14px] grid place-items-center bg-green-900 text-gold font-extrabold tracking-wider shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                    MH
                </div>
                <div className="leading-tight">
                    <div className="font-extrabold tracking-[0.18em] text-sm text-green-900">MO HEMNET</div>
                    <div className="text-xs text-muted mt-1">Premium Real Estate</div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2 ml-4">
                {['Buy', 'Rent', 'Sell', 'Agents'].map((item) => (
                    <button
                        key={item}
                        className="border border-transparent bg-transparent px-3.5 py-2.5 rounded-full cursor-pointer font-bold text-muted hover:border-green-900/10 hover:text-green-900 transition-colors"
                    >
                        {item}
                    </button>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 ml-auto">
                <button className="border border-green-900/10 rounded-full px-3.5 py-2.5 bg-white font-bold text-green-900 cursor-pointer transition-all hover:bg-white/90 hover:shadow-lg hover:-translate-y-px active:translate-y-0 active:shadow-md">
                    Log in
                </button>
                <button className="border-none rounded-full px-3.5 py-2.5 bg-green-700 text-white font-extrabold cursor-pointer transition-all hover:bg-[#25756c] hover:shadow-lg hover:-translate-y-px active:translate-y-0 active:shadow-md">
                    Sign up
                </button>
            </div>
        </nav>
    );
}