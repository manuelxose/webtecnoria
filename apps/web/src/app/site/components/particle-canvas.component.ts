import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

@Component({
  selector: "app-particle-canvas",
  standalone: true,
  template: `<canvas #canvas></canvas>`,
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
      }
      canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class ParticleCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild("canvas") canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() count = 80;
  @Input() dotColor = "rgba(255,255,255,0.25)";
  @Input() lineColor = "rgba(255,255,255,0.05)";
  @Input() connectDist = 140;
  @Input() speed = 0.45;

  private animId = 0;
  private particles: Particle[] = [];
  private ro?: ResizeObserver;
  private dpr = 1;
  private prefersReducedMotion = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    this.dpr = window.devicePixelRatio || 1;
    this.resize();
    this.spawnParticles();

    if (this.prefersReducedMotion) {
      this.drawFrame();
      return;
    }

    this.loop();

    this.ro = new ResizeObserver(() => {
      this.resize();
      this.spawnParticles();
    });
    this.ro.observe(this.canvasRef.nativeElement.parentElement!);
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.animId);
    }
    this.ro?.disconnect();
  }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement!;
    const w = parent.offsetWidth;
    const h = parent.offsetHeight;
    canvas.width = Math.round(w * this.dpr);
    canvas.height = Math.round(h * this.dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
  }

  private spawnParticles(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = canvas.width / this.dpr;
    const h = canvas.height / this.dpr;
    const particleCount = this.prefersReducedMotion
      ? Math.min(this.count, 32)
      : this.count;

    this.particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * this.speed * 2,
      vy: (Math.random() - 0.5) * this.speed * 2,
      r: Math.random() * 1.5 + 1,
    }));
  }

  private loop(): void {
    this.drawFrame(true);
    this.animId = requestAnimationFrame(() => this.loop());
  }

  private drawFrame(animate = false): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width / this.dpr;
    const h = canvas.height / this.dpr;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (animate) {
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
    }

    // Draw connections
    const dist = this.connectDist;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < dist) {
          const opacity = (1 - d / dist) * 0.14;
          ctx.beginPath();
          ctx.strokeStyle = this.withOpacity(this.lineColor, opacity);
          ctx.lineWidth = 0.8;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Draw dots
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = this.dotColor;
      ctx.fill();
    }

  }

  private withOpacity(color: string, opacity: number): string {
    const normalizedOpacity = Math.min(1, Math.max(0, opacity));
    const trimmedColor = color.trim();
    const rgbaMatch = trimmedColor.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+\s*)?\)$/i);

    if (rgbaMatch) {
      const [, r, g, b] = rgbaMatch;
      return `rgba(${r},${g},${b},${normalizedOpacity.toFixed(3)})`;
    }

    const hexMatch = trimmedColor.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hexMatch) {
      const hex = hexMatch[1];
      const expanded = hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex;
      const r = parseInt(expanded.slice(0, 2), 16);
      const g = parseInt(expanded.slice(2, 4), 16);
      const b = parseInt(expanded.slice(4, 6), 16);
      return `rgba(${r},${g},${b},${normalizedOpacity.toFixed(3)})`;
    }

    return `rgba(255,255,255,${normalizedOpacity.toFixed(3)})`;
  }
}
