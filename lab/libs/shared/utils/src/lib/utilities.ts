import { DisplayNames } from './constants';

export class Utilities {
  public static getFormFieldNames(fieldName: string): string {
    return DisplayNames.forms[fieldName] || fieldName;
  }
}
