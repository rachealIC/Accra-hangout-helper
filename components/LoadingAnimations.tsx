import React from 'react';

const Wheel = ({ cx, cy, r }: { cx: number, cy: number, r: number }) => (
    <g>
        <circle cx={cx} cy={cy} r={r} stroke="#3E0703" strokeWidth="4" fill="#1e293b" />
        <g style={{ animation: 'spin 0.5s linear infinite', transformOrigin: `${cx}px ${cy}px` }}>
            <path d={`M${cx} ${cy-r+2} L${cx} ${cy+r-2}`} stroke="#555" strokeWidth="1.5" />
            <path d={`M${cx-r+2} ${cy} L${cx+r-2} ${cy}`} stroke="#555" strokeWidth="1.5" />
        </g>
        <circle cx={cx} cy={cy} r={r/2.5} fill="#f1f5f9" />
    </g>
);


export const TrotroAnimation = () => (
    <div
        className="absolute top-0 left-0"
        style={{ animation: 'drive-across 12s linear infinite' }}
    >
        <div style={{ animation: 'trotro-bounce 1.8s ease-in-out infinite' }}>
            <svg width="200" height="140" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="100" cy="128" rx="70" ry="8" fill="black" opacity="0.1" />
                <rect x="10" y="30" width="180" height="80" rx="8" fill="#f8fafc" stroke="#3E0703" strokeWidth="4"/>
                <path d="M190 60 V 95 H 175 V 60 Z" fill="#FFFCF5" stroke="#3E0703" strokeWidth="2" />
                <g style={{transform: 'translate(178px, 65px)', animation: 'wave 1s ease-in-out infinite'}}>
                  <circle cx="0" cy="-5" r="6" fill="#660B05" />
                  <rect x="-2" y="1" width="4" height="15" rx="2" fill="#660B05" />
                </g>
                <rect x="10" y="80" width="180" height="12" fill="#8C1007" />
                <path d="M10 86 H 190" stroke="#660B05" strokeWidth="2" />
                <rect x="25" y="40" width="30" height="30" fill="#a7e1f5" opacity="0.7"/>
                <rect x="65" y="40" width="30" height="30" fill="#a7e1f5" opacity="0.7"/>
                <rect x="105" y="40" width="30" height="30" fill="#a7e1f5" opacity="0.7"/>
                <rect x="145" y="40" width="30" height="30" fill="#a7e1f5" opacity="0.7"/>
                {/* Passengers */}
                <circle cx="40" cy="65" r="8" fill="#3E0703" opacity="0.3"/>
                <circle cx="80" cy="65" r="8" fill="#660B05" opacity="0.4"/>
                <circle cx="120" cy="65" r="8" fill="#3E0703" opacity="0.3"/>
                {/* Fix: Pass numeric props to Wheel component */}
                <Wheel cx={55} cy={110} r={14} />
                {/* Fix: Pass numeric props to Wheel component */}
                <Wheel cx={145} cy={110} r={14} />
            </svg>
        </div>
    </div>
);

export const CarAnimation = () => (
    <div
        className="absolute top-0 left-0"
        style={{ animation: 'drive-across 10s linear infinite' }}
    >
        <div style={{ animation: 'car-wiggle 1s ease-in-out infinite' }}>
            <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="80" cy="108" rx="50" ry="6" fill="black" opacity="0.1" />
                <path d="M20 85L30 60C35 50 45 45 60 45H100C115 45 125 50 130 60L140 85H20Z" fill="#8C1007" stroke="#3E0703" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M40 60 L 60 45 L 100 45 L 115 60" fill="#a7e1f5" opacity="0.7" />
                {/* Driver head */}
                <circle cx="65" cy="55" r="6" fill="#3E0703" opacity="0.5" />
                {/* Fix: Pass numeric props to Wheel component */}
                <Wheel cx={50} cy={85} r={12} />
                {/* Fix: Pass numeric props to Wheel component */}
                <Wheel cx={110} cy={85} r={12} />
            </svg>
        </div>
    </div>
);

