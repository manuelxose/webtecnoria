import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { FeatherModule } from "angular-feather";

@Component({
  selector: "app-auth-login",
  templateUrl: "./auth-login.component.html",
  styleUrls: ["./auth-login.component.css"],
  standalone: true,
  imports: [FeatherModule],
})

/**
 * Auth Login Component
 */
export class AuthLoginComponent implements OnInit {
  constructor(public authService: AuthService) {}

  year = new Date().getFullYear();

  ngOnInit(): void {}
}
