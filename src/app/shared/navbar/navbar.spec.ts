import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../constants/api.constants';
import { AuthService } from '../../core/services/auth';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    TestBed.inject(AuthService).saveToken(createToken(7));
    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    const request = httpTestingController.expectOne(`${API_BASE_URL}/User/7`);
    expect(request.request.method).toBe('GET');
    request.flush({
      id: 7,
      username: 'mena_dev',
      bio: 'Student and software developer',
      profileImageUrl: 'https://example.com/profile.jpg',
      createdAt: '2026-11-16T12:04:10.5613167',
      articlesCount: 1,
      followersCount: 0,
      followingCount: 0,
    });

    await fixture.whenStable();
  });

  afterEach(() => {
    httpTestingController.verify();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays the fetched user profile', () => {
    expect(fixture.nativeElement.textContent).toContain('mena_dev');
    expect(fixture.nativeElement.querySelector('img')?.getAttribute('src')).toBe(
      'https://example.com/profile.jpg',
    );
  });

  it('emits search input changes', () => {
    let searchQuery = '';
    component.searchChange.subscribe((query) => (searchQuery = query));

    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'writing';
    input.dispatchEvent(new Event('input'));

    expect(searchQuery).toBe('writing');
  });
});

function createToken(userId: number): string {
  const encode = (value: string) =>
    btoa(value).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payload = JSON.stringify({
    sub: String(userId),
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  return `${encode('{"alg":"HS256","typ":"JWT"}')}.${encode(payload)}.${encode('signature')}`;
}
