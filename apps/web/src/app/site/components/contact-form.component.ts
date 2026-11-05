import { DOCUMENT, CommonModule, isPlatformBrowser } from "@angular/common";
import { Component, Inject, PLATFORM_ID } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  CONTACT_REPOSITORY,
  ContactRepository,
} from "src/app/domain/repositories/contact.repository";
import { AnalyticsService } from "../services/analytics.service";
import {
  canStartSubmission,
  createIdempotencyKey,
  serviceCategoryFor,
} from "../services/analytics-events";

@Component({
  selector: "app-contact-form",
  templateUrl: "./contact-form.component.html",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [
    `
      .contact-form__honeypot {
        position: absolute;
        left: -9999px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
    `,
  ],
})
export class ContactFormComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  /** True when the failure was a 429, so the message can be actionable. */
  rateLimited = false;

  /** Regenerated after a confirmed lead, reused across retries otherwise. */
  private idempotencyKey: string | null = null;

  projectTypes = [
    "Software a medida",
    "Automatización de procesos",
    "Chatbots o asistentes",
    "IA aplicada a negocio",
    "Plataforma o SaaS",
    "Revisión de software existente",
    "Consultoría tecnológica",
  ];

  timelines = [
    "Cuanto antes",
    "En 1-2 meses",
    "Este trimestre",
    "Sin fecha cerrada todavía",
  ];

  constructor(
    private readonly fb: FormBuilder,
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepository,
    private readonly analytics: AnalyticsService
  ) {
    this.contactForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      email: ["", [Validators.required, Validators.email]],
      company: ["", [Validators.required, Validators.minLength(2)]],
      phone: ["", [Validators.pattern(/^[0-9+()\s.-]{0,24}$/)]],
      projectType: ["", Validators.required],
      timeline: [""],
      message: ["", [Validators.required, Validators.minLength(30)]],
      privacy: [false, Validators.requiredTrue],
      // Honeypot: humans never see or fill it; robots usually do.
      _hp: [""],
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  async onSubmit(): Promise<void> {
    if (
      !canStartSubmission({
        invalid: this.contactForm.invalid,
        inFlight: this.isSubmitting,
      })
    ) {
      if (this.contactForm.invalid) {
        Object.values(this.contactForm.controls).forEach((control) =>
          control.markAsTouched()
        );
      }
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;
    this.rateLimited = false;

    const projectType = String(this.contactForm.value.projectType || "");
    const sourcePage = this.currentPath();
    this.idempotencyKey = this.idempotencyKey ?? createIdempotencyKey();

    try {
      const service2 = [this.contactForm.value.timeline]
        .filter(Boolean)
        .join(" | ");

      await this.contactRepository.submitLead({
        name: this.contactForm.value.name,
        email: this.contactForm.value.email,
        phone: this.contactForm.value.phone || undefined,
        company: this.contactForm.value.company,
        service1: projectType,
        service2,
        message: this.contactForm.value.message,
        privacyAccepted: true,
        sourcePage,
        idempotencyKey: this.idempotencyKey,
        _hp: String(this.contactForm.value._hp || ""),
      });

      this.isSubmitting = false;
      this.submitSuccess = true;
      this.idempotencyKey = null;

      // Only after the API confirmed the lead, and only with consent.
      this.analytics.trackLead({
        formType: "contact",
        serviceCategory: serviceCategoryFor(projectType),
        sourcePage,
      });

      this.contactForm.reset();
      this.scrollToSuccess();
    } catch (error) {
      this.isSubmitting = false;
      this.submitError = true;
      // G-9: a rate-limited visitor needs a different instruction from someone
      // who mistyped a field. HttpClient rejects with an HttpErrorResponse, which
      // carries the status; anything else is treated as a generic failure.
      const status = (error as { status?: unknown } | null)?.status;
      this.rateLimited = status === 429;
    }
  }

  private currentPath(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return "";
    }

    return this.document.defaultView?.location.pathname ?? "";
  }

  private scrollToSuccess(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    setTimeout(() => {
      this.document
        .getElementById("success-message")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
}
