
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { ShareIcon, RestartIcon, LocationIcon, TravelIcon, TipIcon, MissionIcon, CostIcon, VibeIcon, PicnicIcon, DownloadIcon, MapItIcon, ChecklistIcon, TimeIcon, CalendarIcon, WeatherIcon } from './Icons';

// A simple parser to render the AI's structured text response with Zen styling.
const ZenParser = ({ content, isFinalPlan }: { content: string, isFinalPlan?: boolean }) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const elements = [];

    const icons: { [key: string]: React.ReactNode } = {
        'Description': <MissionIcon />,
        'Cost': <CostIcon />,
        'Pro-Tip': <TipIcon />,
        'Travel Estimate': <TravelIcon />,
        'Rating': <VibeIcon />,
        'Recommendation': <TipIcon />,
        'Picnic Essentials': <PicnicIcon />,
        'Location': <LocationIcon />,
        'Essentials Checklist': <ChecklistIcon />,
        'Opening Hours': <TimeIcon />,
        'Weather Forecast': <WeatherIcon />,
    };

    for (const line of lines) {
        if (line.includes(':')) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim();
            if (key.trim() === 'Title' || key.trim() === 'OPTION 1' || key.trim() === 'OPTION 2') {
                // Skip adding title here, it's handled separately
            } else if (key.trim() === 'Location' && isFinalPlan) {
                 const mapQuery = encodeURIComponent(`${value}, Accra, Ghana`);
                 const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
                 elements.push(
                    <div key={key} className="flex items-start mt-4">
                        <span className="text-[#8C1007] dark:text-[#E18C44] mr-3 mt-1 icon-fill-capture">{icons[key.trim()]}</span>
                        <div>
                            <h3 className="font-semibold text-[#3E0703] dark:text-slate-200">{key.trim()}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <p className="text-[#660B05] dark:text-slate-300 text-lg">{value}</p>
                                <a
                                    href={mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-sm font-bold text-[#8C1007] dark:text-[#E18C44] hover:text-[#660B05] dark:hover:text-[#ffc58a] bg-[#8C1007]/10 dark:bg-[#E18C44]/10 hover:bg-[#8C1007]/20 dark:hover:bg-[#E18C44]/20 transition-colors px-3 py-1 rounded-full shadow-sm border border-[#8C1007]/20 dark:border-[#E18C44]/20"
                                >
                                    <MapItIcon />
                                    <span className="ml-1.5">Map It</span>
                                </a>
                            </div>
                        </div>
                    </div>
                 );
            } else {
                elements.push(
                    <div key={key} className="flex items-start mt-4">
                        <span className="text-[#8C1007] dark:text-[#E18C44] mr-3 mt-1 icon-fill-capture">{icons[key.trim()]}</span>
                        <div>
                            <h3 className="font-semibold text-[#3E0703] dark:text-slate-200">{key.trim()}</h3>
                            {value && <p className="text-[#660B05] dark:text-slate-300 text-lg">{value}</p>}
                        </div>
                    </div>
                );
            }
        } else if (line.startsWith('- ')) {
             elements.push(
                <li key={line} className="text-[#660B05] dark:text-slate-300 text-lg ml-12 list-none relative">
                    <span className="absolute -left-5 top-3 h-1 w-1 bg-[#8C1007]/50 dark:bg-[#E18C44]/50 rounded-full"></span>
                    {line.substring(2)}
                </li>
             );
        } else {
             elements.push(<p key={line} className="text-[#660B05] dark:text-slate-300 text-lg mt-2">{line}</p>);
        }
    }

    return <>{elements}</>;
};

