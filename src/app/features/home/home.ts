import { Component, inject } from '@angular/core';
import { ArticleSearchState } from '../../core/services/article-search';
import { ArticleFeed } from './components/article-feed/article-feed';

@Component({
  standalone: true,
  imports: [ArticleFeed],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly articleSearchState = inject(ArticleSearchState);

  readonly searchTerm = this.articleSearchState.searchTerm;
}
