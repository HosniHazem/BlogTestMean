import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CommentService } from "../../../core/services/comment.service";
import { WebSocketService } from "../../../core/services/websocket.service";
import { AuthService } from "../../../core/services/auth.service";
import { Comment } from "../../../models/comment.model";
import { Subscription } from "rxjs";

@Component({
  selector: "app-comment-section",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./comment-section.component.html",
  styleUrls: ["./comment-section.component.css"],
})
export class CommentSectionComponent implements OnInit, OnDestroy {
  @Input() articleId!: string;

  comments: Comment[] = [];
  commentForm: FormGroup;
  replyForms: { [key: string]: FormGroup } = {};
  loading = true;
  submitting = false;
  replyingTo: string | null = null;
  private wsSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private commentService: CommentService,
    private wsService: WebSocketService,
    public authService: AuthService
  ) {
    this.commentForm = this.fb.group({
      content: ["", [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit(): void {
    this.loadComments();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    this.wsService.leaveArticle(this.articleId);
  }

  setupWebSocket(): void {
    const token = this.authService.getToken();
    if (token) {
      this.wsService.connect(token);
      this.wsService.joinArticle(this.articleId);

      this.wsSubscription = this.wsService.newComment$.subscribe((comment) => {
        if (comment.article === this.articleId) {
          this.loadComments();
        }
      });
    }
  }

  loadComments(): void {
    this.commentService.getCommentsByArticle(this.articleId).subscribe({
      next: (comments) => {
        this.comments = this.buildCommentTree(comments);
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading comments:", error);
        this.loading = false;
      },
    });
  }

  buildCommentTree(comments: Comment[]): Comment[] {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    comments.forEach((comment) => {
      commentMap.set(comment._id, { ...comment, replies: [] });
    });

    comments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment._id)!;
      if (comment.parentComment) {
        const parent = commentMap.get(comment.parentComment);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  }

  onSubmitComment(): void {
    if (this.commentForm.valid && !this.submitting) {
      this.submitting = true;

      const data = {
        content: this.commentForm.value.content,
        articleId: this.articleId,
      };

      this.commentService.createComment(data).subscribe({
        next: (comment) => {
          this.commentForm.reset();
          this.loadComments();
          this.submitting = false;
          this.wsService.sendComment(comment);
        },
        error: (error) => {
          console.error("Error posting comment:", error);
          this.submitting = false;
        },
      });
    }
  }

  startReply(commentId: string): void {
    this.replyingTo = commentId;
    if (!this.replyForms[commentId]) {
      this.replyForms[commentId] = this.fb.group({
        content: ["", [Validators.required, Validators.minLength(1)]],
      });
    }
  }

  cancelReply(): void {
    this.replyingTo = null;
  }

  onSubmitReply(parentCommentId: string): void {
    const form = this.replyForms[parentCommentId];
    if (form?.valid && !this.submitting) {
      this.submitting = true;

      const data = {
        content: form.value.content,
        articleId: this.articleId,
        parentCommentId: parentCommentId,
      };

      this.commentService.createComment(data).subscribe({
        next: (comment) => {
          form.reset();
          this.replyingTo = null;
          this.loadComments();
          this.submitting = false;
          this.wsService.sendComment(comment);
        },
        error: (error) => {
          console.error("Error posting reply:", error);
          this.submitting = false;
        },
      });
    }
  }

  deleteComment(commentId: string): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          this.loadComments();
        },
        error: (error) => {
          console.error("Error deleting comment:", error);
        },
      });
    }
  }

  canDeleteComment(comment: Comment): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser ? currentUser._id === comment.author._id : false;
  }
}
