import { DisplayNames } from './constants';

export class Utilities {
  public static getFormFieldDisplayNames(fieldName: string): string {
    return DisplayNames.forms[fieldName] || fieldName;
  }
}
