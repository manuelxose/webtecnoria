// GROWTH-04 F4 (revisión independiente): el endpoint de diagnóstico SMTP no
// tenía cobertura y transporter.verify() no tenía timeout. Un servidor SMTP que
// acepta la conexión y no responde colgaría la petición del operador.
import assert from "node:assert/strict";
import test from "node:test";

import "./helpers.mjs";

const integrations = await import("../../apps/api/src/routes/v1/integrations.js");

test("F4: the transport probe has a bounded timeout", () => {
  assert.equal(typeof integrations.TRANSPORT_VERIFY_TIMEOUT_MS, "number");
  assert.ok(integrations.TRANSPORT_VERIFY_TIMEOUT_MS > 0, "timeout must be positive");
  assert.ok(
    integrations.TRANSPORT_VERIFY_TIMEOUT_MS <= 15_000,
    "a diagnostic must not hang an operator request for longer than 15s"
  );
});

test("F4: transport error classes are sanitised, never the SMTP text", () => {
  // Una credencial rechazada: sólo la clase puede salir del endpoint.
  assert.equal(integrations.sanitizeTransportClass({ code: "EAUTH" }), "EAUTH");
  assert.equal(integrations.sanitizeTransportClass({ name: "Error" }), "Error");
  assert.equal(integrations.sanitizeTransportClass({}), "UnknownError");
  // Un mensaje con direcciones y detalles del servidor NUNCA es una clase.
  assert.equal(
    integrations.sanitizeTransportClass({
      code: "534-5.7.9 WebLoginRequired user@tecnoriasl.com",
      name: "smtp auth failed for user@tecnoriasl.com",
    }),
    "UnknownError"
  );
  assert.equal(integrations.sanitizeTransportClass({ code: "x".repeat(120) }), "UnknownError");
});

test("F4: the status route is registered behind admin authorisation", () => {
  const routes = [];
  const collect = (stack) => {
    for (const layer of stack ?? []) {
      if (layer.route) {
        routes.push({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods ?? {}),
          handlers: (layer.route.stack ?? []).map((entry) => entry.name),
        });
      } else if (layer.handle?.stack) {
        collect(layer.handle.stack);
      }
    }
  };
  collect(integrations.default.stack);

  const route = routes.find((entry) => entry.path === "/notifications/status");
  assert.ok(route, "the notification status route must exist");
  assert.deepEqual(route.methods, ["get"]);
  assert.ok(
    route.handlers.some((name) => /requireAuth|requireAdmin/.test(name)),
    `route must be guarded; handlers were ${JSON.stringify(route.handlers)}`
  );
});

test("F4: the route never reads a credential value", async () => {
  const source = (await import("node:fs")).readFileSync(
    "apps/api/src/routes/v1/integrations.ts",
    "utf8"
  );

  // El diagnóstico puede NOMBRAR variables que no existen, pero nunca leer el
  // valor de la contraseña: ni process.env.SMTP_PASS ni process.env['SMTP_PASS'].
  assert.doesNotMatch(
    source,
    /process\.env[.[]\s*["'`]?SMTP_PASS/,
    "the SMTP_PASS value must never be read by the diagnostic route"
  );
  assert.doesNotMatch(
    source,
    /process\.env[.[]\s*["'`]?SMTP_USER/,
    "the SMTP_USER value must never be read either"
  );
  // Sí puede comprobar presence por nombre a través de la lista.
  assert.match(source, /const required = \[/, "env presence must be checked by name list");
});
