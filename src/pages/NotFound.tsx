import type { ReactPageDefinition } from "../app/contracts";
import { PROJECTS_ROOT } from "../data/projects";

export const NOT_FOUND_PAGE: ReactPageDefinition = {
  relative: "404.html",
  metadata: {
    title: "Not Found — WizardGang",
    description: "The requested WizardGang page could not be found. Use the navigation, or open the work from the home page.",
    path: "/404/",
    noIndex: true
  },
  body: (
    <main className="site-main" id="main" tabIndex={-1}>
      <section className="not-found">
        <p className="kicker">404 / Route not found</p>
        <h1>Nothing here.</h1>
        <p>That route is not part of this site. The work is on the home page.</p>
        <div className="button-row">
          <a className="button button-primary" href="/">Home <span aria-hidden="true">→</span></a>
          <a className="button" href={PROJECTS_ROOT}>View projects <span aria-hidden="true">→</span></a>
        </div>
      </section>
    </main>
  )
};
