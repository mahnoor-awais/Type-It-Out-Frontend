import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Article } from '../../../../core/models/article.models';
import { AuthService } from '../../../../core/services/auth';
import { ArticleService } from '../../../../core/services/article';
import { ArticleCard } from '../../../../shared/article-card/article-card';

export type ArticleFeedType = 'latest' | 'following' | 'mine' | 'liked';

@Component({
  standalone: true,
  imports: [ArticleCard],
  selector: 'app-article-feed',
  styleUrl: './article-feed.css',
  templateUrl: './article-feed.html',
})
export class ArticleFeed implements OnInit {
  private readonly articleService = inject(ArticleService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly articles = signal<Article[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly feedType = input<ArticleFeedType>('latest');
  readonly searchTerm = input('');
  readonly heading = computed(() => {
    switch (this.feedType()) {
      case 'following':
        return 'Following';
      case 'mine':
        return 'My Articles';
      case 'liked':
        return 'Liked Articles';
      default:
        return 'Latest articles';
    }
  });
  readonly emptyMessage = computed(() => {
    switch (this.feedType()) {
      case 'mine':
        return "You haven't written any articles yet.";
      case 'liked':
        return "You haven't liked any articles yet.";
      case 'following':
        return 'No articles from people you follow yet.';
      default:
        return 'No articles yet.';
    }
  });
  readonly filteredArticles = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) {
      return this.articles();
    }

    return this.articles().filter((article) =>
      [article.title, article.content, article.author.username].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  });

  ngOnInit(): void {
    const needsUserId = this.feedType() === 'mine' || this.feedType() === 'liked';
    const userId = needsUserId ? this.authService.getUserId() : null;
    if (needsUserId && userId === null) {
      this.errorMessage.set('Unable to identify your account. Please sign in again.');
      this.isLoading.set(false);
      return;
    }

    const articlesRequest =
      this.feedType() === 'following'
        ? this.articleService.getFollowingArticles()
        : this.feedType() === 'mine' && userId !== null
          ? this.articleService.getUserArticles(userId)
          : this.feedType() === 'liked' && userId !== null
            ? this.articleService.getUserLikedArticles(userId)
            : this.articleService.getArticles();

    articlesRequest.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (articles) => this.articles.set(articles),
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.authService.removeToken();
          this.errorMessage.set('Your session has expired. Please log in again.');
          void this.router.navigateByUrl('/login');
          return;
        }

        this.errorMessage.set(
          this.getErrorMessage(
            error,
            this.feedType() === 'liked'
              ? 'Unable to load your liked articles. Please try again later.'
              : this.feedType() === 'mine'
                ? 'Unable to load your articles. Please try again later.'
                : 'Unable to load articles. Please try again later.',
          ),
        );
      },
    });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.';
    }

    if (error instanceof HttpErrorResponse && typeof error.error === 'string') {
      return error.error;
    }

    return fallback;
  }
}
