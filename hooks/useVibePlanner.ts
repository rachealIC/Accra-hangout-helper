import { useState, useEffect } from 'react';
import type { HangoutParams, SavedPlan, Location, AppState } from '../types';
import { generatePlanOptions, getTravelDetails } from '../services/geminiService';
import { initiatePayment } from '../services/paystackService';
import { verifyPayment } from '../api/verify-payment';


const LOCAL_STORAGE_KEY = 'accra-vibe-plan-history';
const RATE_LIMIT_KEY = 'accra-vibe-last-plan-timestamp';
const SUB_STATUS_KEY = 'accra-vibe-subscription-status';
const SUB_EXPIRY_KEY = 'accra-vibe-subscription-expiry';
const PLAN_COUNT_KEY = 'accra-vibe-plan-count';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MICRO_BOOST_VALIDITY_MS = 48 * 60 * 60 * 1000;
const POWER_PLANNER_VALIDITY_MS = 30 * DAY_IN_MS;
const MICRO_BOOST_PLAN_LIMIT = 5;
const POWER_PLANNER_PLAN_LIMIT = 150;


interface UseVibePlannerProps {
  setPlanHistory: React.Dispatch<React.SetStateAction<SavedPlan[]>>;
}

export const useVibePlanner = ({ setPlanHistory }: UseVibePlannerProps) => {
  const [appState, setAppState] = useState<AppState>('WELCOME');
  const [params, setParams] = useState<HangoutParams>({
    vibe: '', timeWindow: '', budget: '', audience: '', timing: '', location: null, proximity: 'any', dateMeal: '', specificDateTime: '', groupSize: undefined
  });
  const [planOptions, setPlanOptions] = useState<string | null>(null);
  const [finalPlan, setFinalPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [rateLimitTimeLeft, setRateLimitTimeLeft] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
     if (!process.env.API_KEY) {
        setError("This application is not configured correctly. An API key is required.");
        setAppState('ERROR');
     }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (appState === 'RATE_LIMITED' && rateLimitTimeLeft > 0) {
      timer = setInterval(() => {
        setRateLimitTimeLeft(prev => Math.max(0, prev - 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [appState, rateLimitTimeLeft]);
  
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

  const handleOptionSelect = (key: keyof HangoutParams, value: any) => {
    setIsTransitioning(true);
    setTimeout(() => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);
        setCurrentStep(prev => prev + 1);
        setIsTransitioning(false);
    }, 300);
  };
  
  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handleSurpriseMe = (key: keyof HangoutParams, options: readonly {name: string, value: any}[]) => {
    const randomIndex = Math.floor(Math.random() * options.length);
    const randomOption = options[randomIndex].value;
    handleOptionSelect(key, randomOption);
  };
  
  const handleStartPlanning = () => {
    const subStatus = localStorage.getItem(SUB_STATUS_KEY);
    const subExpiry = localStorage.getItem(SUB_EXPIRY_KEY);
    
    if (subStatus && subExpiry && Date.now() < parseInt(subExpiry, 10)) {
        const planCount = parseInt(localStorage.getItem(PLAN_COUNT_KEY) || '0', 10);
        
        if (subStatus === 'micro-boost' && planCount < MICRO_BOOST_PLAN_LIMIT) {
            setAppState('GATHERING_INPUT');
            return;
        }
        if (subStatus === 'power-planner' && planCount < POWER_PLANNER_PLAN_LIMIT) {
            setAppState('GATHERING_INPUT');
            return;
        }
    } else if (subStatus || subExpiry) {
        localStorage.removeItem(SUB_STATUS_KEY);
        localStorage.removeItem(SUB_EXPIRY_KEY);
        localStorage.removeItem(PLAN_COUNT_KEY);
    }

    const lastPlanTimestamp = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastPlanTimestamp) {
        const timeSinceLastPlan = Date.now() - parseInt(lastPlanTimestamp, 10);
        if (timeSinceLastPlan < DAY_IN_MS) {
            setRateLimitTimeLeft(DAY_IN_MS - timeSinceLastPlan);
            setAppState('RATE_LIMITED');
            return;
        } else {
             localStorage.removeItem(RATE_LIMIT_KEY);
        }
    }

    localStorage.setItem(PLAN_COUNT_KEY, '0');
    setAppState('GATHERING_INPUT');
  };

  const activateSubscription = (plan: 'micro-boost' | 'power-planner') => {
    let expiry: number;
    const lastPlanTimestamp = localStorage.getItem(RATE_LIMIT_KEY);
    const initialPlanCount = lastPlanTimestamp ? 1 : 0;

    if (plan === 'micro-boost') {
        expiry = Date.now() + MICRO_BOOST_VALIDITY_MS;
        localStorage.setItem(SUB_STATUS_KEY, 'micro-boost');
    } else {
        expiry = Date.now() + POWER_PLANNER_VALIDITY_MS;
        localStorage.setItem(SUB_STATUS_KEY, 'power-planner');
    }
    localStorage.setItem(SUB_EXPIRY_KEY, expiry.toString());
    localStorage.setItem(PLAN_COUNT_KEY, initialPlanCount.toString());

    // Transition to the main app after successful activation
    setAppState('GATHERING_INPUT');
    setCurrentStep(0);
  };

  const handlePaymentInitiation = (plan: 'micro-boost' | 'power-planner', email: string) => {
    const planDetails = {
      'micro-boost': { amount: 3 },
      'power-planner': { amount: 60 },
    };

    initiatePayment({
      email,
      amount: planDetails[plan].amount,
      onSuccess: async (response) => {
        // Payment modal was successful, now verify on the (mock) backend
        alert("Payment successful! Verifying your transaction...");
        const verification = await verifyPayment(response.reference);
        if (verification.success) {
          alert("Verification successful! Your plan is activated.");
          activateSubscription(plan);
        } else {
          setError("Payment verification failed. Please contact support.");
          setAppState('ERROR');
        }
      },
      onClose: () => {
        // User closed the modal
        alert("Payment was not completed.");
      }
    });
  };

  const handleRegenerate = () => {
      handleSubmit(params);
  };

  const handleSpecificTimeSubmit = (date: string, hour: string, minute: string, ampm: string) => {
    let hour24 = parseInt(hour, 10);
    if (ampm === 'PM' && hour24 < 12) hour24 += 12;
    if (ampm === 'AM' && hour24 === 12) hour24 = 0;
    
    const formattedTime = `${String(hour24).padStart(2, '0')}:${minute}`;
    
    const finalDateTime = date ? `${date}T${formattedTime}` : formattedTime;
    
    const newParams = { ...params, specificDateTime: finalDateTime };
    setParams(newParams);
    handleSubmit(newParams);
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
        setAppState('LOADING');
        const newLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        const closerParams = { ...params, location: newLocation, proximity: 'close' as const };
        setParams(closerParams);
        handleSubmit(closerParams);
      },
      (err: GeolocationPositionError) => {
        setIsRequestingLocation(false);
        let userMessage = "Couldn't get your location.";
        if (err.code === err.PERMISSION_DENIED) {
          userMessage = "Please enable location access in your browser settings to find closer vibes.";
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

  const handleLocationSubmit = async (origin: string, originCoords: Location | null, intendedTime: string) => {
      if (!origin || !intendedTime || !selectedPlan) return;
      
      setAppState('LOADING');
      
      const destination = selectedPlan.split('\n').find(line => line.trim().startsWith('Location:'))?.replace('Location:', '').trim();

      if (!destination) {
          setError('Could not find a destination in the selected plan.');
          setAppState('ERROR');
          return;
      }
      
      const finalParams = { ...params, specificDateTime: intendedTime };
      setParams(finalParams);

      try {
          const travelInfo = await getTravelDetails(origin, destination, intendedTime, originCoords);
          const fullPlan = `${selectedPlan}\n\n---\n${travelInfo}`;
          setFinalPlan(fullPlan);
          savePlanToHistory(fullPlan);

          const subStatus = localStorage.getItem(SUB_STATUS_KEY);
          const subExpiry = localStorage.getItem(SUB_EXPIRY_KEY);

          if (subStatus && subExpiry && Date.now() < parseInt(subExpiry, 10)) {
              const currentCount = parseInt(localStorage.getItem(PLAN_COUNT_KEY) || '0', 10);
              localStorage.setItem(PLAN_COUNT_KEY, (currentCount + 1).toString());
          } else {
              localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
              localStorage.setItem(PLAN_COUNT_KEY, '1');
          }

          setAppState('SHOWING_FINAL_PLAN');
      } catch (e: any) {
          setError(e.message || 'An unexpected error occurred.');
          setAppState('ERROR');
      }
  };
  
  const handleLocationBack = () => {
    setAppState('SHOWING_OPTIONS');
    setSelectedPlan(null);
  };

  const handleRestart = () => {
    setParams({ vibe: '', timeWindow: '', budget: '', audience: '', timing: '', location: null, proximity: 'any', dateMeal: '', specificDateTime: '', groupSize: undefined });
    setCurrentStep(0);
    setPlanOptions(null);
    setFinalPlan(null);
    setSelectedPlan(null);
    setError(null);
    setAppState('WELCOME');
  };

  return {
    appState,
    params,
    planOptions,
    finalPlan,
    error,
    isRequestingLocation,
    rateLimitTimeLeft,
    currentStep,
    isTransitioning,
    handleStartPlanning,
    handlePaymentInitiation,
    handleOptionSelect,
    handleSubmit,
    handleBack,
    handleSurpriseMe,
    handleSpecificTimeSubmit,
    handleFindCloser,
    handlePlanSelect,
    handleLocationSubmit,
    handleLocationBack,
    handleRestart,
    handleRegenerate,
  };
};