export const OkadaAnimation = () => (
    <div
        className="absolute top-0 left-0"
        style={{ animation: 'drive-across 6s linear infinite' }}
    >
        <div style={{ animation: 'okada-rush 0.5s ease-in-out infinite' }}>
             <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="80" cy="108" rx="45" ry="6" fill="black" opacity="0.1" />
                {/* Rider */}
                <path d="M75 50 C 70 65 70 80 80 90 L 95 90 C 105 75 105 60 95 50 Z" fill="#3E0703" />
                <circle cx="85" cy="40" r="10" fill="#660B05" stroke="#3E0703" strokeWidth="2"/>
                {/* Bike Body */}
                <path d="M60 95 L 120 95" stroke="#3E0703" strokeWidth="4" strokeLinecap="round"/>
                <path d="M95 90 L 115 70 L 130 70" stroke="#3E0703" strokeWidth="4" strokeLinecap="round"/>
                <rect x="100" y="70" width="20" height="15" fill="#8C1007" rx="3" />
                <path d="M70 95 L 50 95" stroke="#3E0703" strokeWidth="4" strokeLinecap="round" />
                {/* Fix: Pass numeric props to Wheel component */}
                <Wheel cx={45} cy={95} r={15} />
                {/* Fix: Pass numeric props to Wheel component */}
                <Wheel cx={125} cy={95} r={15} />
            </svg>
        </div>
    </div>
);

export const BusAnimation = () => (
    <div
        className="absolute top-0 left-0"
        style={{ animation: 'drive-across 15s linear infinite' }}
    >
        <div style={{ animation: 'trotro-bounce 2.5s ease-in-out infinite' }}>
            <svg width="180" height="130" viewBox="0 0 180 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="90" cy="118" rx="65" ry="7" fill="black" opacity="0.1" />
                <rect x="10" y="20" width="160" height="80" rx="10" fill="#f8fafc" stroke="#3E0703" strokeWidth="4" />
                <rect x="10" y="70" width="160" height="15" fill="#8C1007" />
                <rect x="25" y="35" width="30" height="25" fill="#a7e1f5" opacity="0.7" />
                <rect x="65" y="35" width="30" height="25" fill="#a7e1f5" opacity="0.7" />
                <rect x="105" y="35" width="30" height="25" fill="#a7e1f5" opacity="0.7" />
                {/* Fix: Pass numeric props to Wheel component */}
                <Wheel cx={50} cy={100} r={14} />
                {/* Fix: Pass numeric props to Wheel component */}
                <Wheel cx={130} cy={100} r={14} />
            </svg>
        </div>
    </div>
);

export const WalkingPersonAnimation = () => (
    <div
        className="absolute top-0 left-0"
        style={{ animation: 'drive-across 18s linear infinite' }}
    >
        <g style={{ animation: 'walk-cycle 1s ease-in-out infinite' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <g transform="translate(60 85)">
                    {/* Legs */}
                    <path d="M0 0 L-5 25" stroke="#3E0703" strokeWidth="6" strokeLinecap="round" style={{ animation: 'walk-leg-1 1s ease-in-out infinite', transformOrigin: '0 0' }}/>
                    <path d="M0 0 L5 25" stroke="#3E0703" strokeWidth="6" strokeLinecap="round" style={{ animation: 'walk-leg-2 1s ease-in-out infinite', transformOrigin: '0 0' }}/>
                 </g>
                 <g transform="translate(60 65)">
                    {/* Arms */}
                    <path d="M0 0 L-10 15" stroke="#3E0703" strokeWidth="5" strokeLinecap="round" style={{ animation: 'walk-arm-2 1s ease-in-out infinite', transformOrigin: '0 0' }}/>
                    <path d="M0 0 L10 15" stroke="#3E0703" strokeWidth="5" strokeLinecap="round" style={{ animation: 'walk-arm-1 1s ease-in-out infinite', transformOrigin: '0 0' }}/>
                 </g>
                 {/* Body and Head */}
                 <path d="M60 52V85" stroke="#3E0703" strokeWidth="8" strokeLinecap="round" />
                 <circle cx="60" cy="40" r="12" fill="#660B05" />
                 <path d="M55 35 Q 60 30, 70 35" stroke="#3E0703" strokeWidth="2" fill="none" />
            </svg>
        </g>
    </div>
);