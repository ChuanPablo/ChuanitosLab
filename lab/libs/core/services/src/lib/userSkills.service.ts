import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserSkill, UserSkillDto } from '@lab/shared-interfaces';
import { ApiEndpoints, LocalStorageKeys } from '@lab/shared-utils';
import { catchError, EMPTY, map, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * @summary Service handling all user skills management
 * @description This service provides wrapper functions for all user skills API endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  private config = inject(ConfigService);
  private apiUrl = this.config.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * @summary (Getter) Returns HttpHeaders object containing the Bearer token
   * @description retrieves token from local storage, packs it into a HttpHeaders object and returns it
   * every time it is called
   */
  get headers(): HttpHeaders {
    const token = localStorage.getItem(LocalStorageKeys.AuthToken);
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * @summary Maps UserSkillDto to UserSkill interface
   * @description Converts snake_case DTO fields to camelCase interface fields
   * @param skillDto - The DTO object from API
   * @returns UserSkill object with camelCase properties
   */
  private mapDtoToSkill(skillDto: UserSkillDto): UserSkill {
    return {
      id: skillDto.id,
      userId: skillDto.user_id,
      name: skillDto.name,
      category: skillDto.category,
      categoryDisplay: skillDto.category_display,
      level: skillDto.level,
      levelDisplay: skillDto.level_display,
      description: skillDto.description ? skillDto.description : '',
      yearsOfExperience: skillDto?.years_of_experience ? skillDto.years_of_experience : 0,
      documentation: skillDto.documentation ? skillDto.documentation : '',
      visibility: skillDto.visibility,
      createdAt: new Date(skillDto.created_at),
      updatedAt: new Date(skillDto.updated_at),
    };
  }

  /**
   * @summary Maps UserSkill interface to UserSkillDto for API calls
   * @description Converts camelCase interface fields to snake_case DTO fields
   * @param skill - The UserSkill object
   * @returns UserSkillDto object with snake_case properties
   */
  private mapSkillToDto(skill: Partial<UserSkill>): Partial<UserSkillDto> {
    return {
      user_id: skill.userId,
      name: skill.name,
      category: skill.category,
      category_display: skill.categoryDisplay,
      level: skill.level,
      level_display: skill.levelDisplay,
      description: skill.description,
      years_of_experience: skill.yearsOfExperience,
      documentation: skill.documentation,
      visibility: skill.visibility,
    };
  }

  /**
   * @summary Handle HTTP errors with authentication check
   * @description Common error handler that redirects to login on 401
   * @param operation - Name of the operation for logging
   * @returns Observable that throws formatted error
   */
  private handleError(operation: string) {
    return (error: any): Observable<never> => {
      if (error.status === 401) {
        this.router.navigate(['/login']);
        return EMPTY;
      }
      return throwError(() => ({
        message: `Error during ${operation}`,
        originalError: error
      }));
    };
  }

  /**
   * @summary Retrieves all skills for a specific user
   * @description Sends HTTP GET request to fetch user's skills
   * @param userId - The ID of the user whose skills to retrieve
   * @returns Observable<UserSkill[]>
   * @throws Observable<never> when fetch fails or unauthorized
   */
  getUserSkills(userId: number): Observable<UserSkill[]> {
    return this.http.get<UserSkillDto[]>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${userId}/${ApiEndpoints.Skills}`, { headers: this.headers })
      .pipe(
        map((skills) => skills.map(skillDto => this.mapDtoToSkill(skillDto))),
        catchError(this.handleError('fetch user skills'))
      );
  }

  /**
   * @summary Retrieves all skills for the current authenticated user
   * @description Sends HTTP GET request to fetch current user's skills
   * @returns Observable<UserSkill[]>
   * @throws Observable<never> when fetch fails or unauthorized
   */
  getCurrentUserSkills(): Observable<UserSkill[]> {
    return this.http.get<UserSkillDto[]>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${ApiEndpoints.Me}/${ApiEndpoints.Skills}`, { headers: this.headers })
      .pipe(
        map((skills) => skills.map(skillDto => this.mapDtoToSkill(skillDto))),
        catchError(this.handleError('fetch current user skills'))
      );
  }

  /**
   * @summary Creates a new skill for a user
   * @description Sends HTTP POST request to create a new skill
   * @param userId - The ID of the user to add the skill to
   * @param skill - The skill data to create
   * @returns Observable<UserSkill> - The created skill
   * @throws Observable<never> when creation fails or unauthorized
   */
  createSkill(userId: number, skill: FormData): Observable<UserSkill> {
    return this.http.post<UserSkillDto>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${userId}/${ApiEndpoints.Skills}/`, skill, { headers: this.headers })
      .pipe(
        map(createdSkillDto => this.mapDtoToSkill(createdSkillDto)),
        catchError(this.handleError('create skill'))
      );
  }

  /**
   * @summary Creates a new skill for the current authenticated user
   * @description Sends HTTP POST request to create a new skill for current user
   * @param skill - The skill data to create
   * @returns Observable<UserSkill> - The created skill
   * @throws Observable<never> when creation fails or unauthorized
   */
  createCurrentUserSkill(skill: Omit<UserSkill, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Observable<UserSkill> {
    const skillDto = this.mapSkillToDto(skill);
    return this.http.post<UserSkillDto>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${ApiEndpoints.Me}/${ApiEndpoints.Skills}/`, skillDto, { headers: this.headers })
      .pipe(
        map(createdSkillDto => this.mapDtoToSkill(createdSkillDto)),
        catchError(this.handleError('create current user skill'))
      );
  }

  /**
   * @summary Updates an existing skill
   * @description Sends HTTP PUT request to update skill data
   * @param userId - The ID of the user the skill is linked to
   * @param skillId - The ID of the skill to update
   * @param skill - The updated skill data
   * @returns Observable<UserSkill> - The updated skill
   * @throws Observable<never> when update fails or unauthorized
   */
  updateSkill(userId: number, skillId: number, skill: FormData): Observable<UserSkill> {
    return this.http.patch<UserSkillDto>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${userId}/${ApiEndpoints.Skills}/${skillId}/`, skill, { headers: this.headers })
      .pipe(
        map(updatedSkillDto => this.mapDtoToSkill(updatedSkillDto)),
        catchError(this.handleError('update skill'))
      );
  }

  /**
   * @summary Deletes a skill by ID
   * @description Sends HTTP DELETE request to remove skill
   * @param userId - The ID of the user the skill is linked to
   * @param skillId - The ID of the skill to delete
   * @returns Observable<void>
   * @throws Observable<never> when deletion fails or unauthorized
   */
  deleteSkill(userId: number, skillId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${userId}/${ApiEndpoints.Skills}/${skillId}/`, { headers: this.headers })
      .pipe(
        catchError(this.handleError('delete skill'))
      );
  }

  /**
   * @summary Retrieves skills by category
   * @description Sends HTTP GET request to fetch skills filtered by category
   * @param userId - The ID of the user whose skills to retrieve
   * @param category - The category to filter by
   * @returns Observable<UserSkill[]>
   * @throws Observable<never> when fetch fails or unauthorized
   */
  getSkillsByCategory(userId: number, category: string): Observable<UserSkill[]> {
    return this.http.get<UserSkillDto[]>(`${this.apiUrl()}/${ApiEndpoints.Prefix}/${ApiEndpoints.Users}/${userId}/${ApiEndpoints.Skills}?category=${category}`, { headers: this.headers })
      .pipe(
        map((skills) => skills.map(skill => this.mapDtoToSkill(skill))),
        catchError(this.handleError('fetch skills by category'))
      );
  }
}
