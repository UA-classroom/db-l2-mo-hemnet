import React from 'react';

export default function Map() {
    return (
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-green-900/10 bg-[#e5e3df] shadow-sm group isolate my-6">
            {/* 1. Map Base Layer (Simulating Google Maps) */}
            <div className="absolute inset-0">
                {/* Water */}
                <div className="absolute top-0 right-0 w-[40%] h-full bg-[#aadaff] origin-bottom-right transform -skew-x-6" />

                {/* Parks */}
                <div className="absolute bottom-0 left-0 w-[50%] h-[60%] bg-[#c5e8c5] rounded-tr-[100px] opacity-80" />
                <div className="absolute top-10 left-10 w-32 h-32 bg-[#c5e8c5] rounded-full opacity-80" />

                {/* Roads (SVG) */}
                <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.6 }}>
                    {/* Major Roads */}
                    <path d="M -20 150 L 600 180" stroke="white" strokeWidth="16" fill="none" />
                    <path d="M 200 -20 L 180 600" stroke="white" strokeWidth="16" fill="none" />
                    <path d="M 400 -20 L 350 600" stroke="white" strokeWidth="12" fill="none" />

                    {/* Secondary Roads */}
                    <path d="M 0 300 L 600 280" stroke="white" strokeWidth="8" fill="none" />
                    <path d="M 50 50 L 150 150" stroke="white" strokeWidth="8" fill="none" />
                </svg>
            </div>

            {/* 2. Listings (Price Pins) */}
            <div className="absolute inset-0 z-10">
                <PricePin top="40%" left="45%" price="4 500 000 kr" active />
                <PricePin top="25%" left="20%" price="3 200 000 kr" />
                <PricePin top="60%" left="70%" price="5 950 000 kr" />
                <PricePin top="75%" left="30%" price="2 100 000 kr" />
            </div>

            {/* 3. Controls Overlay */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <button className="w-8 h-8 bg-white rounded shadow-md text-gray-600 font-bold hover:bg-gray-50 flex items-center justify-center text-lg">+</button>
                <button className="w-8 h-8 bg-white rounded shadow-md text-gray-600 font-bold hover:bg-gray-50 flex items-center justify-center text-lg">-</button>
            </div>
        </div>
    );
}

function PricePin({ top, left, price, active }) {
    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin"
            style={{ top, left }}
        >
            <div className={`
        relative px-2.5 py-1 rounded-lg shadow-md transition-all duration-200
        ${active
                    ? 'bg-green-900 text-white scale-110 z-20 ring-2 ring-white'
                    : 'bg-white text-green-900 hover:scale-110 hover:z-20 hover:bg-green-900 hover:text-white'
                }
      `}>
                <span className="text-xs font-bold whitespace-nowrap">{price}</span>
                {/* Triangle pointer */}
                <div className={`
          absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45
          ${active ? 'bg-green-900' : 'bg-white group-hover/pin:bg-green-900'}
        `}></div>
            </div>
        </div>
    );
}