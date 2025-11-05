import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserService } from "../../../core/services/user.service";
import { User, UserRole } from "../../../models/user.model";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.css"],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = true;
  roles = Object.values(UserRole);
  successMessage = "";
  errorMessage = "";

  // Create user modal state
  showCreateModal = false;
  newUser = { username: "", email: "", password: "", role: UserRole.READER };

  // Delete user modal state
  showDeleteModal = false;
  userToDelete: { id: string; username: string } | null = null;

  // Inline edit tracking
  editingField: { [userId: string]: "username" | "email" | null } = {};
  fieldValue: { [userId: string]: { username: string; email: string } } = {};

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = "Erreur lors du chargement des utilisateurs";
        this.loading = false;
      },
    });
  }

  // Inline edit handlers
  enableEdit(user: User, field: "username" | "email"): void {
    if (!this.fieldValue[user._id]) {
      this.fieldValue[user._id] = {
        username: user.username,
        email: user.email,
      };
    }
    this.editingField[user._id] = field;
  }

  onEditKeydown(event: KeyboardEvent, userId: string): void {
    if (event.key === "Enter") {
      this.saveInline(userId);
    } else if (event.key === "Escape") {
      this.cancelInline(userId);
    }
  }

  onEditBlur(userId: string): void {
    this.saveInline(userId);
  }

  cancelInline(userId: string): void {
    this.editingField[userId] = null;
  }

  saveInline(userId: string): void {
    const field = this.editingField[userId];
    if (!field) return;
    const payload: any = {};
    payload[field] = this.fieldValue[userId][field];

    this.userService.updateUser(userId, payload).subscribe({
      next: (updated) => {
        const idx = this.users.findIndex((u) => u._id === userId);
        if (idx > -1) {
          this.users[idx] = { ...this.users[idx], ...updated } as User;
        }
        this.successMessage = "Utilisateur mis à jour";
        setTimeout(() => (this.successMessage = ""), 2500);
        this.editingField[userId] = null;
      },
      error: () => {
        this.errorMessage = "Erreur lors de la mise à jour";
        setTimeout(() => (this.errorMessage = ""), 2500);
      },
    });
  }

  // Create user via modal
  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createUser(): void {
    if (
      !this.newUser.username ||
      !this.newUser.email ||
      !this.newUser.password
    ) {
      this.errorMessage = "Nom, email et mot de passe sont requis";
      setTimeout(() => (this.errorMessage = ""), 2500);
      return;
    }
    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.successMessage = "Utilisateur créé";
        setTimeout(() => (this.successMessage = ""), 2500);
        this.newUser = {
          username: "",
          email: "",
          password: "",
          role: UserRole.READER,
        };
        this.closeCreateModal();
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || "Erreur lors de la création";
        setTimeout(() => (this.errorMessage = ""), 2500);
      },
    });
  }

  onRoleChange(userId: string, newRole: UserRole): void {
    this.userService.updateUserRole(userId, newRole).subscribe({
      next: () => {
        this.successMessage = "Rôle mis à jour avec succès";
        setTimeout(() => (this.successMessage = ""), 2500);
      },
      error: (error) => {
        this.errorMessage = "Erreur lors de la mise à jour du rôle";
        setTimeout(() => (this.errorMessage = ""), 2500);
        this.loadUsers();
      },
    });
  }

  // Delete user via modal
  openDeleteModal(user: User): void {
    this.userToDelete = { id: user._id, username: user.username };
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;
    const id = this.userToDelete.id;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.successMessage = "Utilisateur supprimé avec succès";
        this.closeDeleteModal();
        this.loadUsers();
        setTimeout(() => (this.successMessage = ""), 2500);
      },
      error: () => {
        this.errorMessage = "Erreur lors de la suppression de l'utilisateur";
        setTimeout(() => (this.errorMessage = ""), 2500);
      },
    });
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return "badge-admin";
      case UserRole.EDITOR:
        return "badge-editor";
      case UserRole.WRITER:
        return "badge-writer";
      default:
        return "badge-reader";
    }
  }
}
