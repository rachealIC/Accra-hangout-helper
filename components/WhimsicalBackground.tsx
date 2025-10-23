import React from 'react';

// Fix: Add `style` prop to allow for inline style overrides and extensions.
const PersonDancing = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg viewBox="0 0 50 100" className={className} style={{ animation: `sway 4s ease-in-out infinite alternate`, ...style }}>
        <circle cx="25" cy="15" r="10" fill="#E18C44" />
        <path d="M 25 25 V 60 H 15 V 90" stroke="#660B05" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 25 35 L 40 50" stroke="#660B05" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 25 60 H 35 V 90" stroke="#660B05" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
);

// Fix: Add `style` prop for consistency and future use.
const PalmTree = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg viewBox="0 0 150 200" className={className} style={{ animation: `sway 10s ease-in-out infinite alternate`, ...style }}>
        <path d="M75 200 V 20" stroke="#A0522D" strokeWidth="8" />
        <path d="M75 20 C 20 -10, 50 40, 20 50" fill="#660B05" transform="rotate(10 75 20)"/>
        <path d="M75 20 C 130 -10, 100 40, 130 50" fill="#660B05" transform="rotate(-10 75 20)"/>
        <path d="M75 20 C 40 60, 100 60, 75 100" fill="#660B05" transform="rotate(170 75 20) scale(0.8)"/>
        <path d="M75 20 C 40 60, 100 60, 75 100" fill="#660B05" transform="rotate(-170 75 20) scale(0.9)"/>
        <path d="M75 20 C 50 50, 90 50, 75 80" fill="#660B05" />
    </svg>
);

// Fix: Add `style` prop for consistency and future use.
const Sun = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ animation: `sun-rotate 40s linear infinite`, ...style }}>
    <circle cx="50" cy="50" r="30" fill="#8C1007" />
    <path d="M50 0 L50 15 M50 85 L50 100 M0 50 L15 50 M85 50 L100 50 M15 15 L25 25 M75 75 L85 85 M15 85 L25 75 M75 25 L85 15" stroke="#8C1007" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const MountainRange = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg viewBox="0 0 200 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 100L40 60L60 80L100 20L140 70L170 50L200 100H0Z" fill="#8C1007" />
    </svg>
);

const Kayak = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg viewBox="0 0 150 50" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 25 C 40 5, 110 5, 140 25 C 110 45, 40 45, 10 25 Z" fill="#660B05" />
        <path d="M5 20L145 30" stroke="#3E0703" strokeWidth="4" strokeLinecap="round" />
        <circle cx="75" cy="25" r="4" fill="#FFFCF5" />
    </svg>
);

const Compass = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" stroke="#3E0703" strokeWidth="4" />
        <path d="M50 10L50 90 M10 50L90 50" stroke="#3E0703" strokeWidth="2" />
        <path d="M50 10L60 50L50 90L40 50L50 10Z" fill="#8C1007" />
        <path d="M50 10L60 50L50 90L40 50L50 10Z" stroke="#3E0703" strokeWidth="2" />
    </svg>
);

const VibrantAccraBackground: React.FC = () => {
    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" aria-hidden="true">
            {/* Existing elements */}
            <Sun className="absolute -top-10 -left-10 w-40 h-40 opacity-30" />
            <PalmTree className="absolute bottom-0 -right-10 w-60 h-80 opacity-40" />
            <PersonDancing className="absolute bottom-5 left-10 w-24 h-48 opacity-50" />
            <PersonDancing className="absolute bottom-20 right-[30%] w-20 h-40 opacity-40" style={{ animationDuration: '5s', transform: 'scaleX(-1)' }} />
            
            {/* New Adventure Elements */}
            <MountainRange 
                className="absolute bottom-0 left-0 w-full opacity-10" 
                style={{ animation: `drift 40s infinite ease-in-out alternate` }}
            />
            <Kayak 
                className="absolute top-[15%] right-[10%] w-32 h-16 opacity-20" 
                style={{ animation: `drift 28s infinite ease-in-out alternate`, transform: 'rotate(20deg)' }}
            />
            <Compass 
                className="absolute bottom-[25%] left-[5%] w-24 h-24 opacity-15" 
                style={{ animation: `drift 35s infinite ease-in-out alternate-reverse` }}
            />
        </div>
    );
};

export default VibrantAccraBackground;