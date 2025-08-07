import { Visibility } from './User';
/**
 * @summary List of constants related to Skill
 */
export const Skill = {
  Category: {
    TECHNICAL: 'technical',
    LANGUAGE: 'language',
    SOFT: 'soft',
    CREATIVE: 'creative',
    OTHER: 'other',
  },
  Level: {
    Beginner: 'beginner',
    Intermediate: 'intermediate',
    Advanced: 'advanced',
    Expert: 'expert',
  }
}

/**
 * @summary User skill interface
 */
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
