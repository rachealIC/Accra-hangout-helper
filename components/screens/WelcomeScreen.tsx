import React from 'react';
import LandingTrotro from '../LandingTrotro';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 z-10 animate-slide-in">
      <div className="relative w-full h-36">
        <LandingTrotro />
      </div>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-[#3E0703] dark:text-slate-100 mb-4">
          Accra Vibe Planner
        </h1>
        <p className="text-[#660B05] dark:text-slate-300 text-xl mb-8 max-w-lg mx-auto">
          Don't search for a spot, Chale. We already mapped the vibe and the bailout plan.
        </p>
        <button
          onClick={onStart}
          className="px-8 py-4 rounded-lg text-xl font-bold transition-all duration-300 transform hover:scale-105 bg-[#8C1007] dark:bg-[#E18C44] text-white dark:text-slate-900 border-[#8C1007] dark:border-[#E18C44] shadow-lg animate-pulse-subtle"
        >
          Let's Go!
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;