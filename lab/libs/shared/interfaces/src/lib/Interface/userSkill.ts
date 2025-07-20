import { Visibility, Skill } from '@lab/shared-utils';

export interface UserSkill {
  id: number;
  userId: number;
  name: string;
  category: typeof Skill.Category[keyof typeof Skill.Category];
  categoryDisplay: string;
  level: typeof Skill.Level[keyof typeof Skill.Level];
  levelDisplay: string;
  description?: string;
  yearsOfExperience?: number;
  documentation?: string;
  visibility: typeof Visibility[keyof typeof Visibility];
  createdAt: Date;
  updatedAt: Date;
}
