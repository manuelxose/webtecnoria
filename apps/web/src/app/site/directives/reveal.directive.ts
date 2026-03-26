import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

/**
 * RevealDirective — añade la clase `visible` cuando el elemento
 * entra en el viewport usando IntersectionObserver.
 *
 * Uso:
 *   <div appReveal class="reveal reveal-delay-2">...</div>
 */
@Directive({
  selector: "[appReveal]",
  standalone: true,
})
export class RevealDirective implements OnInit, OnDestroy {
  /** Umbral de visibilidad para disparar la animación (0-1) */
  @Input() revealThreshold = 0.12;

  private observer: IntersectionObserver | null = null;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // En SSR marcamos visible directamente para no romper hidratación
      this.el.nativeElement.classList.add("visible");
      return;
    }

    if (!("IntersectionObserver" in window)) {
      this.el.nativeElement.classList.add("visible");
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: this.revealThreshold, rootMargin: "0px 0px -48px 0px" }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
