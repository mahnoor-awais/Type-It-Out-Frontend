import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../constants/api.constants';
import { AuthService } from '../../core/services/auth';
import { WriteArticle } from './write-article';
import { vi } from 'vitest';

describe('WriteArticle', () => {
  let component: WriteArticle;
  let fixture: ComponentFixture<WriteArticle>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WriteArticle],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(WriteArticle);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('publishes the article and navigates to My Articles on success', async () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const article = {
      title: 'A new article',
      content: 'The full article content.',
    };
    component.articleForm.setValue(article);

    component.submitArticle();

    const request = httpTestingController.expectOne(`${API_BASE_URL}/Articles/articles`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(article);
    expect(component.isCreatingArticle()).toBe(true);
    request.flush(null);
    await fixture.whenStable();

    expect(component.isCreatingArticle()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith('/my-articles');
  });

  it('does not send an article request when the form is invalid', () => {
    component.submitArticle();

    expect(component.articleForm.controls.title.touched).toBe(true);
    expect(component.articleForm.controls.content.touched).toBe(true);
    httpTestingController.expectNone({
      method: 'POST',
      url: `${API_BASE_URL}/Articles/articles`,
    });
  });

  it('clears an expired token and redirects to login on a 401 response', async () => {
    const authService = TestBed.inject(AuthService);
    authService.saveToken(createToken(7));
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    component.articleForm.setValue({
      title: 'A new article',
      content: 'The full article content.',
    });

    component.submitArticle();

    httpTestingController
      .expectOne(`${API_BASE_URL}/Articles/articles`)
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();

    expect(authService.getToken()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
    expect(component.createArticleError()).toBe('Your session has expired. Please log in again.');
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
