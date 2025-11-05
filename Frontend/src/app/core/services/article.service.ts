import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, Observable } from "rxjs";
import {
  Article,
  CreateArticleDto,
  UpdateArticleDto,
} from "../../models/article.model";
import { environment } from "../../../environments/environment";

export interface ArticleQueryParams {
  page?: number;
  limit?: number;
  tags?: string[];
  authorId?: string;
  search?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({
  providedIn: "root",
})
export class ArticleService {
  private readonly API_URL = `${environment.apiUrl}/articles`;

  constructor(private http: HttpClient) {}

  getArticles(params?: ArticleQueryParams): Observable<ArticlesResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page)
        httpParams = httpParams.set("page", params.page.toString());
      if (params.limit)
        httpParams = httpParams.set("limit", params.limit.toString());
      if (params.tags?.length)
        httpParams = httpParams.set("tag", params.tags[0]);
      if (params.authorId)
        httpParams = httpParams.set("author", params.authorId);
      if (params.search) httpParams = httpParams.set("search", params.search);
      if (params.status) httpParams = httpParams.set("status", params.status);
    }

    return this.http.get<any>(this.API_URL, { params: httpParams }).pipe(
      map((res) => ({
        articles: res?.data?.articles ?? [],
        total: res?.data?.pagination?.total ?? 0,
        page: res?.data?.pagination?.page ?? 1,
        totalPages: res?.data?.pagination?.pages ?? 1,
      }))
    );
  }

  getArticleById(id: string): Observable<Article> {
    return this.http
      .get<any>(`${this.API_URL}/${id}`)
      .pipe(map((res) => res?.data?.article));
  }

  createArticle(data: CreateArticleDto): Observable<Article> {
    return this.http
      .post<any>(this.API_URL, data)
      .pipe(map((res) => res?.data?.article));
  }

  updateArticle(id: string, data: UpdateArticleDto): Observable<Article> {
    return this.http
      .put<any>(`${this.API_URL}/${id}`, data)
      .pipe(map((res) => res?.data?.article));
  }

  deleteArticle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  toggleLike(id: string): Observable<{ likesCount: number; isLiked: boolean }> {
    return this.http
      .post<any>(`${this.API_URL}/${id}/like`, {})
      .pipe(map((res) => res?.data));
  }
}
