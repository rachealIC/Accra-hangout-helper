import React from 'react';

const LandingTrotro = () => (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex items-center">
        {/* Trotro Animation */}
        <div
            className="absolute left-0 w-[240px]"
            style={{ animation: 'landing-drive 16s linear infinite' }}
        >
            <div style={{ animation: 'trotro-bounce 2s ease-in-out infinite' }}>
                <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <path d="M20 80H10V125H25V110H215V125H230V80H220" stroke="#3E0703" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="#f8fafc" />
                        <rect x="10" y="40" width="220" height="70" rx="8" stroke="#3E0703" strokeWidth="4" fill="#ffffff" />
                        <rect x="10" y="85" width="220" height="18" fill="#8C1007" />
                        <path d="M10 94H230" stroke="#660B05" strokeWidth="2" />
                        <rect x="25" y="48" width="35" height="25" rx="3" fill="#FFFCF5" stroke="#3E0703" strokeWidth="2" />
                        <rect x="70" y="48" width="35" height="25" rx="3" fill="#FFFCF5" stroke="#3E0703" strokeWidth="2" />
                        <rect x="115" y="48" width="35" height="25" rx="3" fill="#FFFCF5" stroke="#3E0703" strokeWidth="2" />
                        <rect x="160" y="48" width="35" height="25" rx="3" fill="#FFFCF5" stroke="#3E0703" strokeWidth="2" />
                        <circle cx="42" cy="70" r="8" fill="#3E0703" opacity="0.5"/>
                        <path d="M36 75 C 38 85, 46 85, 48 75 Z" fill="#3E0703" opacity="0.5" />
                        <circle cx="87" cy="70" r="8" fill="#660B05" opacity="0.6"/>
                        <path d="M81 75 C 83 85, 91 85, 93 75 Z" fill="#660B05" opacity="0.6" />
                        <circle cx="132" cy="70" r="8" fill="#3E0703" opacity="0.5"/>
                        <path d="M126 75 C 128 85, 136 85, 138 75 Z" fill="#3E0703" opacity="0.5" />
                        <circle cx="177" cy="70" r="8" fill="#8C1007" opacity="0.7"/>
                        <path d="M171 75 C 173 85, 181 85, 183 75 Z" fill="#8C1007" opacity="0.7" />
                        <circle cx="65" cy="125" r="18" stroke="#3E0703" strokeWidth="4" fill="#1e293b" />
                        <circle cx="65" cy="125" r="8" fill="#f1f5f9" />
                        <circle cx="175" cy="125" r="18" stroke="#3E0703" strokeWidth="4" fill="#1e293b" />
                        <circle cx="175" cy="125" r="8" fill="#f1f5f9" />
                    </g>
                </svg>
            </div>
        </div>
        
        {/* Motorbike Animation */}
        <div
            className="absolute left-0 w-[200px]"
            style={{
                animation: 'motorbike-drive 9s linear infinite'
            }}
        >
            <div style={{ animation: 'okada-rush 0.5s ease-in-out infinite' }}>
                <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                        {/* Wheels with simple spokes */}
                        <circle cx="70" cy="130" r="20" stroke="#3E0703" strokeWidth="4" fill="#1e293b" />
                        <path d="M70 115 L 70 145 M55 130 L 85 130" stroke="#660B05" strokeWidth="1.5"/>
                        <circle cx="70" cy="130" r="8" fill="#f1f5f9" />
                        <circle cx="150" cy="130" r="20" stroke="#3E0703" strokeWidth="4" fill="#1e293b" />
                        <path d="M150 115 L 150 145 M135 130 L 165 130" stroke="#660B05" strokeWidth="1.5"/>
                        <circle cx="150" cy="130" r="8" fill="#f1f5f9" />

                        {/* Bike frame and body */}
                        <path d="M88 130 L 110 80 L 140 80 L 150 95" stroke="#3E0703" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M110 80 L 70 130" stroke="#3E0703" strokeWidth="4" />
                        <path d="M100 115 C 105 110, 115 110, 120 115 L 140 130" stroke="#3E0703" strokeWidth="4" fill="none" strokeLinecap="round"/>
                        <path d="M110 80 L 125 75 L 135 80" stroke="#3E0703" strokeWidth="4" fill="none" strokeLinecap="round"/>
                        <rect x="105" y="80" width="35" height="25" fill="#8C1007" rx="5" />
                        <path d="M85 95 L 125 105" stroke="#3E0703" strokeWidth="4" fill="none" strokeLinecap="round"/>

                        {/* Rider */}
                        <path d="M110 55 C 100 75, 100 95, 110 110 L 125 110 C 135 95, 135 75, 125 55 Z" fill="#3E0703" />
                        <circle cx="118" cy="45" r="12" fill="#660B05" stroke="#3E0703" strokeWidth="3" />
                        <path d="M108 45 C 115 42, 125 42, 130 48" stroke="#FFFCF5" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
                        <path d="M110 70 L 128 78" stroke="#3E0703" strokeWidth="6" strokeLinecap="round"/>
                    </g>
                </svg>
            </div>
        </div>
    </div>
);

export default LandingTrotro;