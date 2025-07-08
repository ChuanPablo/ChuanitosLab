import { VISIBILITY, SKILL } from '@lab/shared-utils';

export interface UserSkillDto {
  id: number;
  user_id: number;
  name: string;
  category:
    | typeof SKILL.category.TECHNICAL
    | typeof SKILL.category.LANGUAGE
    | typeof SKILL.category.CREATIVE
    | typeof SKILL.category.SOFT
    | typeof SKILL.category.OTHER;
  category_display: string;
  level:
  | typeof SKILL.level.BEGINNER
  | typeof SKILL.level.INTERMEDIATE
  | typeof SKILL.level.ADVANCED
  | typeof SKILL.level.EXPERT;
  level_display: string;
  description: string | null;
  years_of_experience: number | null;
  documentation: string | null;
  visibility: typeof VISIBILITY.PRIVATE | typeof VISIBILITY.PUBLIC;
  created_at: Date;
  updated_at: Date;
}
