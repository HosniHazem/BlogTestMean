import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable, switchMap } from "rxjs";
import { environment } from "../../../environments/environment";
import { Article } from "../../models/article.model";
import { ArticleService } from "./article.service";

export interface AnalyticsData {
  totalArticles: number;
  totalComments: number;
  totalUsers: number;
  articlesPerMonth: { month: string; count: number }[];
  topAuthors: { username: string; articleCount: number }[];
  topTags: { tag: string; count: number }[];
}

@Injectable({
  providedIn: "root",
})
export class AnalyticsService {
  private readonly USERS_URL = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient, private articles: ArticleService) {}

  getAnalytics(): Observable<AnalyticsData> {
    // Fetch articles (large page) then users count and compute client-side stats
    return this.articles.getArticles({ page: 1, limit: 100 }).pipe(
      switchMap((articleRes) =>
        this.http.get<any>(`${this.USERS_URL}?page=1&limit=1`).pipe(
          map((usersRes) => {
            const articles: Article[] = articleRes.articles ?? [];
            const totalArticles = articleRes.total ?? articles.length;
            const totalUsers = usersRes?.data?.pagination?.total ?? 0;

            const totalComments = articles.reduce(
              (sum, a: any) => sum + (a.commentsCount || 0),
              0
            );

            const byMonthMap = new Map<string, number>();
            for (const a of articles) {
              const date = new Date(a.createdAt as any);
              const key = `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, "0")}`;
              byMonthMap.set(key, (byMonthMap.get(key) || 0) + 1);
            }
            const articlesPerMonth = Array.from(byMonthMap.entries())
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([month, count]) => ({ month, count }));

            const authorMap = new Map<
              string,
              { username: string; count: number }
            >();
            for (const a of articles) {
              const username = (a.author as any)?.username || "Inconnu";
              const prev = authorMap.get(username)?.count || 0;
              authorMap.set(username, { username, count: prev + 1 });
            }
            const topAuthors = Array.from(authorMap.values())
              .sort((x, y) => y.count - x.count)
              .slice(0, 10)
              .map((x) => ({ username: x.username, articleCount: x.count }));

            const tagMap = new Map<string, number>();
            for (const a of articles) {
              for (const t of a.tags || []) {
                tagMap.set(t, (tagMap.get(t) || 0) + 1);
              }
            }
            const topTags = Array.from(tagMap.entries())
              .sort(([, c1], [, c2]) => c2 - c1)
              .slice(0, 10)
              .map(([tag, count]) => ({ tag, count }));

            return {
              totalArticles,
              totalComments,
              totalUsers,
              articlesPerMonth,
              topAuthors,
              topTags,
            } as AnalyticsData;
          })
        )
      )
    );
  }
}
