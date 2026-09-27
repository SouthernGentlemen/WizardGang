export interface ExternalReference {
  name: string;
  url: string | null;
  /** Vendor mark, served from public/logos/vendors. Absent where none was found. */
  logo?: string;
}

export interface DeploymentReference extends ExternalReference {
  url: string;
  /** What was delivered for this organization. */
  solution: string;
  /** The employer the work was performed under. Never WizardGang. */
  employer: string;
}

export interface ProfessionalIntegrationEvidenceGroup {
  title: string;
  items: readonly ExternalReference[];
}

export interface ProfessionalSystemEvidenceGroup {
  title: string;
  items: readonly string[];
}

// Canonical professional evidence for employer/customer systems, integrations, and deployments.
// Keep this file factual and attributed; it is not the WizardGang company-facing integration taxonomy.
// External references are intentionally centralized so links can be audited in one place.

export const deployments: readonly DeploymentReference[] = [
  { name: "BAMKO", url: "https://www.bamkousa.com/", solution: "Warehouse Management System (CIMS)", employer: "Supply Chain Technologies" },
  { name: "Brixton", url: "https://www.brixton.com/", solution: "Warehouse Management System (CIMS)", employer: "Supply Chain Technologies" },
  { name: "Custom Integrated Designs", url: "https://www.cidresources.com/", solution: "Warehouse Management System (CIMS)", employer: "Supply Chain Technologies" },
  { name: "FamBrands", url: "https://www.fambrands.com/", solution: "Warehouse Management System (CIMS)", employer: "Supply Chain Technologies" },
  { name: "GNC", url: "https://www.gnc.com/", solution: "Warehouse Management System (CIMS)", employer: "Supply Chain Technologies" },
  { name: "Hybrid Apparel", url: "https://hybridapparel.com/", solution: "Warehouse Management System (CIMS)", employer: "Supply Chain Technologies" },
  { name: "Jerry Leigh", url: "https://www.jerryleigh.com/", solution: "Warehouse Management System (CIMS)", employer: "Supply Chain Technologies" },
  { name: "Manhattan Beachwear", url: "https://www.mbwswim.com/", solution: "Warehouse Management System (CIMS)", employer: "Supply Chain Technologies" },
  { name: "Obermeyer", url: "https://obermeyer.com/", solution: "Warehouse Management System (CIMS)", employer: "Supply Chain Technologies" },
  { name: "Saddle Creek Logistics Services", url: "https://www.sclogistics.com/", solution: "Warehouse Management System (CIMS)", employer: "Supply Chain Technologies" },
  { name: "Solutions 2 GO", url: "https://www.solutions2go.ca/", solution: "Warehouse Management System (CIMS)", employer: "Supply Chain Technologies" },
  { name: "Anderson County Probate Court", url: "https://www.google.com/maps/search/?api=1&query=Anderson+County+Probate+Court", solution: "Probate Case Management", employer: "Spartan Technology Solutions" },
  { name: "Beaufort County Probate Court", url: "https://www.google.com/maps/search/?api=1&query=Beaufort+County+Probate+Court", solution: "Probate Case Management", employer: "Spartan Technology Solutions" },
  { name: "Berkeley County Probate Court", url: "https://www.google.com/maps/search/?api=1&query=Berkeley+County+Probate+Court", solution: "Probate Case Management", employer: "Spartan Technology Solutions" },
  { name: "Florida State Attorney's Office", url: "https://www.google.com/maps/search/?api=1&query=Florida+State+Attorney%27s+Office", solution: "Prosecutor Case Management", employer: "Spartan Technology Solutions" },
  { name: "Greenville County Probate Court", url: "https://www.google.com/maps/search/?api=1&query=Greenville+County+Probate+Court", solution: "Probate Case Management", employer: "Spartan Technology Solutions" },
  { name: "Horry County Probate Court", url: "https://www.google.com/maps/search/?api=1&query=Horry+County+Probate+Court", solution: "Probate Case Management", employer: "Spartan Technology Solutions" },
  { name: "Spartanburg County Probate Court", url: "https://www.google.com/maps/search/?api=1&query=Spartanburg+County+Probate+Court", solution: "Probate Case Management", employer: "Spartan Technology Solutions" },
  { name: "A Beka Book", url: "https://www.abeka.com/", solution: "Order Fulfillment System", employer: "Fastfetch Corporation" },
  { name: "Amware", url: "https://www.amware.net/", solution: "Order Fulfillment System", employer: "Fastfetch Corporation" },
  { name: "Bulk Reef Supply", url: "https://www.bulkreefsupply.com/", solution: "Order Fulfillment System", employer: "Fastfetch Corporation" },
  { name: "BuySeasons", url: "https://www.buyseasons.com/", solution: "Order Fulfillment System", employer: "Fastfetch Corporation" },
  { name: "Dot Foods", url: "https://www.dotfoods.com/", solution: "Order Fulfillment System", employer: "Fastfetch Corporation" },
  { name: "IPSY", url: "https://www.ipsy.com/", solution: "Order Fulfillment System", employer: "Fastfetch Corporation" },
  { name: "Plexus Worldwide", url: "https://plexusworldwide.com/", solution: "Order Fulfillment System", employer: "Fastfetch Corporation" },
  { name: "Rocky Brands", url: "https://www.rockybrands.com/", solution: "Putwall Fulfillment System", employer: "Fastfetch Corporation" },
  { name: "Salon Service Group", url: "https://www.salonservicegroup.com/", solution: "Order Fulfillment System", employer: "Fastfetch Corporation" },
  { name: "Seeds 'N Such", url: "https://seedsnsuch.com/", solution: "Order Fulfillment System", employer: "Fastfetch Corporation" },
  { name: "Snap-on Tools", url: "https://www.snapon.com/", solution: "Order Fulfillment System", employer: "Fastfetch Corporation" },
  { name: "SpartanNash", url: "https://www.spartannash.com/", solution: "Order Fulfillment System", employer: "Fastfetch Corporation" },
  { name: "Torque King 4x4", url: "https://www.torqueking.com/", solution: "Order Fulfillment System", employer: "Fastfetch Corporation" },
  { name: "Waytek Wire", url: "https://www.waytekwire.com/", solution: "Order Fulfillment System", employer: "Fastfetch Corporation" },
  { name: "Younique", url: "https://www.youniqueproducts.com/", solution: "Order Fulfillment System", employer: "Fastfetch Corporation" }
];

