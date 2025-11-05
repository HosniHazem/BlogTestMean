import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ArticleService } from "../../../core/services/article.service";
import { Article } from "../../../models/article.model";
import { AuthService } from "../../../core/services/auth.service";
import { UserRole } from "../../../models/user.model";

@Component({
  selector: "app-article-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: "./article-form.component.html",
  styleUrls: ["./article-form.component.css"],
})
export class ArticleFormComponent implements OnInit {
  articleForm: FormGroup;
  loading = false;
  errorMessage = "";
  isEditMode = false;
  articleId: string | null = null;
  tagInput = "";

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    const user = this.authService.currentUser();
    const isWriter = user?.role === UserRole.WRITER;
    
    this.articleForm = this.fb.group({
      title: ["", [Validators.required, Validators.minLength(3)]],
      content: ["", [Validators.required, Validators.minLength(50)]],
      excerpt: [""],
      featuredImage: [""],
      category: ["General"],
      status: [{ value: isWriter ? "DRAFT" : "DRAFT", disabled: isWriter }],
      tags: [[]],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.isEditMode = true;
        this.articleId = params["id"];
        this.loadArticle();
      }
    });
  }

  loadArticle(): void {
    if (this.articleId) {
      this.articleService.getArticleById(this.articleId).subscribe({
        next: (article) => {
          const user = this.authService.currentUser();
          const isWriter = user?.role === UserRole.WRITER;
          
          this.articleForm.patchValue({
            title: article.title,
            content: article.content,
            excerpt: (article as any).excerpt,
            featuredImage: (article as any).featuredImage,
            category: (article as any).category || "General",
            status: isWriter ? article.status : (article as any).status || "DRAFT",
            tags: article.tags,
          });

          if (isWriter) {
            this.articleForm.get('status')?.disable();
          }
        },
        error: (error) => {
          this.errorMessage = "Erreur lors du chargement de l'article";
          console.error(error);
        },
      });
    }
  }

  get tags(): string[] {
    return this.articleForm.get("tags")?.value || [];
  }

  addTag(): void {
    const tag = this.tagInput.trim();
    if (tag && !this.tags.includes(tag)) {
      this.articleForm.patchValue({
        tags: [...this.tags, tag],
      });
      this.tagInput = "";
    }
  }

  removeTag(tag: string): void {
    this.articleForm.patchValue({
      tags: this.tags.filter((t) => t !== tag),
    });
  }

  onSubmit(): void {
    if (this.articleForm.valid) {
      this.loading = true;
      this.errorMessage = "";

      const formData = this.articleForm.value;

      const request =
        this.isEditMode && this.articleId
          ? this.articleService.updateArticle(this.articleId, formData)
          : this.articleService.createArticle(formData);

      request.subscribe({
        next: (article) => {
          this.router.navigate(["/articles", article._id]);
        },
        error: (error) => {
          // Map backend validation errors
          const backendMsg = error?.error?.message;
          const errors = error?.error?.errors as
            | { field: string; message: string }[]
            | undefined;
          if (errors?.length) {
            // set errors on controls if possible
            errors.forEach((e) => {
              const ctrl = this.articleForm.get(e.field);
              if (ctrl) ctrl.setErrors({ backend: e.message });
            });
            this.errorMessage = backendMsg || "Erreurs de validation";
          } else {
            this.errorMessage = backendMsg || "Erreur lors de l'enregistrement";
          }
          this.loading = false;
        },
      });
    }
  }

  cancel(): void {
    if (this.isEditMode && this.articleId) {
      this.router.navigate(["/articles", this.articleId]);
    } else {
      this.router.navigate(["/articles"]);
    }
  }
}
