import React from 'react';
import type { HistoryItem } from '../types';
import { UserIcon, AiIcon, CloseIcon } from './Icons';

interface HistoryPanelProps {
  history: HistoryItem[];
  isOpen: boolean;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, isOpen, onClose }) => {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-[#FFFCF5]/80 backdrop-blur-md border-r border-[#8C1007]/10 shadow-2xl transition-transform duration-500 ease-in-out z-40 w-full md:w-80 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b border-[#8C1007]/20">
        <h2 className="text-xl font-bold text-[#3E0703]">Vibe History</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-[#8C1007]/10"
          aria-label="Close history panel"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-65px)]">
        {history.length === 0 ? (
          <p className="text-[#660B05] text-center mt-8">Your planning history will appear here.</p>
        ) : (
          history.map(item => (
            <div key={item.id} className="flex items-start gap-3 animate-slide-in">
              <div className={`p-2 rounded-full ${item.type === 'user' ? 'bg-[#8C1007]/10 text-[#8C1007]' : 'bg-[#660B05]/10 text-[#660B05]'}`}>
                {item.type === 'user' ? <UserIcon /> : <AiIcon />}
              </div>
              <div>
                <p className="font-bold text-[#3E0703]">{item.label}</p>
                <p className="text-[#660B05]">{item.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default HistoryPanel;