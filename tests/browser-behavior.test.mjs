import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  STORAGE_KEY,
  applyPreferenceControls,
  findPreferenceControls,
  parseStoredPreferences,
  preferencesFromControls,
  readPreferences,
  resolveInitialPreferences,
  writePreferences
} from "../src/browser/preferences.ts";
import {
  initializeNavigation,
  isAnchorActivationTarget,
  setNavigationOpen,
  shouldCloseForEscape
} from "../src/browser/navigation.ts";
import { translateDynamic, translateText } from "../src/browser/translations.ts";

const root = fileURLToPath(new URL("..", import.meta.url));

function controls() {
  return {
    language: { value: "en" },
    dark: { checked: true },
    light: { checked: false },
    reading: { checked: true },
    text: { checked: false },
    motion: { checked: true }
  };
}

test("stored preference parsing preserves valid finite values and rejects invalid ones", () => {
  assert.deepEqual(parseStoredPreferences(null), {});
  assert.deepEqual(parseStoredPreferences("not json"), {});
  assert.deepEqual(parseStoredPreferences("[]"), {});
  assert.deepEqual(
    parseStoredPreferences(JSON.stringify({
      language: "es",
      theme: "light",
      reading: false,
      text: true,
      motion: false,
      motionExplicit: true,
      ignored: "value"
    })),
    {
      language: "es",
      theme: "light",
      reading: false,
      text: true,
      motion: false,
      motionExplicit: true
    }
  );
  assert.deepEqual(
    parseStoredPreferences(JSON.stringify({
      language: "fr",
      theme: "system",
      reading: "yes",
      text: 1,
      motion: null,
      motionExplicit: "true"
    })),
    {}
  );
});

test("defaults and legacy motion compatibility remain stable", () => {
  assert.deepEqual(resolveInitialPreferences({}, "en-US"), {
    language: "en",
    theme: "dark",
    reading: true,
    text: false,
    motion: true,
    motionExplicit: false
  });
  assert.equal(resolveInitialPreferences({}, "es-MX").language, "es");

  const legacyFalse = resolveInitialPreferences({ motion: false }, "en");
  assert.equal(legacyFalse.motion, true);
  assert.equal(legacyFalse.motionExplicit, false);

  const legacyTrue = resolveInitialPreferences({ motion: true }, "en");
  assert.equal(legacyTrue.motion, true);
  assert.equal(legacyTrue.motionExplicit, true);

  const explicitPause = resolveInitialPreferences({ motion: false, motionExplicit: true }, "en");
  assert.equal(explicitPause.motion, false);
  assert.equal(explicitPause.motionExplicit, true);
});

test("storage keeps the existing key and fails safely when unavailable", () => {
  const writes = [];
  const storage = {
    value: JSON.stringify({ language: "es", theme: "light" }),
    getItem(key) {
      assert.equal(key, STORAGE_KEY);
      return this.value;
    },
    setItem(key, value) {
      writes.push([key, value]);
    }
  };

  assert.deepEqual(readPreferences(storage), { language: "es", theme: "light" });
  const state = resolveInitialPreferences(readPreferences(storage), "en");
  assert.equal(writePreferences(storage, state), true);
  assert.equal(writes.length, 1);
  assert.equal(writes[0][0], "wizardgang.preferences.v1");
  assert.deepEqual(JSON.parse(writes[0][1]), state);

  assert.deepEqual(readPreferences({ getItem() { throw new Error("blocked"); } }), {});
  assert.equal(writePreferences({ setItem() { throw new Error("blocked"); } }, state), false);
  assert.deepEqual(readPreferences(null), {});
  assert.equal(writePreferences(null, state), false);
});

test("typed controls preserve theme, readable layout, text size, motion, and language state", () => {
  const target = controls();
  const state = {
    language: "es",
    theme: "light",
    reading: false,
    text: true,
    motion: false,
    motionExplicit: true
  };
  applyPreferenceControls(target, state);
  assert.deepEqual(target, {
    language: { value: "es" },
    dark: { checked: false },
    light: { checked: true },
    reading: { checked: false },
    text: { checked: true },
    motion: { checked: false }
  });
  assert.deepEqual(preferencesFromControls(target, true), state);
});

test("missing preference controls fail closed without throwing", () => {
  const root = { querySelector() { return null; } };
  assert.equal(findPreferenceControls(root), null);
});

