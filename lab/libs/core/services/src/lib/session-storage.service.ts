import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  /**
   * @summary Sets a value in session storage
   * @param key
   * @param value
   */
  set(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }

  /**
   * @summary Gets a value from session storage
   * @param key
   */
  get(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  /**
   * @summary Removes a value from session storage
   * @param key
   */
  remove(key: string): void {
    sessionStorage.removeItem(key);
  }

  /**
   * @summary Clears session storage
   */
  clear(): void {
    sessionStorage.clear();
  }
}
