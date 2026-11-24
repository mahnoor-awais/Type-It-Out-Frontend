import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { ArticleFeedPage } from './features/home/article-feed-page';
import { Home } from './features/home/home';
import { WriteArticle } from './features/home/write-article';

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
    path: 'following',
    component: ArticleFeedPage,
    canActivate: [authGuard],
    data: { feedType: 'following' },
  },
  {
    path: 'write',
    component: WriteArticle,
    canActivate: [authGuard],
  },
  {
    path: 'my-articles',
    component: ArticleFeedPage,
    canActivate: [authGuard],
    data: { feedType: 'mine' },
  },
  {
    path: 'liked-articles',
    component: ArticleFeedPage,
    canActivate: [authGuard],
    data: { feedType: 'liked' },
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
