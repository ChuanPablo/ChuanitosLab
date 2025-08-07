import { Visibility } from '../Interface/User';
import { Skill } from '../Interface/UserSkill';

export interface UserSkillDto {
  id: number;
  user_id: number;
  name: string;
  category: typeof Skill.Category[keyof typeof Skill.Category];
  category_display: string;
  level: typeof Skill.Level[keyof typeof Skill.Level];
  level_display: string;
  description: string | null;
  years_of_experience: number | null;
  documentation: string | null;
  visibility: typeof Visibility[keyof typeof Visibility];
  created_at: Date;
  updated_at: Date;
}
