import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Notification } from "../../models/notification.model";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private readonly API_URL = `${environment.apiUrl}/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<any>(this.API_URL).pipe(
      map((res) => res?.data?.notifications ?? res ?? []),
      tap((notifications: Notification[]) => {
        const unreadCount = notifications.filter((n) => !n.read).length;
        this.unreadCountSubject.next(unreadCount);
      })
    );
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/read`, {}).pipe(
      tap(() => {
        const currentCount = this.unreadCountSubject.value;
        this.unreadCountSubject.next(Math.max(0, currentCount - 1));
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http
      .patch<void>(`${this.API_URL}/read-all`, {})
      .pipe(tap(() => this.unreadCountSubject.next(0)));
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  incrementUnreadCount(): void {
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
  }
}
