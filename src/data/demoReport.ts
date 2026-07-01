import type { AnalysisReport } from "../types/report";

export const demoReport: AnalysisReport = {
  contractType: "Residential lease agreement",
  confidence: "High confidence based on readable lease terms",
  summary:
    "This agreement appears to define a 12-month rental relationship between a tenant and landlord. The tenant must pay rent on time, maintain the property, follow notice requirements, and review renewal and early termination terms carefully.",
  riskOverview: {
    level: "medium",
    explanation:
      "The agreement includes ordinary lease obligations, but the early termination fee and automatic renewal language deserve extra review before signing."
  },
  obligations: [
    {
      label: "Monthly rent",
      detail: "Payment is due on the first day of each month."
    },
    {
      label: "Property care",
      detail: "The tenant must avoid damage beyond normal wear and tear."
    },
    {
      label: "Written notice",
      detail: "Move-out or renewal decisions must be provided in writing."
    }
  ],
  keyDates: [
    {
      label: "Lease start",
      value: "January 1, 2027"
    },
    {
      label: "Lease end",
      value: "December 31, 2027"
    },
    {
      label: "Renewal notice",
      value: "At least 30 days before the lease ends"
    }
  ],
  clauses: [
    {
      id: "rent",
      title: "Rent and late fees",
      category: "Payment",
      riskLevel: "medium",
      plainEnglish:
        "You must pay rent on the first day of each month. A late fee may apply if payment is not received within the grace period.",
      whyItMatters:
        "Late fees can add up quickly, so confirm the grace period and the exact fee before signing."
    },
    {
      id: "renewal",
      title: "Automatic renewal",
      category: "Renewal",
      riskLevel: "high",
      plainEnglish:
        "The lease may renew automatically unless you provide written notice before the stated deadline.",
      whyItMatters:
        "Missing the notice deadline could keep you responsible for rent longer than expected."
    },
    {
      id: "maintenance",
      title: "Repairs and maintenance",
      category: "Responsibilities",
      riskLevel: "low",
      plainEnglish:
        "The landlord handles major repairs, while the tenant must keep the property clean and report issues promptly.",
      whyItMatters:
        "Reporting problems early helps avoid disputes over responsibility for damage."
    }
  ],
  checklist: [
    "Confirm the total monthly cost, including fees and deposits.",
    "Ask what happens if you need to move out early.",
    "Review renewal deadlines and notice requirements.",
    "Keep a signed copy of the final agreement."
  ]
};
