import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { SessionStorageService } from './session-storage.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(
    private localStorageService: LocalStorageService,
    private sessionStorageService: SessionStorageService
  ) {}

  /**
   * Sets a value in either localStorage or sessionStorage based on the persistent flag
   * @param key The storage key
   * @param value The value to store
   * @param persistent If true, uses localStorage; if false, uses sessionStorage
   */
  set(key: string, value: string, persistent = false): void {
    if (persistent) {
      this.localStorageService.set(key, value);
      // Remove from sessionStorage if it exists there
      this.sessionStorageService.remove(key);
    } else {
      this.sessionStorageService.set(key, value);
      // Remove from localStorage if it exists there
      this.localStorageService.remove(key);
    }
  }

  /**
   * Gets a value from either localStorage or sessionStorage
   * @param key The storage key
   * @returns The stored value or null if not found
   */
  get(key: string): string | null {
    // Check localStorage first
    const localValue = this.localStorageService.get(key);
    if (localValue !== null) {
      return localValue;
    }

    // Check sessionStorage if not found in localStorage
    return this.sessionStorageService.get(key);
  }

  /**
   * Removes a value from both localStorage and sessionStorage
   * @param key The storage key
   */
  remove(key: string): void {
    this.localStorageService.remove(key);
    this.sessionStorageService.remove(key);
  }

  /**
   * Clears both localStorage and sessionStorage
   */
  clear(): void {
    this.localStorageService.clear();
    this.sessionStorageService.clear();
  }

  /**
   * Checks if a key exists in either storage
   * @param key The storage key
   * @returns true if the key exists in either storage
   */
  exists(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Migrates data from sessionStorage to localStorage or vice versa
   * @param key The storage key
   * @param toPersistent If true, migrates to localStorage; if false, migrates to sessionStorage
   */
  migrate(key: string, toPersistent: boolean): void {
    const value = this.get(key);
    if (value !== null) {
      this.set(key, value, toPersistent);
    }
  }
}
