import { UserSkill } from './UserSkill';
import { UserTimelineEntry } from './UserTimelineEntry';

/**
 * @summary List of all available user stati (statusses? :D)
 */
export const UserStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

/**
 * @summary List of API's data entries visibility options
 */
export const Visibility = {
  Public: 'public',
  Private: 'private',
}

/**
 * @summary User interface
 */
export interface User {
  id: number;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  linkedinLink?: string;
  githubLink?: string;
  dockerhubLink?: string;
  contactInfo?: string;
  additionalInfo?: string;
  isStaff: boolean;
  isSuperuser: boolean;
  status: typeof UserStatus.Active | typeof UserStatus.Inactive;
  skills?: UserSkill[];
  timelineEntries?: UserTimelineEntry[];
  lastActive?: Date;
  joinDate: Date;
}
