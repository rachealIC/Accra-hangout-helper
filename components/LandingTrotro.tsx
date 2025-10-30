import React from 'react';

// Reusable Wheel component for animations
const Wheel = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => (
    <g style={{ animation: 'spin 0.6s linear infinite', transformOrigin: `${cx}px ${cy}px` }}>
        <circle cx={cx} cy={cy} r={r} stroke="#3E0703" strokeWidth="4" fill="#1e293b" />
        <path d={`M${cx} ${cy - r + 2} L${cx} ${cy + r - 2}`} stroke="#555" strokeWidth="1.5" />
        <path d={`M${cx - r + 2} ${cy} L${cx + r - 2} ${cy}`} stroke="#555" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={r/2.5} fill="#f1f5f9" />
    </g>
);

const LandingTrotro = () => (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex items-center">
        {/* Road Lines Animation */}
        <div className="absolute bottom-10 left-0 w-full h-2">
            <svg width="100%" height="100%">
                <defs>
                    <pattern id="road-pattern" patternUnits="userSpaceOnUse" width="100" height="4">
                        <path d="M0 2 H60" stroke="rgba(62, 7, 3, 0.2)" strokeWidth="4" strokeDasharray="30 30" className="road-line" />
                    </pattern>
                </defs>
                <rect fill="url(#road-pattern)" width="200%" height="4" style={{ animation: 'move-road 1.5s linear infinite' }}/>
            </svg>
        </div>

        {/* Vehicle 1: Lively Trotro */}
        <div
            className="absolute left-0"
            style={{ animation: 'landing-drive 16s linear infinite', animationDelay: '-8s' }}
        >
            <div style={{ animation: 'trotro-bounce 2s ease-in-out infinite' }}>
                <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="120" cy="148" rx="85" ry="10" fill="black" opacity="0.1" />
                    <rect x="10" y="40" width="220" height="80" rx="10" fill="#f8fafc" stroke="#3E0703" strokeWidth="4"/>
                    {/* Mate (conductor) */}
                    <path d="M230 70 V 105 H 210 V 70 Z" fill="#FFFCF5" stroke="#3E0703" strokeWidth="2" />
                    <g style={{transform: 'translate(213px, 75px)', animation: 'wave 1.5s ease-in-out infinite'}}>
                      <circle cx="0" cy="-5" r="7" fill="#660B05" />
                      <rect x="-3" y="2" width="6" height="20" rx="3" fill="#660B05" />
                    </g>
                    <rect x="10" y="90" width="220" height="15" fill="#8C1007" />
                    <path d="M10 98H230" stroke="#660B05" strokeWidth="2" />
                    {/* Windows with passengers */}
                    <rect x="25" y="50" width="35" height="30" fill="#a7e1f5" opacity="0.7"/>
                    <rect x="70" y="50" width="35" height="30" fill="#a7e1f5" opacity="0.7"/>
                    <rect x="115" y="50" width="35" height="30" fill="#a7e1f5" opacity="0.7"/>
                    <rect x="160" y="50" width="35" height="30" fill="#a7e1f5" opacity="0.7"/>
                    <circle cx="42" cy="75" r="9" fill="#3E0703" opacity="0.3"/>
                    <circle cx="87" cy="75" r="9" fill="#660B05" opacity="0.4"/>
                    <circle cx="132" cy="75" r="9" fill="#3E0703" opacity="0.3"/>

                    <Wheel cx={65} cy={125} r={18} />
                    <Wheel cx={175} cy={125} r={18} />
                </svg>
            </div>
        </div>
        
        {/* Vehicle 3: Speedy Okada */}
        <div
            className="absolute left-0"
            style={{ animation: 'motorbike-drive 8s linear infinite' }}
        >
            <div style={{ animation: 'okada-rush 0.5s ease-in-out infinite' }}>
                <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="110" cy="138" rx="55" ry="7" fill="black" opacity="0.1" />
                    {/* Rider */}
                    <path d="M110 55 C 100 75, 100 95, 110 110 L 125 110 C 135 95, 135 75, 125 55 Z" fill="#3E0703" />
                    <circle cx="118" cy="45" r="12" fill="#660B05" stroke="#3E0703" strokeWidth="3" />
                    <path d="M108 45 C 115 42, 125 42, 130 48" stroke="#FFFCF5" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
                    {/* Bike Body */}
                    <path d="M88 120 L 150 120" stroke="#3E0703" strokeWidth="4" strokeLinecap="round"/>
                    <path d="M120 115 L 145 80 L 160 80" stroke="#3E0703" strokeWidth="4" strokeLinecap="round"/>
                    <rect x="130" y="80" width="25" height="20" fill="#8C1007" rx="3" />
                    <Wheel cx={70} cy={120} r={20} />
                    <Wheel cx={160} cy={120} r={20} />
                </svg>
            </div>
        </div>
    </div>
);

export default LandingTrotro;