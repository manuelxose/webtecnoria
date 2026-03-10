App Carousel

A lightweight, dependency-free carousel component to replace ngx-owl-carousel-o where possible.

Usage

- Import the standalone component where you need it, or reference it from a parent standalone component's `imports` array.

Example (standalone parent):

imports: [CommonModule, CarouselComponent]

Template:

<app-carousel [autoplay]="true" [interval]="4000" [loop]="true" [slidesToShow]="1">

  <div *ngFor="let item of items"> ... slide content ... </div>
</app-carousel>

Inputs

- autoplay: boolean (default false) — start auto-rotation
- interval: number (ms, default 5000) — autoplay delay
- loop: boolean (default true) — whether to wrap around
- pauseOnHover: boolean (default true)
- slidesToShow: number (default 1) — how many slides visible at once

Notes & Migration

- This is intentionally small and opinionated. It supports basic autoplay, next/prev buttons, keyboard navigation and touch swipes.
- It does not implement the full Owl API (dots, complex responsive rules, lazy load, merges, etc.). For components needing advanced features, migrate them incrementally:

  1. Replace the carousel tag and project slide content into <app-carousel>.
  2. Map OwlOptions to the simpler configuration: loop, autoplay, interval, slidesToShow.
  3. If a component uses advanced features, either reimplement those features in this component or keep that component using the external library until you migrate it.

- To fully remove the `ngx-owl-carousel-o` dependency you will need to replace remaining imports/usages found across the repo (search for `ngx-owl-carousel-o`, `owl-carousel-o`, `OwlOptions`).

Feedback & Improvements

If you'd like I can:

- Add responsive breakpoints mapping (similar to Owl's responsive) so `slidesToShow` changes per viewport width.
- Add dot indicators and a small API (events: slideChange).
- Create a runtime compatibility shim to allow the rest of the codebase to compile while you migrate files.
