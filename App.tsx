import React, { useState, useEffect, useMemo } from 'react';
import Clock from './components/Clock';
import Timeline from './components/Timeline';
import EventForm from './components/EventForm';
import DailyFact from './components/DailyFact';
import { ScheduledEvent, TimeState } from './types';
import { DEFAULT_EVENTS } from './constants';

const App: React.FC = () => {
  // State for Time
  const [now, setNow] = useState(new Date());

  // State for Events (loaded from localStorage or default)
  const [events, setEvents] = useState<ScheduledEvent[]>(() => {
    const saved = localStorage.getItem('playroom_events');
    return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
  });

  // State for Daily Magic Visibility
  const [showDailyMagic, setShowDailyMagic] = useState<boolean>(() => {
    const saved = localStorage.getItem('playroom_show_magic');
    return saved !== 'false'; // Default to true
  });

  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Derived Time State
  const timeState: TimeState = useMemo(() => {
    return {
      now,
      minutesSinceMidnight: now.getHours() * 60 + now.getMinutes(),
      dayOfWeek: now.getDay(),
    };
  }, [now]);

  // Identify Current Event for Styling
  const currentEvent = useMemo(() => {
    const { minutesSinceMidnight, dayOfWeek } = timeState;
    return events.find(e => {
      if (!e.days.includes(dayOfWeek)) return false;
      const start = parseInt(e.startTime.split(':')[0]) * 60 + parseInt(e.startTime.split(':')[1]);
      const end = parseInt(e.endTime.split(':')[0]) * 60 + parseInt(e.endTime.split(':')[1]);
      
      // Handle overnight logic strictly for coloring the current moment
      if (end < start) {
        return minutesSinceMidnight >= start || minutesSinceMidnight < end;
      }
      return minutesSinceMidnight >= start && minutesSinceMidnight < end;
    });
  }, [events, timeState]);

  // Persist Events
  const handleSaveEvents = (newEvents: ScheduledEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('playroom_events', JSON.stringify(newEvents));
  };

  // Persist Magic Setting
  const handleToggleDailyMagic = (show: boolean) => {
    setShowDailyMagic(show);
    localStorage.setItem('playroom_show_magic', show.toString());
  };

  // Dynamic Background Style
  const getBackgroundStyle = () => {
    if (currentEvent) {
      return {
        background: `linear-gradient(135deg, ${currentEvent.color}dd 0%, #000000 100%)`,
      };
    }

    const hour = now.getHours();
    if (hour >= 6 && hour < 12) return { background: 'linear-gradient(135deg, #60A5FA 0%, #FCD34D 100%)' }; 
    if (hour >= 12 && hour < 17) return { background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)' }; 
    if (hour >= 17 && hour < 20) return { background: 'linear-gradient(135deg, #F97316 0%, #7C3AED 100%)' }; 
    return { background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)' }; 
  };

  return (
    <div 
      className="w-full h-[100dvh] overflow-hidden transition-all duration-[2000ms] ease-in-out font-sans select-none relative"
      style={getBackgroundStyle()}
    >
      <div className="flex flex-col lg:grid lg:grid-cols-12 h-full w-full relative z-10">
        
        {/* Left Side: Clock & Info */}
        <div className={`transition-all duration-700 flex flex-col justify-center items-center lg:items-start p-6 lg:pl-16 lg:pr-8 shrink-0 ${showDailyMagic ? 'lg:col-span-5' : 'lg:col-span-6'}`}>
          <Clock now={now} forceLarge={!showDailyMagic} />
          {showDailyMagic && (
            <DailyFact 
              currentEvent={currentEvent} 
              timeString={now.toLocaleTimeString()} 
            />
          )}
        </div>

        {/* Right Side: Timeline */}
        <div className={`transition-all duration-700 flex-1 h-full w-full bg-black/10 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-white/5 relative overflow-hidden ${showDailyMagic ? 'lg:col-span-7' : 'lg:col-span-6'}`}>
          <Timeline 
            events={events} 
            timeState={timeState} 
            onEditRequest={() => setIsSettingsOpen(true)}
          />
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-white/5 rounded-full blur-[80px]"></div>
      </div>

      {isSettingsOpen && (
        <EventForm 
          events={events} 
          onSave={handleSaveEvents} 
          onClose={() => setIsSettingsOpen(false)} 
          showDailyMagic={showDailyMagic}
          onToggleDailyMagic={handleToggleDailyMagic}
        />
      )}
    </div>
  );
};

export default App;