export const professionalIntegrationEvidence: readonly ProfessionalIntegrationEvidenceGroup[] = [
  {
    title: "ERP Integrations",
    items: [
      ["NetSuite", "https://www.netsuite.com/", "/logos/vendors/netsuite.png"],
      ["Microsoft Dynamics", "https://www.microsoft.com/en-us/dynamics-365", "/logos/vendors/microsoft-dynamics.png"],
      ["Sage", "https://www.sage.com/", "/logos/vendors/sage.svg"],
      ["Fishbowl", "https://www.fishbowlinventory.com/", "/logos/vendors/fishbowl.ico"],
      ["QuickBooks POS", "https://quickbooks.intuit.com/pos/", "/logos/vendors/quickbooks-pos.svg"],
      ["RedPrairie", "https://blueyonder.com/", "/logos/vendors/redprairie.ico"],
      ["Blue Yonder", "https://blueyonder.com/", "/logos/vendors/blue-yonder.ico"],
      ["CIMS WMS", "https://cloudimsystems.com/", "/logos/vendors/cims-wms.ico"],
      // The exact public vendor identity for the historical Canbar integration is not
      // reliably resolvable today. Keep the experience visible rather than attaching
      // an unrelated modern company to it; add a URL only when the canonical identity
      // can be verified.
      "Canbar"
    ]
  },
  {
    title: "Commerce & Fulfillment",
    items: [
      ["Shopify", "https://www.shopify.com/", "/logos/vendors/shopify.png"],
      ["Amazon Direct Fulfillment", "https://vendorcentral.amazon.com/", "/logos/vendors/amazon-direct-fulfillment.ico"],
      ["ShipStation", "https://www.shipstation.com/", "/logos/vendors/shipstation.png"],
      ["Shipium", "https://www.shipium.com/", "/logos/vendors/shipium.png"],
      ["ProShip", "https://www.proshipinc.com/", "/logos/vendors/proship.png"]
    ]
  },
  {
    title: "Warehouse Automation",
    items: [
      ["A360", "https://www.staciamericas.com/wms", "/logos/vendors/a360.ico"],
      ["Locus", "https://www.locusrobotics.com/", "/logos/vendors/locus.png"],
      ["6 River Systems", "https://6river.com/"],
      ["AutoStore", "https://www.autostoresystem.com/", "/logos/vendors/autostore.ico"],
      ["Corvus", "https://www.corvus-robotics.com/", "/logos/vendors/corvus.ico"],
      ["Pendant", "https://pendantautomation.com/"]
    ]
  },
  {
    title: "Carrier Integrations",
    items: [
      ["USPS", "https://www.usps.com/", "/logos/vendors/usps.ico"],
      ["UPS", "https://www.ups.com/", "/logos/vendors/ups.ico"],
      ["FedEx", "https://www.fedex.com/", "/logos/vendors/fedex.svg"]
    ]
  },
  {
    title: "EDI & B2B",
    items: ["EDI Orders", "Acknowledgements", "ASNs", "Invoices", "Inventory & Fulfillment Flows"]
  },
  {
    title: "Warehouse Hardware",
    items: [
      ["Zebra", "https://www.zebra.com/", "/logos/vendors/zebra.ico"],
      ["Honeywell", "https://automation.honeywell.com/us/en/industries/logistics-and-warehouses", "/logos/vendors/honeywell.svg"]
    ]
  },
  {
    title: "Development & Workflow",
    items: [
      ["GitHub", "https://github.com/", "/logos/vendors/github.png"],
      ["Jira", "https://www.atlassian.com/software/jira", "/logos/vendors/jira.png"],
      ["Zapier", "https://zapier.com/", "/logos/vendors/zapier.ico"]
    ]
  },
  {
    title: "Justice & Legal",
    items: [
      ["Axon", "https://www.axon.com/", "/logos/vendors/axon.png"],
      ["LexisNexis", "https://www.lexisnexis.com/en-us/", "/logos/vendors/lexisnexis.ico"]
    ]
  }
].map((group) => ({
  ...group,
  items: group.items.map((item): ExternalReference => Array.isArray(item)
    ? {
        name: String(item[0]),
        url: item[1] ? String(item[1]) : null,
        ...(item[2] ? { logo: String(item[2]) } : {})
      }
    : { name: item, url: null })
}));

export const professionalSystemEvidence: readonly ProfessionalSystemEvidenceGroup[] = [
  {
    title: "Warehouse & Fulfillment",
    items: ["Fulfillment", "Inventory", "Lot Tracking", "Barcode Workflows", "Warehouse Automation", "Quality Control", "Shipping", "RMA"]
  },
  {
    title: "Logistics",
    items: ["Yard Management", "Truck & Trailer Workflows"]
  },
  {
    title: "Justice & Court Systems",
    items: ["Case Management", "Prosecutor Systems", "Public Defense Systems", "Probate Court Systems", "Public Inquiry"]
  },
  {
    title: "Public-Sector Workflows",
    items: ["Solicitation", "Tax Appeals"]
  },
  {
    title: "Enterprise & AI Infrastructure",
    items: ["ERP Integration", "MCP Servers"]
  }
];
