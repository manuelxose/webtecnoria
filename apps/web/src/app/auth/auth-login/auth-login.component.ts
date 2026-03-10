import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  NgZone,
  PLATFORM_ID,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import {
  AUTH_REPOSITORY,
  AuthRepository,
} from "src/app/domain/repositories/auth.repository";
import { getPublicRuntimeConfig } from "src/app/infrastructure/runtime/public-runtime-config";
import { parseApiError } from "../parse-api-error";

let googleScriptPromise: Promise<void> | null = null;

@Component({
  selector: "app-auth-login",
  templateUrl: "./auth-login.component.html",
  styleUrls: ["./auth-login.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class AuthLoginComponent implements AfterViewInit {
  @ViewChild("googleButtonHost")
  private readonly googleButtonHost?: ElementRef<HTMLDivElement>;

  email = "";
  password = "";
  loading = false;
  errorMessage = "";
  googleEnabled = false;
  googleLoading = false;
  googleErrorMessage = "";

  private readonly isBrowser: boolean;
  private googleButtonRendered = false;

  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    private readonly router: Router,
    private readonly ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    queueMicrotask(() => {
      void this.setupGoogleLogin();
    });
  }

  async signIn(): Promise<void> {
    this.errorMessage = "";

    if (!this.email || !this.password) {
      this.errorMessage = "Introduce email y password para continuar.";
      return;
    }

    this.loading = true;

    try {
      await this.authRepository.login(this.email, this.password);
      await this.router.navigate(["/dashboard"]);
    } catch (error) {
      this.errorMessage = this.parseAuthError(error);
    } finally {
      this.loading = false;
    }
  }

  private async setupGoogleLogin(): Promise<void> {
    if (this.googleButtonRendered || !this.googleButtonHost?.nativeElement) {
      return;
    }

    const clientId = getPublicRuntimeConfig().googleClientId?.trim();
    if (!clientId) {
      return;
    }

    this.googleEnabled = true;

    try {
      await this.loadGoogleScript();

      const googleApi = (window as any).google;
      if (!googleApi?.accounts?.id) {
        throw new Error("Google Identity Services unavailable");
      }

      googleApi.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }: { credential?: string }) => {
          if (!credential) {
            this.googleErrorMessage = "No se pudo validar el acceso con Google.";
            return;
          }

          void this.ngZone.run(async () => {
            await this.signInWithGoogle(credential);
          });
        },
      });

      this.googleButtonHost.nativeElement.innerHTML = "";
      googleApi.accounts.id.renderButton(this.googleButtonHost.nativeElement, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 360,
      });

      this.googleButtonRendered = true;
    } catch (error) {
      console.error("Google button setup failed:", error);
      this.googleEnabled = false;
    }
  }

  private async signInWithGoogle(credential: string): Promise<void> {
    this.googleErrorMessage = "";
    this.googleLoading = true;

    try {
      await this.authRepository.loginWithGoogle(credential);
      await this.router.navigate(["/dashboard"]);
    } catch (error) {
      this.googleErrorMessage = this.parseAuthError(error);
    } finally {
      this.googleLoading = false;
    }
  }

  private parseAuthError(error: unknown): string {
    const parsed = parseApiError(error);
    if (parsed?.unavailable) {
      return "No se puede conectar con la API. Comprueba que el backend este levantado y vuelve a intentarlo.";
    }

    if (parsed?.code === "ACCESS_NOT_GRANTED") {
      return "Tu cuenta no tiene acceso autorizado al area privada.";
    }

    if (parsed?.code === "GOOGLE_ACCOUNT_MISMATCH") {
      return "La cuenta de Google no coincide con el usuario autorizado.";
    }

    if (parsed?.status === 401) {
      return "No se pudo iniciar sesion. Revisa las credenciales.";
    }

    if (parsed?.status === 403) {
      return parsed.message || "Tu usuario no tiene permisos para entrar al area privada.";
    }

    if (parsed?.message) {
      return parsed.message;
    }

    return "No se pudo iniciar sesion. Intentalo de nuevo.";
  }

  private loadGoogleScript(): Promise<void> {
    if ((window as any).google?.accounts?.id) {
      return Promise.resolve();
    }

    if (googleScriptPromise) {
      return googleScriptPromise;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-google-identity="true"]'
    );

    if (existingScript) {
      googleScriptPromise = new Promise((resolve, reject) => {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Failed to load Google Identity Services")),
          { once: true }
        );
      });
      return googleScriptPromise;
    }

    googleScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset["googleIdentity"] = "true";
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Google Identity Services"));
      document.head.appendChild(script);
    });

    return googleScriptPromise;
  }
}
