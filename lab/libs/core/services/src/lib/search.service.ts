import { Injectable, inject } from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
  of,
  catchError,
  forkJoin
} from 'rxjs';
import { User } from '@lab/shared-interfaces';
import { UserService } from './user.service';
import { TimelineService } from './user-timeline-entry.service';
import { SkillsService } from './user-skills.service';
import { SearchSuggestionMatchTypes } from '@lab/shared-utils';

export interface SearchResult {
  users: User[];
  query: string;
  totalResults: number;
}

export interface SearchSuggestion {
  user: User;
  matchType: typeof SearchSuggestionMatchTypes[keyof typeof SearchSuggestionMatchTypes];
  displayText: string;
}

/**
 * @summary Service for handling user search functionality
 * @description Provides both server-side search via API and client-side filtering as fallback
 * Manages search state and provides suggestions for autocomplete
 */
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private userService = inject(UserService);
  private userTimelineService = inject(TimelineService);
  private userSkillsService = inject(SkillsService);

  private searchQuerySubject = new BehaviorSubject<string>('');
  private cachedUsers: User[] = [];
  private cacheLoaded = false;

  /**
   * @summary Observable for the current search query
   */
  public readonly searchQuery$ = this.searchQuerySubject.asObservable();
  /**
   * @summary Gets the current search query value
   * @returns Current search query string
   */
  get searchQuery(): string {
    return this.searchQuerySubject.value;
  }

  /**
   * @summary Updates the search query
   * @param query - The search query string
   */
  set searchQuery(query: string) {
    this.searchQuerySubject.next(query);
  }

  /**
   * @summary Performs server-side search with fallback to client-side filtering
   * @param query - The search query string
   * @param limit - Maximum number of results to return
   * @returns Observable<SearchResult>
   */
  searchUsers(query: string, limit = 10): Observable<SearchResult> {
    if (!query.trim()) {
      return of({ users: [], query: '', totalResults: 0 });
    }

    // Try server-side search first
    return this.loadAndCacheUsersWithSkillsAndTimeline(query, limit).pipe(
      map(users => ({
        users,
        query,
        totalResults: users.length
      })),
      catchError(() => {
        // Fallback to client-side search if server search fails
        return this.clientSideSearch(query, limit);
      })
    );
  }

  /**
   * @summary Gets search suggestions for autocomplete
   * @param query - The search query string
   * @param limit - Maximum number of suggestions to return
   * @returns Observable<SearchSuggestion[]>
   */
  getSearchSuggestions(query: string, limit = 5): Observable<SearchSuggestion[]> {
    if (!query.trim()) {
      return of([]);
    }

    return this.searchUsers(query, limit).pipe(
      map(result => this.createSuggestions(result.users, query))
    );
  }

  /**
   * @summary Creates a debounced search observable
   * @param debounceMs - Debounce time in milliseconds
   * @returns Observable<SearchResult>
   */
  createDebouncedSearch(debounceMs = 300): Observable<SearchResult> {
    return this.searchQuery$.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged(),
      switchMap(query => this.searchUsers(query))
    );
  }

  /**
   * @summary Creates a debounced suggestions observable
   * @param debounceMs - Debounce time in milliseconds
   * @returns Observable<SearchSuggestion[]>
   */
  createDebouncedSuggestions(debounceMs = 300): Observable<SearchSuggestion[]> {
    return this.searchQuery$.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged(),
      switchMap(query => this.getSearchSuggestions(query))
    );
  }

  /**
   * @summary Client-side search implementation as fallback
   * @param query - The search query string
   * @param limit - Maximum number of results to return
   * @returns Observable<SearchResult>
   */
  private clientSideSearch(query: string, limit: number): Observable<SearchResult> {
    return this.getAllUsersForSearch(query, limit).pipe(
      map(users => {
        const filteredUsers = this.filterUsers(users, query).slice(0, limit);
        return {
          users: filteredUsers,
          query,
          totalResults: filteredUsers.length
        };
      })
    );
  }

  /**
   * @summary Gets all users for client-side search (with caching)
   * @returns Observable<User[]>
   */
  private getAllUsersForSearch(query: string, limit?: number): Observable<User[]> {
    if (this.cacheLoaded && this.cachedUsers.length > 0) {
      return of(this.cachedUsers);
    }
    return this.loadAndCacheUsersWithSkillsAndTimeline(query, limit);
  }

  /**
   * @summary Loads all users for client-side search
   * @private
   */
  private loadAndCacheUsers(query: string, limit?: number): Observable<User[]> {
    return this.userService.searchUsers(query, limit).pipe(
      map(users => {
        this.cachedUsers = users;
        this.cacheLoaded = true;
        return users;
      }),
      catchError(() => of([]))
    );
  }

  /**
   * @summary Loads all users with skills and timeline entries for client-side search
   * @private
   */
  private loadAndCacheUsersWithSkillsAndTimeline(query: string, limit?: number): Observable<User[]> {
    return this.loadAndCacheUsers(query, limit).pipe(
      switchMap(users => {
        const userObservables = users.map(user => forkJoin({
          skills: this.userSkillsService.getUserSkills(user.id),
          timelineEntries: this.userTimelineService.getUserTimelineEntries(user.id)
        }).pipe(
          map(({ skills, timelineEntries }) => {
            user.skills = skills;
            user.timelineEntries = timelineEntries;
            return user;
          })
        ));
        return forkJoin(userObservables);
      })
    );
  }

  /**
   * @summary Filters users based on search query
   * @param users - Array of users to filter
   * @param query - Search query string
   * @returns Filtered array of users
   */
  private filterUsers(users: User[], query: string): User[] {
    const searchTerm = query.toLowerCase().trim();

    return users.filter(user =>
      `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().trim().includes(searchTerm) ||
      (user.username || '').toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.skills?.some(skill => skill.name.toLowerCase().includes(searchTerm)) || false) ||
      (user.timelineEntries?.some(entry => entry.title.toLowerCase().includes(searchTerm)) || false)
    );
  }

  /**
   * @summary Creates search suggestions from users
   * @param users - Array of users
   * @param query - Original search query
   * @returns Array of search suggestions
   */
  private createSuggestions(users: User[], query: string): SearchSuggestion[] {
    const searchTerm = query.toLowerCase().trim();

    return users.map(user => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const username = user.username || '';

      // Determine match type and display text
      const searchSuggestion = {
        user,
        matchType: 'name',
        displayText: fullName
      };

      if (username.toLowerCase().includes(searchTerm)) {
        searchSuggestion.matchType = SearchSuggestionMatchTypes.Username;
        searchSuggestion.displayText = `${searchSuggestion.displayText} (@${username})`;
      } else if (fullName.toLowerCase().includes(searchTerm)) {
        searchSuggestion.matchType = SearchSuggestionMatchTypes.Name;
      } else if (user.email.toLowerCase().includes(searchTerm)) {
        searchSuggestion.matchType = SearchSuggestionMatchTypes.Email;
      } else if (user.skills?.some(skill => skill.name.toLowerCase().includes(searchTerm))) {
        searchSuggestion.matchType = SearchSuggestionMatchTypes.Skill;
      } else if (user.timelineEntries?.some(entry => entry.title.toLowerCase().includes(searchTerm))) {
        searchSuggestion.matchType = SearchSuggestionMatchTypes.Organisation;
      }

      return searchSuggestion
    });
  }

  /**
   * @summary Clears the search cache (call when users are updated)
   */
  clearCache(): void {
    this.cachedUsers = [];
    this.cacheLoaded = false;
  }
}
