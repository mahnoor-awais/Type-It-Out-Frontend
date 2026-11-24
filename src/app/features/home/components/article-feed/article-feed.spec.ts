import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../../constants/api.constants';
import { AuthService } from '../../../../core/services/auth';
import { ArticleFeed } from './article-feed';
import { vi } from 'vitest';

describe('ArticleFeed', () => {
  let component: ArticleFeed;
  let fixture: ComponentFixture<ArticleFeed>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleFeed],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleFeed);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('loads and displays articles from the API', async () => {
    fixture.detectChanges();

    const request = httpTestingController.expectOne(`${API_BASE_URL}/Articles/articles`);
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 1,
        title: 'My Updated Article',
        content: 'This is my updated content.',
        createdAt: '2026-11-17T12:55:40.252454',
        updatedAt: '2026-11-20T09:01:13.6138133',
        likesCount: 0,
        commentsCount: 0,
        author: {
          id: 1,
          username: 'mena_dev',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
      },
    ]);

    fixture.detectChanges();
    const likesRequest = httpTestingController.expectOne(`${API_BASE_URL}/Articles/1/likes`);
    likesRequest.flush({ articleId: 1, likesCount: 0, users: [] });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.articles()).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('My Updated Article');
    expect(fixture.nativeElement.textContent).toContain('mena_dev');

    fixture.componentRef.setInput('searchTerm', 'no matching article');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No articles match your search.');
  });

  it('loads My Articles from the logged-in user articles endpoint', async () => {
    TestBed.inject(AuthService).saveToken(createToken(7));
    fixture.componentRef.setInput('feedType', 'mine');
    fixture.detectChanges();

    const articlesRequest = httpTestingController.expectOne(`${API_BASE_URL}/User/7/articles`);
    expect(articlesRequest.request.method).toBe('GET');
    articlesRequest.flush([
      createArticle(1, 7, 'First article'),
      createArticle(2, 7, 'Second article'),
    ]);

    expect(component.articles().map((article) => article.title)).toEqual([
      'First article',
      'Second article',
    ]);

    fixture.detectChanges();
    httpTestingController.expectOne(`${API_BASE_URL}/Articles/1/likes`).flush({
      articleId: 1,
      likesCount: 0,
      users: [],
    });
    httpTestingController.expectOne(`${API_BASE_URL}/Articles/2/likes`).flush({
      articleId: 2,
      likesCount: 0,
      users: [],
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const headings = fixture.nativeElement.querySelectorAll(
      'app-article-card h3',
    ) as NodeListOf<HTMLElement>;
    const titles = Array.from(headings, (heading) => heading.textContent?.trim());
    expect(titles).toEqual(['First article', 'Second article']);
  });

  it('loads liked articles from the logged-in user liked articles endpoint', async () => {
    TestBed.inject(AuthService).saveToken(createToken(7));
    fixture.componentRef.setInput('feedType', 'liked');
    fixture.detectChanges();

    const request = httpTestingController.expectOne(`${API_BASE_URL}/User/7/liked-articles`);
    expect(request.request.method).toBe('GET');
    request.flush([
      createArticle(1, 8, 'First liked article'),
      createArticle(2, 9, 'Second liked article'),
    ]);

    expect(component.articles().map((article) => article.title)).toEqual([
      'First liked article',
      'Second liked article',
    ]);
    fixture.detectChanges();
    httpTestingController.expectOne(`${API_BASE_URL}/Articles/1/likes`).flush({
      articleId: 1,
      likesCount: 1,
      users: [{ id: 7, username: 'reader', profileImageUrl: null }],
    });
    httpTestingController.expectOne(`${API_BASE_URL}/Articles/2/likes`).flush({
      articleId: 2,
      likesCount: 1,
      users: [{ id: 7, username: 'reader', profileImageUrl: null }],
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const headings = fixture.nativeElement.querySelectorAll(
      'app-article-card h3',
    ) as NodeListOf<HTMLElement>;
    const titles = Array.from(headings, (heading) => heading.textContent?.trim());
    expect(titles).toEqual(['First liked article', 'Second liked article']);
  });

  it('loads following articles in backend order and displays the shared article cards', async () => {
    fixture.componentRef.setInput('feedType', 'following');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Loading articles...');
    const request = httpTestingController.expectOne(`${API_BASE_URL}/Articles/followingArticles`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys()).toEqual([]);
    request.flush([
      createArticle(2, 8, 'First from backend'),
      createArticle(1, 9, 'Second from backend'),
    ]);

    expect(component.articles().map((article) => article.title)).toEqual([
      'First from backend',
      'Second from backend',
    ]);
    fixture.detectChanges();
    httpTestingController
      .expectOne(`${API_BASE_URL}/Articles/2/likes`)
      .flush({ articleId: 2, likesCount: 0, users: [] });
    httpTestingController
      .expectOne(`${API_BASE_URL}/Articles/1/likes`)
      .flush({ articleId: 1, likesCount: 0, users: [] });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    const headings = fixture.nativeElement.querySelectorAll(
      'app-article-card h3',
    ) as NodeListOf<HTMLElement>;
    const titles = Array.from(headings, (heading) => heading.textContent?.trim());
    expect(titles).toEqual(['First from backend', 'Second from backend']);
  });

  it('shows the following-feed empty state when the endpoint returns no articles', () => {
    fixture.componentRef.setInput('feedType', 'following');
    fixture.detectChanges();

    httpTestingController.expectOne(`${API_BASE_URL}/Articles/followingArticles`).flush([]);
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('No articles from people you follow yet.');
  });

  it('shows a friendly message when the following feed request fails', () => {
    fixture.componentRef.setInput('feedType', 'following');
    fixture.detectChanges();

    httpTestingController
      .expectOne(`${API_BASE_URL}/Articles/followingArticles`)
      .flush({ message: 'Unavailable' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Unable to load articles.');
  });

  it('clears an expired token and redirects to login on a 401 response', () => {
    const authService = TestBed.inject(AuthService);
    const token = createToken(7);
    authService.saveToken(token);
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.componentRef.setInput('feedType', 'following');
    fixture.detectChanges();

    httpTestingController
      .expectOne(`${API_BASE_URL}/Articles/followingArticles`)
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(authService.getToken()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
    expect(fixture.nativeElement.textContent).toContain('Your session has expired.');
  });
});

function createArticle(id: number, authorId: number, title: string) {
  return {
    id,
    title,
    content: `${title} content`,
    createdAt: '2026-11-17T12:55:40.252454',
    updatedAt: null,
    likesCount: 0,
    commentsCount: 0,
    author: {
      id: authorId,
      username: `writer-${authorId}`,
      profileImageUrl: null,
    },
  };
}

function createToken(userId: number): string {
  const encode = (value: string) =>
    btoa(value).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payload = JSON.stringify({
    sub: String(userId),
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  return `${encode('{"alg":"HS256","typ":"JWT"}')}.${encode(payload)}.${encode('signature')}`;
}
