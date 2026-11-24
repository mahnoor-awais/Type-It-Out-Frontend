import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ArticleSearchState {
  readonly searchTerm = signal('');

  setSearchTerm(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
  }
}
