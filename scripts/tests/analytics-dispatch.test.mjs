// generate_lead dispatch — unit tests (node:test).
//
// Runs the real pure module used by AnalyticsService with a fake gtag dataLayer
// and models the exact six scenarios the milestone requires, then scans the
// serialized payload for personal data.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  LEAD_EVENT_NAME,
  LEAD_PARAM_KEYS,
  allowlistedSourcePage,
  buildLeadEvent,
  canDispatchLead,
  canStartSubmission,
  createIdempotencyKey,
  dispatchGenerateLead,
  serviceCategoryFor,
} from "../../apps/web/src/app/site/services/analytics-events.ts";
import { PUBLIC_PATHS } from "../../apps/web/src/app/site/seo-route-manifest.ts";

/**
 * Records gtag command calls the way the real gtag function would: the spy is
 * the delivery path under test, so asserting on it proves the event was handed
 * to gtag instead of merely parked in an array.
 */
function gtagSpy() {
  const calls = [];
  const fn = (...args) => {
    calls.push(args);
    return undefined;
  };
  fn.calls = calls;
  return fn;
}

const LEAD_INPUT = {
  formType: "contact",
  serviceCategory: "software-a-medida",
  sourcePage: "/contacto",
};

const FORM_VALUES = {
  name: "Ana María Pérez",
  email: "ana.perez@acme-example.com",
  phone: "+34 600 123 456",
  company: "ACME Robotics SL",
  message: "Necesitamos integrar el CRM con el ERP antes de enero, sin romper la operativa diaria.",
  timeline: "Cuanto antes",
};

/**
 * Models the component pipeline with the real helpers:
 * validate → guard → request → (only on success) consent-gated dispatch.
 */
function runSubmission({ invalid, inFlight, httpOk, analyticsGranted, dataLayer, gtag, input }) {
  if (!canStartSubmission({ invalid, inFlight })) {
    return { requests: 0, events: 0 };
  }

  if (!httpOk) {
    return { requests: 1, events: 0 };
  }

  const dispatched = dispatchGenerateLead({
    gtag,
    dataLayer,
    analyticsGranted,
    runtimeLoaded: true,
    input,
    allowedPaths: PUBLIC_PATHS,
  });

  return { requests: 1, events: dispatched ? 1 : 0 };
}

test("event names and allowed parameter keys are locked", () => {
  const event = buildLeadEvent(LEAD_INPUT, PUBLIC_PATHS);

  assert.equal(event.name, LEAD_EVENT_NAME);
  assert.equal(event.name, "generate_lead");
  assert.deepEqual(Object.keys(event.params).sort(), [...LEAD_PARAM_KEYS].sort());
  assert.deepEqual(event.params, {
    form_type: "contact",
    service_category: "software-a-medida",
    source_page: "/contacto",
  });
});

test("free text is never accepted as a parameter value", () => {
  const event = buildLeadEvent({
    formType: "contact",
    serviceCategory: FORM_VALUES.message,
    sourcePage: "/contacto",
  }, PUBLIC_PATHS);

  assert.equal(event.params.service_category, "other");
  assert.ok(!JSON.stringify(event.params).includes("CRM"));
});

test("scenario 1 — validation failure sends nothing", () => {
  const dataLayer = [];
  const result = runSubmission({
    invalid: true,
    inFlight: false,
    httpOk: true,
    analyticsGranted: true,
    dataLayer,
    input: LEAD_INPUT,
  });

  assert.deepEqual(result, { requests: 0, events: 0 });
  assert.equal(dataLayer.length, 0);
});

test("scenario 2 — HTTP error sends no event", () => {
  const dataLayer = [];
  const result = runSubmission({
    invalid: false,
    inFlight: false,
    httpOk: false,
    analyticsGranted: true,
    dataLayer,
    input: LEAD_INPUT,
  });

  assert.deepEqual(result, { requests: 1, events: 0 });
  assert.equal(dataLayer.length, 0);
});

test("scenario 3 — success with consent dispatches exactly one event through gtag", () => {
  const dataLayer = [];
  const gtag = gtagSpy();
  const result = runSubmission({
    invalid: false,
    inFlight: false,
    httpOk: true,
    analyticsGranted: true,
    dataLayer,
    gtag,
    input: LEAD_INPUT,
  });

  assert.deepEqual(result, { requests: 1, events: 1 });
  assert.equal(gtag.calls.length, 1, "gtag must be called exactly once");
  assert.deepEqual(gtag.calls[0], [
    "event",
    "generate_lead",
    buildLeadEvent(LEAD_INPUT, PUBLIC_PATHS).params,
  ]);
  assert.equal(
    dataLayer.some((entry) => Array.isArray(entry)),
    false,
    "no bare Array may be pushed: gtag only interprets commands handed to gtag()"
  );
});

test("scenario 4 — success without consent dispatches no event", () => {
  const dataLayer = [];
  const result = runSubmission({
    invalid: false,
    inFlight: false,
    httpOk: true,
    analyticsGranted: false,
    dataLayer,
    input: LEAD_INPUT,
  });

  assert.deepEqual(result, { requests: 1, events: 0 });
  assert.equal(dataLayer.length, 0);
});

test("scenario 5 — rapid double submit sends one request and one event", () => {
  const dataLayer = [];
  const gtag = gtagSpy();

  const first = runSubmission({
    invalid: false,
    inFlight: false,
    httpOk: true,
    analyticsGranted: true,
    dataLayer,
    gtag,
    input: LEAD_INPUT,
  });
  const second = runSubmission({
    invalid: false,
    inFlight: true,
    httpOk: true,
    analyticsGranted: true,
    dataLayer,
    gtag,
    input: LEAD_INPUT,
  });

  assert.deepEqual(first, { requests: 1, events: 1 });
  assert.deepEqual(second, { requests: 0, events: 0 });
  assert.equal(gtag.calls.length, 1);
});

