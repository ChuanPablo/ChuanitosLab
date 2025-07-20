/**
 * @summary List of keys used in the local storage
 */
export const LocalStorageKeys = {
  AuthToken: 'auth_token',
  UserData: 'user_data',
  RefreshToken: 'refresh_token',
} as const;

/**
 * @summary List containing all used API endpoints
 */
export const ApiEndpoints = {
  Prefix: 'api',
  Token: 'token',
  Auth: 'auth',
  EmailSubmit: 'email-submit',
  Verify: 'verify-code',
  Register: 'register',
  Users: 'users',
  Skills: 'skills',
  Timeline: 'timeline_entries',
  Me: 'me',
} as const;


/**
 * @summary List of API's data entries visibility options
 */
export const Visibility = {
  Public: 'public',
  Private: 'private',
}

/**
 * @summary List of all available user stati (statusses? :D)
 */
export const UserStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

/**
 * @summary List of all constants related to TimelineEntry
 */
export const TimelineEntry = {
  Type: {
    Job: 'job',
    Education: 'edu',
  }
} as const;

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
