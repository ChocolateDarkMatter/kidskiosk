import { ScheduledEvent } from './types';

export const DEFAULT_EVENTS: ScheduledEvent[] = [
  {
    id: '1',
    title: 'Breakfast',
    startTime: '07:30',
    endTime: '08:00',
    days: [0, 1, 2, 3, 4, 5, 6],
    color: '#FCD34D', // Amber
    icon: '🥞',
  },
  {
    id: '2',
    title: 'School / Pre-K',
    startTime: '08:30',
    endTime: '15:00',
    days: [1, 2, 3, 4, 5],
    color: '#60A5FA', // Blue
    icon: '🎒',
  },
  {
    id: '3',
    title: 'Taekwondo',
    startTime: '16:30',
    endTime: '17:30',
    days: [2, 4], // Tue, Thu
    color: '#EF4444', // Red
    icon: '🥋',
  },
  {
    id: '4',
    title: 'Dinner Time',
    startTime: '18:00',
    endTime: '19:00',
    days: [0, 1, 2, 3, 4, 5, 6],
    color: '#10B981', // Green
    icon: '🥦',
  },
  {
    id: '5',
    title: 'Bath & Stories',
    startTime: '19:30',
    endTime: '20:00',
    days: [0, 1, 2, 3, 4, 5, 6],
    color: '#8B5CF6', // Purple
    icon: '🛁',
  },
  {
    id: '6',
    title: 'Bedtime',
    startTime: '20:30',
    endTime: '07:00',
    days: [0, 1, 2, 3, 4, 5, 6],
    color: '#1E3A8A', // Dark Blue
    icon: '💤',
  },
];

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
