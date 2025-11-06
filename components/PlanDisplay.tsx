import React, { useState, useRef, useMemo, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
    ShareIcon, RestartIcon, LocationIcon, TravelIcon, TipIcon, MissionIcon,
    CostIcon, TimeIcon, CalendarIcon, WeatherIcon, DownloadIcon, MapItIcon,
    ChecklistIcon, PicnicIcon, VoilaSunIcon, RatingStarIcon, DressCodeIcon,
    NoiseLevelIcon, SeatingIcon, VibeIcon,
} from './Icons';
import type { Vibe } from '../types';

interface ParsedPlan {
  rawContent: string;
  title: string;
  imageUrl: string;
  category: Vibe;
  location: string;
  rating: string;
  openingHours: string;
  description: string;
  cost: string;
  proTip: string;
  dressCode: string;
  noiseLevel: string;
  seating: string;
  picnicEssentials: string[] | null;
}

interface ParsedTravelDetails {
  distance: string;
  travelTime: string;
  traffic: string;
  weather: string;
}

const defaultImages: Record<Vibe, string> = {
  'Relax & Unwind': '/assets/relax.jpg',
  'Food & Nightlife': '/assets/food.jpg',
  'Rich Kids Sports': '/assets/sports.jpg',
  'Active & Adventure': '/assets/adventure.jpg',
  'Movies & Plays': '/assets/theatre.jpg',
  'Romantic Date': '/assets/romantic.jpg',
  'Picnic & Parks': '/assets/picnic.jpg',
  '': '/assets/default.jpg',
};


const parsePlans = (content: string): { plans: ParsedPlan[], recommendation: string | null } => {
    const recommendationMatch = content.match(/Recommendation:([\s\S]*)/);
    const recommendation = recommendationMatch ? recommendationMatch[0].trim() : null;
    
    const plansContent = recommendation ? content.split(recommendation)[0] : content;
    const planStrings = plansContent.split('---').map(p => p.trim()).filter(Boolean);

    const plans = planStrings.map(planString => {
        const lines = planString.split('\n').filter(l => l.trim() !== '');
        const data: Partial<ParsedPlan> & { rawContent: string } = { rawContent: planString };
        let inChecklist = false;
        let inPicnic = false;
        const picnicItems: string[] = [];

        lines.forEach(line => {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim();

            if (key.trim().toLowerCase().includes('option')) return;

            if (!line.trim().startsWith('-')) {
                inChecklist = false;
                inPicnic = false;
            }

            switch (key.trim()) {
                case 'Title': data.title = value; break;
                case 'Image URL': data.imageUrl = value; break;
                case 'Category': data.category = value as Vibe; break;
                case 'Location': data.location = value; break;
                case 'Rating': data.rating = value; break;
                case 'Opening Hours': data.openingHours = value; break;
                case 'Description': data.description = value; break;
                case 'Cost': data.cost = value; break;
                case 'Pro-Tip': data.proTip = value; break;
                case 'Essentials Checklist': inChecklist = true; break;
                case 'Picnic Essentials': inPicnic = true; break;
                default:
                    if (inChecklist && line.trim().startsWith('-')) {
                        const checkKey = key.trim().substring(1).trim();
                        switch (checkKey) {
                            case 'Dress Code': data.dressCode = value; break;
                            case 'Noise Level': data.noiseLevel = value; break;
                            case 'Seating': data.seating = value; break;
                        }
                    } else if (inPicnic && line.trim().startsWith('-')) {
                         picnicItems.push(line.substring(1).trim());
                    }
                    break;
            }
        });
        
        if (picnicItems.length > 0) {
            data.picnicEssentials = picnicItems;
        }

        const finalCategory: Vibe = (data.category && Object.keys(defaultImages).includes(data.category)) ? data.category : '';
        const finalImageUrl = (data.imageUrl && (data.imageUrl.startsWith('http') || data.imageUrl.startsWith('data:image')))
          ? data.imageUrl
          : defaultImages[finalCategory] || defaultImages[''];

        return {
            rawContent: planString,
            title: data.title || 'N/A',
            imageUrl: finalImageUrl,
            category: finalCategory,
            location: data.location || 'N/A',
            rating: data.rating || 'N/A',
            openingHours: data.openingHours || 'N/A',
            description: data.description || 'No description available.',
            cost: data.cost || 'N/A',
            proTip: data.proTip || 'N/A',
            dressCode: data.dressCode || 'N/A',
            noiseLevel: data.noiseLevel || 'N/A',
            seating: data.seating || 'N/A',
            picnicEssentials: data.picnicEssentials || null,
        };
    });

    return { plans, recommendation };
};

