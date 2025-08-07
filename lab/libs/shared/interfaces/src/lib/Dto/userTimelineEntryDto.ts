import { Visibility } from '../Interface/User';
import { TimelineEntry } from '../Interface/UserTimelineEntry';

export interface UserTimelineEntryDto {
  id: number;
  user_id: number;
  title: string;
  organisation: string;
  location: string;
  timeline_entry_type: typeof TimelineEntry.Type[keyof typeof TimelineEntry.Type];
  description: string | null;
  start_date: string;
  end_date: string | null;
  documentation: File | string | null;
  visibility: typeof Visibility[keyof typeof Visibility];
}
