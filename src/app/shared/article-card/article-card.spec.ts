import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../constants/api.constants';
import { Article } from '../../core/models/article.models';
import { AuthService } from '../../core/services/auth';
import { ArticleCard } from './article-card';

describe('ArticleCard', () => {
  let component: ArticleCard;
  let fixture: ComponentFixture<ArticleCard>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ArticleCard],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    TestBed.inject(AuthService).saveToken(createToken(1));
    fixture = TestBed.createComponent(ArticleCard);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('article', createArticle());
    fixture.detectChanges();
    flushArticleLikes(httpTestingController, []);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the supplied article data', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('My Updated Article');
    expect(text).toContain('This is my updated content.');
    expect(text).toContain('mena_dev');
    expect(text).toContain('Nov 17, 2026');
  });

  it('truncates long content only for display', () => {
    const fullContent = 'a'.repeat(250);
    fixture.componentRef.setInput('article', { ...component.article, content: fullContent });
    fixture.detectChanges();
    flushArticleLikes(httpTestingController, []);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(`${'a'.repeat(220)}...`);
    expect(fixture.nativeElement.textContent).not.toContain('a'.repeat(221));
    expect(component.article.content).toBe(fullContent);
  });

  it('likes and unlikes through the API and stops click propagation', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    let parentReceivedClick = false;
    fixture.nativeElement.addEventListener('click', () => (parentReceivedClick = true));

    button.click();

    const likeRequest = httpTestingController.expectOne(`${API_BASE_URL}/Articles/1/likes`);
    expect(likeRequest.request.method).toBe('POST');
    expect(likeRequest.request.body).toBeNull();
    likeRequest.flush({ message: 'Article liked successfully.', likesCount: 1 });
    fixture.detectChanges();

    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Unlike article, 1 like');
    expect(button.textContent).toContain('1');
    expect(parentReceivedClick).toBe(false);

    button.click();

    const unlikeRequest = httpTestingController.expectOne(`${API_BASE_URL}/Articles/1/likes`);
    expect(unlikeRequest.request.method).toBe('DELETE');
    unlikeRequest.flush({ message: 'Article unliked successfully.', likesCount: 0 });
    fixture.detectChanges();

    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Like article, 0 likes');
    expect(button.textContent).toContain('0');
  });
});

function createArticle(): Article {
  return {
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

function flushArticleLikes(httpTestingController: HttpTestingController, users: unknown[]): void {
  const request = httpTestingController.expectOne(`${API_BASE_URL}/Articles/1/likes`);
  request.flush({ articleId: 1, likesCount: users.length, users });
}
