import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../constants/api.constants';
import { AuthService } from './auth';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { Article } from '../models/article.models';
import { ArticleService } from './article';

describe('ArticleService', () => {
  let service: ArticleService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ArticleService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('gets articles from the articles endpoint', () => {
    const articles: Article[] = [
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
    ];
    let response: Article[] | undefined;

    service.getArticles().subscribe((result) => (response = result));

    const request = httpTestingController.expectOne(`${API_BASE_URL}/Articles/articles`);
    expect(request.request.method).toBe('GET');
    request.flush(articles);

    expect(response).toEqual(articles);
  });

  it('gets following articles with the authenticated token and no user id parameter', () => {
    const token = createToken(7);
    TestBed.inject(AuthService).saveToken(token);
    const articles: Article[] = [
      {
        id: 2,
        title: 'Followed author article',
        content: 'Writing from a followed author.',
        createdAt: '2026-11-17T12:55:40.252454',
        updatedAt: null,
        likesCount: 0,
        commentsCount: 0,
        author: {
          id: 9,
          username: 'followed_writer',
          profileImageUrl: null,
        },
      },
    ];
    let response: Article[] | undefined;

    service.getFollowingArticles().subscribe((result) => (response = result));

    const request = httpTestingController.expectOne(`${API_BASE_URL}/Articles/followingArticles`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys()).toEqual([]);
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    request.flush(articles);

    expect(response).toEqual(articles);
  });

  it('gets a user article list from the user articles endpoint', () => {
    const token = createToken(7);
    TestBed.inject(AuthService).saveToken(token);
    const articles: Article[] = [
      {
        id: 2,
        title: 'User article',
        content: 'Writing by this user.',
        createdAt: '2026-11-17T12:55:40.252454',
        updatedAt: null,
        likesCount: 0,
        commentsCount: 0,
        author: {
          id: 7,
          username: 'writer',
          profileImageUrl: null,
        },
      },
    ];
    let response: Article[] | undefined;

    service.getUserArticles(7).subscribe((result) => (response = result));

    const request = httpTestingController.expectOne(`${API_BASE_URL}/User/7/articles`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys()).toEqual([]);
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    request.flush(articles);

    expect(response).toEqual(articles);
  });

  it('gets liked articles from the user liked articles endpoint', () => {
    const token = createToken(7);
    TestBed.inject(AuthService).saveToken(token);
    const articles: Article[] = [
      {
        id: 3,
        title: 'Liked article',
        content: 'An article the current user liked.',
        createdAt: '2026-11-17T12:55:40.252454',
        updatedAt: null,
        likesCount: 1,
        commentsCount: 0,
        author: {
          id: 9,
          username: 'writer',
          profileImageUrl: null,
        },
      },
    ];
    let response: Article[] | undefined;

    service.getUserLikedArticles(7).subscribe((result) => (response = result));

    const request = httpTestingController.expectOne(`${API_BASE_URL}/User/7/liked-articles`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys()).toEqual([]);
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    request.flush(articles);

    expect(response).toEqual(articles);
  });

  it('creates an article with only the supplied title and content', () => {
    const token = createToken(7);
    TestBed.inject(AuthService).saveToken(token);
    const article = {
      title: 'A new article',
      content: 'The full article content.',
    };

    service.createArticle(article).subscribe();

    const request = httpTestingController.expectOne(`${API_BASE_URL}/Articles/articles`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(article);
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    request.flush(null);
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
