import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService, ConfigService } from '@lab/core-services';
import { inject } from '@angular/core';

@Component({
  selector: 'lib-layout-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  //Inject services here so we can use their signals directly here
  private authService = inject(AuthService);
  private config = inject(ConfigService)

  //expose desired signals here
  appName = this.config.appName;
  isLoggedIn = this.authService.isLoggedIn;

  isMobileMenuOpen = signal(false);
  isMobile = signal(false);

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
  ) {
    // Watch for mobile breakpoint changes
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
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  logout(){
    this.authService.logout();
  }
}
