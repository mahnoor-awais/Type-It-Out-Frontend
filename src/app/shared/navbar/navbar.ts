import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { UserProfile } from '../../core/models/user.models';
import { UserService } from '../../core/services/user';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  @Output() readonly searchChange = new EventEmitter<string>();
  @Output() readonly logoutRequested = new EventEmitter<void>();

  readonly user = signal<UserProfile | null>(null);
  readonly isLoadingProfile = signal(true);
  readonly profileError = signal('');

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId === null) {
      this.isLoadingProfile.set(false);
      this.profileError.set('Unable to identify your account.');
      return;
    }

    this.userService
      .getUserById(userId)
      .pipe(finalize(() => this.isLoadingProfile.set(false)))
      .subscribe({
        next: (user) => this.user.set(user),
        error: (error: unknown) => this.profileError.set(this.getErrorMessage(error)),
      });
  }

  onSearchInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.searchChange.emit(event.target.value);
    }
  }

  getInitial(username: string): string {
    return username.trim().charAt(0).toUpperCase() || '?';
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'Unable to reach the server. Your profile could not be loaded.';
    }

    return 'Unable to load your profile.';
  }
}
