import { UserStatus } from '@lab/shared-utils';

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
  lastActive?: Date;
  joinDate: Date;
}
