import { User } from "./user.model";

export interface Comment {
  _id: string;
  content: string;
  author: User;
  article: string;
  parentComment?: string;
  replies?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentDto {
  content: string;
  articleId: string;
  parentCommentId?: string;
}
