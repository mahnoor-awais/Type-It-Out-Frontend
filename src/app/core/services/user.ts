import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../constants/api.constants';
import { UserProfile } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getUserById(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${API_BASE_URL}/User/${userId}`);
  }
}
