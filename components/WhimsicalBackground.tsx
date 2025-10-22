import React, { useState, useEffect } from 'react';

const colors = [
    'rgba(229, 231, 235, 0.5)', // stone-200/50
    'rgba(254, 240, 138, 0.5)', // yellow-200/50
    'rgba(209, 213, 219, 0.5)', // stone-300/50
    'rgba(254, 249, 195, 0.6)', // yellow-100/60
];

interface Shape {
    id: number;
    size: number;
    top: string;
    left: string;
    animationDuration: string;
    animationDelay: string;
    color: string;
    borderRadius: string;
}

const generateShapes = (numShapes: number): Shape[] => {
    const shapes: Shape[] = [];
    const randomBorderRadius = () => {
        const r = () => `${Math.floor(Math.random() * 40) + 30}%`; // values between 30% and 70%
        return `${r()} ${r()} ${r()} ${r()} / ${r()} ${r()} ${r()} ${r()}`;
    };

    for (let i = 0; i < numShapes; i++) {
        shapes.push({
            id: i,
            size: Math.random() * 120 + 20, // 20px to 140px
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 20 + 15}s`, // 15s to 35s
            animationDelay: `${Math.random() * 5}s`,
            color: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: randomBorderRadius(),
        });
    }
    return shapes;
};

const WhimsicalBackground: React.FC = () => {
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [hoveredShapeId, setHoveredShapeId] = useState<number | null>(null);

    useEffect(() => {
        setShapes(generateShapes(15)); // Generate 15 shapes
    }, []);

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden" aria-hidden="true">
            {shapes.map(shape => (
                <div
                    key={shape.id}
                    className="absolute"
                    style={{
                        top: shape.top,
                        left: shape.left,
                        animation: `drift ${shape.animationDuration} infinite ease-in-out alternate`,
                        animationDelay: shape.animationDelay,
                    }}
                >
                    <div
                        onMouseEnter={() => setHoveredShapeId(shape.id)}
                        onMouseLeave={() => setHoveredShapeId(null)}
                        style={{
                            width: `${shape.size}px`,
                            height: `${shape.size}px`,
                            backgroundColor: shape.color,
                            borderRadius: shape.borderRadius,
                            animation: `shape-appear 1.5s ease-out forwards`,
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-radius 0.5s ease',
                            transform: hoveredShapeId === shape.id ? 'scale(1.15)' : 'scale(1)',
                            boxShadow: hoveredShapeId === shape.id ? '0px 8px 25px -5px rgba(0, 0, 0, 0.1)' : 'none',
                            cursor: 'pointer',
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

export default WhimsicalBackground;