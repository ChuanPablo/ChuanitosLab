import { Visibility } from './User';

/**
 * @summary List of all constants related to TimelineEntry
 */
export const TimelineEntry = {
  Type: {
    Job: 'job',
    Education: 'edu',
  }
} as const;

/**
 * @summary TimelineEntry interface
 */
export interface UserTimelineEntry {
  id: number;
  userId: number;
  title: string;
  organisation: string;
  location: string;
  timelineEntryType: typeof TimelineEntry.Type[keyof typeof TimelineEntry.Type];
  description?: string;
  startDate: Date;
  endDate?: Date;
  documentation?: File | string;
  visibility?: typeof Visibility[keyof typeof Visibility];
}
