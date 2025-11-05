import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  ArticleService,
  ArticleQueryParams,
} from "../../../core/services/article.service";
import { AuthService } from "../../../core/services/auth.service";
import { Article } from "../../../models/article.model";
import { UserRole } from "../../../models/user.model";

@Component({
  selector: "app-article-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./article-list.component.html",
  styleUrls: ["./article-list.component.css"],
})
export class ArticleListComponent implements OnInit {
  articles: Article[] = [];
  loading = true;
  searchQuery = "";
  selectedTags: string[] = [];
  currentPage = 1;
  totalPages = 1;
  total = 0;

  constructor(
    private articleService: ArticleService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.loading = true;
    const params: ArticleQueryParams = {
      page: this.currentPage,
      limit: 10,
      search: this.searchQuery || undefined,
      tags: this.selectedTags.length > 0 ? this.selectedTags : undefined,
    };

    const user = this.authService.currentUser();
    const storedUserStr = localStorage.getItem("user");
        const parsedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
        const storedUserId =
          (parsedUser?.id as string | undefined) ||
          (parsedUser?._id as string | undefined);
    console.log("user", storedUserId);
    console.log("(params as any)", (params as any));
    console.log("user role", user?.role);
    console.log("UserRole", UserRole.WRITER);

    if (!user || user.role === UserRole.READER) {
      (params as any).status = "PUBLISHED";
    } else if (user.role === UserRole.WRITER) {
      // Authors only see their own articles
      (params as any).authorId = storedUserId;
    }

    this.articleService.getArticles(params).subscribe({
      next: (response) => {
        this.articles = response.articles;
        this.total = response.total;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading articles:", error);
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadArticles();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadArticles();
  }

  viewArticle(id: string): void {
    this.router.navigate(["/articles", id]);
  }

  editArticle(id: string): void {
    this.router.navigate(["/articles", id, "edit"]);
  }

  deleteArticle(article: Article): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      this.articleService.deleteArticle(article._id).subscribe({
        next: () => {
          this.loadArticles();
        },
        error: (error) => {
          console.error("Error deleting article:", error);
        },
      });
    }
  }

  canEdit(article: Article): boolean {
    const user = this.authService.currentUser();
    const storedUserStr = localStorage.getItem("user");
        const parsedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
        const storedUserId =
          (parsedUser?.id as string | undefined) ||
          (parsedUser?._id as string | undefined);
    if (!user) return false;
    return user.role === UserRole.ADMIN 
      || user.role === UserRole.EDITOR
      || (user.role === UserRole.WRITER && article.author._id === storedUserId);
  }

  canDelete(): boolean {
    return this.authService.canDeleteArticle();
  }

  canCreate(): boolean {
    const user = this.authService.currentUser();
    return user
      ? [UserRole.ADMIN, UserRole.EDITOR, UserRole.WRITER].includes(user.role)
      : false;
  }

  getTruncatedContent(content: string, maxLength: number = 150): string {
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  }
}
