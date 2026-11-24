import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../constants/api.constants';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { LoginResponse } from '../models/auth.models';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('posts the supplied registration data to the register endpoint', () => {
    const request = {
      username: 'writer',
      email: 'writer@example.com',
      password: 'stringst',
    };

    service.register(request).subscribe();

    const httpRequest = httpTestingController.expectOne(`${API_BASE_URL}/Auth/register`);
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.body).toEqual(request);
    httpRequest.flush({
      id: 3,
      username: request.username,
      email: request.email,
      createdAt: '2026-11-23T08:15:05.0536785Z',
    });
  });

  it('stores the login token in session storage for authenticated requests', () => {
    const token = createToken(Math.floor(Date.now() / 1000) + 3600);
    const response: LoginResponse = {
      id: 3,
      username: 'writer',
      email: 'writer@example.com',
      bio: null,
      profileImageUrl: null,
      createdAt: '2026-11-23T08:15:05.0536785',
      token,
    };

    service.login({ email: response.email, password: 'stringst' }).subscribe();

    const httpRequest = httpTestingController.expectOne(`${API_BASE_URL}/Auth/login`);
    expect(httpRequest.request.method).toBe('POST');
    httpRequest.flush(response);

    expect(sessionStorage.getItem('type-it-out-token')).toBe(response.token);

    service
      .register({
        username: response.username,
        email: response.email,
        password: 'stringst',
      })
      .subscribe();

    const authenticatedRequest = httpTestingController.expectOne(`${API_BASE_URL}/Auth/register`);
    expect(authenticatedRequest.request.headers.get('Authorization')).toBe(
      `Bearer ${response.token}`,
    );
    authenticatedRequest.flush({
      id: response.id,
      username: response.username,
      email: response.email,
      createdAt: response.createdAt,
    });
  });

  it('removes tokens that are missing, malformed, missing expiry, or expired', () => {
    const invalidTokens = [
      'not-a-jwt',
      createToken(undefined),
      createToken(Math.floor(Date.now() / 1000) - 1),
    ];

    for (const token of invalidTokens) {
      service.saveToken(token);
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getToken()).toBeNull();
    }

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('removes the saved token when requested', () => {
    service.saveToken(createToken(Math.floor(Date.now() / 1000) + 3600));

    service.removeToken();

    expect(service.getToken()).toBeNull();
  });

  it('gets the user id from the valid token subject', () => {
    service.saveToken(createToken(Math.floor(Date.now() / 1000) + 3600, '42'));

    expect(service.getUserId()).toBe(42);
  });
});

function createToken(expiry: number | undefined, subject?: string): string {
  const encode = (value: string) =>
    btoa(value).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payload = {
    ...(expiry === undefined ? {} : { exp: expiry }),
    ...(subject === undefined ? {} : { sub: subject }),
  };
  return `${encode('{"alg":"HS256","typ":"JWT"}')}.${encode(
    JSON.stringify(payload),
  )}.${encode('signature')}`;
}
