import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ArticleService } from '../../core/services/article';
import { AuthService } from '../../core/services/auth';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  selector: 'app-write-article',
  styleUrl: './write-article.css',
  templateUrl: './write-article.html',
})
export class WriteArticle {
  private readonly articleService = inject(ArticleService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isCreatingArticle = signal(false);
  readonly createArticleError = signal('');
  readonly articleForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    content: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  submitArticle(): void {
    if (this.articleForm.invalid || this.isCreatingArticle()) {
      this.articleForm.markAllAsTouched();
      return;
    }

    this.isCreatingArticle.set(true);
    this.createArticleError.set('');
    this.articleService
      .createArticle(this.articleForm.getRawValue())
      .pipe(finalize(() => this.isCreatingArticle.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/my-articles'),
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.authService.removeToken();
            this.createArticleError.set('Your session has expired. Please log in again.');
            void this.router.navigateByUrl('/login');
            return;
          }

          this.createArticleError.set(this.getCreateArticleErrorMessage(error));
        },
      });
  }

  private getCreateArticleErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.';
    }

    if (error instanceof HttpErrorResponse && typeof error.error === 'string') {
      return error.error;
    }

    return 'Unable to publish your article. Please try again.';
  }
}
