import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  HostListener,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { NotificationService } from "../../../core/services/notification.service";
import { WebSocketService } from "../../../core/services/websocket.service";
import { UserRole } from "../../../models/user.model";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  unreadCount = 0;
  UserRole = UserRole;
  showNotifications = false;
  notifications: any[] = [];

  @ViewChild("notifPanel") notifPanelRef?: ElementRef<HTMLElement>;
  @ViewChild("notifButton") notifButtonRef?: ElementRef<HTMLElement>;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private wsService: WebSocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.loadNotifications();
        this.setupWebSocketNotifications();
      }
    });
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe((list) => {
      this.notifications = list || [];
    });
    this.notificationService.unreadCount$.subscribe((count) => {
      this.unreadCount = count;
    });
  }

  setupWebSocketNotifications(): void {
    this.wsService.notification$.subscribe((notification) => {
      this.notificationService.incrementUnreadCount();
      this.notifications = [notification, ...this.notifications];
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      // refresh list when opening
      this.loadNotifications();
    }
  }

  markAsRead(id: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.notificationService.markAsRead(id).subscribe(() => {
      this.notifications = this.notifications.map((n) =>
        n._id === id ? { ...n, read: true } : n
      );
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications = this.notifications.map((n) => ({
        ...n,
        read: true,
      }));
    });
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showNotifications) return;
    const panelEl = this.notifPanelRef?.nativeElement;
    const btnEl = this.notifButtonRef?.nativeElement;
    const target = event.target as Node;
    if (panelEl && panelEl.contains(target)) return;
    if (btnEl && btnEl.contains(target)) return;
    this.showNotifications = false;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.wsService.disconnect();
    this.router.navigate(["/login"]);
    this.isMenuOpen = false;
  }

  isAdmin(): boolean {
    return this.authService.hasRole([UserRole.ADMIN]);
  }
}
