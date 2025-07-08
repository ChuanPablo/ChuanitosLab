import { Route } from '@angular/router';
import {
  DashboardComponent,
  EditUserComponent,
  LoginComponent,
  MainLayoutComponent,
  NotFoundComponent,
  UserDetailComponent
} from '@lab/layout-ui';
import { AuthGuard } from '@lab/core-services';

export const appRoutes: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    //canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'u/:userId',
        component: UserDetailComponent,
      },
      {
        path: 'u/:userId/edit',
        component: EditUserComponent,
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path:'**',
    component: NotFoundComponent
  }
];
