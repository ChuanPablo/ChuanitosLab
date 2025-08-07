export const SearchSuggestionMatchTypes = {
  Name: 'name',
  Username: 'username',
  Email: 'email',
  Organisation: 'organisation',
  Skill: 'skill',
}

/**
 * @summary List of keys used in the local storage
 */
export const StorageKeys = {
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
  Refresh: 'refresh',
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
 * @summary List containing all used base routes
 */
export const BaseRoutes = {
  Login: 'login',
  Dashboard: 'dashboard',
  Search: 'search',
  User: 'u',
  About: 'about',
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
