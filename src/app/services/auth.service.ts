import { Injectable, Inject, PLATFORM_ID, Optional } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";

// Modular Auth
import {
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  User,
} from "@angular/fire/auth";

// Firestore compat (solo si existe en browser)
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/compat/firestore";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router,
    @Optional() private afs: AngularFirestore | null, // 👈 Optional en SSR
    private auth: Auth
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  get isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    try {
      const user = localStorage.getItem("user");
      return !!user && user !== "null";
    } catch {
      return false;
    }
  }

  async SignIn(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    await this.SetUserData(cred.user);
    if (this.isBrowser) this.router.navigate(["dashboard"]);
    return cred;
  }

  async GoogleAuth() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(this.auth, provider);
    await this.SetUserData(cred.user);
    if (this.isBrowser) this.router.navigate(["/dashboard"]);
    return cred;
  }

  async ForgotPassword(email: string) {
    await sendPasswordResetEmail(this.auth, email);
    if (this.isBrowser) alert("Password reset email sent, check your inbox.");
  }

  async SignOut() {
    try {
      await signOut(this.auth);
    } finally {
      if (this.isBrowser) {
        try {
          localStorage.removeItem("user");
        } catch {}
        this.router.navigate(["sign-in"]);
      }
    }
  }

  /** Guarda/mergea datos del usuario en Firestore (solo en browser) */
  private async SetUserData(user: User | null) {
    if (!user || !this.isBrowser || !this.afs) return;

    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );

    const data = {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      emailVerified: user.emailVerified ?? false,
      updatedAt: new Date().toISOString(),
    };

    await userRef.set(data, { merge: true });

    try {
      localStorage.setItem("user", JSON.stringify(data));
    } catch {}
  }
}
