import type { LanguagePreference } from "./preferences";

export const SPANISH_TRANSLATIONS = new Map<string, string>([
    ["Skip to main content", "Saltar al contenido principal"],
    ["Projects", "Proyectos"],
    ["About", "Acerca de"],
    ["Company", "Empresa"],
    ["Team", "Equipo"],
    ["About section", "Sección Acerca de"],
    ["WizardGang · Software, systems & integrations", "WizardGang · Software, sistemas e integraciones"],
    ["Software", "Software"],
    ["Solutions", "Soluciones"],
    ["Build software.", "Construye software."],
    ["Company & team", "Empresa y equipo"],
    ["Warehouse & Fulfillment", "Almacén y cumplimiento"],
    ["Logistics", "Logística"],
    ["Justice & Court Systems", "Sistemas judiciales y de tribunales"],
    ["Public-Sector Workflows", "Flujos del sector público"],
    ["Enterprise & AI Infrastructure", "Infraestructura empresarial y de IA"],
    ["Professional systems and integration experience remains attributed in Jacob's Team record.", "La experiencia profesional en sistemas e integraciones sigue atribuida en el registro de Equipo de Jacob."],
    ["Security", "Seguridad"],
    ["Accessibility", "Accesibilidad"],
    ["Menu", "Menú"],
    ["Preferences", "Preferencias"],
    ["Language", "Idioma"],
    ["English", "Inglés"],
    ["Español", "Español"],
    ["Theme", "Tema"],
    ["Dark", "Oscuro"],
    ["Light", "Claro"],
    ["Readable layout", "Diseño legible"],
    ["200% text", "Texto al 200 %"],
    ["Play previews", "Reproducir vistas previas"],
    ["Language, display, and motion preferences", "Preferencias de idioma, visualización y movimiento"],
    ["Previews play by default. Turn this off to pause them; reduced-motion preferences are always respected.", "Las vistas previas se reproducen de forma predeterminada. Desactiva esta opción para pausarlas; las preferencias de movimiento reducido siempre se respetan."],
    ["View project", "Ver proyecto"],
    ["Open live demo", "Abrir demo en vivo"],
    ["View source", "Ver código fuente"],
    ["Explore evidence", "Explorar evidencia"],
    ["Primary capability", "Capacidad principal"],
    ["Live multiplayer operation and governance", "Operación y gobernanza multijugador en vivo"],
    ["Deterministic combat simulation", "Simulación de combate determinista"],
    ["Offline, recoverable media pipeline", "Canalización de medios sin conexión y recuperable"],
    ["Case study", "Caso de estudio"],
    ["Home", "Inicio"],
    ["View projects", "Ver proyectos"],
    ["All projects", "Todos los proyectos"],
    ["LinkedIn", "LinkedIn"],
    ["WizardGang.ai ·", "WizardGang.ai ·"],
    ["Selected projects", "Proyectos seleccionados"],
    ["Browse the projects", "Explorar los proyectos"],
    ["Source on GitHub", "Código en GitHub"],
    ["Industries delivered to, and the work done in each.", "Industrias atendidas y el trabajo realizado en cada una."],
    ["Systems connected in production, and who makes them.", "Sistemas conectados en producción y quién los fabrica."],
    ["Solutions built for the operations that cannot stop: warehouses, courtrooms, and the systems that feed them.", "Soluciones creadas para las operaciones que no pueden detenerse: almacenes, tribunales y los sistemas que las alimentan."],
    ["Capabilities", "Capacidades"],
    ["Points", "Puntos"],
    ["Rank", "Rango"],
    ["Size", "Tamaño"],
    ["Top Sharks", "Mejores tiburones"],
    ["Dash", "Impulso"],
    ["Rocket", "Cohete"],
    ["Hit confirmed", "Golpe confirmado"],
    ["Move timeline / event-derived", "Cronología del movimiento / derivada de eventos"],
    ["Frame", "Cuadro"],
    ["Phase", "Fase"],
    ["Hit", "Golpe"],
    ["Cancel", "Cancelar"],
    ["Format", "Formato"],
    ["All formats", "Todos los formatos"],
    ["Genre", "Género"],
    ["All genres", "Todos los géneros"],
    ["Series", "Series"],
    ["Chapters", "Capítulos"],
    ["6 sample series", "6 series de muestra"],
    ["Search series, title, year", "Buscar serie, título o año"],
    ["Alphabetical", "Alfabético"],
    ["AI-developed multiplayer game", "Juego multijugador desarrollado con IA"],
    ["Deterministic systems", "Sistemas deterministas"],
    ["Portable media pipeline", "Canalización portátil de medios"],
    ["Building practical systems that use artificial intelligence (AI) at the University of Georgia.", "Construyo sistemas prácticos que utilizan inteligencia artificial (IA) en la Universidad de Georgia."],
    ["Led distributed delivery for enterprise warehouse management system (WMS) implementations, integrations, releases, and production support.", "Lideré la entrega distribuida de implementaciones, integraciones, lanzamientos y soporte de producción para sistemas empresariales de gestión de almacenes (WMS)."],
    ["Led .NET case-management delivery, continuous integration and continuous delivery (CI/CD), production support, and migration planning for public-sector systems.", "Lideré la entrega de gestión de casos en .NET, la integración y entrega continuas (CI/CD), el soporte de producción y la planificación de migraciones para sistemas del sector público."],
    ["Run a seasonal short-term rental every year, owning licensing, pricing, bookings, guest service, compliance, and closeout.", "Opero cada año un alquiler estacional de corta duración y soy responsable de licencias, precios, reservas, atención a huéspedes, cumplimiento y cierre."],
    ["Built and supported .NET fulfillment systems, extract-transform-load (ETL) data pipelines, warehouse management system (WMS) integrations, and migrations without planned downtime.", "Construí y mantuve sistemas de cumplimiento en .NET, canalizaciones de extracción, transformación y carga (ETL), integraciones con sistemas de gestión de almacenes (WMS) y migraciones sin tiempo de inactividad planificado."],
    ["AI Engineer", "Ingeniero de IA"],
    ["Consultant / Technical Lead", "Consultor / Líder técnico"],
    ["Lead Developer", "Desarrollador principal"],
    ["Founder / operator", "Fundador / operador"],
    ["Senior Software Engineer", "Ingeniero de software sénior"],
    ["Go deeper", "Profundizar"],
    ["Integrations", "Integraciones"],
    ["Deployments", "Despliegues"],
    ["Approach", "Enfoque"],
    ["Report a problem", "Informar de un problema"],
    ["Open Preferences near the top of any page. You can use the site in English or Spanish, choose a dark or light high-contrast theme, increase text to 200%, apply a readable layout, and play or pause project preview animations. Preferences are saved in this browser. Project previews play by default; pause them with the Play previews control.", "Abre Preferencias cerca de la parte superior de cualquier página. Puedes usar el sitio en inglés o español, elegir un tema oscuro o claro de alto contraste, aumentar el texto al 200 %, aplicar un diseño legible y reproducir o pausar las animaciones de vista previa. Las preferencias se guardan en este navegador. Las vistas previas de proyectos se reproducen de forma predeterminada; páusalas con el control Reproducir vistas previas."],
    ["May 2026 - Current", "may. 2026 - actualidad"],
    ["Sep 2024 - Apr 2026", "sept. 2024 - abr. 2026"],
    ["Jun 2023 - Aug 2024", "jun. 2023 - ago. 2024"],
    ["Aug 2023 - Current", "ago. 2023 - actualidad"],
    ["Jul 2019 - May 2023", "jul. 2019 - may. 2023"],
    ["Not Found — WizardGang", "Página no encontrada — WizardGang"],
    ["Nothing here.", "No hay nada aquí."],
    ["404 / Route not found", "404 / Ruta no encontrada"]
  ]);

