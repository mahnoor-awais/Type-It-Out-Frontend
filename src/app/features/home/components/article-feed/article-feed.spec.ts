import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleFeed } from './article-feed';

describe('ArticleFeed', () => {
  let component: ArticleFeed;
  let fixture: ComponentFixture<ArticleFeed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleFeed],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleFeed);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
