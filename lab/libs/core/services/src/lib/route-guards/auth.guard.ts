import {AuthService} from "../auth.service";
import { Injectable } from '@angular/core';
import {CanActivate, Router, UrlTree} from "@angular/router";
import {inject} from "@angular/core";

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  readonly isLoggedIn = this.authService.isLoggedIn;

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    return this.isLoggedIn() || this.router.createUrlTree(['/login']);
  }
}
