import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserTimelineEntry, UserTimelineEntryDto } from '@lab/shared-interfaces';
import { ApiEndpoints, StorageKeys } from '@lab/shared-utils';
import { catchError, map, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { ErrorService } from './error.service';

/**
 * @summary Service handling all user timeline entries management
 * @description This service provides wrapper functions for all user timeline entries API endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class TimelineService {
  private config = inject(ConfigService);
  private storageService = inject(StorageService);
  private errorService = inject(ErrorService);
  private apiUrl = this.config.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * @summary (Getter) Returns HttpHeaders object containing the Bearer token if authenticated
   * @description retrieves token from storage, and returns headers with Authorization only if token exists
   * Returns empty headers if user is not authenticated
   */
  get headers(): HttpHeaders {
    const token = this.storageService.get(StorageKeys.AuthToken);

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * @summary Maps UserTimelineEntryDto to UserTimelineEntry interface
   * @description Converts snake_case DTO fields to camelCase interface fields
   * @param entryDto - The DTO object from API
   * @returns UserTimelineEntry object with camelCase properties
   */
  private mapDtoToEntry(entryDto: UserTimelineEntryDto): UserTimelineEntry {
    return {
      id: entryDto.id,
      userId: entryDto.user_id,
      title: entryDto.title,
      organisation: entryDto.organisation,
      location: entryDto.location,
      timelineEntryType: entryDto.timeline_entry_type,
      description: entryDto.description ? entryDto.description : '',
      documentation: entryDto.documentation ? entryDto.documentation : '',
      startDate: new Date(entryDto.start_date),
      endDate: entryDto.end_date ? new Date(entryDto.end_date) : undefined,
      visibility: entryDto.visibility,
    };
  }

  /**
   * @summary Maps UserTimelineEntry interface to UserTimelineEntryDto for API calls
   * @description Converts camelCase interface fields to snake_case DTO fields
   * @param entry - The UserTimelineEntry object
   * @returns UserTimelineEntryDto object with snake_case properties
   */
  private mapEntryToDto(entry: Partial<UserTimelineEntry>): Partial<UserTimelineEntryDto> {
    return {
      user_id: entry.userId ? entry.userId : undefined,
      title: entry.title,
      organisation: entry.organisation,
      location: entry.location,
      timeline_entry_type: entry.timelineEntryType,
      description: entry.description,
      start_date: entry.startDate?.toISOString().split('T')[0],
      end_date: entry.endDate ? entry.endDate.toISOString().split('T')[0] : undefined,
      documentation: entry.documentation,
      visibility: entry.visibility,
    };
  }

  /**
   * @summary Retrieves all timeline entries for a specific user
   * @description Sends HTTP GET request to fetch user's timeline entries
   * @param userId - The ID of the user whose timeline entries to retrieve
   * @returns Observable<UserTimelineEntry[]>
   * @throws Observable<never> when fetch fails or unauthorized
   */
  getUserTimelineEntries(userId: number): Observable<UserTimelineEntry[]> {
    return this.http.get<UserTimelineEntryDto[]>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${userId}/${ApiEndpoints.Timeline}`, { headers: this.headers })
      .pipe(
        map((entries) => entries.map(entry => this.mapDtoToEntry(entry))),
        catchError(this.errorService.handleError('fetch user timeline entries'))
      );
  }

  /**
   * @summary Retrieves all timeline entries for the current authenticated user
   * @description Sends HTTP GET request to fetch current user's timeline entries
   * @returns Observable<UserTimelineEntry[]>
   * @throws Observable<never> when fetch fails or unauthorized
   */
  getCurrentUserTimelineEntries(): Observable<UserTimelineEntry[]> {
    return this.http.get<UserTimelineEntryDto[]>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${ApiEndpoints.Me}/${ApiEndpoints.Timeline}`, { headers: this.headers })
      .pipe(
        map((entries) => entries.map(entry => this.mapDtoToEntry(entry))),
        catchError(this.errorService.handleError('fetch current user timeline entries'))
      );
  }

  /**
   * @summary Creates a new timeline entry for a user
   * @description Sends HTTP POST request to create a new timeline entry
   * @param userId - The ID of the user to add the timeline entry to
   * @param entry - The timeline entry data to create
   * @returns Observable<UserTimelineEntry> - The created timeline entry
   * @throws Observable<never> when creation fails or unauthorized
   */
  createTimelineEntry(userId: number, entry: FormData): Observable<UserTimelineEntry> {
    return this.http.post<UserTimelineEntryDto>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${userId}/${ApiEndpoints.Timeline}/`, entry, { headers: this.headers })
      .pipe(
        map(createdEntryDto => this.mapDtoToEntry(createdEntryDto)),
        catchError(this.errorService.handleError('create timeline entry'))
      );
  }

  /**
   * @summary Creates a new timeline entry for the current authenticated user
   * @description Sends HTTP POST request to create a new timeline entry for current user
   * @param entry - The timeline entry data to create
   * @returns Observable<UserTimelineEntry> - The created timeline entry
   * @throws Observable<never> when creation fails or unauthorized
   */
  createCurrentUserTimelineEntry(entry: Omit<UserTimelineEntry, 'id' | 'userId'>): Observable<UserTimelineEntry> {
    const entryDto = this.mapEntryToDto(entry);
    return this.http.post<UserTimelineEntryDto>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${ApiEndpoints.Me}/${ApiEndpoints.Timeline}/`, entryDto, { headers: this.headers })
      .pipe(
        map(createdEntryDto => this.mapDtoToEntry(createdEntryDto)),
        catchError(this.errorService.handleError('create current user timeline entry'))
      );
  }

  /**
   * @summary Updates an existing timeline entry
   * @description Sends HTTP PUT request to update timeline entry data
   * @param userId - The ID of the user linked to the timeline
   * @param entryId - The ID of the timeline entry to update
   * @param entry - The updated timeline entry data
   * @returns Observable<UserTimelineEntry> - The updated timeline entry
   * @throws Observable<never> when update fails or unauthorized
   */
  updateTimelineEntry(userId: number, entryId: number, entry: FormData): Observable<UserTimelineEntry> {
    return this.http.patch<UserTimelineEntryDto>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${userId}/${ApiEndpoints.Timeline}/${entryId}/`, entry, { headers: this.headers })
      .pipe(
        map(updatedEntryDto => this.mapDtoToEntry(updatedEntryDto)),
        catchError(this.errorService.handleError('update timeline entry'))
      );
  }

  /**
   * @summary Deletes a timeline entry by ID
   * @description Sends HTTP DELETE request to remove timeline entry
   * @param userId - The ID of the user linked to the timeline
   * @param entryId - The ID of the timeline entry to delete
   * @returns Observable<void>
   * @throws Observable<never> when deletion fails or unauthorized
   */
  deleteTimelineEntry(userId: number, entryId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${userId}/${ApiEndpoints.Timeline}/${entryId}/`, { headers: this.headers })
      .pipe(
        catchError(this.errorService.handleError('delete timeline entry'))
      );
  }

  /**
   * @summary Retrieves timeline entries by type (JOB or EDUCATION)
   * @description Sends HTTP GET request to fetch timeline entries filtered by type
   * @param userId - The ID of the user whose timeline entries to retrieve
   * @param type - The type to filter by ('JOB' or 'EDUCATION')
   * @returns Observable<UserTimelineEntry[]>
   * @throws Observable<never> when fetch fails or unauthorized
   */
  getTimelineEntriesByType(userId: number, type: string): Observable<UserTimelineEntry[]> {
    return this.http.get<UserTimelineEntryDto[]>(`${this.apiUrl()}/${ApiEndpoints.Users}/${userId}/timeline?type=${type}`, { headers: this.headers })
      .pipe(
        map((entries) => entries.map(entry => this.mapDtoToEntry(entry))),
        catchError(this.errorService.handleError('fetch timeline entries by type'))
      );
  }

  /**
   * @summary Retrieves timeline entries within a date range
   * @description Sends HTTP GET request to fetch timeline entries within specified dates
   * @param userId - The ID of the user whose timeline entries to retrieve
   * @param startDate - The start date for filtering
   * @param endDate - The end date for filtering
   * @returns Observable<UserTimelineEntry[]>
   * @throws Observable<never> when fetch fails or unauthorized
   */
  getTimelineEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Observable<UserTimelineEntry[]> {
    const params = new URLSearchParams({
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });

    return this.http.get<UserTimelineEntryDto[]>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${userId}/${ApiEndpoints.Timeline}?${params}`, { headers: this.headers })
      .pipe(
        map((entries) => entries.map(entry => this.mapDtoToEntry(entry))),
        catchError(this.errorService.handleError('fetch timeline entries by date range'))
      );
  }

  /**
   * @summary Retrieves timeline entries sorted by date
   * @description Sends HTTP GET request to fetch timeline entries ordered by start date
   * @param userId - The ID of the user whose timeline entries to retrieve
   * @param order - Sort order: 'asc' for ascending, 'desc' for descending
   * @returns Observable<UserTimelineEntry[]>
   * @throws Observable<never> when fetch fails or unauthorized
   */
  getTimelineEntriesSorted(userId: string, order: 'asc' | 'desc' = 'desc'): Observable<UserTimelineEntry[]> {
    return this.http.get<UserTimelineEntryDto[]>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${userId}/${ApiEndpoints.Timeline}?sort=${order}`, { headers: this.headers })
      .pipe(
        map((entries) => entries.map(entry => this.mapDtoToEntry(entry))),
        catchError(this.errorService.handleError('fetch sorted timeline entries'))
      );
  }
}
