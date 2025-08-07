import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearchService, SearchResult, DialogService } from '@lab/core-services';
import { User } from '@lab/shared-interfaces';
import { BaseRoutes, Utilities } from '@lab/shared-utils';
import { UserCardComponent } from '@lab/user-ui';
import { UserDetailComponent } from '../user-detail/user-detail.component';

@Component({
  selector: 'lib-search-results',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    UserCardComponent,
  ],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private searchService = inject(SearchService);

  // Signals for component state
  searchQuery = signal<string>('');
  searchResults = signal<User[]>([]);
  isLoading = signal<boolean>(false);
  hasSearched = signal<boolean>(false);

  // Computed properties
  hasResults = computed(() => this.searchResults().length > 0);
  showNoResults = computed(
    () => this.hasSearched() && !this.hasResults() && !this.isLoading()
  );

  // Bindings
  public readonly trackByUserId = Utilities.trackByUserId;

  // Dependency Injection
  private dialogService = inject(DialogService);

  ngOnInit(): void {
    // Subscribe to query parameters to handle search
    this.route.queryParams.subscribe((params) => {
      const query = params['q'];
      if (query) {
        this.performSearch(query);
      } else {
        this.resetSearch();
      }
    });
  }

  /**
   * @summary Performs search with the given query
   * @param query - The search query string
   */
  private performSearch(query: string): void {
    this.searchQuery.set(query);
    this.isLoading.set(true);
    this.hasSearched.set(true);

    this.searchService.searchUsers(query, 50).subscribe({
      next: (result: SearchResult) => {
        this.searchResults.set(result.users);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Search failed:', error);
        this.searchResults.set([]);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * @summary Resets the search state
   */
  private resetSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.hasSearched.set(false);
    this.isLoading.set(false);
  }

  /**
   * @summary Navigates to a user's profile
   * @param userId - The ID of the user to view
   */
  viewUserProfile(userId: number): void {
    this.router.navigate(['/', BaseRoutes.User, userId]);
  }

  /**
   * @summary Gets the display name for a user
   * @param user - The user object
   * @returns The display name
   */
  getUserDisplayName(user: User): string {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.username || user.email;
  }

  /**
   * @summary Performs a new search
   * @param query - The new search query
   */
  newSearch(query: string): void {
    if (query.trim()) {
      this.router.navigate(['/', BaseRoutes.Search], {
        queryParams: { q: query.trim() },
      });
    }
  }

  onViewDetails(user: User) {
    this.dialogService.openGenericDialog( {
      title: 'User Details',
      componentClass: UserDetailComponent,
      componentInputs: { inputUser:user },
    });
  }
}
