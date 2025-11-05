import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ArticleService } from "../../../core/services/article.service";
import { AuthService } from "../../../core/services/auth.service";
import { Article } from "../../../models/article.model";
import { CommentSectionComponent } from "../../comments/comment-section/comment-section.component";

@Component({
  selector: "app-article-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, CommentSectionComponent],
  templateUrl: "./article-detail.component.html",
  styleUrls: ["./article-detail.component.css"],
})
export class ArticleDetailComponent implements OnInit, OnDestroy {
  article: Article | null = null;
  loading = true;
  articleId: string = "";
  likesCount = 0;
  isLiked = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.articleId = params["id"];
      this.loadArticle();
    });
  }

  ngOnDestroy(): void {}

  loadArticle(): void {
    this.loading = true;
    this.articleService.getArticleById(this.articleId).subscribe({
      next: (article) => {
        this.article = article;
        const likes = (article as any)?.likes as any[] | undefined;
        this.likesCount = Array.isArray(likes) ? likes.length : 0;
        // Prefer localStorage user id if available, fallback to authService
        const storedUserStr = localStorage.getItem("user");
        const parsedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
        const storedUserId =
          (parsedUser?.id as string | undefined) ||
          (parsedUser?._id as string | undefined);
        const currentUser = this.authService.currentUser();
        const currentUserId = storedUserId || currentUser?._id;
        const likeIds = Array.isArray(likes)
          ? likes.map((v: any) => String(v?._id ?? v))
          : [];
        this.isLiked = !!(
          currentUserId && likeIds.includes(String(currentUserId))
        );
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading article:", error);
        this.loading = false;
        this.router.navigate(["/articles"]);
      },
    });
  }

  toggleLike(): void {
    if (!this.article) return;
    this.articleService.toggleLike(this.article._id).subscribe({
      next: (res) => {
        this.likesCount = res?.likesCount ?? this.likesCount;
        this.isLiked = !!res?.isLiked;
      },
      error: (error) => {
        console.error("Error toggling like:", error);
      },
    });
  }

  editArticle(): void {
    if (this.article) {
      this.router.navigate(["/articles", this.article._id, "edit"]);
    }
  }

  deleteArticle(): void {
    if (
      this.article &&
      confirm("Êtes-vous sûr de vouloir supprimer cet article ?")
    ) {
      this.articleService.deleteArticle(this.article._id).subscribe({
        next: () => {
          this.router.navigate(["/articles"]);
        },
        error: (error) => {
          console.error("Error deleting article:", error);
        },
      });
    }
  }

  canEdit(): boolean {
    return this.article
      ? this.authService.canEditArticle(this.article.author._id)
      : false;
  }

  canDelete(): boolean {
    return this.authService.canDeleteArticle();
  }
}
