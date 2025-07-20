import {TimelineEntry, Visibility} from '@lab/shared-utils';

export interface UserTimelineEntry {
  id: number;
  userId: number;
  title: string;
  organisation: string;
  location: string;
  timelineEntryType: typeof TimelineEntry.Type.Job | typeof TimelineEntry.Type.Education;
  description?: string;
  startDate: Date;
  endDate?: Date;
  documentation?: File | string;
  visibility?: typeof Visibility.Private | typeof Visibility.Public;
}
