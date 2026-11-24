import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from './core/services/auth';
import { ArticleSearchState } from './core/services/article-search';
import { Navbar } from './shared/navbar/navbar';

function isShellRoute(url: string): boolean {
  const path = url.split(/[?#]/, 1)[0];
  return path !== '/login' && path !== '/register';
}

@Component({
  imports: [Navbar, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly articleSearchState = inject(ArticleSearchState);

  readonly showShell = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => isShellRoute(event.urlAfterRedirects)),
    ),
    { initialValue: false },
  );

  updateSearchTerm(searchTerm: string): void {
    this.articleSearchState.setSearchTerm(searchTerm);
  }

  logout(): void {
    this.authService.removeToken();
    void this.router.navigateByUrl('/login');
  }
}
