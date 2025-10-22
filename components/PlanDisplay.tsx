import React, { useState } from 'react';
import { ShareIcon, RestartIcon, LocationIcon, TravelIcon, TipIcon, MissionIcon, CostIcon, VibeIcon } from './Icons';

// A simple parser to render the AI's structured text response with Zen styling.
const ZenParser = ({ content }: { content: string }) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const elements = [];
    let currentKey = '';
    let currentContent: string[] = [];

    const icons: { [key: string]: React.ReactNode } = {
        'Description': <MissionIcon />,
        'Cost': <CostIcon />,
        'Pro-Tip': <TipIcon />,
        'Travel Estimate': <TravelIcon />,
        'Rating': <VibeIcon />,
        'Recommendation': <TipIcon />,
    };

    for (const line of lines) {
        if (line.includes(':')) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim();
            if (key.trim() === 'Title' || key.trim() === 'OPTION 1' || key.trim() === 'OPTION 2') {
                // Skip adding title here, it's handled separately
            } else {
                elements.push(
                    <div key={key} className="flex items-start mt-4">
                        <span className="text-stone-500 mr-3 mt-1">{icons[key.trim()]}</span>
                        <div>
                            <h3 className="font-semibold text-stone-700">{key.trim()}</h3>
                            <p className="text-stone-600 text-lg">{value}</p>
                        </div>
                    </div>
                );
            }
        } else if (line.startsWith('- ')) {
             elements.push(
                <li key={line} className="text-stone-600 text-lg ml-12 list-none relative">
                    <span className="absolute -left-5 top-3 h-1 w-1 bg-stone-400 rounded-full"></span>
                    {line.substring(2)}
                </li>
             );
        } else {
             elements.push(<p key={line} className="text-stone-600 text-lg mt-2">{line}</p>);
        }
    }

    return <>{elements}</>;
};

interface PlanDisplayProps {
  planContent: string;
  onRestart: () => void;
  onSelectPlan?: (planContent: string) => void;
  onFindCloser?: () => void;
  isLocationAvailable?: boolean;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ planContent, onRestart, onSelectPlan, onFindCloser, isLocationAvailable }) => {
  const [isSharing, setIsSharing] = useState(false);
  let plans: string[];
  let recommendation: string | null = null;

  // Robustly separate the recommendation from the main content first.
  const recommendationSplit = planContent.split(/(Recommendation:.*)/s);
  const mainPlansContent = recommendationSplit[0];
  if (recommendationSplit.length > 1) {
    recommendation = recommendationSplit[1].trim();
  }

  // Then, split the remaining content into plans, filtering out any empty strings.
  plans = mainPlansContent.split('---').map(p => p.trim()).filter(Boolean);


  const handleShare = async () => {
    if (isSharing) return; // Prevent multiple clicks

    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: 'Accra Vibe Planner has a plan for us!',
          text: planContent,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('Share canceled by user.');
        } else {
          console.error('Share failed:', error);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      navigator.clipboard.writeText(planContent);
      alert('Plan copied to clipboard!');
    }
  };
  
  const getTitle = (planText: string) => {
    const titleLine = planText.split('\n').find(line => line.startsWith('Title:'));
    return titleLine ? titleLine.replace('Title:', '').trim() : 'Your Vibe Plan';
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f1ea] flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-3xl space-y-8">
            {plans.map((plan, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-sm border border-stone-200/80 animate-slide-in">
                    <h2 className="text-3xl font-bold text-stone-800 mb-4">{getTitle(plan)}</h2>
                    <ZenParser content={plan} />
                    {onSelectPlan && (
                        <button
                            onClick={() => onSelectPlan(plan)}
                            className="w-full mt-6 py-3 px-6 bg-stone-800 text-white font-bold rounded-lg shadow-md hover:bg-stone-900 transition-all duration-300 transform hover:scale-105"
                        >
                            Choose this Vibe
                        </button>
                    )}
                </div>
            ))}

            {onSelectPlan && isLocationAvailable && onFindCloser && (
                <div className="bg-stone-50/70 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-sm border border-stone-200/80 animate-slide-in text-center">
                    <h3 className="text-xl font-bold text-stone-700 mb-2">Not quite right?</h3>
                    <p className="text-stone-600 mb-4 text-lg">Let's find something a little closer to you.</p>
                    <button
                        onClick={onFindCloser}
                        className="py-3 px-6 bg-stone-800 text-white font-bold rounded-lg shadow-md hover:bg-stone-900 transition-all duration-300 transform hover:scale-105"
                    >
                        Find Closer Vibes
                    </button>
                </div>
            )}

            {recommendation && (
                 <div className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-sm border border-stone-200/80 animate-slide-in">
                    <ZenParser content={recommendation} />
                 </div>
            )}
        </div>

      <div className="mt-8 flex justify-center items-center w-full max-w-3xl">
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="flex items-center px-4 py-2 bg-white/80 text-stone-700 rounded-lg hover:bg-white transition-all shadow-sm border border-stone-200/80 disabled:opacity-50"
        >
          <ShareIcon />
          <span className="ml-2">{isSharing ? 'Sharing...' : 'Share'}</span>
        </button>
        <button
          onClick={onRestart}
          className="flex items-center px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors ml-4"
        >
          <RestartIcon />
          <span className="ml-2">Start Over</span>
        </button>
      </div>
    </div>
  );
};

export default PlanDisplay;