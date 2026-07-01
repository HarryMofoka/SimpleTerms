import type { AnalysisReport, RiskLevel } from "../../types/report";

const riskLabels: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
};

function RiskBadge({ level }: { level: RiskLevel }) {
  return <span className={`risk-badge risk-${level}`}>{riskLabels[level]}</span>;
}

export function AnalysisReportView({ report }: { report: AnalysisReport }) {
  return (
    <section id="report" className="report-section" aria-labelledby="report-title">
      <div className="section-heading">
        <p className="eyebrow">Example analysis</p>
        <h2 id="report-title">A report designed for understanding.</h2>
        <p>
          The frontend renders validated JSON into predictable sections: summary,
          risks, obligations, dates, clauses, and a review checklist.
        </p>
      </div>

      <div className="report-shell">
        <div className="report-summary">
          <div>
            <p className="eyebrow">Contract type</p>
            <h3>{report.contractType}</h3>
          </div>
          <RiskBadge level={report.riskOverview.level} />
          <p>{report.summary}</p>
          <p className="confidence">{report.confidence}</p>
        </div>

        <div className="report-columns">
          <article>
            <h3>Key obligations</h3>
            {report.obligations.map((obligation) => (
              <div className="compact-item" key={obligation.label}>
                <strong>{obligation.label}</strong>
                <span>{obligation.detail}</span>
              </div>
            ))}
          </article>

          <article>
            <h3>Important dates</h3>
            {report.keyDates.map((date) => (
              <div className="compact-item" key={date.label}>
                <strong>{date.label}</strong>
                <span>{date.value}</span>
              </div>
            ))}
          </article>
        </div>

        <div className="clause-list">
          {report.clauses.map((clause) => (
            <article className="clause-card" key={clause.id}>
              <div className="clause-heading">
                <div>
                  <span>{clause.category}</span>
                  <h3>{clause.title}</h3>
                </div>
                <RiskBadge level={clause.riskLevel} />
              </div>
              <p>{clause.plainEnglish}</p>
              <strong>Why it matters</strong>
              <p>{clause.whyItMatters}</p>
            </article>
          ))}
        </div>

        <article className="checklist">
          <h3>Before you sign</h3>
          <ul>
            {report.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