interface PlanDisplayProps {
  planContent: string;
  onRestart: () => void;
  onSelectPlan?: (planContent: string) => void;
  onFindCloser?: () => void;
  isFinalPlan?: boolean;
  isRequestingLocation?: boolean;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ planContent, onRestart, onSelectPlan, onFindCloser, isFinalPlan, isRequestingLocation }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const planContainerRef = useRef<HTMLDivElement>(null);

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
    if (isSharing) return;

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
  
  const handleDownload = async () => {
    if (isDownloading) return;

    const elementToCapture = planContainerRef.current;
    if (!elementToCapture) return;

    setIsDownloading(true);
    elementToCapture.classList.add('capturing'); // Add class for screenshot styles

    try {
      // Small delay to allow styles to apply
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await html2canvas(elementToCapture, {
        backgroundColor: null, // We're using the element's bg, which is set in CSS
        scale: 3, // Increased scale for higher resolution
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'accra-vibe-plan.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download plan:', error);
      alert('Sorry, there was an error downloading your plan.');
    } finally {
      elementToCapture.classList.remove('capturing'); // Clean up class
      setIsDownloading(false);
    }
  };

  const handleAddToCalendar = () => {
    const mainPlanContent = plans[0];
    if (!mainPlanContent) return;

    const getDetail = (key: string, content: string): string => {
        const line = content.split('\n').find(l => l.trim().startsWith(key + ':'));
        return line ? line.replace(key + ':', '').trim() : '';
    };

    const title = `Vibe Plan: ${getDetail('Title', mainPlanContent)}`;
    const location = getDetail('Location', mainPlanContent);
    
    const descriptionLines = [
        getDetail('Description', mainPlanContent),
        `\nCost: ${getDetail('Cost', mainPlanContent)}`,
        `Rating: ${getDetail('Rating', mainPlanContent)}`,
        `Pro-Tip: ${getDetail('Pro-Tip', mainPlanContent)}`,
        `Opening Hours: ${getDetail('Opening Hours', mainPlanContent)}`,
        `\nGenerated by Accra Vibe Planner`
    ];
    const description = descriptionLines.filter(Boolean).join('\n');

    if (!title) {
        alert("Couldn't find a title to create a calendar event.");
        return;
    }

    const encodedTitle = encodeURIComponent(title);
    const encodedLocation = encodeURIComponent(location);
    const encodedDescription = encodeURIComponent(description);

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&location=${encodedLocation}&details=${encodedDescription}`;

    window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
};

  const getTitle = (planText: string) => {
    const titleLine = planText.split('\n').find(line => line.startsWith('Title:'));
    return titleLine ? titleLine.replace('Title:', '').trim() : 'Your Vibe Plan';
  };

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div ref={planContainerRef} className="w-full max-w-3xl space-y-8">
            {plans.map((plan, index) => (
                <div key={index} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-lg border border-white/50 dark:border-slate-700/50 animate-slide-in">
                    <h2 className="text-3xl font-bold text-[#3E0703] dark:text-slate-100 mb-4">{getTitle(plan)}</h2>
                    <ZenParser content={plan} isFinalPlan={isFinalPlan} />
                    {onSelectPlan && (
                        <button
                            onClick={() => onSelectPlan(plan)}
                            className="w-full mt-6 py-3 px-6 bg-[#8C1007] dark:bg-[#E18C44] text-white dark:text-slate-900 font-bold rounded-lg shadow-md hover:bg-[#660B05] dark:hover:bg-[#f3a469] transition-all duration-300 transform hover:scale-105"
                        >
                            Choose this Vibe
                        </button>
                    )}
                </div>
            ))}

            {onSelectPlan && onFindCloser && (
                <div className="bg-[#8C1007]/5 dark:bg-[#E18C44]/5 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-lg border border-[#8C1007]/10 dark:border-[#E18C44]/10 animate-slide-in text-center">
                    <h3 className="text-xl font-bold text-[#3E0703] dark:text-slate-100 mb-2">Not quite right?</h3>
                    <p className="text-[#660B05] dark:text-slate-300 mb-4 text-lg">Let's find something a little closer to you.</p>
                    <button
                        onClick={onFindCloser}
                        disabled={isRequestingLocation}
                        className="py-3 px-6 bg-[#8C1007] dark:bg-[#E18C44] text-white dark:text-slate-900 font-bold rounded-lg shadow-md hover:bg-[#660B05] dark:hover:bg-[#f3a469] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isRequestingLocation ? 'Getting Location...' : 'Find Closer Vibes'}
                    </button>
                </div>
            )}

            {recommendation && (
                 <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 sm:p-8 rounded-lg shadow-lg border border-white/50 dark:border-slate-700/50 animate-slide-in">
                    <ZenParser content={recommendation} />
                 </div>
            )}
        </div>

      <div className="mt-8 flex justify-center items-center flex-wrap w-full max-w-3xl gap-4">
        {!onSelectPlan && (
            <>
                <button
                  onClick={handleAddToCalendar}
                  className="flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-[#3E0703] dark:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-md border border-white/50 dark:border-slate-700/50"
                >
                  <CalendarIcon />
                  <span className="ml-2">Add to Calendar</span>
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-[#3E0703] dark:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-md border border-white/50 dark:border-slate-700/50 disabled:opacity-50"
                >
                  <DownloadIcon />
                  <span className="ml-2">{isDownloading ? 'Saving...' : 'Download'}</span>
                </button>
            </>
        )}
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-[#3E0703] dark:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-md border border-white/50 dark:border-slate-700/50 disabled:opacity-50"
        >
          <ShareIcon />
          <span className="ml-2">{isSharing ? 'Sharing...' : 'Share'}</span>
        </button>
        <button
          onClick={onRestart}
          className="flex items-center px-4 py-2 bg-[#8C1007] dark:bg-slate-600 text-white dark:text-slate-100 rounded-lg hover:bg-[#660B05] dark:hover:bg-slate-500 transition-colors shadow-md"
        >
          <RestartIcon />
          <span className="ml-2">Start Over</span>
        </button>
      </div>
    </div>
  );
};

export default PlanDisplay;
