import React, { useState, useEffect, useMemo } from 'react';
import {
  VIBE_OPTIONS,
  TIME_WINDOW_OPTIONS,
  BUDGET_OPTIONS,
  AUDIENCE_OPTIONS,
  TIMING_OPTIONS,
  DATE_MEAL_OPTIONS,
} from './constants';
import type { HangoutParams, HistoryItem } from './types';
import { generatePlanOptions, getTravelDetails } from './services/geminiService';
import PlanDisplay from './components/PlanDisplay';
import WhimsicalBackground from './components/WhimsicalBackground';
import DynamicLoading from './components/DynamicLoading';
import HistoryPanel from './components/HistoryPanel';
import Confetti from './components/Confetti';
import { HistoryIcon } from './components/Icons';

type AppState = 'WELCOME' | 'GATHERING_INPUT' | 'LOADING' | 'SHOWING_OPTIONS' | 'ASKING_LOCATION' | 'SHOWING_FINAL_PLAN' | 'ERROR';

// Helper to get the title from a plan string
const getTitleFromPlan = (planText: string) => {
    const titleLine = planText.split('\n').find(line => line.startsWith('Title:'));
    return titleLine ? titleLine.replace('Title:', '').trim() : 'a Vibe Plan';
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('WELCOME');
  const [params, setParams] = useState<HangoutParams>({
    vibe: '', timeWindow: '', budget: '', audience: '', timing: '', location: null, proximity: 'any', dateMeal: '',
  });
  const [planOptions, setPlanOptions] = useState<string | null>(null);
  const [finalPlan, setFinalPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userOrigin, setUserOrigin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);

  const addToHistory = (item: Omit<HistoryItem, 'id'>) => {
    setHistory(prev => [...prev, { ...item, id: new Date().toISOString() + Math.random() }]);
  };

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

  const questions = useMemo(() => {
      const audienceQuestion = params.vibe === 'Romantic Date'
        ? { key: 'audience', options: ["Just the Two of Us", "It's a Double Date"], prompt: 'And who is this romantic date for?' }
        : { key: 'audience', options: AUDIENCE_OPTIONS, prompt: 'Who you rolling with?' };

      const baseQuestions = [
        { key: 'vibe', options: VIBE_OPTIONS, prompt: "First, what's the vibe?" },
        ...(params.vibe === 'Romantic Date' ? [{ key: 'dateMeal', options: DATE_MEAL_OPTIONS, prompt: 'Perfect! What time of day?' }] : []),
        { key: 'timeWindow', options: TIME_WINDOW_OPTIONS, prompt: 'How much time you got?' },
        { key: 'budget', options: BUDGET_OPTIONS.map(o => o.name), prompt: 'How deep are your pockets?' },
        audienceQuestion,
        { key: 'timing', options: TIMING_OPTIONS, prompt: 'And when are we doing this?' },
      ];
      return baseQuestions;
  }, [params.vibe]);
  
  const getStepLabel = (key: string): string => {
      switch(key) {
        case 'vibe': return 'Vibe';
        case 'dateMeal': return 'Date Meal';
        case 'timeWindow': return 'Time';
        case 'budget': return 'Budget';
        case 'audience': return 'Group';
        case 'timing': return 'Timing';
        default: return 'Choice';
      }
  };

  const handleOptionSelect = (key: keyof HangoutParams, value: any) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    addToHistory({ type: 'user', label: `Selected ${getStepLabel(key)}`, content: value });

    const isLastQuestion = currentStep >= questions.length - 1;

    if (isLastQuestion) {
      handleSubmit({ ...newParams, proximity: 'any' });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      if(questions[currentStep].key === 'dateMeal') {
          setParams({...params, vibe: '', dateMeal: ''});
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSurpriseMe = (key: keyof HangoutParams, options: readonly string[]) => {
    const randomIndex = Math.floor(Math.random() * options.length);
    const randomOption = options[randomIndex];
    handleOptionSelect(key, randomOption);
  };

  const handleSubmit = async (finalParams: HangoutParams) => {
    setAppState('LOADING');
    try {
      const result = await generatePlanOptions(finalParams);
      setPlanOptions(result);
      addToHistory({ type: 'ai', label: 'Generated Vibes', content: 'Here are a couple of options for you.' });
      setAppState('SHOWING_OPTIONS');
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
      setAppState('ERROR');
    }
  };
  
  const handleFindCloser = () => {
      const closerParams = { ...params, proximity: 'close' as const };
      addToHistory({ type: 'user', label: 'New Request', content: 'Find something closer to me.' });
      handleSubmit(closerParams);
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    addToHistory({ type: 'user', label: 'Chose Vibe', content: getTitleFromPlan(plan) });
    setAppState('ASKING_LOCATION');
  };

  const handleLocationSubmit = async () => {
      if (!userOrigin.trim() || !selectedPlan) return;
      setAppState('LOADING');
      addToHistory({ type: 'user', label: 'Starting From', content: userOrigin });
      try {
          const travelInfo = await getTravelDetails(userOrigin, selectedPlan);
          setFinalPlan(`${selectedPlan}\n\n---\n${travelInfo}`);
          addToHistory({ type: 'ai', label: 'Final Plan Ready', content: 'Calculated travel time and traffic.' });
          setAppState('SHOWING_FINAL_PLAN');
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000); // Confetti lasts 4 seconds
      } catch (e: any) {
          setError(e.message || 'An unexpected error occurred.');
          setAppState('ERROR');
      }
  };

  const handleRestart = () => {
    setParams({ ...params, vibe: '', timeWindow: '', budget: '', audience: '', timing: '', proximity: 'any', dateMeal: '' });
    setCurrentStep(0);
    setPlanOptions(null);
    setFinalPlan(null);
    setSelectedPlan(null);
    setUserOrigin('');
    setError(null);
    setHistory([]);
    setAppState('WELCOME');
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  const mainContent = () => {
    if (appState === 'WELCOME') {
        return (
            <div className="flex flex-col items-center justify-center text-center p-4 h-full z-10 animate-slide-in">
                <div className="w-full max-w-2xl mx-auto">
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-[#3E0703] mb-4">Accra Vibe Planner</h1>
                    <p className="text-[#660B05] text-lg mb-8 max-w-lg mx-auto">
                        Finally, a planner that understands Accra traffic... your introverted soul, your group indecisions and find the perfect spot for you.
                    </p>
                    <button
                        onClick={() => setAppState('GATHERING_INPUT')}
                        className="px-8 py-4 rounded-lg text-xl font-bold transition-all duration-300 transform hover:scale-105 bg-[#8C1007] text-white border-[#8C1007] shadow-lg"
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
          isLocationAvailable={!!params.location}
      />;
    }
    if (appState === 'ASKING_LOCATION') {
       return (
          <div className="flex flex-col justify-center items-center p-4 h-full z-10">
               <div className="w-full max-w-md bg-white/60 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-white/50 text-center animate-slide-in">
                   <h2 className="text-2xl font-bold text-[#3E0703] mb-4">One last thing...</h2>
                   <p className="text-[#660B05] mb-6 text-lg">To calculate the travel time and traffic, where will you be coming from?</p>
                   <input
                      type="text"
                      value={userOrigin}
                      onChange={(e) => setUserOrigin(e.target.value)}
                      placeholder="e.g., Accra Mall or East Legon"
                      className="w-full px-4 py-3 border-2 border-[#8C1007]/50 rounded-lg focus:ring-2 focus:ring-[#8C1007] focus:border-[#8C1007] outline-none transition"
                   />
                   <button
                      onClick={handleLocationSubmit}
                      disabled={!userOrigin.trim()}
                      className="w-full mt-4 py-3 px-6 bg-[#8C1007] text-white font-bold rounded-lg shadow-md hover:bg-[#660B05] disabled:bg-[#8C1007]/50 transition-all"
                   >
                      Get Travel Details
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
               <div className="w-full max-w-md bg-white/80 p-8 rounded-lg shadow-xl">
                  <h2 className="text-2xl font-bold text-[#8C1007] mb-4">Oops! Something went wrong.</h2>
                  <p className="text-[#3E0703] mb-6">{error}</p>
                   <button onClick={handleRestart} className="px-6 py-2 bg-[#3E0703] text-white rounded-lg">Try Again</button>
               </div>
           </div>
        )
    }

    const currentQuestion = questions[currentStep];

    return (
      <div className="flex flex-col items-center justify-center p-4 h-full z-10">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-[#8C1007]/20 rounded-full h-2.5 w-full mb-8">
            <div className="bg-[#8C1007] h-2.5 rounded-full animate-progress" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 transition-all duration-500 relative">
             {currentStep > 0 && (
               <button 
                 onClick={handleBack} 
                 className="absolute top-4 left-4 text-[#3E0703] hover:text-[#8C1007] font-bold transition-all flex items-center text-lg p-2 rounded-lg hover:bg-[#8C1007]/10"
                 aria-label="Go back"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                 </svg>
                 Back
               </button>
             )}
            <div className="text-center animate-slide-in" key={currentStep}>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#3E0703] mb-6">{currentQuestion.prompt}</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(currentQuestion.key as keyof HangoutParams, option)}
                    className="px-5 py-3 rounded-lg border-2 text-base font-bold transition-all duration-200 transform hover:scale-105 bg-[#8C1007] text-white border-[#8C1007] hover:bg-[#660B05]"
                  >
                    {option}
                  </button>
                ))}
              </div>

              {(currentQuestion.key === 'vibe' || currentQuestion.key === 'timeWindow') && (
                <>
                  <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-[#8C1007]/30"></div>
                    <span className="flex-shrink mx-4 text-[#660B05] font-semibold">or</span>
                    <div className="flex-grow border-t border-[#8C1007]/30"></div>
                  </div>
                  <button
                    onClick={() => handleSurpriseMe(currentQuestion.key as keyof HangoutParams, currentQuestion.options)}
                    className="px-6 py-4 rounded-lg border-2 text-base font-bold transition-all duration-200 transform hover:scale-105 bg-[#660B05] text-white border-[#8C1007] shadow-lg animate-pulse-subtle"
                  >
                    Just Surprise Me, Chale!
                  </button>
                </>
              )}

              {locationError && currentStep === 0 && <p className="text-[#8C1007] text-sm mt-6">{locationError}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FFFCF5] overflow-hidden">
        <WhimsicalBackground />
        {showConfetti && <Confetti />}
        <button
            onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
            className="fixed top-4 left-4 z-30 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
            aria-label="Toggle history panel"
        >
            <HistoryIcon />
        </button>

        <main className={`transition-all duration-500 ease-in-out w-full min-h-screen overflow-y-auto ${isHistoryPanelOpen ? 'pl-0 md:pl-80' : 'pl-0'}`}>
            {mainContent()}
        </main>

        <HistoryPanel
            history={history}
            isOpen={isHistoryPanelOpen}
            onClose={() => setIsHistoryPanelOpen(false)}
        />
    </div>
  );
};

export default App;