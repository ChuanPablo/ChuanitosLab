import {TimelineEntry, Visibility} from '@lab/shared-utils';

export interface UserTimelineEntryDto {
  id: number;
  user_id: number;
  title: string;
  organisation: string;
  location: string;
  timeline_entry_type: typeof TimelineEntry.Type.Job | typeof TimelineEntry.Type.Education;
  description: string | null;
  start_date: string;
  end_date: string | null;
  documentation: File | string | null;
  visibility: typeof Visibility.Private | typeof Visibility.Public;
}
