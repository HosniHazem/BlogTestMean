import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject, tap, map } from "rxjs";
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  UserRole,
} from "../../models/user.model";
import { environment } from "../../../environments/environment";
import { WebSocketService } from "./websocket.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private ws: WebSocketService) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      const user = JSON.parse(userStr);
      this.currentUserSubject.next(user);
      this.currentUser.set(user);
    }
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<any>(`${this.API_URL}/auth/register`, data).pipe(
      map(
        (res) =>
          ({
            token: res?.data?.accessToken,
            refreshToken: res?.data?.refreshToken,
            user: res?.data?.user,
          } as AuthResponse)
      ),
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<any>(`${this.API_URL}/auth/login`, credentials).pipe(
      map(
        (res) =>
          ({
            token: res?.data?.accessToken,
            refreshToken: res?.data?.refreshToken,
            user: res?.data?.user,
          } as AuthResponse)
      ),
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    this.currentUserSubject.next(null);
    this.currentUser.set(null);
    this.ws.disconnect();
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem("refreshToken");
    return this.http
      .post<any>(`${this.API_URL}/auth/refresh-token`, {
        refreshToken,
      })
      .pipe(
        map(
          (res) =>
            ({
              token: res?.data?.accessToken,
              refreshToken: res?.data?.refreshToken,
              user: JSON.parse(localStorage.getItem("user") || "null"),
            } as AuthResponse)
        ),
        tap((response) => this.handleAuthSuccess(response))
      );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem("token", response.token);
    localStorage.setItem("refreshToken", response.refreshToken);
    localStorage.setItem("user", JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    this.currentUser.set(response.user);
    if (response.token) {
      this.ws.connect(response.token);
    }
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  canEditArticle(authorId: string): boolean {
    const user = this.currentUser();
    if (!user) return false;

    return (
      user.role === UserRole.ADMIN ||
      user.role === UserRole.EDITOR ||
      (user.role === UserRole.WRITER && user._id === authorId)
    );
  }

  canDeleteArticle(): boolean {
    const user = this.currentUser();
    return user?.role === UserRole.ADMIN;
  }
}
