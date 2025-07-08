import {TIMELINE_ENTRY, VISIBILITY} from '@lab/shared-utils';

export interface UserTimelineEntryDto {
  id: number;
  user_id: number;
  title: string;
  organisation: string;
  location: string;
  timeline_entry_type: typeof TIMELINE_ENTRY.type.JOB | typeof TIMELINE_ENTRY.type.EDUCATION;
  description: string | null;
  start_date: string;
  end_date: string | null;
  documentation: File | string | null;
  visibility: typeof VISIBILITY.PRIVATE | typeof VISIBILITY.PUBLIC;
}
