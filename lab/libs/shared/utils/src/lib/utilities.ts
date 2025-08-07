import { DisplayNames } from './constants';
import { User } from '@lab/shared-interfaces';

/**
 * @summary Collection of utility functions
 */
export class Utilities {
  /**
   * @summary Returns the verbose display name of a form field
   * @param fieldName
   * @returns verbose display name of given form field
   */
  public static getFormFieldDisplayNames(fieldName: string): string {
    return DisplayNames.forms[fieldName] || fieldName;
  }

  /**
   * @summary returns the given date in ISO format without time
   * @param date
   * @returns date in ISO format without time
   */
  public static getISODate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  /**
   * @summary Checks if the given value is a string and not empty
   * @param value
   * @returns true if the given value is a string and not empty
   */
  public static isString(value: any): value is string {
    return value && typeof value === 'string';
  }

  /**
   * @summary Returns the user id
   * @description function that can be used to track users in a *ngFor list
   * @param index
   * @param user
   * @returns number user id
   * @see https://angular.io/api/common/NgFor
   */
  public static trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
