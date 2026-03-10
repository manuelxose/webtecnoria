import { Component, Inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import {
  CONTACT_REPOSITORY,
  ContactRepository,
} from "src/app/domain/repositories/contact.repository";

@Component({
  selector: "app-form-bottom",
  templateUrl: "./form-bottom.component.html",
  styleUrls: ["./form-bottom.component.css"],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class FormBottomComponent {
  public form: FormGroup;
  public servicio = [
    "Diseño Web",
    "Marketing Digital",
    "Posicionamiento",
    "Publicidad",
    "Desarrollo a Medida",
  ];
  public servicio_seleccionado = "";
  public sub_servicio;
  diseño = [
    "Paginas Web",
    "Tiendas Online",
    "Landing Page",
    "Mantenimientio Web",
    "Otros",
  ];
  marketing = [
    "Redes Sociales",
    "Email Marketing",
    "Branding",
    "Marketing de Contenidos",
    "Otros",
  ];
  posicionamiento = ["SEO", "SEM", "Linkbuilding", "Auditoria SEO", "Otros"];
  publicidad = [
    "Google Ads",
    "Facebook Ads",
    "Instagram Ads",
    "Linkedin Ads",
    "Otros",
  ];
  desarrollo = ["Aplicaciones Web", "Aplicaciones Moviles", "Otros"];

  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepository
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.minLength(3)]),
      email: new FormControl("", [Validators.required, Validators.email]),
      empresa: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
      ]),
      phone: new FormControl("", [
        Validators.required,
        Validators.pattern("[0-9]{9}"),
      ]),
      service1: new FormControl("", [Validators.required]),
      service2: new FormControl("", [Validators.required]),
      message: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  public onSubmit(form) {
    console.log(form);
  }

  public selectOption(option) {
    this.servicio_seleccionado = option;
    switch (option) {
      case "Diseño Web":
        this.sub_servicio = this.diseño;
        break;
      case "Marketing Digital":
        this.sub_servicio = this.marketing;
        break;
      case "Posicionamiento":
        this.sub_servicio = this.posicionamiento;
        break;
      case "Publicidad":
        this.sub_servicio = this.publicidad;
        break;
      case "Desarrollo a Medida":
        this.sub_servicio = this.desarrollo;
        break;
    }
  }

  public selectSubOption(option) {
    this.form.controls["service2"].setValue(option);
    this.form.controls["service1"].setValue(this.servicio_seleccionado);
    this.sub_servicio = option;
  }

  public sendEmail() {
    if (this.form.valid) {
      console.log("Formulario enviado");
      this.addMessage();
      this.form.reset();
    } else {
      console.log("Formulario no enviado");
    }
  }

  public addMessage() {
    let date = new Date();
    this.form.value.date = this.dateFormat(date);

    this.contactRepository
      .submitLead(this.form.value)
      .then(() => {
        console.log("Mensaje enviado");
      })
      .catch(() => {
        console.log("Mensaje no enviado");
      });
  }

  public dateFormat(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  }
}
