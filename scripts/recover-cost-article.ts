/**
 * GROWTH-04 / H-12 — operación de recuperación del artículo de coste.
 *
 * Por qué existe: en producción, `blog_posts` tiene una fila con
 * slug = "cuanto-cuesta-desarrollar-software-medida" y content = "sadasda".
 * El componente del artículo carga primero la API, así que esa fila (status
 * publish) gana sobre el contenido editorial estático del repositorio y la URL
 * sirve un cuerpo de 7 caracteres.
 *
 * Decisión de producto (H-12): recuperar una versión editorial verificada.
 * No hay tabla de revisiones en el CMS, así que la versión aprobada y
 * verificable es la que vive en el repositorio
 * (apps/web/src/app/site/content/site-content.ts). Este script la recupera como
 * HTML y sólo escribe en la base de datos con --apply.
 *
 * Reglas que este script cumple y que no puede saltarse:
 *   - Nunca inventa precios ni cifras: el cuerpo es copia literal del repo.
 *   - Sin --apply no toca nada (sólo lectura + informe).
 *   - Con --apply: verifica la autorización, GUARDA la fila actual en un fichero
 *     JSON antes de escribir, escribe dentro de una transacción y vuelve a leer
 *     lo escrito en la misma transacción antes del COMMIT.
 *   - Nunca elimina la fila, nunca cambia el slug, nunca cambia el estado: los
 *     enlaces entrantes y la continuidad de la URL canónica se preservan por
 *     construcción (misma fila, mismo slug, mismo status).
 *
 * Uso:
 *   node --import tsx scripts/recover-cost-article.ts                    # plan
 *   node --import tsx scripts/recover-cost-article.ts --out <dir>        # plan + HTML
 *   node --import tsx scripts/recover-cost-article.ts --apply \
 *        --confirm H-12-RECOVER-CANONICAL-BODY --backup <dir>
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

/** Único slug que esta operación puede tocar. */
export const TARGET_SLUG = "cuanto-cuesta-desarrollar-software-medida";

/** Prefijo del texto de confirmación exigido por --apply. */
export const CONFIRMATION = "H-12-RECOVER-CANONICAL-BODY";

/**
 * Umbral de "cuerpo real". Medido: la fila actual tiene 7 caracteres de texto
 * plano; el cuerpo editorial tiene varios miles. 400 deja un margen enorme
 * contra un falso positivo y ningún falso negativo sobre el contenido real.
 */
export const MIN_BODY_TEXT_CHARS = 400;

