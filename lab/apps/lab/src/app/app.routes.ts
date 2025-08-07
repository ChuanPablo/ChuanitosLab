import { Route } from '@angular/router';
import {
  DashboardComponent,
  EditUserComponent,
  LoginComponent,
  MainLayoutComponent,
  NotFoundComponent,
  UserDetailComponent,
  SearchResultsComponent,
  AboutComponent,
} from '@lab/layout-ui';
import { AuthGuard } from '@lab/core-services';
import { BaseRoutes } from '@lab/shared-utils';

export const appRoutes: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full',
      },
      {
        path: BaseRoutes.Dashboard,
        component: DashboardComponent,
      },
      {
        path: BaseRoutes.Search,
        component: SearchResultsComponent,
      },
      {
        path: BaseRoutes.About,
        component: AboutComponent,
      },
      {
        path: `${BaseRoutes.User}/:userId`,
        component: UserDetailComponent,
      },
      {
        path: `${BaseRoutes.User}/:userId/edit`,
        component: EditUserComponent,
        canActivate: [AuthGuard],
      }
    ]
  },
  {
    path: BaseRoutes.Login,
    component: LoginComponent
  },
  {
    path:'**',
    component: NotFoundComponent
  }
];
