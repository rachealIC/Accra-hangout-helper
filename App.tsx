import React, { useState, useEffect, useMemo } from 'react';
import {
  VIBE_OPTIONS,
  TIME_WINDOW_OPTIONS,
  BUDGET_OPTIONS,
  AUDIENCE_OPTIONS,
  TIMING_OPTIONS,
} from './constants';
import type { HangoutParams } from './types';
import { generatePlanOptions, getTravelDetails } from './services/geminiService';
import PlanDisplay from './components/PlanDisplay';
import { LoadingMusicIcon, LoadingArtIcon, LoadingFoodIcon, LoadingShoppingIcon, LoadingAdventureIcon, LoadingRelaxIcon } from './components/LoadingIcons';
import WhimsicalBackground from './components/WhimsicalBackground';

type AppState = 'GATHERING_INPUT' | 'LOADING' | 'SHOWING_OPTIONS' | 'ASKING_LOCATION' | 'SHOWING_FINAL_PLAN' | 'ERROR';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('GATHERING_INPUT');
  const [params, setParams] = useState<HangoutParams>({
    vibe: '', timeWindow: '', budget: '', audience: '', timing: '', location: null, proximity: 'any',
  });
  const [planOptions, setPlanOptions] = useState<string | null>(null);
  const [finalPlan, setFinalPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userOrigin, setUserOrigin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setParams((prev) => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        }));
        setLocationError(null);
      },
      (err) => {
        console.error("Error getting location: ", err);
        setLocationError("Enable location for better suggestions.");
      }
    );
  }, []);

  const questions = useMemo(() => [
    { key: 'vibe', options: VIBE_OPTIONS, prompt: "First, what's the vibe?" },
    { key: 'timeWindow', options: TIME_WINDOW_OPTIONS, prompt: 'How much time you got?' },
    { key: 'budget', options: BUDGET_OPTIONS.map(o => o.name), prompt: 'How deep are your pockets?' },
    { key: 'audience', options: AUDIENCE_OPTIONS, prompt: 'Who you rolling with?' },
    { key: 'timing', options: TIMING_OPTIONS, prompt: 'And when are we doing this?' },
  ], []);

  const handleOptionSelect = (key: keyof HangoutParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last question answered, trigger plan generation
      handleSubmit({ ...params, [key]: value, proximity: 'any' });
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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
      const closerParams = { ...params, proximity: 'close' as const };
      handleSubmit(closerParams);
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    setAppState('ASKING_LOCATION');
  };

  const handleLocationSubmit = async () => {
      if (!userOrigin.trim() || !selectedPlan) return;
      setAppState('LOADING');
      try {
          const travelInfo = await getTravelDetails(userOrigin, selectedPlan);
          setFinalPlan(`${selectedPlan}\n\n---\n${travelInfo}`);
          setAppState('SHOWING_FINAL_PLAN');
      } catch (e: any) {
          setError(e.message || 'An unexpected error occurred.');
          setAppState('ERROR');
      }
  };

  const handleRestart = () => {
    setParams({ ...params, vibe: '', timeWindow: '', budget: '', audience: '', timing: '', proximity: 'any' });
    setCurrentStep(0);
    setPlanOptions(null);
    setFinalPlan(null);
    setSelectedPlan(null);
    setUserOrigin('');
    setError(null);
    setAppState('GATHERING_INPUT');
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  if (appState === 'LOADING') {
    const icons = [
      { Icon: LoadingFoodIcon, delay: '0s' },
      { Icon: LoadingArtIcon, delay: '0.2s' },
      { Icon: LoadingMusicIcon, delay: '0.4s' },
      { Icon: LoadingRelaxIcon, delay: '0.6s' },
      { Icon: LoadingAdventureIcon, delay: '0.8s' },
      { Icon: LoadingShoppingIcon, delay: '1s' },
    ];
    return (
      <div className="relative min-h-screen bg-yellow-50 flex flex-col justify-center items-center text-center p-4 overflow-hidden z-0">
        <WhimsicalBackground />
        <div className="relative z-10">
            <div className="grid grid-cols-3 gap-6 mb-6">
            {icons.map(({ Icon, delay }, index) => (
                <div key={index} className="animate-fade-in-out" style={{ animationDelay: delay }}>
                    <Icon />
                </div>
            ))}
            </div>
            <h2 className="text-2xl font-semibold text-stone-700">Crafting some vibes...</h2>
            <p className="text-stone-500 mt-2">Our AI guide is finding the perfect spots for you.</p>
        </div>
      </div>
    );
  }

  if (appState === 'SHOWING_OPTIONS' && planOptions) {
    return <PlanDisplay 
        planContent={planOptions} 
        onRestart={handleRestart} 
        onSelectPlan={handlePlanSelect}
        onFindCloser={handleFindCloser}
        isLocationAvailable={!!params.location}
    />;
  }

  if (appState === 'ASKING_LOCATION') {
     return (
        <div className="relative min-h-screen bg-[#f4f1ea] flex flex-col justify-center items-center p-4 overflow-hidden z-0">
             <WhimsicalBackground />
             <div className="relative z-10 w-full max-w-md bg-white/70 p-8 rounded-lg shadow-sm border border-stone-200/80 text-center animate-slide-in">
                 <h2 className="text-2xl font-bold text-stone-800 mb-4">One last thing...</h2>
                 <p className="text-stone-600 mb-6 text-lg">To calculate the travel time and traffic, where will you be coming from?</p>
                 <input
                    type="text"
                    value={userOrigin}
                    onChange={(e) => setUserOrigin(e.target.value)}
                    placeholder="e.g., Accra Mall or East Legon"
                    className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 outline-none transition"
                 />
                 <button
                    onClick={handleLocationSubmit}
                    disabled={!userOrigin.trim()}
                    className="w-full mt-4 py-3 px-6 bg-stone-800 text-white font-bold rounded-lg shadow-md hover:bg-stone-900 disabled:bg-stone-400 transition-all"
                 >
                    Get Travel Details
                 </button>
             </div>
        </div>
     )
  }

  if (appState === 'SHOWING_FINAL_PLAN' && finalPlan) {
    return <PlanDisplay planContent={finalPlan} onRestart={handleRestart} />;
  }
  
  if (appState === 'ERROR') {
      return (
         <div className="relative min-h-screen bg-yellow-50 flex flex-col justify-center items-center text-center p-4 overflow-hidden z-0">
             <WhimsicalBackground />
             <div className="relative z-10 w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong.</h2>
                <p className="text-stone-600 mb-6">{error}</p>
                 <button onClick={handleRestart} className="px-6 py-2 bg-stone-800 text-white rounded-lg">Try Again</button>
             </div>
         </div>
      )
  }

  const currentQuestion = questions[currentStep];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden z-0">
      <WhimsicalBackground />
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-stone-800 mb-2">Accra Vibe Planner</h1>
        <p className="text-stone-600 text-lg text-center mb-6">Your AI guide to the perfect Accra hangout.</p>
        <div className="bg-stone-200 rounded-full h-2.5 w-full mb-8">
          <div className="bg-stone-600 h-2.5 rounded-full animate-progress" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-500 relative">
           {currentStep > 0 && (
             <button 
               onClick={handleBack} 
               className="absolute top-4 left-4 text-stone-600 hover:text-stone-900 font-bold transition-all flex items-center text-lg p-2 rounded-lg hover:bg-stone-100/70"
               aria-label="Go back"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
               </svg>
               Back
             </button>
           )}
          <div className="text-center animate-slide-in" key={currentStep}>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">{currentQuestion.prompt}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(currentQuestion.key as keyof HangoutParams, option)}
                  className="px-5 py-3 rounded-lg border-2 text-base font-bold transition-all duration-200 transform hover:scale-105 bg-stone-800 text-white border-stone-800"
                >
                  {option}
                </button>
              ))}
            </div>
            {locationError && currentStep === 0 && <p className="text-yellow-600 text-sm mt-6">{locationError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;