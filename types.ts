export interface ScheduledEvent {
  id: string;
  title: string;
  startTime: string; // "HH:mm" 24h format
  endTime: string;   // "HH:mm" 24h format
  days: number[];    // 0=Sunday, 1=Monday, etc.
  color: string;     // Hex code
  icon: string;      // Emoji
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  events: ScheduledEvent[];
}

export interface TimeState {
  now: Date;
  minutesSinceMidnight: number;
  dayOfWeek: number;
}
