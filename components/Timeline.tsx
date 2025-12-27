import React, { useMemo, useEffect, useRef } from 'react';
import { ScheduledEvent, TimeState } from '../types';

interface TimelineProps {
  events: ScheduledEvent[];
  timeState: TimeState;
  onEditRequest: () => void;
}

const Timeline: React.FC<TimelineProps> = ({ events, timeState, onEditRequest }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const todaysEvents = useMemo(() => {
    return events
      .filter((e) => e.days.includes(timeState.dayOfWeek))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, timeState.dayOfWeek]);

  const getMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const getEventStatus = (event: ScheduledEvent) => {
    const start = getMinutes(event.startTime);
    const end = getMinutes(event.endTime);
    if (end < start) {
      if (timeState.minutesSinceMidnight >= start || timeState.minutesSinceMidnight < end) return 'active';
    } else {
      if (timeState.minutesSinceMidnight >= start && timeState.minutesSinceMidnight < end) return 'active';
    }
    if (end < start && timeState.minutesSinceMidnight >= end && timeState.minutesSinceMidnight < start) return 'future'; 
    if (timeState.minutesSinceMidnight >= end && end > start) return 'past';
    return 'future';
  };

  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-status="active"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [timeState.minutesSinceMidnight, todaysEvents]);

  if (todaysEvents.length === 0) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-white/50">
        <p className="text-xl lg:text-2xl">No events today!</p>
        <button onClick={onEditRequest} className="mt-4 underline text-lg">Edit Schedule</button>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <button 
        onClick={onEditRequest}
        className="absolute top-0 right-0 p-4 opacity-0 hover:opacity-50 text-white z-50 text-2xl"
      >
        ⚙️
      </button>

      <div 
        ref={scrollRef}
        className="h-full overflow-y-auto no-scrollbar py-8 px-6 lg:py-20 lg:pl-16 lg:pr-24 pb-32 lg:pb-20"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="relative border-l-4 border-white/20 ml-2 lg:ml-6 space-y-8 lg:space-y-12 max-w-4xl mx-auto lg:mx-0">
          {todaysEvents.map((event) => {
            const status = getEventStatus(event);
            const isPast = status === 'past';
            const isActive = status === 'active';

            return (
              <div 
                key={event.id}
                data-status={status}
                className={`relative pl-8 lg:pl-12 transition-all duration-500 ease-in-out ${isPast ? 'opacity-40 grayscale' : 'opacity-100'}`}
              >
                <div 
                  className={`absolute rounded-full border-4 border-white shadow-lg transition-all duration-500
                    ${isActive ? 'w-8 h-8 lg:w-10 lg:h-10 -left-[18px] lg:-left-[22px] bg-white' : 'w-5 h-5 lg:w-6 lg:h-6 -left-[12px] lg:-left-[14px]'}
                  `}
                  style={{ backgroundColor: isActive ? event.color : (isPast ? '#666' : event.color) }}
                >
                   {isActive && (
                     <div className="absolute inset-0 animate-ping rounded-full opacity-75" style={{ backgroundColor: event.color }}></div>
                   )}
                </div>

                <div 
                  className={`
                    p-5 lg:p-10 rounded-2xl lg:rounded-[50px] backdrop-blur-xl transition-all duration-500 w-full
                    ${isActive ? 'bg-white/20 shadow-2xl scale-100 lg:scale-105' : 'bg-black/10 hover:bg-black/20'}
                  `}
                  style={{ borderLeft: isActive ? `16px solid ${event.color}` : 'none' }}
                >
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-xl lg:text-3xl font-bold text-white drop-shadow-md">{event.startTime}</span>
                     <span className="text-3xl lg:text-6xl">{event.icon}</span>
                  </div>
                  <h3 className="text-2xl lg:text-6xl font-extrabold text-white tracking-wide drop-shadow-md leading-tight">{event.title}</h3>
                  {isActive && (
                    <div className="mt-4 text-white/90 font-bold text-sm lg:text-2xl uppercase tracking-widest">
                      Happening Now
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;