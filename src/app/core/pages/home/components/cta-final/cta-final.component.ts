import { Component } from "@angular/core";

@Component({
  selector: "app-cta-final",
  template: `
    <div
      class="cta-final"
      role="complementary"
      aria-label="Llamada a la acción"
    >
      <a
        href="tel:+34682047802"
        class="cta-final__button"
        aria-label="Llamar a TecnoRia"
      >
        <svg
          class="cta-final__icon"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
          />
        </svg>
        <span class="cta-final__text">
          <strong>682 04 78 02</strong>
          <small>Llámanos ahora</small>
        </span>
      </a>
    </div>
  `,
  styles: [
    `
      .cta-final {
        position: fixed;
        bottom: var(--space-6);
        right: var(--space-6);
        z-index: var(--z-sticky);
        animation: slideInUp 0.5s var(--ease-out);
      }

      .cta-final__button {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-4) var(--space-6);
        background: var(--gradient-secondary);
        color: var(--color-white);
        border-radius: var(--border-radius-full);
        box-shadow: var(--shadow-2xl);
        text-decoration: none;
        transition: all var(--transition-base) var(--ease-out);
      }

      .cta-final__button:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 60px rgba(102, 126, 234, 0.5);
      }

      .cta-final__icon {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        animation: pulse 2s infinite;
      }

      .cta-final__text {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .cta-final__text strong {
        font-size: var(--text-lg);
        font-weight: var(--font-bold);
      }

      .cta-final__text small {
        font-size: var(--text-xs);
        opacity: 0.9;
      }

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(100px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }

      @media (max-width: 767px) {
        .cta-final {
          bottom: var(--space-4);
          right: var(--space-4);
        }

        .cta-final__text small {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .cta-final {
          animation: none;
        }
        .cta-final__icon {
          animation: none;
        }
      }
    `,
  ],
})
export class CtaFinalComponent {}