test("scenario 6 — gtag runtime not loaded means no event", () => {
  const dataLayer = [];
  const gtag = gtagSpy();

  assert.equal(
    canDispatchLead({ analyticsGranted: true, runtimeLoaded: false }),
    false
  );
  assert.equal(
    dispatchGenerateLead({
      gtag,
      dataLayer,
      analyticsGranted: true,
      runtimeLoaded: false,
      input: LEAD_INPUT,
    }),
    false
  );
  assert.equal(gtag.calls.length, 0);
  assert.equal(dataLayer.length, 0);
});

test("fallback: with no gtag function the event uses the documented object form", () => {
  const dataLayer = [];
  const dispatched = dispatchGenerateLead({
    gtag: undefined,
    dataLayer,
    analyticsGranted: true,
    runtimeLoaded: true,
    input: LEAD_INPUT,
    allowedPaths: PUBLIC_PATHS,
  });

  assert.equal(dispatched, true);
  assert.equal(dataLayer.length, 1);
  const entry = dataLayer[0];
  assert.equal(Array.isArray(entry), false, "the fallback must not be a bare Array");
  assert.equal(entry.event, "generate_lead");
  assert.equal(entry.source_page, "/contacto");
  assert.equal(entry.form_type, "contact");
});

test("fallback: with neither gtag nor dataLayer nothing claims to be sent", () => {
  assert.equal(
    dispatchGenerateLead({
      gtag: null,
      dataLayer: undefined,
      analyticsGranted: true,
      runtimeLoaded: true,
      input: LEAD_INPUT,
    }),
    false
  );
});

test("F-10: source_page is enumerated against the public route allow-list", () => {
  assert.equal(allowlistedSourcePage("/contacto", PUBLIC_PATHS), "/contacto");
  assert.equal(allowlistedSourcePage("/servicios", PUBLIC_PATHS), "/servicios");
  assert.equal(allowlistedSourcePage("/", PUBLIC_PATHS), "/");
  assert.equal(allowlistedSourcePage("/contacto?utm=x", PUBLIC_PATHS), "/contacto");

  for (const hostile of [
    "/admin/clientes/juan.perez@example.com",
    "/cliente/ana-maria-perez",
    "javascript:alert(1)",
    "https://evil.example/x",
    "",
    "/blog/not-a-real-post",
  ]) {
    assert.equal(allowlistedSourcePage(hostile, PUBLIC_PATHS), "/", `${hostile} must collapse to "/"`);
  }

  const event = buildLeadEvent({
    formType: "contact",
    serviceCategory: "other",
    sourcePage: "/cliente/ana-maria-perez",
  });
  assert.equal(event.params.source_page, "/");
  assert.equal(JSON.stringify(event.params).includes("ana-maria"), false);
});

test("payload carries no personal data from the submitted form", () => {
  const gtag = gtagSpy();

  dispatchGenerateLead({
    gtag,
    dataLayer: [],
    analyticsGranted: true,
    runtimeLoaded: true,
    input: {
      formType: "contact",
      serviceCategory: serviceCategoryFor("Software a medida"),
      sourcePage: "/contacto",
    },
  });

  const serialized = JSON.stringify(gtag.calls);
  for (const [field, value] of Object.entries(FORM_VALUES)) {
    assert.equal(
      serialized.includes(value),
      false,
      `${field} leaked into the generate_lead payload`
    );
  }
  for (const token of ["@", "600 123", "ACME", "Ana María"]) {
    assert.equal(serialized.includes(token), false, `${token} leaked into the payload`);
  }
});

test("service categories are a closed, non-free-text set", () => {
  assert.equal(serviceCategoryFor("Software a medida"), "software-a-medida");
  assert.equal(serviceCategoryFor("Consultoría tecnológica"), "consultoria-tecnologica");
  assert.equal(serviceCategoryFor("algo inventado"), "other");
  assert.equal(serviceCategoryFor(""), "other");
});

test("idempotency keys are unique per generation", () => {
  const seen = new Set();
  for (let index = 0; index < 50; index += 1) {
    const key = createIdempotencyKey();
    assert.match(key, /^lead-[a-z0-9]+-[a-z0-9]{6}$/);
    assert.equal(seen.has(key), false);
    seen.add(key);
  }
});

test("contact form wires the consent gate, honeypot and idempotency contract", () => {
  const source = readFileSync(
    fileURLToPath(
      new URL("../../apps/web/src/app/site/components/contact-form.component.ts", import.meta.url)
    ),
    "utf8"
  );
  const template = readFileSync(
    fileURLToPath(
      new URL("../../apps/web/src/app/site/components/contact-form.component.html", import.meta.url)
    ),
    "utf8"
  );

  assert.match(source, /canStartSubmission\(/);
  assert.match(source, /this\.analytics\.trackLead\(/);
  assert.match(source, /idempotencyKey: this\.idempotencyKey/);
  assert.match(source, /privacyAccepted: true/);
  assert.match(source, /sourcePage,/);
  assert.match(source, /_hp: String\(this\.contactForm\.value\._hp/);
  assert.match(template, /id="_hp"/);
  assert.match(template, /formControlName="_hp"/);
  assert.match(template, /autocomplete="off"/);
  assert.match(template, /tabindex="-1"/);
  assert.doesNotMatch(template, /_hp[^>]*required/);

  // trackLead must run after the awaited repository call, never before.
  const awaitIndex = source.indexOf("await this.contactRepository.submitLead");
  const trackIndex = source.indexOf("this.analytics.trackLead(");
  assert.ok(awaitIndex > 0 && trackIndex > awaitIndex, "trackLead must follow the API call");
});
