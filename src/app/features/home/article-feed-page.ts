import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ArticleSearchState } from '../../core/services/article-search';
import { ArticleFeed, ArticleFeedType } from './components/article-feed/article-feed';

function getFeedType(value: unknown): ArticleFeedType {
  switch (value) {
    case 'following':
    case 'mine':
    case 'liked':
      return value;
    default:
      return 'latest';
  }
}

@Component({
  standalone: true,
  imports: [ArticleFeed],
  selector: 'app-article-feed-page',
  template: `<app-article-feed [feedType]="feedType()" [searchTerm]="searchTerm()" />`,
})
export class ArticleFeedPage {
  private readonly route = inject(ActivatedRoute);
  private readonly articleSearchState = inject(ArticleSearchState);

  readonly feedType = toSignal(this.route.data.pipe(map((data) => getFeedType(data['feedType']))), {
    initialValue: getFeedType(this.route.snapshot.data['feedType']),
  });
  readonly searchTerm = this.articleSearchState.searchTerm;
}
