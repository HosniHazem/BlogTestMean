import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Comment } from '../../models/comment.model';
import { Notification } from '../../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket | null = null;
  private newCommentSubject = new Subject<Comment>();
  private notificationSubject = new Subject<Notification>();

  public newComment$ = this.newCommentSubject.asObservable();
  public notification$ = this.notificationSubject.asObservable();

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(environment.wsUrl, {
      auth: { token },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('new-comment', (comment: Comment) => {
      this.newCommentSubject.next(comment);
    });

    this.socket.on('notification', (notification: Notification) => {
      this.notificationSubject.next(notification);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinArticle(articleId: string): void {
    this.socket?.emit('join-article', articleId);
  }

  leaveArticle(articleId: string): void {
    this.socket?.emit('leave-article', articleId);
  }

  sendComment(comment: Comment): void {
    this.socket?.emit('comment', comment);
  }
}
