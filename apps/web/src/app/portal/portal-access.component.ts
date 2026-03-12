import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  AUTH_REPOSITORY,
  AuthRepository,
} from "src/app/domain/repositories/auth.repository";
import { getPublicRuntimeConfig } from "src/app/infrastructure/runtime/public-runtime-config";
import { PrivateNavigationService } from "../auth/private-navigation.service";
import { parseApiError } from "../auth/parse-api-error";

let googleScriptPromise: Promise<void> | null = null;

@Component({
  selector: "app-portal-access",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#0f172a 0%,#111827 45%,#f8fafc 45%,#f8fafc 100%);padding:24px">
  <div style="width:100%;max-width:460px">
    <div style="text-align:center;margin-bottom:28px;color:#e2e8f0">
      <div style="font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#93c5fd">TecnoRia</div>
      <div style="font-size:30px;font-weight:800;letter-spacing:-0.03em;margin-top:10px">Portal de cliente</div>
      <div style="font-size:14px;line-height:1.6;color:#cbd5e1;margin-top:10px">
        Accede con tu cuenta corporativa para revisar proyectos, facturas y soporte desde una sesión segura.
      </div>
    </div>

    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px;box-shadow:0 18px 48px rgba(15,23,42,.12)">
      @if (errorMessage) {
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;color:#b91c1c;padding:12px 14px;font-size:13px;margin-bottom:16px">
          {{ errorMessage }}
        </div>
      }

      <form (ngSubmit)="signIn()">
        <div style="display:grid;gap:16px">
          <div>
            <label style="display:block;font-size:13px;font-weight:600;color:#334155;margin-bottom:6px">Email</label>
            <input
              style="width:100%;padding:11px 12px;border:1px solid #cbd5e1;border-radius:10px;font-size:14px;box-sizing:border-box;outline:none"
              [(ngModel)]="email"
              name="email"
              type="email"
              autocomplete="email"
              placeholder="cliente@empresa.com"
              required
            >
          </div>

          <div>
            <label style="display:block;font-size:13px;font-weight:600;color:#334155;margin-bottom:6px">Password</label>
            <input
              style="width:100%;padding:11px 12px;border:1px solid #cbd5e1;border-radius:10px;font-size:14px;box-sizing:border-box;outline:none"
              [(ngModel)]="password"
              name="password"
              type="password"
              autocomplete="current-password"
              placeholder="Introduce tu password"
              required
            >
          </div>
        </div>

        <button
          type="submit"
          style="width:100%;margin-top:18px;padding:12px;background:#0f172a;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer"
          [disabled]="loading"
        >
          @if (loading) { Entrando… } @else { Acceder al portal }
        </button>
      </form>

      @if (googleEnabled) {
        <div style="display:flex;align-items:center;gap:12px;margin:22px 0 16px">
          <span style="height:1px;background:#e2e8f0;flex:1"></span>
          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.12em">o</span>
          <span style="height:1px;background:#e2e8f0;flex:1"></span>
        </div>

        <div #googleButtonHost style="display:flex;justify-content:center"></div>

        @if (googleLoading) {
          <p style="margin:12px 0 0;text-align:center;font-size:12px;color:#475569">Validando acceso con Google…</p>
        }

        @if (googleErrorMessage) {
          <p style="margin:12px 0 0;text-align:center;font-size:12px;color:#b91c1c">{{ googleErrorMessage }}</p>
        }
      }
    </div>

    <div style="display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-top:16px;font-size:12px;color:#475569">
      <a routerLink="/" style="color:inherit;text-decoration:none">Volver a la web</a>
      <a routerLink="/auth-signup" style="color:inherit;text-decoration:none">Solicitar acceso</a>
      <a routerLink="/auth-login" style="color:inherit;text-decoration:none">Acceso editorial</a>
    </div>
  </div>
</div>
  `,
})
export class PortalAccessComponent implements OnInit, AfterViewInit {
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
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly privateNavigation: PrivateNavigationService,
    private readonly ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit(): Promise<void> {
    const user = await this.authRepository.me();
    if (user) {
      await this.router.navigateByUrl(this.privateNavigation.getPostLoginUrl(this.route, user));
    }
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
      await this.finishLogin();
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
      await this.finishLogin();
    } catch (error) {
      this.googleErrorMessage = this.parseAuthError(error);
    } finally {
      this.googleLoading = false;
    }
  }

  private async finishLogin(): Promise<void> {
    const user = await this.authRepository.me();
    await this.router.navigateByUrl(this.privateNavigation.getPostLoginUrl(this.route, user));
  }

  private parseAuthError(error: unknown): string {
    const parsed = parseApiError(error);
    if (parsed?.unavailable) {
      return "No se puede conectar con la API. Comprueba el backend y vuelve a intentarlo.";
    }

    if (parsed?.code === "ACCESS_NOT_GRANTED") {
      return "Tu cuenta no tiene acceso autorizado a las areas privadas.";
    }

    if (parsed?.code === "GOOGLE_ACCOUNT_MISMATCH") {
      return "La cuenta de Google no coincide con el usuario autorizado.";
    }

    if (parsed?.status === 401) {
      return "No se pudo iniciar sesion. Revisa las credenciales.";
    }

    if (parsed?.status === 403) {
      return parsed.message || "Tu cuenta no tiene permisos para entrar con este acceso.";
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