test("language translation preserves exact and dynamic current behavior", () => {
  assert.equal(translateDynamic("Projects"), "Proyectos");
  assert.equal(translateDynamic("Software"), "Software");
  assert.equal(translateDynamic("Solutions"), "Soluciones");
  assert.equal(translateDynamic("Build software."), "Construye software.");
  assert.equal(translateDynamic("Company & team"), "Empresa y equipo");
  assert.equal(translateDynamic("Company"), "Empresa");
  assert.equal(translateDynamic("Team"), "Equipo");
  assert.equal(translateDynamic("About section"), "Sección Acerca de");
  assert.equal(translateDynamic("Professional systems and integration experience remains attributed in Jacob's Team record."), "La experiencia profesional en sistemas e integraciones sigue atribuida en el registro de Equipo de Jacob.");
  assert.equal(translateDynamic("Warehouse & Fulfillment"), "Almacén y cumplimiento");
  assert.equal(translateDynamic("Play SharkTank"), "Jugar a SharkTank");
  assert.equal(translateDynamic("Read the Hexframe case study"), "Leer el caso de estudio de Hexframe");
  assert.equal(translateDynamic("Visit WizardGang on GitHub"), "Visitar WizardGang en GitHub");
  // An exact entry wins over a pattern that would also match it.
  assert.equal(translateDynamic("Play previews"), "Reproducir vistas previas");
  assert.equal(translateDynamic("404 / Route not found"), "404 / Ruta no encontrada");
  assert.equal(translateText("  Projects  ", "es"), "  Proyectos  ");
  assert.equal(translateText("Projects", "en"), "Projects");
  assert.equal(translateText(null, "es"), null);
});

test("navigation helpers preserve button state, link-close and Escape semantics", () => {
  const attributes = new Map([["aria-expanded", "true"]]);
  const toggle = {
    hidden: true,
    setAttribute(name, value) { attributes.set(name, value); },
    getAttribute(name) { return attributes.get(name) ?? null; },
    focus() {}
  };
  const mobileNav = { hidden: false };

  setNavigationOpen(toggle, mobileNav, false);
  assert.equal(attributes.get("aria-expanded"), "false");
  assert.equal(mobileNav.hidden, true);

  setNavigationOpen(toggle, mobileNav, true);
  assert.equal(attributes.get("aria-expanded"), "true");
  assert.equal(mobileNav.hidden, false);

  assert.equal(shouldCloseForEscape("Escape", true), true);
  assert.equal(shouldCloseForEscape("Enter", true), false);
  assert.equal(shouldCloseForEscape("Escape", false), false);
  assert.equal(isAnchorActivationTarget({ closest: (selector) => selector === "a" ? {} : null }), true);
  assert.equal(isAnchorActivationTarget({ closest: () => null }), false);
  assert.equal(isAnchorActivationTarget(null), false);
});

test("navigation enhancement initialization is optional when shell markup is absent", () => {
  assert.equal(initializeNavigation({ querySelector() { return null; } }, undefined), false);
});

test("navigation enhancement upgrades the visible no-JavaScript fallback to a button-controlled menu", () => {
  const toggleListeners = new Map();
  const mobileListeners = new Map();
  const documentListeners = new Map();
  const attributes = new Map([["aria-expanded", "false"]]);
  let focusCount = 0;

  const toggle = {
    hidden: true,
    setAttribute(name, value) { attributes.set(name, value); },
    getAttribute(name) { return attributes.get(name) ?? null; },
    addEventListener(type, listener) { toggleListeners.set(type, listener); },
    focus() { focusCount += 1; }
  };
  const mobileNav = {
    hidden: false,
    addEventListener(type, listener) { mobileListeners.set(type, listener); }
  };
  const disclosure = {
    querySelector(selector) {
      if (selector === ".nav-toggle") return toggle;
      if (selector === ".site-nav-mobile") return mobileNav;
      return null;
    }
  };
  const documentRoot = {
    querySelector(selector) { return selector === ".nav-disclosure" ? disclosure : null; },
    addEventListener(type, listener) { documentListeners.set(type, listener); }
  };

  assert.equal(initializeNavigation(documentRoot, undefined), true);
  assert.equal(toggle.hidden, false, "enhancement reveals the real menu button");
  assert.equal(attributes.get("aria-expanded"), "false");
  assert.equal(mobileNav.hidden, true, "enhancement collapses the duplicate mobile links initially");
  assert.equal(typeof toggleListeners.get("click"), "function");
  assert.equal(typeof mobileListeners.get("click"), "function");
  assert.equal(typeof documentListeners.get("keydown"), "function");

  toggleListeners.get("click")();
  assert.equal(attributes.get("aria-expanded"), "true");
  assert.equal(mobileNav.hidden, false);

  documentListeners.get("keydown")({ key: "Escape" });
  assert.equal(attributes.get("aria-expanded"), "false");
  assert.equal(mobileNav.hidden, true);
  assert.equal(focusCount, 1, "Escape returns focus to the menu button");

  toggleListeners.get("click")();
  mobileListeners.get("click")({ target: { closest: (selector) => selector === "a" ? {} : null } });
  assert.equal(attributes.get("aria-expanded"), "false");
  assert.equal(mobileNav.hidden, true);
});

test("reduced motion remains the CSS accessibility boundary and overrides preview animation", async () => {
  const styles = await readFile(resolve(root, "src/styles/globals.css"), "utf8");
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  const reduced = styles.slice(styles.lastIndexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(reduced, /\.tank-fish[\s\S]*animation:\s*none/);
  assert.match(reduced, /\.lab-playhead[\s\S]*animation:\s*none/);
});
