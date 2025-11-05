import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'articles',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'articles',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/articles/article-list/article-list.component').then(m => m.ArticleListComponent)
      },
      {
        path: 'new',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.WRITER] },
        loadComponent: () => import('./features/articles/article-form/article-form.component').then(m => m.ArticleFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/articles/article-detail/article-detail.component').then(m => m.ArticleDetailComponent)
      },
      {
        path: ':id/edit',
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.EDITOR, UserRole.WRITER] },
        loadComponent: () => import('./features/articles/article-form/article-form.component').then(m => m.ArticleFormComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] },
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] },
    loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: '**',
    redirectTo: 'articles'
  }
];
