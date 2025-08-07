import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class LocalStorageService {
  /**
   * @summary Sets a value in local storage
   * @param key
   * @param value
   */
  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  /**
   * @summary Gets a value from local storage
   * @param key
   */
  get(key: string): string | null {
    return localStorage.getItem(key);
  }

  /**
   * @summary Removes a value from local storage
   * @param key
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * @summary Clears local storage
   */
  clear(): void {
    localStorage.clear();
  }
}
