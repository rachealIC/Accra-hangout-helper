import React, { useState, useEffect } from 'react';
import { TrotroAnimation, CarAnimation, OkadaAnimation, BusAnimation, WalkingPersonAnimation } from './LoadingAnimations';

const scenarios = [
  {
    vehicle: 'Trotro',
    text: "Planning the route! Lapaz Kasoa! Lapaz Kasoa! 📣 Don't worry, our mate is counting passengers... and he's almost done counting! Your plan will drop when we start moving!",
    animation: <TrotroAnimation />,
  },
  {
    vehicle: 'Ride-share',
    text: "Your ride is almost here! 📱 (Note: May take longer if he stops for fan ice). Almost ready for your pick-up!",
    animation: <CarAnimation />,
  },
  {
    vehicle: 'Okada',
    text: "We dey rush the plan to you! 💨 Just flying past the traffic in East Legon. We promise, the Plan Biker is wearing his helmet!",
    animation: <OkadaAnimation />,
  },
  {
    vehicle: 'Bus',
    text: "All aboard the long trip! Sit back, relax, and we go start the fun (in exactly 5 minutes... or maybe 15).",
    animation: <BusAnimation />,
  },
  {
    vehicle: 'Walk',
    text: "Taking a little walk to find your spot. 👣 Warning: If you see any street vendors selling plantain chips, this plan may take longer! No stress, your solid plan is just around the corner!",
    animation: <WalkingPersonAnimation />,
  },
];

const DynamicLoading = () => {
  const [scenario, setScenario] = useState(scenarios[0]);

  useEffect(() => {
    // Select a random scenario when the component mounts
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    setScenario(scenarios[randomIndex]);
  }, []);

  return (
    <div className="relative z-10 w-full flex flex-col items-center justify-center">
      <div className="w-full h-40 overflow-x-hidden relative">
        {scenario.animation}
      </div>
      <div className="mt-4 text-center max-w-md mx-auto">
        <p className="text-[#8C1007] text-lg">{scenario.text}</p>
      </div>
    </div>
  );
};

export default DynamicLoading;
