import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Article } from '../../core/models/article.models';
import { AuthService } from '../../core/services/auth';
import { ArticleService } from '../../core/services/article';
import { formatArticleDate } from '../utils/date-format';

const ARTICLE_PREVIEW_LIMIT = 220;

@Component({
  standalone: true,
  imports: [],
  selector: 'app-article-card',
  styleUrl: './article-card.css',
  templateUrl: './article-card.html',
})
export class ArticleCard {
  private readonly articleService = inject(ArticleService);
  private readonly authService = inject(AuthService);

  private articleValue!: Article;

  @Input({ required: true })
  set article(article: Article) {
    this.articleValue = article;
    this.displayedLikesCount.set(article.likesCount);
    this.isLiked.set(false);
    this.canToggleLike.set(false);
    this.likeError.set('');
    this.loadLikeState(article);
  }

  get article(): Article {
    return this.articleValue;
  }

  readonly isLiked = signal(false);
  readonly displayedLikesCount = signal(0);
  readonly isLikeRequestPending = signal(true);
  readonly canToggleLike = signal(false);
  readonly likeError = signal('');

  get previewContent(): string {
    const content = this.article.content;
    if (content.length <= ARTICLE_PREVIEW_LIMIT) {
      return content;
    }

    return `${content.slice(0, ARTICLE_PREVIEW_LIMIT).trimEnd()}...`;
  }

  get formattedCreatedAt(): string {
    return formatArticleDate(this.article?.createdAt);
  }

  toggleLike(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isLikeRequestPending() || !this.canToggleLike()) {
      return;
    }

    const shouldLike = !this.isLiked();
    const request = shouldLike
      ? this.articleService.likeArticle(this.article.id)
      : this.articleService.unlikeArticle(this.article.id);

    this.likeError.set('');
    this.isLikeRequestPending.set(true);
    request.pipe(finalize(() => this.isLikeRequestPending.set(false))).subscribe({
      next: (response) => {
        this.displayedLikesCount.set(response.likesCount);
        this.isLiked.set(shouldLike);
      },
      error: (error: unknown) =>
        this.likeError.set(
          this.getErrorMessage(error, 'Unable to update this like. Please try again.'),
        ),
    });
  }

  private loadLikeState(article: Article): void {
    const userId = this.authService.getUserId();
    this.isLikeRequestPending.set(true);

    this.articleService
      .getArticleLikes(article.id)
      .pipe(finalize(() => this.isLikeRequestPending.set(false)))
      .subscribe({
        next: (response) => {
          this.displayedLikesCount.set(response.likesCount);
          this.isLiked.set(userId !== null && response.users.some((user) => user.id === userId));
          this.canToggleLike.set(userId !== null);
          if (userId === null) {
            this.likeError.set('Sign in to like articles.');
          }
        },
        error: (error: unknown) =>
          this.likeError.set(this.getErrorMessage(error, 'Unable to load like status.')),
      });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'Unable to reach the server. Please try again.';
    }
    if (error instanceof HttpErrorResponse && error.status === 401) {
      return 'Please sign in again to like this article.';
    }
    if (error instanceof HttpErrorResponse && error.status === 409) {
      return 'Your like status changed elsewhere. Reload the page to sync it.';
    }

    return fallback;
  }
}
