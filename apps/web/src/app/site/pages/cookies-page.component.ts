import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SITE_EMAIL } from "../content/site-content";
import { SeoService } from "../services/seo.service";

/**
 * Cookie policy — truthfully describes the current implementation.
 *
 * PENDING CONTROLLER/COUNSEL APPROVAL: identity, contact details, retention
 * periods, legal bases and the processor/transfer descriptions must be
 * reviewed and approved by the controller or its counsel. This page does not
 * assert legal compliance and must not be treated as approved legal copy.
 */
@Component({
  selector: "app-cookies-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [
    `
      .table-scroll {
        overflow-x: auto;
        margin: 14px 0;
      }

      .article-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.92rem;
      }

      .article-table th,
      .article-table td {
        padding: 10px 12px;
        border-bottom: 1px solid var(--line);
        text-align: left;
        vertical-align: top;
      }

      .article-table thead th {
        font-family: var(--font-heading);
        font-size: 0.78rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--ink-muted);
      }

      .article-list {
        margin: 0 0 0 18px;
        padding: 0;
      }

      .article-list li {
        margin-bottom: 8px;
        color: var(--ink-soft);
      }

      code {
        font-size: 0.88em;
      }
    `,
  ],
  template: `
    <!-- PENDING CONTROLLER/COUNSEL APPROVAL -->
    <section class="page-hero section">
      <div class="site-container page-hero__inner">
        <span class="eyebrow">Cookies</span>
        <h1>Política de cookies</h1>
        <p class="lead">
          Qué almacenamos en tu navegador, para qué sirve y cómo puedes aceptar,
          rechazar o retirar tu consentimiento en cualquier momento.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="site-container article-layout">
        <article class="article-content surface-card">
          <section class="article-section">
            <h2>Responsable del tratamiento</h2>
            <!-- PENDING CONTROLLER/COUNSEL APPROVAL: razón social, NIF y dirección -->
            <p>
              TecnoRia (identificación completa y datos de contacto pendientes de
              aprobación por el responsable del tratamiento). Para cualquier
              consulta sobre esta política puedes escribir a
              <a [href]="'mailto:' + email">{{ email }}</a>.
            </p>
          </section>

          <section class="article-section">
            <h2>Qué cookies usamos</h2>
            <p>
              Solo instalamos cookies opcionales después de que las aceptes. Hasta
              que tomas una decisión no se carga ningún servicio de analítica ni
              de publicidad.
            </p>

            <div class="table-scroll">
              <table class="article-table">
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Titular</th>
                    <th scope="col">Finalidad</th>
                    <th scope="col">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row"><code>tecnoria_session</code></th>
                    <td>TecnoRia</td>
                    <td>
                      Mantener la sesión iniciada en el área privada. Es una cookie
                      técnica, imprescindible para ese servicio, y solo se crea al
                      iniciar sesión.
                    </td>
                    <td>8 horas</td>
                  </tr>
                  <tr>
                    <th scope="row"><code>_ga</code></th>
                    <td>Google Analytics</td>
                    <td>
                      Distinguir usuarios en las estadísticas de visitas. Solo se
                      instala si aceptas la categoría «Analítica».
                    </td>
                    <td>2 años</td>
                  </tr>
                  <tr>
                    <th scope="row"><code>_ga_LE6ETPWL23</code></th>
                    <td>Google Analytics</td>
                    <td>
                      Mantener el estado de la sesión de medición. Solo se instala
                      si aceptas la categoría «Analítica».
                    </td>
                    <td>2 años</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              En este momento <strong>no se usan cookies publicitarias</strong> y la
              web no tiene ninguna categoría de publicidad: el aviso de cookies solo
              te permite decidir sobre analítica. Las señales publicitarias de Google
              (ad_storage, ad_user_data, ad_personalization) permanecen siempre
              denegadas.
            </p>
          </section>

          <section class="article-section">
            <h2>Servicios de terceros que intervienen</h2>
            <ul class="article-list">
              <li>
                <strong>Google Analytics (Google Ireland Limited).</strong> Medición
                agregada de visitas. No se contacta con Google ni se instala ninguna
                cookie analítica antes de tu consentimiento.
              </li>
              <li>
                <strong>Cloudflare.</strong> Protege y sirve el sitio. Inyecta un
                script propio desde <code>/cdn-cgi/</code> que ofusca las direcciones
                de correo para evitar spam. No lo controlamos desde el código del
                sitio.
              </li>
              <li>
                <strong>Talkaris (widget de chat).</strong> El script del widget
                (<code>talkaris.com/widget/embed.js</code>) y su iframe se solicitan
                al dominio <code>talkaris.com</code> <strong>al cargar la página</strong>,
                antes de cualquier interacción y con independencia de tu decisión
                sobre cookies; el iframe pide además la configuración del widget
                (<code>/api/v1/widget/config/…</code>). Es un comportamiento anterior
                a este aviso y no depende del consentimiento: hoy no está bloqueado
                por la elección de cookies. El widget no instala cookies propias en
                <code>tecnoriasl.com</code>.
              </li>
              <li>
                <strong>Google Identity.</strong> Solo en el acceso al área privada,
                si eliges iniciar sesión con Google.
              </li>
            </ul>
            <!-- PENDING CONTROLLER/COUNSEL APPROVAL: encargados, base jurídica y transferencias internacionales -->
          </section>

          <section class="article-section">
            <h2>Cómo aceptar, rechazar o retirar el consentimiento</h2>
            <p>
              Al entrar por primera vez verás un aviso con tres opciones con la misma
              prominencia: <strong>Aceptar</strong>, <strong>Rechazar</strong> y
              <strong>Configurar</strong>. Rechazar no limita el acceso al sitio.
            </p>
            <p>
              Puedes cambiar o retirar tu decisión cuando quieras con el botón
              «Configuración de cookies», disponible de forma permanente en todas las
              páginas (esquina inferior izquierda) y en el pie de página. Al retirar el
              consentimiento se eliminan las cookies analíticas y se deja de enviar
              cualquier medición en esa sesión.
            </p>
            <p class="form-note">
              El registro de tu decisión se guarda en tu navegador
              (<code>localStorage</code>, clave <code>tecnoria.consent.v1</code>) con la
              fecha y la versión del consentimiento.
            </p>
          </section>

          <section class="article-section">
            <h2>Más información y derechos</h2>
            <!-- PENDING CONTROLLER/COUNSEL APPROVAL: plazos de conservación y base jurídica -->
            <p>
              El tratamiento de los datos que nos envías a través del formulario se
              describe en la
              <a routerLink="/politica-de-privacidad">política de privacidad</a>. Puedes
              ejercer tus derechos escribiendo a
              <a [href]="'mailto:' + email">{{ email }}</a> y también reclamar ante la
              Agencia Española de Protección de Datos.
            </p>
          </section>
        </article>
      </div>
    </section>
  `,
})
export class CookiesPageComponent implements OnInit {
  email = SITE_EMAIL;

  constructor(private readonly seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update({
      title: "Política de cookies",
      description:
        "Cookies y almacenamiento que usa tecnoriasl.com, finalidad de cada una y cómo aceptar, rechazar o retirar el consentimiento.",
      path: "/politica-de-cookies",
      schemas: [
        this.seo.createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Política de cookies", path: "/politica-de-cookies" },
        ]),
      ],
    });
  }
}
