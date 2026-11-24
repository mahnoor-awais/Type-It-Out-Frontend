import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../constants/api.constants';
import {
  Article,
  ArticleLikeActionResponse,
  ArticleLikesResponse,
  CreateArticleRequest,
} from '../models/article.models';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly http = inject(HttpClient);

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${API_BASE_URL}/Articles/articles`);
  }

  getFollowingArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${API_BASE_URL}/Articles/followingArticles`);
  }

  getUserArticles(userId: number): Observable<Article[]> {
    return this.http.get<Article[]>(`${API_BASE_URL}/User/${userId}/articles`);
  }

  getUserLikedArticles(userId: number): Observable<Article[]> {
    return this.http.get<Article[]>(`${API_BASE_URL}/User/${userId}/liked-articles`);
  }

  createArticle(request: CreateArticleRequest): Observable<unknown> {
    return this.http.post<unknown>(`${API_BASE_URL}/Articles/articles`, request);
  }

  getArticleLikes(articleId: number): Observable<ArticleLikesResponse> {
    return this.http.get<ArticleLikesResponse>(`${API_BASE_URL}/Articles/${articleId}/likes`);
  }

  likeArticle(articleId: number): Observable<ArticleLikeActionResponse> {
    return this.http.post<ArticleLikeActionResponse>(
      `${API_BASE_URL}/Articles/${articleId}/likes`,
      null,
    );
  }

  unlikeArticle(articleId: number): Observable<ArticleLikeActionResponse> {
    return this.http.delete<ArticleLikeActionResponse>(
      `${API_BASE_URL}/Articles/${articleId}/likes`,
    );
  }
}
