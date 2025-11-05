import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { Comment, CreateCommentDto } from "../../models/comment.model";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class CommentService {
  private readonly API_URL = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  getCommentsByArticle(articleId: string): Observable<Comment[]> {
    return this.http
      .get<any>(`${this.API_URL}/article/${articleId}`)
      .pipe(map((res) => res?.data?.comments ?? []));
  }

  createComment(data: CreateCommentDto): Observable<Comment> {
    return this.http
      .post<any>(this.API_URL, data)
      .pipe(map((res) => res?.data?.comment));
  }

  updateComment(id: string, content: string): Observable<Comment> {
    return this.http
      .put<any>(`${this.API_URL}/${id}`, { content })
      .pipe(map((res) => res?.data?.comment));
  }

  deleteComment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  toggleLike(id: string): Observable<{ likesCount: number; isLiked: boolean }> {
    return this.http
      .post<any>(`${this.API_URL}/${id}/like`, {})
      .pipe(map((res) => res?.data));
  }
}
