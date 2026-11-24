export interface ArticleAuthor {
  id: number;
  username: string;
  profileImageUrl: string | null;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  likesCount: number;
  commentsCount: number;
  author: ArticleAuthor;
}

export interface ArticleLikeUser {
  id: number;
  username: string;
  profileImageUrl: string | null;
}

export interface ArticleLikesResponse {
  articleId: number;
  likesCount: number;
  users: ArticleLikeUser[];
}

export interface ArticleLikeActionResponse {
  message: string;
  likesCount: number;
}
