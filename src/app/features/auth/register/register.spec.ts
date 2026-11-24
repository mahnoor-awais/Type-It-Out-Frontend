import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../constants/api.constants';
import { vi } from 'vitest';
import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  afterEach(() => httpTestingController.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('logs in after registration succeeds and navigates home', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const credentials = {
      username: 'writer',
      email: 'writer@example.com',
      password: 'stringst',
    };
    const token = 'login-token';
    component.form.setValue(credentials);

    component.submit();

    const registerRequest = httpTestingController.expectOne(`${API_BASE_URL}/Auth/register`);
    expect(registerRequest.request.body).toEqual(credentials);
    httpTestingController.expectNone(`${API_BASE_URL}/Auth/login`);
    registerRequest.flush({
      id: 3,
      username: credentials.username,
      email: credentials.email,
      createdAt: '2026-11-23T08:15:05.0536785Z',
    });

    const loginRequest = httpTestingController.expectOne(`${API_BASE_URL}/Auth/login`);
    expect(loginRequest.request.body).toEqual({
      email: credentials.email,
      password: credentials.password,
    });
    loginRequest.flush({
      id: 3,
      username: credentials.username,
      email: credentials.email,
      bio: null,
      profileImageUrl: null,
      createdAt: '2026-11-23T08:15:05.0536785Z',
      token,
    });

    expect(sessionStorage.getItem('type-it-out-token')).toBe(token);
    expect(navigateSpy).toHaveBeenCalledWith('/');
    expect(component.isLoading).toBe(false);
  });
});
