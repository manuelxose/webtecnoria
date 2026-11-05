import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import {
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { ConsentService } from "../services/consent.service";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Accessible consent bar.
 *
 * Mounted once in `app.component.html` (the only global outlet) so it exists on
 * public and private routes. It renders nothing until the stored decision has
 * been resolved in the browser, which keeps SSR output stable.
 */
@Component({
  selector: "app-consent-banner",
  standalone: true,
  imports: [RouterModule],
  template: `
    @if (resolved()) {
      @if (dialogOpen()) {
        <div class="consent" role="presentation">
          <div
            #dialog
            class="consent__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-title"
            aria-describedby="consent-desc"
            tabindex="-1"
          >
            <div class="consent__body">
              <p class="consent__title" id="consent-title">
                Cookies y consentimiento
              </p>
              <p class="consent__text" id="consent-desc">
                Usamos cookies necesarias para el sitio. Si aceptas, cargamos
                Google Analytics para medir visitas de forma agregada. Puedes
                cambiar tu decisión cuando quieras.
              </p>
              <p class="consent__text consent__thirdparty">
                El chat (Talkaris) contacta con talkaris.com al cargar la página.
                <a routerLink="/politica-de-cookies">Política de cookies</a>
              </p>

              @if (configOpen()) {
                <fieldset class="consent__options">
                  <legend>Preferencias</legend>
                  <label class="consent__option">
                    <input
                      type="checkbox"
                      #analyticsToggle
                      [checked]="analyticsOn()"
                      (change)="toggleAnalytics($event)"
                    />
                    <span>Analítica (Google Analytics)</span>
                  </label>
                </fieldset>
              }
            </div>

            <div class="consent__actions">
              @if (configOpen()) {
                <button
                  type="button"
                  class="button button-secondary consent__action"
                  (click)="saveSelection()"
                >
                  Guardar selección
                </button>
                <button
                  type="button"
                  class="button button-secondary consent__action"
                  (click)="reject()"
                >
                  Rechazar todo
                </button>
              } @else {
                <button
                  type="button"
                  class="button button-secondary consent__action"
                  (click)="accept()"
                >
                  Aceptar
                </button>
                <button
                  type="button"
                  class="button button-secondary consent__action"
                  (click)="reject()"
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  class="button button-secondary consent__action"
                  (click)="configure()"
                >
                  Configurar
                </button>
              }

              @if (hasDecision()) {
                <button
                  type="button"
                  class="button button-ghost consent__action"
                  (click)="withdraw()"
                >
                  Retirar consentimiento
                </button>
              }
            </div>
          </div>
        </div>
      } @else {
        <button type="button" class="consent-reopen" (click)="openPreferences()">
          Configuración de cookies
        </button>
      }
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .consent {
        position: fixed;
        inset: auto 0 0 0;
        z-index: 1000000;
        display: flex;
        justify-content: center;
        padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
        background: rgba(6, 6, 14, 0.94);
        backdrop-filter: blur(6px);
      }

      .consent__dialog {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 20px;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        max-width: 980px;
        color: #ffffff;
      }

      .consent__dialog:focus-visible {
        outline: 2px solid var(--copper);
        outline-offset: 4px;
      }

      .consent__body {
        flex: 1 1 380px;
        min-width: 220px;
      }

      .consent__title {
        margin: 0 0 2px;
        font-family: var(--font-heading);
        font-size: 0.95rem;
        font-weight: 600;
      }

      .consent__text {
        margin: 0;
        font-size: 0.85rem;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.82);
      }

      .consent__thirdparty {
        margin-top: 4px;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.72);
      }

      .consent__thirdparty a {
        color: #ffffff;
        text-decoration: underline;
      }

      .consent__thirdparty a:focus-visible {
        outline: 2px solid var(--copper);
        outline-offset: 2px;
      }

      .consent__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .consent__action {
        min-height: 38px;
        padding: 8px 14px;
        font-size: 0.85rem;
      }

      .consent__options {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 16px;
        margin: 8px 0 0;
        padding: 6px 10px;
        border: 1px solid rgba(255, 255, 255, 0.22);
        border-radius: 12px;
      }

      .consent__options legend {
        padding: 0 4px;
        font-size: 0.75rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.66);
      }

      .consent__option {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
      }

      .consent__option input {
        width: 16px;
        height: 16px;
        accent-color: var(--accent);
      }

      .consent-reopen {
        position: fixed;
        left: 12px;
        bottom: 12px;
        z-index: 1000000;
        padding: 8px 14px;
        border: 1px solid var(--line-strong);
        border-radius: 999px;
        background: var(--bg);
        color: var(--ink);
        font-family: var(--font-body);
        font-size: 0.78rem;
        cursor: pointer;
        box-shadow: var(--shadow-sm);
      }

      .consent-reopen:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }

      @media (max-width: 640px) {
        .consent {
          padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
        }

        .consent__dialog {
          max-height: 62vh;
          overflow: auto;
          gap: 6px 12px;
        }

        .consent__text {
          font-size: 0.78rem;
        }

        .consent__thirdparty {
          margin-top: 2px;
          font-size: 0.7rem;
        }

        .consent__action {
          flex: 1 1 auto;
          min-height: 34px;
          padding: 6px 12px;
        }
      }
    `,
  ],
})
export class ConsentBannerComponent {
  private readonly consent = inject(ConsentService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = viewChild<ElementRef<HTMLElement>>("dialog");
  private readonly analyticsToggleRef =
    viewChild<ElementRef<HTMLInputElement>>("analyticsToggle");

  readonly resolved = this.consent.resolved;
  readonly decision = this.consent.decision;

  readonly dismissed = signal(false);
  readonly forcedOpen = signal(false);
  readonly configOpen = signal(false);
  readonly analyticsOn = signal(false);

  readonly dialogOpen = computed(
    () =>
      this.resolved() &&
      !this.dismissed() &&
      (this.decision() === null || this.forcedOpen())
  );

  readonly hasDecision = computed(() => this.decision() !== null);

  private focusPending = false;
  /** Document-level key handling: host-scoped listeners miss keys after re-render. */
  private listening = false;
  /** Element focus returns to when the dialog closes (WCAG 2.4.3). */
  private returnFocusTarget: HTMLElement | null = null;

  private readonly onDocumentKeydown = (event: KeyboardEvent): void => {
    this.handleKeydown(event);
  };

  constructor() {
    effect(() => {
      // G-2: only the open-request counter may be tracked. openPreferences()
      // reads the current grant through isAnalyticsGranted(); tracked, that made
      // this effect depend on the decision, so once the footer link had been used
      // every Accept/Reject/Save/Withdraw re-opened the dialog.
      const request = this.consent.openRequest();
      if (request === 0) {
        return;
      }

      untracked(() => this.openPreferences());
    });

    effect(() => {
      this.syncDialogState(this.dialogOpen());
    });

    effect(() => {
      if (this.dialogOpen() && !this.focusPending) {
        this.focusPending = true;
        queueMicrotask(() => this.focusDialog());
        return;
      }
      if (!this.dialogOpen()) {
        this.focusPending = false;
      }
    });

    this.destroyRef.onDestroy(() => this.detachDocumentKeydown());
  }

  accept(): void {
    this.consent.acceptAnalytics();
    this.close();
  }

  reject(): void {
    this.consent.rejectAll();
    this.close();
  }

  /**
   * Opens the preferences panel. F-7: the control is initialised from the
   * visitor's stored decision, never forced to false, so the panel cannot show
   * a state that contradicts the record.
   */
  configure(): void {
    this.analyticsOn.set(this.consent.isAnalyticsGranted());
    this.configOpen.set(true);
    // The button that opened the panel is removed by the re-render, so move
    // focus to a stable element inside the dialog (F-3).
    setTimeout(() => {
      const toggle = this.analyticsToggleRef()?.nativeElement;
      if (toggle) {
        toggle.focus();
        return;
      }
      this.focusDialog();
    }, 0);
  }

  saveSelection(): void {
    this.consent.saveSelection(this.analyticsOn());
    this.close();
  }

  withdraw(): void {
    this.consent.withdraw();
    this.close();
  }

  openPreferences(): void {
    this.analyticsOn.set(this.consent.isAnalyticsGranted());
    this.configOpen.set(false);
    this.dismissed.set(false);
    this.forcedOpen.set(true);
  }

  toggleAnalytics(event: Event): void {
    this.analyticsOn.set((event.target as HTMLInputElement).checked === true);
  }

  /**
   * F-3: installed on `document` (capture phase) while the dialog is open, so
   * Escape works from anywhere and Tab cannot reach the background page even
   * after the focused button has been replaced.
   */
  private handleKeydown(event: KeyboardEvent): void {
    if (!this.dialogOpen()) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      // Closing without a choice grants nothing.
      this.close();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const dialog = this.dialogRef()?.nativeElement;
    if (!dialog) {
      return;
    }

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((element) => element.getAttribute("aria-hidden") !== "true");

    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.document.activeElement as HTMLElement | null;
    const insideDialog = active === dialog || dialog.contains(active);

    if (!insideDialog) {
      // Focus fell to body (or the page behind): pull it back in.
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private syncDialogState(open: boolean): void {
    if (open) {
      this.captureReturnTarget();
      this.attachDocumentKeydown();
      return;
    }

    this.detachDocumentKeydown();
  }

  private attachDocumentKeydown(): void {
    if (this.listening || !isPlatformBrowser(this.platformId)) {
      return;
    }
    this.document.addEventListener("keydown", this.onDocumentKeydown, true);
    this.listening = true;
  }

  private detachDocumentKeydown(): void {
    if (!this.listening) {
      return;
    }
    this.document.removeEventListener("keydown", this.onDocumentKeydown, true);
    this.listening = false;
  }

  private captureReturnTarget(): void {
    const active = this.document.activeElement as HTMLElement | null;
    if (!active || active === this.document.body) {
      return;
    }

    const dialog = this.dialogRef()?.nativeElement;
    if (dialog && (active === dialog || dialog.contains(active))) {
      return;
    }

    this.returnFocusTarget = active;
  }

  private close(): void {
    this.configOpen.set(false);
    this.forcedOpen.set(false);
    this.dismissed.set(true);
    // Restore focus after the DOM has re-rendered (the panel disappears and the
    // persistent control reappears).
    setTimeout(() => this.restoreFocus(), 0);
  }

  private restoreFocus(): void {
    const stored = this.returnFocusTarget;
    this.returnFocusTarget = null;

    const candidate =
      (stored && stored.isConnected ? stored : null) ??
      (this.document.querySelector(".consent-reopen") as HTMLElement | null) ??
      (this.document.querySelector("main, [role='main'], #main-content") as HTMLElement | null);

    if (!candidate) {
      return;
    }

    try {
      candidate.focus();
    } catch {
      // Focus is best-effort: never break the page over it.
    }
  }

  private focusDialog(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.dialogRef()?.nativeElement.focus();
  }
}
