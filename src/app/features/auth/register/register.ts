import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { finalize, switchMap, tap } from 'rxjs';
import { AuthService } from '../../../core/services/auth';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  isLoading = false;
  errorMessage = '';

  submit(): void {
    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const credentials = this.form.getRawValue();
    let registrationCompleted = false;

    this.authService
      .register(credentials)
      .pipe(
        tap(() => (registrationCompleted = true)),
        switchMap(() =>
          this.authService.login({
            email: credentials.email,
            password: credentials.password,
          }),
        ),
      )
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/'),
        error: (error: unknown) => {
          this.errorMessage = this.getErrorMessage(
            error,
            registrationCompleted
              ? 'Your account was created, but automatic login failed. Please log in with your new credentials.'
              : 'Unable to create your account. Please try again.',
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
