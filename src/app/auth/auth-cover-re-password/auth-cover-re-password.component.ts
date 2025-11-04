import { Component, OnInit } from "@angular/core";
import { FeatherModule } from "angular-feather";

@Component({
  selector: "app-auth-cover-re-password",
  templateUrl: "./auth-cover-re-password.component.html",
  styleUrls: ["./auth-cover-re-password.component.css"],
  standalone: true,
  imports: [FeatherModule],
})

/**
 * Auth Cover Repassword Component
 */
export class AuthCoverRePasswordComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