type TranslationReplacement = string | ((...match: string[]) => string);

const DYNAMIC_TRANSLATIONS: ReadonlyArray<readonly [RegExp, TranslationReplacement]> = [
  [/^Play (.+)$/, "Jugar a $1"],
  [/^View (.+) project$/, "Ver proyecto $1"],
  [/^Open (.+) live demo$/, "Abrir demo en vivo de $1"],
  [/^Read the (.+) case study$/, "Leer el caso de estudio de $1"],
  [/^View (.+) source(?: code)? on GitHub$/, "Ver el código fuente de $1 en GitHub"],
  [/^Explore (.+) operating evidence$/, "Explorar la evidencia operativa de $1"],
  [/^Visit WizardGang on GitHub$/, "Visitar WizardGang en GitHub"],
  [/^(\d+) \/ (.+)$/, (_match, number, label) => `${number} / ${SPANISH_TRANSLATIONS.get(label) || label}`],
  [/^(\d+) units$/, "$1 unidades"],
  [/^(\d+) damage · ([\d.]+) pushback · (\d+) frames active$/, "$1 de daño · $2 de empuje · $3 fotogramas activos"],
  [/^(\d+) fictional series · (\d+) chapters · Original demo artwork$/, "$1 series ficticias · $2 capítulos · Arte original de demostración"],
  [/^(\d+) sample series$/, "$1 series de muestra"],
  [/^(Comic|Manga|Webtoon|Webtoons) · (.+)$/, (_match, genre, issue) => `${SPANISH_TRANSLATIONS.get(genre) || genre} · ${issue}`],
];

export function translateDynamic(value: string): string {
  for (const [pattern, replacement] of DYNAMIC_TRANSLATIONS) {
    if (!pattern.test(value)) continue;
    return typeof replacement === "string"
      ? value.replace(pattern, replacement)
      : value.replace(pattern, (...match) => replacement(...match.map(String)));
  }
  return SPANISH_TRANSLATIONS.get(value) || value;
}

export function translateText(value: string | null, locale: LanguagePreference): string | null {
  if (locale !== "es" || !value?.trim()) return value;
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const key = value.trim().replace(/\s+/g, " ");
  return `${leading}${translateDynamic(key)}${trailing}`;
}
