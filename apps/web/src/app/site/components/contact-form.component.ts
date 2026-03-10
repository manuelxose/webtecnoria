import {
  DOCUMENT,
  CommonModule,
  isPlatformBrowser,
} from "@angular/common";
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

  clientTypes = [
    "Empresa consolidada",
    "Pyme o negocio en crecimiento",
    "Startup",
    "Emprendedor o proyecto propio",
  ];

  projectTypes = [
    "Software a medida",
    "Automatizacion de procesos",
    "Chatbot / asistente virtual",
    "IA aplicada al negocio",
    "Plataforma o SaaS",
    "Consultoria tecnologica",
    "Evolucion de software existente",
  ];

  budgetRanges = [
    "Todavia no lo se",
    "Menos de 10.000 EUR",
    "10.000 - 25.000 EUR",
    "25.000 - 50.000 EUR",
    "Mas de 50.000 EUR",
  ];

  timelines = [
    "Cuanto antes",
    "En 1-2 meses",
    "En este trimestre",
    "Sin fecha cerrada todavia",
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
      phone: [
        "",
        [Validators.pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{3,6}$/)],
      ],
      company: [""],
      clientType: ["", Validators.required],
      projectType: ["", Validators.required],
      budget: [""],
      timeline: [""],
      message: ["", [Validators.required, Validators.minLength(20)]],
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
      const service2 = [
        this.contactForm.value.clientType,
        this.contactForm.value.timeline,
        this.contactForm.value.budget,
      ]
        .filter(Boolean)
        .join(" | ");

      await this.contactRepository.submitLead({
        name: this.contactForm.value.name,
        email: this.contactForm.value.email,
        phone: this.contactForm.value.phone || undefined,
        company:
          this.contactForm.value.company || this.contactForm.value.clientType,
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
