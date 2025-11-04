import {
  Component,
  Input,
  AfterViewInit,
  ElementRef,
  ViewChild,
  HostListener,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-carousel",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./carousel.component.html",
  styleUrls: ["./carousel.component.css"],
})
export class CarouselComponent implements AfterViewInit, OnDestroy {
  @Input() autoplay = false;
  @Input() interval = 5000;
  @Input() loop = true;
  @Input() pauseOnHover = true;
  @Input() slidesToShow = 1;

  @ViewChild("viewport", { static: true, read: ElementRef })
  viewport!: ElementRef<HTMLElement>;

  current = 0;
  slidesCount = 0;
  timer: any = null;
  isPaused = false;

  ngAfterViewInit(): void {
    // small deferral so projected children are available
    requestAnimationFrame(() => this.setup());
    if (this.autoplay) this.startAutoplay();
  }

  private setup() {
    const el = this.viewport.nativeElement;
    const children = Array.from(el.children).filter(
      (n) => n.nodeType === Node.ELEMENT_NODE
    ) as HTMLElement[];
    this.slidesCount = Math.max(0, children.length);
    // ensure slides take correct width
    children.forEach((c) => {
      c.style.flex = `0 0 ${100 / this.slidesToShow}%`;
      c.style.boxSizing = "border-box";
    });
    el.style.transition = "transform 400ms ease";
    this.updatePosition();
  }

  next() {
    if (this.slidesCount <= this.slidesToShow) return;
    const maxIndex = this.slidesCount - this.slidesToShow;
    if (this.current < maxIndex) this.current++;
    else if (this.loop) this.current = 0;
    else this.current = maxIndex;
    this.updatePosition();
  }

  prev() {
    if (this.slidesCount <= this.slidesToShow) return;
    if (this.current > 0) this.current--;
    else if (this.loop) this.current = this.slidesCount - this.slidesToShow;
    this.updatePosition();
  }

  goTo(index: number) {
    this.current = Math.max(
      0,
      Math.min(index, Math.max(0, this.slidesCount - this.slidesToShow))
    );
    this.updatePosition();
  }

  private updatePosition() {
    const shift = (this.current * 100) / this.slidesToShow;
    this.viewport.nativeElement.style.transform = `translateX(-${shift}%)`;
  }

  startAutoplay() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      if (!this.isPaused) this.next();
    }, this.interval);
  }

  stopAutoplay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  @HostListener("mouseenter") onEnter() {
    if (this.pauseOnHover) this.isPaused = true;
  }

  @HostListener("mouseleave") onLeave() {
    if (this.pauseOnHover) this.isPaused = false;
  }

  @HostListener("window:keydown", ["$event"]) onKey(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") this.prev();
    else if (event.key === "ArrowRight") this.next();
  }

  // touch support
  private touchStartX = 0;
  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.touches[0]?.clientX ?? 0;
    this.isPaused = true;
  }
  onTouchEnd(e: TouchEvent) {
    const endX = e.changedTouches[0]?.clientX ?? 0;
    const diff = endX - this.touchStartX;
    if (Math.abs(diff) > 40) {
      diff < 0 ? this.next() : this.prev();
    }
    this.isPaused = false;
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }
}