export interface ArticleSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface EditorialArticle {
  title: string;
  summary: string;
  sections: ArticleSection[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Texto plano de un fragmento HTML, con el mismo criterio que usa el gate. */
export function plainTextLength(html: string): number {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

/**
 * Renderiza el cuerpo editorial a HTML. Los encabezados llevan id porque el
 * índice del artículo (tableOfContents) enlaza a `#id`; sin id se generarían
 * anclas rotas.
 */
export function renderBodyHtml(article: EditorialArticle): string {
  const parts: string[] = [];

  for (const [index, section] of article.sections.entries()) {
    const id = `${index + 1}-${section.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}`;

    parts.push(`<section class="article-section" id="${escapeHtml(id)}">`);
    parts.push(`<h2>${escapeHtml(section.title)}</h2>`);
    for (const paragraph of section.paragraphs) {
      parts.push(`<p>${escapeHtml(paragraph)}</p>`);
    }
    if (section.bullets && section.bullets.length > 0) {
      parts.push('<ul class="plain-list plain-list--article">');
      for (const bullet of section.bullets) {
        parts.push(`<li>${escapeHtml(bullet)}</li>`);
      }
      parts.push("</ul>");
    }
    parts.push("</section>");
  }

  return parts.join("\n");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export interface Plan {
  slug: string;
  editorialSha256: string;
  bodyHtml: string;
  bodyHtmlBytes: number;
  bodyTextChars: number;
  headings: number;
  valid: boolean;
  problems: string[];
}

export function buildPlan(article: EditorialArticle | undefined, slug: string): Plan {
  const problems: string[] = [];

  if (!article) {
    problems.push(`no editorial article found for slug ${slug}`);
    return {
      slug,
      editorialSha256: "",
      bodyHtml: "",
      bodyHtmlBytes: 0,
      bodyTextChars: 0,
      headings: 0,
      valid: false,
      problems,
    };
  }

  if (plainTextLength(article.summary).length < 40) {
    problems.push("editorial summary is too short to be a real article summary");
  }

  const bodyHtml = renderBodyHtml(article);
  const bodyTextChars = plainTextLength(bodyHtml);
  const headings = (bodyHtml.match(/<h2[\s>]/g) ?? []).length;

  if (bodyTextChars < MIN_BODY_TEXT_CHARS) {
    problems.push(`body text length ${bodyTextChars} is below the ${MIN_BODY_TEXT_CHARS} threshold`);
  }
  if (headings !== article.sections.length || headings === 0) {
    problems.push(`expected ${article.sections.length} <h2> headings, found ${headings}`);
  }
  // Un precio inventado sería inaceptable: el cuerpo recuperado no debe contener
  // cifras monetarias, porque ni el repositorio ni ninguna fuente medida las tiene.
  if (/\d[\d.,]*\s?(€|eur\b|euros?\b)/i.test(bodyHtml.replace(/<[^>]+>/g, " "))) {
    problems.push("recovered body contains a monetary amount; refusing to publish an unverified price");
  }

  return {
    slug,
    editorialSha256: sha256(JSON.stringify(article)),
    bodyHtml,
    bodyHtmlBytes: Buffer.byteLength(bodyHtml, "utf8"),
    bodyTextChars,
    headings,
    valid: problems.length === 0,
    problems,
  };
}

function parseArgs(argv: string[]): { apply: boolean; out?: string; backup?: string; confirm?: string } {
  const valueOf = (flag: string): string | undefined => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };

  return {
    apply: argv.includes("--apply"),
    out: valueOf("--out"),
    backup: valueOf("--backup"),
    confirm: valueOf("--confirm"),
  };
}

interface CurrentRow {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: string;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

function describeRow(row: CurrentRow | undefined) {
  if (!row) {
    return { present: false };
  }

  return {
    present: true,
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    publishedAt: row.published_at,
    contentSha256: sha256(row.content ?? ""),
    contentBytes: Buffer.byteLength(row.content ?? "", "utf8"),
    contentTextChars: plainTextLength(row.content ?? ""),
    alreadyRecovered: plainTextLength(row.content ?? "") >= MIN_BODY_TEXT_CHARS,
  };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  // Carga de módulos con efectos (env + pool) sólo cuando se ejecuta, para que
  // los tests puedan importar las funciones puras de este fichero.
  const { articles } = await import("../apps/web/src/app/site/content/site-content");
  const article = (articles as unknown as Array<EditorialArticle & { slug: string }>).find(
    (item) => item.slug === TARGET_SLUG
  );

  const plan = buildPlan(article, TARGET_SLUG);
  console.log(
    JSON.stringify(
      {
        event: "h12_plan",
        slug: plan.slug,
        valid: plan.valid,
        problems: plan.problems,
        editorialSha256: plan.editorialSha256,
        bodyHtmlBytes: plan.bodyHtmlBytes,
        bodyTextChars: plan.bodyTextChars,
        headings: plan.headings,
        mode: options.apply ? "apply" : "plan",
      },
      null,
      2
    )
  );

  if (!plan.valid) {
    console.error("h12: plan invalid, nothing was read from or written to the database");
    process.exitCode = 1;
    return;
  }

  if (options.out) {
    mkdirSync(options.out, { recursive: true });
    const htmlPath = join(options.out, `h12-${TARGET_SLUG}.html`);
    writeFileSync(htmlPath, plan.bodyHtml, "utf8");
    console.log(`h12: wrote ${htmlPath} (${plan.bodyHtmlBytes} bytes, sha256 ${sha256(plan.bodyHtml)})`);
  }

  const { pool } = await import("../apps/api/src/db/pool");
  try {
    if (!options.apply) {
      const current = await pool.query<CurrentRow>(
        "SELECT id, slug, title, content, status, published_at, seo_title, seo_description FROM blog_posts WHERE slug = $1",
        [TARGET_SLUG]
      );
      console.log(JSON.stringify({ event: "h12_current_row", row: describeRow(current.rows[0]) }, null, 2));
      return;
    }

    // ---- escritura: autorización explícita primero ----
    if (options.confirm !== CONFIRMATION) {
      console.error(`h12: --apply requires --confirm ${CONFIRMATION}`);
      process.exitCode = 1;
      return;
    }
    if (!options.backup) {
      console.error("h12: --apply requires --backup <dir> (where the current row is preserved)");
      process.exitCode = 1;
      return;
    }

    const backupDir = resolve(options.backup);
    if (!existsSync(backupDir)) {
      console.error(`h12: backup directory does not exist: ${backupDir}`);
      process.exitCode = 1;
      return;
    }

    const client = await (pool as unknown as {
      connect: () => Promise<{
        query: <T>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
        release: () => void;
      }>;
    }).connect();

    try {
      await client.query("BEGIN");

      const currentResult = await client.query<CurrentRow>(
        "SELECT id, slug, title, content, status, published_at, seo_title, seo_description FROM blog_posts WHERE slug = $1 FOR UPDATE",
        [TARGET_SLUG]
      );
      const current = currentResult.rows[0];
      if (!current) {
        await client.query("ROLLBACK");
        console.error(`h12: no row with slug ${TARGET_SLUG}; nothing to recover`);
        process.exitCode = 1;
        return;
      }

      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = join(backupDir, `blog_posts-${TARGET_SLUG}-${stamp}.json`);
      writeFileSync(
        backupPath,
        JSON.stringify(
          {
            capturedAt: new Date().toISOString(),
            table: "blog_posts",
            operation: "H-12 recover canonical editorial body",
            row: current,
            rowSha256: sha256(JSON.stringify(current)),
          },
          null,
          2
        ),
        "utf8"
      );
      console.log(`h12: current row preserved at ${backupPath}`);

      const updated = await client.query<CurrentRow>(
        `UPDATE blog_posts
            SET content = $2,
                updated_at = NOW()
          WHERE id = $1
            AND slug = $3
        RETURNING id, slug, title, content, status, published_at, seo_title, seo_description`,
        [current.id, plan.bodyHtml, TARGET_SLUG]
      );

      const row = updated.rows[0];
      if (!row) {
        await client.query("ROLLBACK");
        console.error("h12: UPDATE matched no row; rolled back");
        process.exitCode = 1;
        return;
      }

      // Validación DENTRO de la transacción: si lo escrito no es lo esperado,
      // no hay COMMIT y la base queda exactamente como estaba.
      const written = plainTextLength(row.content);
      const slugUnchanged = row.slug === TARGET_SLUG;
      const statusUnchanged = row.status === current.status;
      const canonicalText = row.content === plan.bodyHtml;
      if (written < MIN_BODY_TEXT_CHARS || !slugUnchanged || !statusUnchanged || !canonicalText) {
        await client.query("ROLLBACK");
        console.error(
          `h12: post-write validation failed (text=${written} slug=${slugUnchanged} status=${statusUnchanged} body=${canonicalText}); rolled back`
        );
        process.exitCode = 1;
        return;
      }

      await client.query("COMMIT");

      console.log(
        JSON.stringify(
          {
            event: "h12_applied",
            id: row.id,
            slug: row.slug,
            status: row.status,
            contentType: "text/html",
            textChars: written,
            bodySha256: sha256(row.content),
            backupPath,
          },
          null,
          2
        )
      );
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await pool.end().catch(() => undefined);
  }
}

const isDirectRun = process.argv[1]
  ? import.meta.url === new URL(`file:///${process.argv[1].replace(/\\/g, "/").replace(/^\//, "")}`).href
  : false;

if (isDirectRun) {
  main().catch((error: unknown) => {
    console.error(`h12: failed (${error instanceof Error ? error.name : "UnknownError"})`);
    process.exitCode = 1;
  });
}
