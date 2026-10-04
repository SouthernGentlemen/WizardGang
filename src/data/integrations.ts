export const INTEGRATIONS_PATH = "/services/#integrations" as const;

export type IntegrationCategoryId =
  | "apis-services"
  | "enterprise-systems"
  | "identity-access"
  | "data-automation"
  | "operational-interfaces";

export type IntegrationEvidenceKind = "professional" | "project";

export interface IntegrationEvidenceReference {
  id: string;
  kind: IntegrationEvidenceKind;
  label: string;
  href: string;
  note: string;
}

export interface IntegrationCapability {
  id: string;
  name: string;
  description: string;
  systemTypes?: readonly string[];
  interfaces?: readonly string[];
  technologies?: readonly string[];
}

export interface IntegrationCategory {
  id: IntegrationCategoryId;
  name: string;
  summary: string;
  capabilities: readonly IntegrationCapability[];
  evidence: readonly IntegrationEvidenceReference[];
}

export const integrationCategories = [
  {
    id: "apis-services",
    name: "APIs & Services",
    summary: "Connect application boundaries through explicit interfaces, mapped data, and service contracts.",
    capabilities: [
      {
        id: "application-interfaces",
        name: "Application interfaces",
        description: "Connect software through documented request, response, and data-mapping boundaries rather than hidden coupling.",
        interfaces: ["REST/JSON APIs", "SOAP"],
        technologies: ["Interface & data mapping"]
      },
      {
        id: "service-workflows",
        name: "Service workflows",
        description: "Coordinate application-to-application flows with validation, failure handling, and production support in mind."
      }
    ],
    evidence: [
      {
        id: "apis-professional-evidence",
        kind: "professional",
        label: "Professional systems & integration experience",
        href: "/about/team/jacob/#work-integrations",
        note: "Jacob's Team profile keeps the employer-attributed API and integration experience that supports this capability."
      }
    ]
  },
  {
    id: "enterprise-systems",
    name: "Enterprise Systems",
    summary: "Integrate the operational systems that move inventory, orders, fulfillment, and shipping.",
    capabilities: [
      {
        id: "enterprise-platforms",
        name: "Enterprise platform integration",
        description: "Connect operational platforms while keeping ownership, data boundaries, and workflow responsibilities explicit.",
        systemTypes: ["ERP", "WMS", "Commerce & fulfillment", "Warehouse automation", "Carrier platforms"]
      },
      {
        id: "operational-synchronization",
        name: "Operational synchronization",
        description: "Coordinate orders, inventory, fulfillment, shipping, and related status changes across system boundaries."
      }
    ],
    evidence: [
      {
        id: "enterprise-professional-evidence",
        kind: "professional",
        label: "Employer-attributed enterprise integration evidence",
        href: "/about/team/jacob/#work-integrations",
        note: "Prior enterprise and warehouse work remains attributed to Jacob's professional history."
      }
    ]
  },
  {
    id: "identity-access",
    name: "Identity & Access",
    summary: "Connect authentication and authorization boundaries without turning identity behavior into application-specific glue.",
    capabilities: [
      {
        id: "federated-access",
        name: "Federated access",
        description: "Integrate standards-based sign-in and delegated access across application boundaries.",
        interfaces: ["OAuth 2.0", "SAML/SSO"]
      }
    ],
    evidence: [
      {
        id: "identity-professional-evidence",
        kind: "professional",
        label: "Professional integration skill evidence",
        href: "/about/team/jacob/#skills-heading",
        note: "Jacob's professional skills record is the source for the identity protocols represented here."
      }
    ]
  },
  {
    id: "data-automation",
    name: "Data & Automation",
    summary: "Move, transform, validate, and reconcile data so downstream workflows have an inspectable source of truth.",
    capabilities: [
      {
        id: "data-pipelines",
        name: "Data pipelines",
        description: "Build repeatable data movement and transformation paths with validation and recovery boundaries.",
        technologies: ["SQL/T-SQL", "SQL Server", "ETL & data pipelines"]
      },
      {
        id: "reconciliation-automation",
        name: "Reconciliation & automation",
        description: "Use explicit mapping and checks to keep operational data aligned across systems and handoffs."
      }
    ],
    evidence: [
      {
        id: "data-professional-evidence",
        kind: "professional",
        label: "Professional data & integration experience",
        href: "/about/team/jacob/#skills-heading",
        note: "SQL, ETL, and data-mapping experience stays attributed to Jacob's professional record."
      },
    ]
  },
  {
    id: "operational-interfaces",
    name: "Operational Interfaces",
    summary: "Represent durable business exchanges and production handoffs as explicit integration contracts.",
    capabilities: [
      {
        id: "b2b-data-exchange",
        name: "B2B data exchange",
        description: "Support structured operational exchanges across order, acknowledgement, shipment, invoice, inventory, and fulfillment flows.",
        interfaces: ["EDI", "Orders", "Acknowledgements", "ASNs", "Invoices"]
      },
      {
        id: "production-integration-support",
        name: "Production integration support",
        description: "Carry integration work through testing, cutover, monitoring, support, and operational handoff instead of stopping at interface construction."
      }
    ],
    evidence: [
      {
        id: "operations-professional-evidence",
        kind: "professional",
        label: "Professional delivery & integration evidence",
        href: "/about/team/jacob/#work-integrations",
        note: "Employer deployments and production outcomes remain on Jacob's Team profile."
      }
    ]
  }
] as const satisfies readonly IntegrationCategory[];

export function validateIntegrationCategories(categories: readonly IntegrationCategory[]): void {
  const categoryIds = new Set<string>();
  const capabilityIds = new Set<string>();
  const evidenceIds = new Set<string>();

  for (const category of categories) {
    if (categoryIds.has(category.id)) throw new Error(`Duplicate integration category id: ${category.id}`);
    categoryIds.add(category.id);
    if (!category.name.trim() || !category.summary.trim()) throw new Error(`Incomplete integration category: ${category.id}`);
    if (!category.capabilities.length) throw new Error(`Integration category has no capabilities: ${category.id}`);

    for (const capability of category.capabilities) {
      if (capabilityIds.has(capability.id)) throw new Error(`Duplicate integration capability id: ${capability.id}`);
      capabilityIds.add(capability.id);
      if (!capability.name.trim() || !capability.description.trim()) throw new Error(`Incomplete integration capability: ${capability.id}`);

      for (const values of [capability.systemTypes, capability.interfaces, capability.technologies]) {
        if (!values) continue;
        const normalized = values.map((value) => value.trim().toLowerCase());
        if (normalized.some((value) => !value)) throw new Error(`Empty integration detail: ${capability.id}`);
        if (new Set(normalized).size !== normalized.length) throw new Error(`Duplicate integration detail: ${capability.id}`);
      }
    }

    for (const evidence of category.evidence) {
      if (evidenceIds.has(evidence.id)) throw new Error(`Duplicate integration evidence id: ${evidence.id}`);
      evidenceIds.add(evidence.id);
      if (!evidence.label.trim() || !evidence.note.trim() || !evidence.href.startsWith("/")) {
        throw new Error(`Invalid integration evidence: ${evidence.id}`);
      }
    }
  }
}

validateIntegrationCategories(integrationCategories);
