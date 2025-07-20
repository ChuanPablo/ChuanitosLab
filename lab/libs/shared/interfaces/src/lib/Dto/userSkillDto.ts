import { Visibility, Skill } from '@lab/shared-utils';

export interface UserSkillDto {
  id: number;
  user_id: number;
  name: string;
  category:
    | typeof Skill.Category.TECHNICAL
    | typeof Skill.Category.LANGUAGE
    | typeof Skill.Category.CREATIVE
    | typeof Skill.Category.SOFT
    | typeof Skill.Category.OTHER;
  category_display: string;
  level:
  | typeof Skill.Level.Beginner
  | typeof Skill.Level.Intermediate
  | typeof Skill.Level.Advanced
  | typeof Skill.Level.Expert;
  level_display: string;
  description: string | null;
  years_of_experience: number | null;
  documentation: string | null;
  visibility: typeof Visibility.Private | typeof Visibility.Public;
  created_at: Date;
  updated_at: Date;
}
