export interface Notification {
  _id: string;
  type: 'comment' | 'reply' | 'article';
  message: string;
  articleId?: string;
  commentId?: string;
  read: boolean;
  createdAt: Date;
}
