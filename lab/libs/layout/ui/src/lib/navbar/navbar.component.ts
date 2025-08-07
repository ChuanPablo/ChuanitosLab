import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { AuthService, ConfigService, SearchService, SearchSuggestion, UserAuthUtilsService } from '@lab/core-services';
import { BaseRoutes, Utilities } from '@lab/shared-utils';
import { SearchBarComponent } from '@lab/shared-ui';

@Component({
  selector: 'lib-layout-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    FormsModule,
    SearchBarComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private config = inject(ConfigService);
  private authUtils = inject(UserAuthUtilsService)

  appName = this.config.appName;
  isLoggedIn = this.authService.isLoggedIn;
  isMobile = signal(false);
  isMobileMenuOpen = signal(false);
  currentUserId = this.authUtils.currentUserId;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isMobile.set(result.matches);
        if (!result.matches) {
          this.isMobileMenuOpen.set(false);
        }
      });
  }

  toggleMobileMenu() {
    console.log('Before toggle:', this.isMobileMenuOpen());
    this.isMobileMenuOpen.update((value) => !value);
    console.log('After toggle:', this.isMobileMenuOpen());
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }

  /**
   * @summary Handles search form submission
   * @description Navigates to search results page with the current query
   */
  onSearchSubmitted(query: string): void {
    if (query) {
      this.router.navigate(['/', BaseRoutes.Search], { queryParams: { q: query } });
    }
  }

  /**
   * @summary Handles suggestion selection
   * @description Navigates to search results or user profile based on suggestion
   * @param suggestion - The selected search suggestion
   */
  onSuggestionSelected(suggestion: SearchSuggestion): void {
    console.log('suggestion selected', suggestion);
    this.router.navigate(['/', BaseRoutes.User, suggestion.user.id]);
  }

  /**
   * @summary Handles search icon click
   * @description Triggers search submission
   */
  onSearchIconClicked(query: string): void {
    this.onSearchSubmitted(query);
  }

  protected readonly BaseRoutes = BaseRoutes;
}
