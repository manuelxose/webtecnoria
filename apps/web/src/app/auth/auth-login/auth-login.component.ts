import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { FeatherModule } from "angular-feather";
import {
  AUTH_REPOSITORY,
  AuthRepository,
} from "src/app/domain/repositories/auth.repository";

@Component({
  selector: "app-auth-login",
  templateUrl: "./auth-login.component.html",
  styleUrls: ["./auth-login.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FeatherModule],
})
export class AuthLoginComponent {
  year = new Date().getFullYear();
  email = "";
  password = "";
  loading = false;
  errorMessage = "";

  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    private readonly router: Router
  ) {}

  async signIn(): Promise<void> {
    this.errorMessage = "";

    if (!this.email || !this.password) {
      this.errorMessage = "Debes introducir email y password.";
      return;
    }

    this.loading = true;
    try {
      await this.authRepository.login(this.email, this.password);
      this.router.navigate(["/dashboard"]);
    } catch {
      this.errorMessage = "No se pudo iniciar sesion. Revisa tus credenciales.";
    } finally {
      this.loading = false;
    }
  }
}
