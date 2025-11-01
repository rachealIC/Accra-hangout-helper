
import React, { useState, useEffect, useMemo } from 'react';
import {
  VIBE_OPTIONS,
  TIME_WINDOW_OPTIONS,
  BUDGET_OPTIONS,
  AUDIENCE_OPTIONS,
  ROMANTIC_AUDIENCE_OPTIONS,
  TIMING_OPTIONS,
  DATE_MEAL_OPTIONS,
} from './constants';
import type { HangoutParams, SavedPlan } from './types';
import { generatePlanOptions, getTravelDetails } from './services/geminiService';
import PlanDisplay from './components/PlanDisplay';
import DynamicLoading from './components/DynamicLoading';
import HistoryPanel from './components/HistoryPanel';
import Confetti from './components/Confetti';
import { HistoryIcon, SunIcon, MoonIcon, HeartIcon } from './components/Icons';
import LandingTrotro from './components/LandingTrotro';

type AppState = 'WELCOME' | 'GATHERING_INPUT' | 'LOADING' | 'SHOWING_OPTIONS' | 'ASKING_LOCATION' | 'SHOWING_FINAL_PLAN' | 'ERROR';

const LOCAL_STORAGE_KEY = 'accra-vibe-plan-history';
const THEME_KEY = 'accra-vibe-theme';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('WELCOME');
  const [params, setParams] = useState<HangoutParams>({
    vibe: '', timeWindow: '', budget: '', audience: '', timing: '', location: null, proximity: 'any', dateMeal: '',
  });
  const [planOptions, setPlanOptions] = useState<string | null>(null);
  const [finalPlan, setFinalPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userOrigin, setUserOrigin] = useState<string>('');
  const [intendedTime, setIntendedTime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [planHistory, setPlanHistory] = useState<SavedPlan[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // History initialization
    try {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedHistory) {
        setPlanHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load plan history from localStorage", error);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(THEME_KEY, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_KEY, 'light');
      }
      return newMode;
    });
  };

  const savePlanToHistory = (planContent: string) => {
    const newPlan: SavedPlan = {
        id: new Date().toISOString(),
        planContent,
        savedAt: new Date().toISOString(),
        rating: null,
    };
    setPlanHistory(prevHistory => {
        const updatedHistory = [newPlan, ...prevHistory];
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to save plan history to localStorage", error);
        }
        return updatedHistory;
    });
  };

  const handleRatePlan = (id: string, rating: number) => {
      setPlanHistory(prevHistory => {
          const updatedHistory = prevHistory.map(plan =>
              plan.id === id ? { ...plan, rating } : plan
          );
          try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));
          } catch (error) {
              console.error("Failed to update plan rating in localStorage", error);
          }
          return updatedHistory;
      });
  };

  const questions = useMemo(() => {
      const audienceQuestion = params.vibe === 'Romantic Date'
        ? { key: 'audience', options: ROMANTIC_AUDIENCE_OPTIONS, prompt: 'And who is this romantic date for?' }
        : { key: 'audience', options: AUDIENCE_OPTIONS, prompt: 'Who are you rolling with?' };

      return [
        { key: 'vibe', options: VIBE_OPTIONS, prompt: "First, what's the vibe?" },
        ...(params.vibe === 'Romantic Date' ? [{ key: 'dateMeal', options: DATE_MEAL_OPTIONS, prompt: 'Perfect! What time of day?' }] : []),
        { key: 'timeWindow', options: TIME_WINDOW_OPTIONS, prompt: 'How much time have you got?' },
        { key: 'budget', options: BUDGET_OPTIONS, prompt: 'How deep are your pockets?' },
        audienceQuestion,
        { key: 'timing', options: TIMING_OPTIONS, prompt: 'And when are we doing this?' },
      ];
  }, [params.vibe]);
  
  const handleOptionSelect = (key: keyof HangoutParams, value: any) => {
    setIsTransitioning(true);
    setTimeout(() => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);

        const isLastQuestion = currentStep >= questions.length - 1;

        if (isLastQuestion) {
          handleSubmit({ ...newParams, proximity: 'any' });
        } else {
          setCurrentStep(currentStep + 1);
        }
        setIsTransitioning(false);
    }, 300);
  };
  
  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
        if (currentStep > 0) {
          const previousKey = questions[currentStep - 1].key as keyof HangoutParams;
          // Reset the data for the step we are leaving, for a cleaner state
          if (params[previousKey]) {
            setParams(prev => ({...prev, [previousKey]: ''}));
          }
          setCurrentStep(currentStep - 1);
        }
        setIsTransitioning(false);
    }, 300);
  };

  const handleSurpriseMe = (key: keyof HangoutParams, options: readonly {name: string, value: any}[]) => {
    const randomIndex = Math.floor(Math.random() * options.length);
    const randomOption = options[randomIndex].value;
    handleOptionSelect(key, randomOption);
  };

  const handleSubmit = async (finalParams: HangoutParams) => {
    setAppState('LOADING');
    try {
      const result = await generatePlanOptions(finalParams);
      setPlanOptions(result);
      setAppState('SHOWING_OPTIONS');
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
      setAppState('ERROR');
    }
  };
  
  const handleFindCloser = () => {
      if (!navigator.geolocation) {
          setError("Geolocation is not supported by your browser.");
          setAppState('ERROR');
          return;
      }
      
      setIsRequestingLocation(true);
      navigator.geolocation.getCurrentPosition(
          (position) => {
              setIsRequestingLocation(false);
              // Now that we have permission, show the loading screen.
              setAppState('LOADING');
              const newLocation = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
              };
              const closerParams = { 
                  ...params, 
                  location: newLocation, 
                  proximity: 'close' as const 
              };
              setParams(closerParams); // Update main params state
              handleSubmit(closerParams);
          },
          (err: GeolocationPositionError) => {
              setIsRequestingLocation(false);
              console.error("Error getting location: ", err);
              
              let userMessage = "Couldn't get your location. Please allow location access and try again.";
              switch (err.code) {
                  case err.PERMISSION_DENIED:
                      userMessage = "It looks like you've denied location access. Please enable it in your browser settings to find closer vibes.";
                      break;
                  case err.POSITION_UNAVAILABLE:
                      userMessage = "We couldn't determine your current location. Please check your network connection or try again later.";
                      break;
                  case err.TIMEOUT:
                      userMessage = "Finding your location took too long. Please try again.";
                      break;
              }

              setError(userMessage);
              setAppState('ERROR');
          }
      );
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    setAppState('ASKING_LOCATION');
  };

  const handleLocationSubmit = async () => {
      const trimmedOrigin = userOrigin.trim();
      const trimmedTime = intendedTime.trim();
      if (!trimmedOrigin || !trimmedTime || !selectedPlan) return;
      
      setAppState('LOADING');

      const getDestinationFromPlan = (plan: string): string | null => {
          const lines = plan.split('\n');
          const locationLine = lines.find(line => line.trim().startsWith('Location:'));
          if (!locationLine) return null;
          return locationLine.replace('Location:', '').trim();
      };
      
      const destination = getDestinationFromPlan(selectedPlan);

      if (!destination) {
          setError('Could not find a destination in the selected plan.');
          setAppState('ERROR');
          return;
      }

      try {
          const travelInfo = await getTravelDetails(trimmedOrigin, destination, trimmedTime);
          const fullPlan = `${selectedPlan}\n\n---\n${travelInfo}`;
          setFinalPlan(fullPlan);
          savePlanToHistory(fullPlan);
          setAppState('SHOWING_FINAL_PLAN');
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000); // Confetti lasts 4 seconds
      } catch (e: any) {
          setError(e.message || 'An unexpected error occurred.');
          setAppState('ERROR');
      }
  };

  const handleRestart = () => {
    setParams({ ...params, vibe: '', timeWindow: '', budget: '', audience: '', timing: '', proximity: 'any', dateMeal: '', location: null });
    setCurrentStep(0);
    setPlanOptions(null);
    setFinalPlan(null);
    setSelectedPlan(null);
    setUserOrigin('');
    setIntendedTime('');
    setError(null);
    setLocationError(null);
    setAppState('WELCOME');
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  const mainContent = () => {
    if (appState === 'WELCOME') {
        return (
            <div className="flex flex-col items-center justify-center text-center p-4 z-10 animate-slide-in">
                <div className="relative w-full h-40 md:h-48">
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
                        onClick={() => setAppState('GATHERING_INPUT')}
                        className="px-8 py-4 rounded-lg text-xl font-bold transition-all duration-300 transform hover:scale-105 bg-[#8C1007] dark:bg-[#E18C44] text-white dark:text-slate-900 border-[#8C1007] dark:border-[#E18C44] shadow-lg animate-pulse-subtle"
                    >
                        Let's Go!
                    </button>
                </div>
            </div>
        );
    }
    if (appState === 'LOADING') {
      return (
        <div className="flex flex-col justify-center items-center text-center p-4 h-full z-10">
          <DynamicLoading />
        </div>
      );
    }
    if (appState === 'SHOWING_OPTIONS' && planOptions) {
      return <PlanDisplay 
          planContent={planOptions} 
          onRestart={handleRestart} 
          onSelectPlan={handlePlanSelect}
          onFindCloser={handleFindCloser}
          isRequestingLocation={isRequestingLocation}
      />;
    }
    if (appState === 'ASKING_LOCATION') {
       return (
          <div className="flex flex-col justify-center items-center p-4 h-full z-10">
               <div className="w-full max-w-md bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-white/50 dark:border-slate-700/50 text-left animate-slide-in">
                   <h2 className="text-2xl font-bold text-[#3E0703] dark:text-slate-100 mb-2 text-center">One Last Step...</h2>
                   <p className="text-[#660B05] dark:text-slate-300 mb-6 text-lg text-center">Let's check the route! Tell us your starting point and travel time for a live traffic and weather forecast.</p>
                   <div className="space-y-6">
                       <div>
                           <label htmlFor="userOrigin" className="block text-lg font-semibold text-[#3E0703] dark:text-slate-200 mb-2">Where will you be coming from?</label>
                           <input
                              id="userOrigin"
                              type="text"
                              value={userOrigin}
                              onChange={(e) => setUserOrigin(e.target.value)}
                              placeholder="e.g., Accra Mall or East Legon"
                              className="w-full px-4 py-3 border-2 border-[#8C1007]/50 dark:border-[#E18C44]/50 bg-transparent dark:bg-slate-700/50 rounded-lg focus:ring-2 focus:ring-[#8C1007] dark:focus:ring-[#E18C44] focus:border-[#8C1007] dark:focus:border-[#E18C44] outline-none transition text-[#3E0703] dark:text-slate-100 placeholder:text-[#660B05]/70 dark:placeholder:text-slate-400"
                           />
                       </div>
                       <div>
                            <label htmlFor="intendedTime" className="block text-lg font-semibold text-[#3E0703] dark:text-slate-200 mb-2">What time do you plan to go?</label>
                           <input
                              id="intendedTime"
                              type="text"
                              value={intendedTime}
                              onChange={(e) => setIntendedTime(e.target.value)}
                              placeholder="e.g., Tomorrow at 5 PM, Saturday morning"
                              className="w-full px-4 py-3 border-2 border-[#8C1007]/50 dark:border-[#E18C44]/50 bg-transparent dark:bg-slate-700/50 rounded-lg focus:ring-2 focus:ring-[#8C1007] dark:focus:ring-[#E18C44] focus:border-[#8C1007] dark:focus:border-[#E18C44] outline-none transition text-[#3E0703] dark:text-slate-100 placeholder:text-[#660B05]/70 dark:placeholder:text-slate-400"
                           />
                       </div>
                   </div>
                   <button
                      onClick={handleLocationSubmit}
                      disabled={!userOrigin.trim() || !intendedTime.trim()}
                      className="w-full mt-8 py-3 px-6 bg-[#8C1007] dark:bg-[#E18C44] text-white dark:text-slate-900 font-bold rounded-lg shadow-md hover:bg-[#660B05] dark:hover:bg-[#f3a469] disabled:bg-[#8C1007]/50 dark:disabled:bg-[#E18C44]/50 transition-all"
                   >
                      Check Route & Weather
                   </button>
               </div>
          </div>
       )
    }
    if (appState === 'SHOWING_FINAL_PLAN' && finalPlan) {
      return <PlanDisplay planContent={finalPlan} onRestart={handleRestart} isFinalPlan={true} />;
    }
    if (appState === 'ERROR') {
        return (
           <div className="flex flex-col justify-center items-center text-center p-4 h-full z-10">
               <div className="w-full max-w-md bg-white/80 dark:bg-red-900/40 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-red-200/50" role="alert">
                  <h2 className="text-2xl font-bold text-[#8C1007] dark:text-red-300 mb-4">Oops! Something went wrong.</h2>
                  <p className="text-[#3E0703] dark:text-red-200 mb-6" aria-live="polite">{error}</p>
                   <button onClick={handleRestart} className="px-6 py-2 bg-[#3E0703] dark:bg-red-800 text-white rounded-lg">Try Again</button>
               </div>
           </div>
        )
    }

    const currentQuestion = questions[currentStep];

    return (
      <div className="flex flex-col items-center justify-center p-4 z-10">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-[#8C1007]/20 dark:bg-slate-700 rounded-full h-2.5 w-full mb-8">
            <div className="bg-[#8C1007] dark:bg-[#E18C44] h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <div className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 pt-16 sm:p-8 sm:pt-12 transition-all duration-500 relative ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
             {currentStep > 0 && (
               <button 
                 onClick={handleBack} 
                 className="absolute top-2 left-3 sm:top-3 sm:left-4 text-[#3E0703] dark:text-slate-200 hover:text-[#8C1007] dark:hover:text-white font-bold transition-all flex items-center text-lg py-3 px-4 sm:py-4 rounded-lg hover:bg-[#8C1007]/10 dark:hover:bg-[#E18C44]/20"
                 aria-label="Go back to previous question"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                 </svg>
                 Back
               </button>
             )}
            <div className="text-center animate-slide-in" key={currentStep}>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#3E0703] dark:text-slate-100 mb-6 sm:mt-4">{currentQuestion.prompt}</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {currentQuestion.options.map((option) => (
                  <div key={option.value} className="flex flex-col items-center">
                    <button
                      onClick={() => handleOptionSelect(currentQuestion.key as keyof HangoutParams, option.value)}
                      className="px-5 py-3 rounded-lg border-2 text-base font-bold transition-all duration-200 transform hover:scale-105 active:scale-100 bg-[#8C1007] dark:bg-[#E18C44] text-white dark:text-slate-900 border-[#8C1007] dark:border-[#E18C44] hover:bg-[#660B05] dark:hover:bg-[#f3a469]"
                    >
                      {option.name}
                    </button>
                    {currentQuestion.key === 'budget' && (
                        <span className="text-xs text-[#660B05] dark:text-slate-400 mt-1.5 px-2 text-center w-40 h-8">
                            {option.name === 'Basically Free' ? '(Street food, parks, etc.)' :
                             option.name === 'Mid-Range' ? '(Approx. GH₵80 - GH₵200 pp)' :
                             option.name === 'Feeling Fancy' ? '(Approx. GH₵250+ pp)' : ''}
                        </span>
                    )}
                  </div>
                ))}
              </div>

              {(currentQuestion.key === 'vibe' || currentQuestion.key === 'timeWindow') && (
                <>
                  <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-[#8C1007]/30 dark:border-slate-600"></div>
                    <span className="flex-shrink mx-4 text-[#660B05] dark:text-slate-400 font-semibold">or</span>
                    <div className="flex-grow border-t border-[#8C1007]/30 dark:border-slate-600"></div>
                  </div>
                  <button
                    onClick={() => handleSurpriseMe(currentQuestion.key as keyof HangoutParams, currentQuestion.options)}
                    className="px-6 py-4 rounded-lg border-2 text-base font-bold transition-all duration-200 transform hover:scale-105 active:scale-100 bg-[#660B05] dark:bg-[#e18b44] text-white dark:text-slate-900 border-[#8C1007] dark:border-[#E18C44] shadow-lg animate-pulse-subtle"
                  >
                    Just Surprise Me, Chale!
                  </button>
                </>
              )}

              {locationError && <p className="text-[#8C1007] text-sm mt-6">{locationError}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FFFCF5] dark:bg-slate-900 overflow-hidden pb-10">
        {showConfetti && <Confetti />}
        <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
            <button
                onClick={toggleDarkMode}
                className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:hover:bg-slate-700 transition-all text-[#3E0703] dark:text-slate-200"
                aria-label="Toggle dark mode"
            >
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
                onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
                className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:hover:bg-slate-700 transition-all text-[#3E0703] dark:text-slate-200"
                aria-label="Toggle history panel"
            >
                <HistoryIcon />
            </button>
        </div>

        <main className={`transition-all duration-500 ease-in-out w-full min-h-screen ${isHistoryPanelOpen ? 'pl-0 md:pl-80' : 'pl-0'}`}>
            <div className="min-h-screen flex flex-col justify-center">
              {mainContent()}
            </div>
        </main>

        <HistoryPanel
            history={planHistory}
            isOpen={isHistoryPanelOpen}
            onClose={() => setIsHistoryPanelOpen(false)}
            onRatePlan={handleRatePlan}
        />
        <footer className="fixed bottom-0 left-0 right-0 p-3 text-center text-xs text-[#660B05]/80 dark:text-slate-400 bg-[#FFFCF5]/50 dark:bg-slate-900/50 backdrop-blur-sm z-20">
            Developed by Racheal Kuranchie, kuranchieracheal35@gmail.com, with love <HeartIcon />
        </footer>
    </div>
  );
};

export default App;
