import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import {
  AUTH_REPOSITORY,
  AuthRepository,
} from "src/app/domain/repositories/auth.repository";
import { parseApiError } from "../parse-api-error";

@Component({
  selector: "app-auth-signup",
  templateUrl: "./auth-signup.component.html",
  styleUrls: ["./auth-signup.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class AuthSignupComponent {
  name = "";
  company = "";
  email = "";
  phone = "";
  message = "";
  loading = false;
  errorMessage = "";
  successMessage = "";

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository
  ) {}

  async requestAccess(): Promise<void> {
    this.errorMessage = "";
    this.successMessage = "";

    if (!this.name || !this.email || !this.company) {
      this.errorMessage = "Nombre, empresa y email son obligatorios.";
      return;
    }

    this.loading = true;

    try {
      await this.authRepository.requestAccess({
        name: this.name.trim(),
        company: this.company.trim(),
        email: this.email.trim(),
        phone: this.phone.trim() || undefined,
        message: this.message.trim() || undefined,
      });

      this.successMessage =
        "Solicitud enviada. Te escribiremos por email cuando revisemos el acceso.";
      this.message = "";
      this.phone = "";
    } catch (error) {
      this.errorMessage = this.parseError(error);
    } finally {
      this.loading = false;
    }
  }

  private parseError(error: unknown): string {
    const parsed = parseApiError(error);
    if (parsed?.unavailable) {
      return "No se puede conectar con la API. Comprueba que el backend esta levantado y vuelve a intentarlo.";
    }

    if (parsed?.status === 400) {
      return parsed.message || "Revisa los datos enviados antes de volver a intentarlo.";
    }

    if (parsed?.message) {
      return parsed.message;
    }

    return "No se pudo registrar la solicitud. Intentalo de nuevo.";
  }
}
