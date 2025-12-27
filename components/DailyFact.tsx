import React, { useState, useEffect, useCallback } from 'react';
import { getFunMessage } from '../services/geminiService';
import { ScheduledEvent } from '../types';

interface DailyFactProps {
  currentEvent: ScheduledEvent | undefined;
  timeString: string; // Used to trigger updates sparingly
}

const DailyFact: React.FC<DailyFactProps> = ({ currentEvent, timeString }) => {
  const [message, setMessage] = useState<string>("Loading fun info...");
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchMessage = useCallback(async () => {
    // Only fetch if it's been at least 15 minutes or if the event has changed significantly
    const now = Date.now();
    if (now - lastFetchTime < 1000 * 60 * 15) return; 

    setLastFetchTime(now);
    const msg = await getFunMessage(currentEvent, timeString);
    setMessage(msg);
  }, [currentEvent, timeString, lastFetchTime]);

  useEffect(() => {
    fetchMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEvent?.id]); // Trigger when event changes

  // Also trigger periodically if no event change, but keep it sparse
  useEffect(() => {
    const interval = setInterval(() => {
        fetchMessage();
    }, 1000 * 60 * 30); // Every 30 mins
    return () => clearInterval(interval);
  }, [fetchMessage]);

  return (
    <div className="mt-6 lg:mt-12 p-4 lg:p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 w-full max-w-md shadow-lg">
      <div className="flex items-start gap-3 lg:gap-4">
        <span className="text-3xl lg:text-4xl">✨</span>
        <div>
          <h4 className="text-white/60 font-bold uppercase text-xs lg:text-sm tracking-wider mb-1">Daily Magic</h4>
          <p className="text-white text-lg lg:text-2xl font-medium leading-relaxed font-sans">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyFact;
