import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { User, UserRole } from "../../models/user.model";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http
      .get<any>(this.API_URL)
      .pipe(map((res) => res?.data?.users ?? []));
  }

  getUserById(id: string): Observable<User> {
    return this.http
      .get<any>(`${this.API_URL}/${id}`)
      .pipe(map((res) => res?.data?.user ?? res));
  }

  updateUserRole(userId: string, role: UserRole): Observable<User> {
    return this.http
      .put<any>(`${this.API_URL}/${userId}`, { role })
      .pipe(map((res) => res?.data?.user ?? res));
  }

  updateUser(
    userId: string,
    data: Partial<Pick<User, "username" | "email">>
  ): Observable<User> {
    return this.http
      .put<any>(`${this.API_URL}/${userId}`, data)
      .pipe(map((res) => res?.data?.user ?? res));
  }

  createUser(payload: {
    username: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Observable<User> {
    // Backend exposes creation via auth/register
    return this.http
      .post<any>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(map((res) => res?.data?.user ?? res));
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${userId}`);
  }

  // No direct users/profile endpoint in backend; profile GET is under /auth/profile
}
