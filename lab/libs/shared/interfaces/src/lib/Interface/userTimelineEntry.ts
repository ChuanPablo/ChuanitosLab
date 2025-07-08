import {TIMELINE_ENTRY, VISIBILITY} from '@lab/shared-utils';

export interface UserTimelineEntry {
  id: number;
  userId: number;
  title: string;
  organisation: string;
  location: string;
  timelineEntryType: typeof TIMELINE_ENTRY.type.JOB | typeof TIMELINE_ENTRY.type.EDUCATION;
  description?: string;
  startDate: Date;
  endDate?: Date;
  documentation?: File | string;
  visibility?: typeof VISIBILITY.PRIVATE | typeof VISIBILITY.PUBLIC;
}
