import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Home } from './features/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    pathMatch: 'full',
    canActivate: [authGuard],
  },
  {
    path: 'home',
    redirectTo: '/',
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: Register,
    canActivate: [authGuard],
    data: { guestOnly: true },
  },
  {
    path: 'login',
    component: Login,
    canActivate: [authGuard],
    data: { guestOnly: true },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
