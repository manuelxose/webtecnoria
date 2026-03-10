import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterModule } from "@angular/router";
import {
  AUTH_REPOSITORY,
  AuthRepository,
} from "src/app/domain/repositories/auth.repository";
import { parseApiError } from "../parse-api-error";

@Component({
  selector: "app-auth-re-password",
  templateUrl: "./auth-re-password.component.html",
  styleUrls: ["./auth-re-password.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class AuthRePasswordComponent implements OnInit {
  token = "";
  email = "";
  password = "";
  confirmPassword = "";
  loading = false;
  errorMessage = "";
  successMessage = "";

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get("token") ?? "";
  }

  async requestRecovery(): Promise<void> {
    this.errorMessage = "";
    this.successMessage = "";

    if (!this.email) {
      this.errorMessage = "Introduce el email asociado a tu acceso.";
      return;
    }

    this.loading = true;

    try {
      await this.authRepository.requestPasswordRecovery(this.email.trim());
      this.successMessage =
        "Si existe una cuenta asociada, te enviaremos un enlace para restablecer el acceso.";
    } catch (error) {
      this.errorMessage = this.parseError(error);
    } finally {
      this.loading = false;
    }
  }

  async submitNewPassword(): Promise<void> {
    this.errorMessage = "";
    this.successMessage = "";

    if (!this.password || this.password.length < 8) {
      this.errorMessage = "La nueva password debe tener al menos 8 caracteres.";
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = "Las passwords no coinciden.";
      return;
    }

    this.loading = true;

    try {
      await this.authRepository.resetPassword(this.token, this.password);
      this.successMessage =
        "Password actualizada. Ya puedes volver al login y entrar al panel.";
      this.password = "";
      this.confirmPassword = "";
    } catch (error) {
      this.errorMessage = this.parseError(error);
    } finally {
      this.loading = false;
    }
  }

  private parseError(error: unknown): string {
    const parsed = parseApiError(error);
    if (parsed?.unavailable) {
      return "No se puede conectar con la API. Comprueba que el backend este levantado y vuelve a intentarlo.";
    }

    if (parsed?.code === "INVALID_TOKEN") {
      return "El enlace ya no es valido o ha caducado. Solicita uno nuevo.";
    }

    if (parsed?.status === 400) {
      return parsed.message || "Revisa los datos introducidos antes de volver a intentarlo.";
    }

    if (parsed?.message) {
      return parsed.message;
    }

    return "No se pudo completar la operacion. Intentalo de nuevo.";
  }
}
