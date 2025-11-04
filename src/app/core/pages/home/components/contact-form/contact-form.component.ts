import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-contact-form",
  templateUrl: "./contact-form.component.html",
  styleUrls: ["./contact-form.component.css"],
  standalone: true,
  imports: [],
})
export class ContactFormComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;

  projectTypes = [
    "Desarrollo software a medida",
    "Implementación ERP/CRM",
    "Integración de sistemas",
    "Automatización de procesos (RPA)",
    "Business Intelligence / Dashboards",
    "Software industrial (IoT/SCADA)",
    "Otro",
  ];

  budgetRanges = [
    "Menos de 10.000€",
    "10.000€ - 25.000€",
    "25.000€ - 50.000€",
    "50.000€ - 100.000€",
    "Más de 100.000€",
    "No lo sé",
  ];

  timelines = [
    "Urgente (menos de 1 mes)",
    "Corto plazo (1-3 meses)",
    "Medio plazo (3-6 meses)",
    "Largo plazo (más de 6 meses)",
    "Sin prisa",
  ];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      email: ["", [Validators.required, Validators.email]],
      phone: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{3,6}$/
          ),
        ],
      ],
      company: ["", Validators.required],
      position: [""],
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

  onSubmit(): void {
    if (this.contactForm.invalid) {
      Object.keys(this.contactForm.controls).forEach((key) => {
        this.contactForm.controls[key].markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    // Simulación de envío (reemplazar con servicio real)
    setTimeout(() => {
      console.log("Form submitted:", this.contactForm.value);
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.contactForm.reset();

      // Scroll to success message
      setTimeout(() => {
        document
          .getElementById("success-message")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 2000);
  }
}