const parseTravelDetails = (content: string): ParsedTravelDetails | null => {
  if (!content || !content.includes('Travel Estimate')) return null;
  const getDetail = (key: string): string => {
    const regex = new RegExp(`${key}:\\s*([^\n\r]*)`);
    const match = content.match(regex);
    return match ? match[1].trim() : "Could not be determined";
  };
  return {
    distance: getDetail('Distance'),
    travelTime: getDetail('Travel Time'),
    traffic: getDetail('Traffic'),
    weather: getDetail('Weather Forecast'),
  };
};

const PlanCard = ({ plan, onSelect, onRegenerate, cardRef, isFinal, travelDetails, intendedTime }: {
  plan: ParsedPlan;
  onSelect?: () => void;
  onRegenerate?: () => void;
  cardRef: React.RefObject<HTMLDivElement>;
  isFinal?: boolean;
  travelDetails?: ParsedTravelDetails | null;
  intendedTime?: string;
}) => {
    const [imgSrc, setImgSrc] = useState(plan.imageUrl);
    
    useEffect(() => {
        setImgSrc(plan.imageUrl);
    }, [plan.imageUrl]);

    const handleImageError = () => {
        setImgSrc(defaultImages[plan.category] || defaultImages['']);
    };
    
    const ratingMatch = plan.rating.match(/(\d\.\d|\d)/);
    const ratingValue = ratingMatch ? ratingMatch[0] : null;
    const locationShort = plan.location.split(',')[0];
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${plan.location}, Accra, Ghana`)}`;

    const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
        <div className="flex items-start space-x-2">
            <div className="text-xl text-[#8C1007] dark:text-[#E18C44] pt-0.5">{icon}</div>
            <div>
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400">{label}</p>
                <div className="text-sm font-semibold text-[#3E0703] dark:text-slate-200">{value}</div>
            </div>
        </div>
    );
    
    const locationValue = (
        <div className="flex items-center gap-x-2 flex-wrap">
            <p>{locationShort}</p>
            {isFinal && (
                 <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs font-bold text-[#8C1007] dark:text-[#E18C44] hover:text-[#660B05] dark:hover:text-[#ffc58a] bg-[#8C1007]/10 dark:bg-[#E18C44]/10 px-2 py-1 rounded-full shadow-sm border border-[#8C1007]/20 dark:border-[#E18C44]/20"><MapItIcon /><span className="ml-1">Map It</span></a>
            )}
        </div>
    );
    
    return (
        <div ref={cardRef} className="relative w-full bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden flex flex-col">
            {ratingValue && (
                <div className="absolute top-4 right-4 z-10 flex items-center bg-black/60 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                    <RatingStarIcon className="h-4 w-4 text-yellow-300" />
                    <span className="ml-1.5">{ratingValue} / 5</span>
                </div>
            )}

            <div className="relative h-48 w-full">
                <img 
                    src={imgSrc} 
                    alt={plan.title} 
                    className="w-full h-full object-cover" 
                    crossOrigin="anonymous"
                    onError={handleImageError} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-2xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}>{plan.title}</h3>
                </div>
            </div>

            <div className="p-6 flex-grow flex flex-col">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4 border-b border-gray-200 dark:border-slate-700 pb-4">
                    <DetailItem icon={<CostIcon />} label="Cost" value={<p>{plan.cost}</p>} />
                    <DetailItem icon={<TimeIcon />} label="Opening Hours" value={<p>{plan.openingHours}</p>} />
                     <DetailItem icon={<LocationIcon />} label="Location" value={locationValue} />
                    <DetailItem icon={<NoiseLevelIcon />} label="Noise Level" value={<p>{plan.noiseLevel}</p>} />
                </div>
                
                <p className="text-sm text-[#3E0703] dark:text-slate-300 font-medium leading-relaxed mb-4">{plan.description}</p>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
                     <DetailItem icon={<SeatingIcon />} label="Seating" value={<p>{plan.seating}</p>} />
                    <DetailItem icon={<DressCodeIcon />} label="Dress Code" value={<p>{plan.dressCode}</p>} />
                    {isFinal && intendedTime && (
                         <DetailItem icon={<CalendarIcon className="h-6 w-6"/>} label="Date of Going" value={<p>{intendedTime}</p>} />
                    )}
                </div>

                <div className="flex items-start space-x-3 text-[#3E0703] dark:text-slate-200 p-3 bg-yellow-50 dark:bg-slate-700/50 rounded-lg mb-4">
                    <div className="text-xl text-yellow-600 dark:text-yellow-400 mt-0.5"><TipIcon /></div>
                    <div>
                        <p className="text-xs font-bold text-yellow-700 dark:text-yellow-300">Pro-Tip</p>
                        <p className="text-sm font-semibold">{plan.proTip}</p>
                    </div>
                </div>
                
                {plan.picnicEssentials && (
                     <div className="flex items-start space-x-3 text-[#3E0703] dark:text-slate-200 p-3 bg-green-50 dark:bg-slate-700/50 rounded-lg mb-4">
                        <div className="text-xl text-green-600 dark:text-green-400 mt-0.5"><PicnicIcon /></div>
                        <div>
                             <p className="text-xs font-bold text-green-700 dark:text-green-300">Picnic Essentials</p>
                             <ul className="list-disc list-inside mt-1">
                                {plan.picnicEssentials.map(item => <li key={item} className="text-sm font-semibold">{item}</li>)}
                             </ul>
                        </div>
                    </div>
                )}

                {isFinal && travelDetails && (
                    <div className="mt-2 border-t border-gray-200 dark:border-slate-700 pt-4">
                        <h4 className="text-lg font-bold text-[#3E0703] dark:text-slate-200 mb-3">Travel & Weather Forecast</h4>
                        <div className="flex flex-col space-y-3">
                            <DetailItem icon={<TravelIcon />} label="Distance" value={<p>{travelDetails.distance}</p>} />
                            <DetailItem icon={<TimeIcon />} label="Travel Time" value={<p>{travelDetails.travelTime}</p>} />
                            <DetailItem icon={<VibeIcon />} label="Traffic" value={<p>{travelDetails.traffic}</p>} />
                            <DetailItem icon={<WeatherIcon />} label="Weather" value={<p>{travelDetails.weather}</p>} />
                        </div>
                    </div>
                )}
            </div>
            
            {!isFinal && (
                 <div className="p-6 pt-0 mt-auto">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onSelect}
                            className="flex-grow py-3 px-4 bg-[#8C1007] text-white font-bold rounded-xl shadow-md hover:bg-[#660B05] transition-all duration-300 transform hover:scale-105"
                        >
                            Select this plan
                        </button>
                        {onRegenerate && (
                             <button onClick={onRegenerate} aria-label="Get new suggestion" className="p-3 bg-gray-100 dark:bg-slate-700 rounded-xl text-[#3E0703] dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                                <RestartIcon />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


// Main PlanDisplay Component
interface PlanDisplayProps {
  planContent: string;
  onRestart: () => void;
  onSelectPlan?: (planContent: string) => void;
  onFindCloser?: () => void;
  onRegenerate?: () => void;
  isFinalPlan?: boolean;
  isRequestingLocation?: boolean;
  intendedTime?: string;
  specificDateTime?: string;
  timeWindow?: string;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ planContent, onRestart, onSelectPlan, onFindCloser, onRegenerate, isFinalPlan, isRequestingLocation, intendedTime, specificDateTime, timeWindow }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const finalPlanRef = useRef<HTMLDivElement>(null);

  const { plans, recommendation } = useMemo(() => parsePlans(planContent), [planContent]);
  
  const handleShare = async (contentToShare: string) => {
    if (isSharing) return;

    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: 'Accra Vibe Planner has a plan for us!',
          text: contentToShare,
        });
      } catch (error) {
        // Ignore abort errors
      } finally {
        setIsSharing(false);
      }
    } else {
      navigator.clipboard.writeText(contentToShare);
      alert('Plan copied to clipboard!');
    }
  };
  
  const handleDownload = async (elementRef: React.RefObject<HTMLDivElement>, filename: string) => {
    if (isDownloading) return;
    const elementToCapture = elementRef.current;
    if (!elementToCapture) return;

    setIsDownloading(true);
    elementToCapture.classList.add('capturing'); 
    
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const canvas = await html2canvas(elementToCapture, { backgroundColor: null, scale: 2, useCORS: true });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download plan:', error);
    } finally {
      elementToCapture.classList.remove('capturing');
      setIsDownloading(false);
    }
  };

  const handleAddToCalendar = () => {
    const mainPlanContent = plans.length > 0 ? plans[0].rawContent : '';
    if (!mainPlanContent) return;

    const getDetail = (key: string, content: string): string => {
        const line = content.split('\n').find(l => l.trim().startsWith(key + ':'));
        return line ? line.replace(key + ':', '').trim() : '';
    };

    const title = `Vibe Plan: ${getDetail('Title', mainPlanContent)}`;
    const location = getDetail('Location', mainPlanContent);
    const description = [
        getDetail('Description', mainPlanContent),
        `\nCost: ${getDetail('Cost', mainPlanContent)}`,
        `Rating: ${getDetail('Rating', mainPlanContent)}`,
        `Pro-Tip: ${getDetail('Pro-Tip', mainPlanContent)}`,
    ].join('\n');
    
    let startDate = new Date();
    if (specificDateTime) {
      if (specificDateTime.includes('T')) {
        startDate = new Date(specificDateTime);
      } else if (specificDateTime.includes(':')) {
        const [hours, minutes] = specificDateTime.split(':').map(Number);
        startDate.setHours(hours, minutes, 0, 0);
      }
    }

    if (isNaN(startDate.getTime())) {
      startDate = new Date();
    }

    let durationHours = 2;
    if (timeWindow) {
      if (timeWindow.includes('1-2')) durationHours = 2;
      else if (timeWindow.includes('3-4')) durationHours = 4;
      else if (timeWindow.includes('5+')) durationHours = 5;
      else if (timeWindow.includes('8+')) durationHours = 8;
    }

    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
    
    const formatDateForGoogle = (date: Date): string => {
      return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };
    
    const calendarDates = `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`;
    
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${calendarDates}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(description)}`;
    
    window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
  };

  if (isFinalPlan) {
    const parts = planContent.split('\n\n---\n');
    const planString = parts[0];
    const travelString = parts.length > 1 ? parts[1] : '';

    const { plans: finalPlans } = useMemo(() => parsePlans(planString), [planString]);
    const travelDetails = useMemo(() => parseTravelDetails(travelString), [travelString]);
    const finalPlanData = finalPlans.length > 0 ? finalPlans[0] : null;

    if (!finalPlanData) {
      return (
        <div className="text-center p-8">
          <p className="text-red-500">Could not display the final plan.</p>
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg animate-slide-in">
          <PlanCard
            cardRef={finalPlanRef}
            plan={finalPlanData}
            isFinal={true}
            travelDetails={travelDetails}
            intendedTime={intendedTime}
          />
        </div>
        <div className="mt-8 flex justify-center items-center flex-wrap w-full max-w-3xl gap-4">
            <button onClick={handleAddToCalendar} className="flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-[#3E0703] dark:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-md border border-white/50 dark:border-slate-700/50"><CalendarIcon className="h-5 w-5"/><span className="ml-2">Add to Calendar</span></button>
            <button onClick={() => handleDownload(finalPlanRef, 'accra-vibe-plan')} disabled={isDownloading} className="flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-[#3E0703] dark:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-md border border-white/50 dark:border-slate-700/50 disabled:opacity-50"><DownloadIcon /><span className="ml-2">{isDownloading ? 'Saving...' : 'Download'}</span></button>
            <button onClick={() => handleShare(planContent)} disabled={isSharing} className="flex items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-[#3E0703] dark:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-md border border-white/50 dark:border-slate-700/50 disabled:opacity-50"><ShareIcon /><span className="ml-2">{isSharing ? 'Sharing...' : 'Share'}</span></button>
            <button onClick={onRestart} className="flex items-center px-4 py-2 bg-[#8C1007] text-white rounded-lg hover:bg-[#660B05] transition-colors shadow-md"><RestartIcon /><span className="ml-2">Start Over</span></button>
        </div>
      </div>
    );
  }

  const recommendedPlanTitle = recommendation ? recommendation.split(':')[1]?.trim() : null;

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="text-center mb-8 animate-slide-in">
            <h1 className="text-5xl font-bold text-[#8C1007] dark:text-[#E18C44] mt-2">Here is your plan</h1>
            <p className="text-lg text-[#660B05] dark:text-slate-300 mt-2">Based on your answers, we've found a couple of spots we think you'll love.</p>
        </div>

        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-stretch animate-slide-in">
            {plans.map((plan, index) => (
                <div key={index} className="w-full md:w-1/2 flex-shrink-0">
                    <PlanCard
                        cardRef={index === 0 ? card1Ref : card2Ref}
                        plan={plan}
                        onSelect={() => onSelectPlan && onSelectPlan(plan.rawContent)}
                        onRegenerate={plan.title === recommendedPlanTitle && onRegenerate ? onRegenerate : undefined}
                    />
                </div>
            ))}
        </div>
        
        <div className="mt-8 text-center animate-slide-in">
             <button
                onClick={onFindCloser}
                disabled={isRequestingLocation}
                className="py-3 px-8 bg-yellow-400 text-yellow-900 font-bold rounded-full shadow-lg hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait text-lg"
            >
                {isRequestingLocation ? 'Getting Location...' : "Not feeling it? Find something closer!"}
            </button>
        </div>
        
        {recommendation && (
            <div className="mt-8 animate-slide-in w-full max-w-lg">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-lg border border-gray-200 dark:border-slate-700">
                    <p className="font-sans font-semibold text-xl text-[#3E0703] dark:text-slate-200 flex items-center justify-center gap-x-2">
                        <RatingStarIcon className="h-6 w-6 text-yellow-500" />
                        <span>
                           Recommended: <span className="font-bold text-[#8C1007] dark:text-[#E18C44]">{recommendedPlanTitle}</span>
                        </span>
                    </p>
                </div>
            </div>
        )}
    </div>
  );
};

export default PlanDisplay;
