import type { ReactPageDefinition } from "../app/contracts";
import { SOLUTIONS_PATH, SOLUTION_SECTIONS } from "../data/solutions-menu";
import { DEMO_ORIGIN, capabilityGroups, capabilityProofCount } from "../data/capabilities";
import {
  deployments,
  professionalIntegrationEvidence,
  professionalSystemEvidence,
  type ExternalReference
} from "../data/professional-systems";

/* Capabilities leads, because it is the only section that is WizardGang's own
   work — every proof links into the running architecture demo. The three that
   follow are Jacob Yongue's employment record, so the attribution note sits
   between them rather than at the top of the page, where it would have claimed
   the capabilities were someone else's too. */

const ATTRIBUTION = "Everything below is Jacob Yongue's professional record. This work was delivered under the employers named, not under WizardGang.";

function VendorMark({ item }: { item: ExternalReference }) {
  if (item.logo) return <img className="vendor-mark" src={item.logo} alt="" width={20} height={20} loading="lazy" />;
  return <span className="vendor-mark vendor-mark-text" aria-hidden="true">{item.name.slice(0, 1)}</span>;
}

export const SOLUTIONS_PAGE: ReactPageDefinition = {
  relative: "solutions/index.html",
  metadata: {
    title: "Solutions — WizardGang",
    description: "Software for warehouses, courts and the systems feeding them \u2014 what it does, what it connects to, and the organizations where it went live.",
    path: SOLUTIONS_PATH,
    socialImage: "/og.jpg"
  },
  body: (
    <main className="site-main" id="main" tabIndex={-1}>
      <section className="page-hero">
        <h1>Solutions</h1>
        <p>
          Solutions built for the operations that cannot stop: warehouses, courtrooms, and the
          systems that feed them.
        </p>
      </section>

      <nav className="work-jump" aria-label="Sections on this page">
        <ul>
          <li><a href="#capabilities">Capabilities</a></li>
          {SOLUTION_SECTIONS.map((section) => (
            <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>
          ))}
        </ul>
      </nav>

      <section className="solution-section" id="capabilities" aria-labelledby="capabilities-heading">
        <h2 id="capabilities-heading">Capabilities</h2>
        <p className="work-entry-lede">
          Open each working example in the architecture demo. The assurance and security links
          lead to the records and reporting guidance behind the work.
        </p>
        <div className="capability-intro-actions">
          <p className="evidence-count">{capabilityProofCount} linked areas across {capabilityGroups.length} groups</p>
          <a href={`${DEMO_ORIGIN}/demos`}>Explore all demos <span aria-hidden="true">↗</span></a>
        </div>
        <div className="evidence-groups">
          {capabilityGroups.map((group) => (
            <section className="evidence-group" key={group.title}>
              <h3>{group.title}</h3>
              <p className="capability-summary">{group.summary}</p>
              <ul className="capability-proofs" aria-label={`${group.title} links`}>
                {group.proofs.map((proof) => (
                  <li key={proof.href}>
                    <a href={proof.href}>
                      <strong>{proof.name} <span aria-hidden="true">↗</span></strong>
                      <span>{proof.detail}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <p className="attribution-note" role="note">{ATTRIBUTION}</p>

      <section className="solution-section" id="industries" aria-labelledby="industries-heading">
        <h2 id="industries-heading">Industries</h2>
        <p className="work-entry-lede">{SOLUTION_SECTIONS[0].lede}</p>
        <div className="evidence-groups">
          {professionalSystemEvidence.map((group) => (
            <section className="evidence-group" key={group.title}>
              <h3>{group.title}</h3>
              <ul className="evidence-list" aria-label={group.title}>
                {group.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="solution-section" id="integrations" aria-labelledby="integrations-heading">
        <h2 id="integrations-heading">Integrations</h2>
        <p className="work-entry-lede">{SOLUTION_SECTIONS[1].lede}</p>
        <div className="evidence-groups">
          {professionalIntegrationEvidence.map((group) => (
            <section className="evidence-group" key={group.title}>
              <h3>{group.title}</h3>
              <ul className="evidence-list evidence-vendors" aria-label={group.title}>
                {group.items.map((item) => (
                  <li key={item.name}>
                    {item.url ? (
                      <a href={item.url}><VendorMark item={item} />{item.name} <span aria-hidden="true">↗</span></a>
                    ) : (
                      <span><VendorMark item={item} />{item.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="solution-section" id="deployments" aria-labelledby="deployments-heading">
        <h2 id="deployments-heading">Deployments</h2>
        <p className="work-entry-lede">{SOLUTION_SECTIONS[2].lede}</p>
        <p className="evidence-count">{deployments.length} organizations</p>
        <ul className="deployment-wall" aria-label="Organizations where these systems went live">
          {deployments.map((deployment) => (
            <li key={`${deployment.name}-${deployment.solution}`}>
              {deployment.url ? (
                <a href={deployment.url}>
                  <strong>{deployment.name} <span aria-hidden="true">↗</span></strong>
                  <span>{deployment.solution}</span>
                  <em>{deployment.employer}</em>
                </a>
              ) : (
                <div className="deployment-record">
                  <strong>{deployment.name}</strong>
                  <span>{deployment.solution}</span>
                  <em>{deployment.employer}</em>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
};
