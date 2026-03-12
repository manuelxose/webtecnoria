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

@Component({
  selector: "app-contact-form",
  templateUrl: "./contact-form.component.html",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class ContactFormComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;

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
    private readonly contactRepository: ContactRepository
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
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  async onSubmit(): Promise<void> {
    if (this.contactForm.invalid) {
      Object.values(this.contactForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    try {
      const service2 = [this.contactForm.value.timeline]
        .filter(Boolean)
        .join(" | ");

      await this.contactRepository.submitLead({
        name: this.contactForm.value.name,
        email: this.contactForm.value.email,
        phone: this.contactForm.value.phone || undefined,
        company: this.contactForm.value.company,
        service1: this.contactForm.value.projectType,
        service2,
        message: this.contactForm.value.message,
      });

      this.isSubmitting = false;
      this.submitSuccess = true;
      this.contactForm.reset();
      this.scrollToSuccess();
    } catch {
      this.isSubmitting = false;
      this.submitError = true;
    }
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
