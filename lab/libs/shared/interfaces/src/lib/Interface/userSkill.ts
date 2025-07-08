import { VISIBILITY, SKILL } from '@lab/shared-utils';

export interface UserSkill {
  id: number;
  userId: number;
  name: string;
  category:
    | typeof SKILL.category.TECHNICAL
    | typeof SKILL.category.LANGUAGE
    | typeof SKILL.category.CREATIVE
    | typeof SKILL.category.SOFT
    | typeof SKILL.category.OTHER;
  categoryDisplay: string;
  level:
    | typeof SKILL.level.BEGINNER
    | typeof SKILL.level.INTERMEDIATE
    | typeof SKILL.level.ADVANCED
    | typeof SKILL.level.EXPERT;
  levelDisplay: string;
  description?: string;
  yearsOfExperience?: number;
  documentation?: string;
  visibility: typeof VISIBILITY.PRIVATE | typeof VISIBILITY.PUBLIC;
  createdAt: Date;
  updatedAt: Date;
}
