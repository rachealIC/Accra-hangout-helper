import React from 'react';

export const TrotroAnimation = () => (
    <div
        className="absolute top-0 left-0"
        style={{ animation: 'drive-across 12s linear infinite' }}
    >
        <div style={{ animation: 'trotro-bounce 1.8s ease-in-out infinite' }}>
            <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="85" cy="108" rx="55" ry="6" fill="black" opacity="0.1" />
                <path d="M15 55H10V85H20V70H140V85H150V55H145" stroke="#3E0703" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="#f8fafc" />
                <rect x="10" y="30" width="140" height="40" rx="5" stroke="#3E0703" strokeWidth="4" fill="#ffffff" />
                <rect x="10" y="55" width="140" height="12" fill="#8C1007" />
                <path d="M10 61H150" stroke="#660B05" strokeWidth="2" />
                <rect x="20" y="36" width="25" height="15" rx="2" fill="#FFFCF5" />
                <rect x="50" y="36" width="25" height="15" rx="2" fill="#FFFCF5" />
                <rect x="80" y="36" width="25" height="15" rx="2" fill="#FFFCF5" />
                <rect x="110" y="36" width="25" height="15" rx="2" fill="#FFFCF5" />
                <circle cx="45" cy="85" r="12" stroke="#3E0703" strokeWidth="4" fill="#1e293b" />
                <circle cx="45" cy="85" r="5" fill="#f1f5f9" />
                <circle cx="115" cy="85" r="12" stroke="#3E0703" strokeWidth="4" fill="#1e293b" />
                <circle cx="115" cy="85" r="5" fill="#f1f5f9" />
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
                <path d="M30 60H130" stroke="#3E0703" strokeWidth="4" />
                <rect x="65" y="48" width="30" height="12" fill="#FFFCF5" stroke="#3E0703" strokeWidth="2" />
                <circle cx="50" cy="85" r="12" stroke="#3E0703" strokeWidth="4" fill="#1e293b" /><circle cx="50" cy="85" r="5" fill="#f1f5f9" />
                <circle cx="110" cy="85" r="12" stroke="#3E0703" strokeWidth="4" fill="#1e293b" /><circle cx="110" cy="85" r="5" fill="#f1f5f9" />
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
                <circle cx="45" cy="85" r="15" stroke="#3E0703" strokeWidth="4" fill="#1e293b" /><circle cx="45" cy="85" r="6" fill="#f1f5f9" />
                <circle cx="115" cy="85" r="15" stroke="#3E0703" strokeWidth="4" fill="#1e293b" /><circle cx="115" cy="85" r="6" fill="#f1f5f9" />
                <path d="M60 40C50 50 50 65 70 80H90L110 60L90 40H60Z" fill="#660B05" stroke="#3E0703" strokeWidth="4" strokeLinejoin="round" />
                <circle cx="65" cy="45" r="8" fill="#FFFCF5" stroke="#3E0703" strokeWidth="2" />
                <path d="M90 80L55 80" stroke="#3E0703" strokeWidth="4" strokeLinecap="round"/>
                <path d="M110 60L125 55" stroke="#3E0703" strokeWidth="4" strokeLinecap="round"/>
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
                <rect x="25" y="35" width="30" height="25" fill="#FFFCF5" />
                <rect x="65" y="35" width="30" height="25" fill="#FFFCF5" />
                <rect x="105" y="35" width="30" height="25" fill="#FFFCF5" />
                <circle cx="50" cy="100" r="14" stroke="#3E0703" strokeWidth="4" fill="#1e293b" /><circle cx="50" cy="100" r="6" fill="#f1f5f9" />
                <circle cx="130" cy="100" r="14" stroke="#3E0703" strokeWidth="4" fill="#1e293b" /><circle cx="130" cy="100" r="6" fill="#f1f5f9" />
            </svg>
        </div>
    </div>
);

export const WalkingPersonAnimation = () => (
    <div
        className="absolute top-0 left-0"
        style={{ animation: 'drive-across 18s linear infinite' }}
    >
        <div style={{ animation: 'walk-cycle 1s ease-in-out infinite' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M60 85L50 110" stroke="#3E0703" strokeWidth="6" strokeLinecap="round" style={{ animation: 'walk-cycle 1s ease-in-out infinite reverse' }} />
                 <path d="M60 85L70 110" stroke="#3E0703" strokeWidth="6" strokeLinecap="round" />
                 <circle cx="60" cy="40" r="12" fill="#660B05" />
                 <path d="M60 52V85" stroke="#3E0703" strokeWidth="6" strokeLinecap="round" />
                 <path d="M60 65L45 80" stroke="#3E0703" strokeWidth="6" strokeLinecap="round" />
            </svg>
        </div>
    </div>
);
