import React, { useState, useEffect } from 'react';
import { TrotroAnimation, CarAnimation, OkadaAnimation, BusAnimation, WalkingPersonAnimation } from './LoadingAnimations';

const animationScenarios = [
  {
    vehicle: 'Trotro',
    animation: <TrotroAnimation />,
  },
  {
    vehicle: 'Ride-share',
    animation: <CarAnimation />,
  },
  {
    vehicle: 'Okada',
    animation: <OkadaAnimation />,
  },
  {
    vehicle: 'Bus',
    animation: <BusAnimation />,
  },
  {
    vehicle: 'Walk',
    animation: <WalkingPersonAnimation />,
  },
];

const loadingTexts = [
  "Halt! The server has detected a massive roadblock: a Saturday wedding reception is blocking the entire street.  Recalculating the plan to bypass all the aso-ebi and jollof queues. Just a moment, please!",
  "Panic mode! The device we use to plan has 2% battery.   Finding the nearest charging port now!   Once fully charged (and the music is sorted), your low-battery-friendly plan will appear.",
  'Ama: "Are we on time?" Kofi: "Ah, don\'t worry, Chale.   We are running on Ghana Man Time (GMT).   The plan will be ready exactly when it feels ready. Enjoy the wait!"',
  "The Vibe Planner is currently on a video call with your mother.  We are justifying your decision to go out and ensuring you eat properly. Once we get her blessing, the plan is live!",
  "Loading paused! The server is in a heated debate over who has the better team: Kotoko or Hearts of Oak.  Once a winner is declared (or everyone gives up), your plan resumes.",
  "Small moment, Chale. Need to check my tyre pressure. We are flying this plan through the tight spots, so safety first! Prepare for an express delivery!",
  "The planner has reviewed your Vibe and is asking a crucial question:   'Are you sure you don't just want to order pizza and watch Netflix?'  We support either choice! Generating both possibilities now!",
  "Driver: 'Ah, this GPS! I know the route more than you! Just relax, Madam/Oga.  The system is calculating the shortest cut past the Mall traffic.   We will drop your Vibe plan soonest!'",
  "Chaley, where are you? Planner's Response: Oh, I'm in a car, just turning onto Oxford Street...   (Disclaimer: We haven't even taken our bath yet.  The plan is still loading!)",
  "You chose Trotro and you're in a hurry?  Hmm... Looks like somebody is new to Accra, Chale! Your plan is loading, but maybe call a Bolt next time?   Just kidding! (Mostly.)"
];


const DynamicLoading = () => {
  const [animation, setAnimation] = useState(() => animationScenarios[0].animation);
  const [currentText, setCurrentText] = useState('');
  const [isTextFading, setIsTextFading] = useState(false);

  useEffect(() => {
    // Select a random animation when the component mounts
    const randomAnimationIndex = Math.floor(Math.random() * animationScenarios.length);
    setAnimation(animationScenarios[randomAnimationIndex].animation);
    
    // Set an initial random text
    const randomTextIndex = Math.floor(Math.random() * loadingTexts.length);
    setCurrentText(loadingTexts[randomTextIndex]);

    // Change the text every 4.5 seconds for a lively feel
    const intervalId = setInterval(() => {
      setIsTextFading(true); // Start fade out

      setTimeout(() => {
        setCurrentText(prevText => {
          let newText;
          // Ensure the new text is different from the current one
          do {
            const newIndex = Math.floor(Math.random() * loadingTexts.length);
            newText = loadingTexts[newIndex];
          } while (loadingTexts.length > 1 && newText === prevText);
          return newText;
        });
        setIsTextFading(false); // Start fade in
      }, 500); // Corresponds to the transition duration
    }, 7700);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative z-10 w-full flex flex-col items-center justify-center">
      <div className="w-full h-40 overflow-x-hidden relative">
        {animation}
      </div>
      <div className="mt-4 text-center max-w-md mx-auto h-24 flex items-center justify-center">
        <p className={`text-[#8C1007] dark:text-[#E18C44] text-lg transition-opacity duration-500 ${isTextFading ? 'opacity-0' : 'opacity-100'}`}>
          {currentText}
        </p>
      </div>
    </div>
  );
};

export default DynamicLoading;