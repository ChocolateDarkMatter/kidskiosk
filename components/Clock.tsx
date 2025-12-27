import React, { useState } from 'react';
import { DAYS_OF_WEEK } from '../constants';

interface ClockProps {
  now: Date;
  forceLarge?: boolean;
}

const AnalogClock: React.FC<{ now: Date; large?: boolean }> = ({ now, large }) => {
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
  const hourDegrees = ((hours % 12 + minutes / 60) / 12) * 360;

  return (
    <div className={`relative aspect-square transition-all duration-700 ease-in-out ${large ? 'w-80 md:w-[450px] lg:w-[40vw] lg:max-w-[800px]' : 'w-48 md:w-64 lg:w-[18vw] lg:max-w-[350px]'}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
        {/* Clock Face Background */}
        <circle cx="50" cy="50" r="48" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        
        {/* Numbers */}
        {[...Array(12)].map((_, i) => {
            const num = i + 1;
            const angle = (num * 30) * (Math.PI / 180);
            const r = 38; 
            const x = 50 + r * Math.sin(angle);
            const y = 50 - r * Math.cos(angle);
            return (
                <text 
                    key={num} 
                    x={x} 
                    y={y} 
                    fill="white" 
                    fontSize="7" 
                    fontWeight="700" 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    className="select-none font-sans"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                >
                    {num}
                </text>
            );
        })}

        {/* Hands */}
        <line 
            x1="50" y1="50" x2="50" y2="25" 
            stroke="white" strokeWidth="4" strokeLinecap="round"
            transform={`rotate(${hourDegrees} 50 50)`} 
            className="drop-shadow-md"
        />
        <line 
            x1="50" y1="50" x2="50" y2="10" 
            stroke="white" strokeWidth="2.5" strokeLinecap="round"
            transform={`rotate(${minuteDegrees} 50 50)`} 
            className="drop-shadow-md"
        />
        <line 
            x1="50" y1="58" x2="50" y2="8" 
            stroke="#EF4444" strokeWidth="1" strokeLinecap="round"
            transform={`rotate(${secondDegrees} 50 50)`} 
            className="drop-shadow-sm"
        />
        <circle cx="50" cy="50" r="3" fill="white" />
        <circle cx="50" cy="50" r="1.5" fill="#EF4444" />
      </svg>
    </div>
  );
};

const Clock: React.FC<ClockProps> = ({ now, forceLarge }) => {
  const [viewMode, setViewMode] = useState<'digital' | 'analog' | 'both'>('both');

  const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateString = now.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  const dayName = DAYS_OF_WEEK[now.getDay()];

  const toggleView = () => {
    if (viewMode === 'both') setViewMode('analog');
    else if (viewMode === 'analog') setViewMode('digital');
    else setViewMode('both');
  };

  return (
    <div className={`flex flex-col items-center lg:items-start justify-center text-white drop-shadow-lg relative group select-none transition-all duration-700 ${forceLarge ? 'scale-110 origin-left' : ''}`}>
       <button 
         onClick={(e) => {
             e.stopPropagation();
             toggleView();
         }}
         className="absolute -top-12 lg:-top-20 left-0 lg:left-0 right-0 lg:right-auto mx-auto lg:mx-0 w-max text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-60 transition-opacity border border-white/30 bg-black/20 rounded-full px-4 py-2 hover:bg-black/40"
       >
         Display: {viewMode}
       </button>

       <div className={`opacity-90 font-medium uppercase tracking-widest transition-all duration-700 text-center lg:text-left ${forceLarge ? 'text-4xl lg:text-[4vw] mb-10' : 'text-xl lg:text-[2vw] mb-4'}`}>
         {dayName}
       </div>

       <div className="flex flex-col gap-6 lg:gap-12 items-center lg:items-start cursor-pointer transition-all duration-700" onClick={toggleView}>
         {(viewMode === 'analog' || viewMode === 'both') && (
            <AnalogClock now={now} large={forceLarge || viewMode === 'analog'} />
         )}

         {(viewMode === 'digital' || viewMode === 'both') && (
           <div className={`leading-none font-bold tracking-tighter transition-all duration-700 text-center lg:text-left ${forceLarge || viewMode === 'digital' ? 'text-8xl lg:text-[14vw]' : 'text-7xl lg:text-[7vw]'}`}>
             {timeString}
           </div>
         )}
       </div>

       <div className={`font-light opacity-80 text-center lg:text-left transition-all duration-700 ${forceLarge ? 'text-3xl lg:text-[5vw] mt-10' : 'text-lg lg:text-[3vw] mt-2'}`}>
         {dateString}
       </div>
    </div>
  );
};

export default Clock;