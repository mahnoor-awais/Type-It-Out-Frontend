import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../../constants/api.constants';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorageKey = 'type-it-out-token';

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${API_BASE_URL}/Auth/register`, request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_BASE_URL}/Auth/login`, request)
      .pipe(tap((response) => this.saveToken(response.token)));
  }

  saveToken(token: string): void {
    sessionStorage.setItem(this.tokenStorageKey, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenStorageKey);
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token || !this.isAuthenticated()) {
      return null;
    }

    const subject = decodeJwtPayload(token)['sub'];
    const userId =
      typeof subject === 'number'
        ? subject
        : typeof subject === 'string' && /^\d+$/.test(subject)
          ? Number(subject)
          : NaN;

    return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
  }

  removeToken(): void {
    sessionStorage.removeItem(this.tokenStorageKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      this.removeToken();
      return false;
    }

    try {
      const expiry = decodeJwtPayload(token)['exp'];
      const expiryTime = typeof expiry === 'number' ? expiry * 1000 : NaN;
      if (!Number.isFinite(expiryTime) || expiryTime <= Date.now()) {
        this.removeToken();
        return false;
      }

      return true;
    } catch {
      this.removeToken();
      return false;
    }
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed JWT');
  }

  const header: unknown = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0])));
  const payload: unknown = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])));
  decodeBase64Url(parts[2]);

  if (!isJsonObject(header) || !isJsonObject(payload)) {
    throw new Error('Malformed JWT');
  }

  return payload;
}

function decodeBase64Url(segment: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(segment)) {
    throw new Error('Malformed JWT segment');
  }

  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
