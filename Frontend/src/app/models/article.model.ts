import { User } from "./user.model";

export interface Article {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  tags: string[];
  category?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  views?: number;
  slug?: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  commentsCount?: number;
}

export interface CreateArticleDto {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  tags: string[];
  category?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  tags?: string[];
  category?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}
