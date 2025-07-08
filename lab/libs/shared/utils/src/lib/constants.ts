/**
 * @summary List of keys used in the local storage
 */
export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
} as const;

/**
 * @summary List containing all used API endpoints
 */
export const API_ENDPOINTS = {
  PREFIX: 'api',
  TOKEN: 'token',
  AUTH: 'auth',
  EMAIL_SUBMIT: 'email-submit',
  VERIFY: 'verify-code',
  REGISTER: 'register',
  USERS: 'users',
  SKILLS: 'skills',
  TIMELINE: 'timeline_entries',
  ME: 'me',
} as const;


/**
 * @summary List of API's data entries visibility options
 */
export const VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
}

/**
 * @summary List of all available user stati (statusses? :D)
 */
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

/**
 * @summary List of all constants related to TimelineEntry
 */
export const TIMELINE_ENTRY = {
  type: {
    JOB: 'job',
    EDUCATION: 'edu',
  }
} as const;

/**
 * @summary List of constants related to Skill
 */
export const SKILL = {
  category: {
    TECHNICAL: 'technical',
    LANGUAGE: 'language',
    SOFT: 'soft',
    CREATIVE: 'creative',
    OTHER: 'other',
  },
  level: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    EXPERT: 'expert',
  }
}

/**
 * @summary URL to config file
 * @description The config file is needed to be able to have a dynamic API_URL that is injected when running the docker
 * container from the defined container environment variable
 */
export const CONFIG_URL = 'config.json';

const formsDisplayNames: { [key: string]: string } = {
  name: 'Skill name',
  category: 'Category',
  level: 'Level',
  description: 'Description',
  yearsOfExperience: 'Years of experience',
  visibility: 'Visibility',
  title: 'Title',
  organisation: 'Organisation',
  location: 'Location',
  timelineEntryType: 'Timeline entry type',
  startDate: 'Start date',
  endDate: 'End date',
  username: 'Username',
  password: 'Password',
  firstName: 'First Name',
  lastName: 'Last Name',
}

/**
 * @summary Collection of verbose display names
 * @description This collection contains all names displayed in the UI anywhere.
 */
export const DisplayNames = {
  forms: formsDisplayNames,
};
