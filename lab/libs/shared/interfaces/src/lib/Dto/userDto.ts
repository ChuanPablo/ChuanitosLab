export interface UserDto {
  id: number;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  linkedin_link: string | null;
  github_link: string | null;
  dockerhub_link: string | null;
  contact_info: string | null;
  additional_info: string | null;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_created: Date;
  date_updated: Date;
  last_online: Date;
}
