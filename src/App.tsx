import { useState } from "react";
import { Footer } from "./components/Footer";
import { SiteHeader } from "./components/SiteHeader";
import { demoReport } from "./data/demoReport";
import { AnalysisReportView } from "./features/report/AnalysisReportView";
import { UploadPanel } from "./features/upload/UploadPanel";
import { ContractChat } from "./features/chat/ContractChat";
import type { AnalysisReport } from "./types/report";

const processSteps = [
  {
    title: "Validate",
    text: "Reject unsupported, empty, oversized, or suspicious files before processing starts."
  },
  {
    title: "Extract",
    text: "Convert PDF or DOCX content into clean text without rewriting the legal language."
  },
  {
    title: "Analyze",
    text: "Ask the AI layer for structured JSON that explains meaning, risks, dates, and obligations."
  },
  {
    title: "Explain",
    text: "Render the response as a calm report that helps users understand, not outsource judgment."
  }
];

const trustItems = [
  "Temporary processing only",
  "No legal advice claims",
  "Structured AI responses",
  "Plain-English explanations"
];

function App() {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [contractText, setContractText] = useState<string>("");
  const [contractName, setContractName] = useState<string>("");

  const activeReport = report ?? demoReport;
  const isLiveReport = report !== null;

  return (
    <div id="top" className="app">
      <SiteHeader />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Contract intelligence for ordinary people</p>
            <h1 id="hero-title">Upload a contract. Leave with clarity.</h1>
            <p>
              SimpleTerms turns legal agreements into structured, plain-English
              reports so people can understand responsibilities, dates,
              financial commitments, and clauses that deserve attention.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#upload">
                Analyze a contract
              </a>
              <a className="secondary-button" href="#report">
                View sample report
              </a>
            </div>
            <ul className="trust-strip" aria-label="Product trust principles">
              {trustItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="hero-media" aria-label="SimpleTerms report preview">
            <img src="/simpleterms-report-preview.png" alt="" />
          </div>
        </section>

        <UploadPanel
          onAnalysisComplete={({ report, contractText, contractName }) => {
            setReport(report);
            setContractText(contractText);
            setContractName(contractName);
          }}
        />

        <section id="how-it-works" className="process-section" aria-labelledby="process-title">
          <div className="section-heading">
            <p className="eyebrow">How it works</p>
            <h2 id="process-title">One predictable path from upload to understanding.</h2>
          </div>
          <div className="process-grid">
            {processSteps.map((step, index) => (
              <article className="process-step" key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <AnalysisReportView report={activeReport} isLive={isLiveReport} />

        {isLiveReport ? (
          <ContractChat contractText={contractText} contractName={contractName} />
        ) : null}

        <section id="security" className="security-section" aria-labelledby="security-title">
          <div>
            <p className="eyebrow">Security and privacy</p>
            <h2 id="security-title">Designed around sensitive documents.</h2>
            <p>
              Legal agreements can contain personal, financial, and business
              information. SimpleTerms treats validation, temporary processing,
              secret management, and safe error handling as core product
              behavior.
            </p>
          </div>
          <div className="security-grid">
            <article>
              <h3>Trust nothing</h3>
              <p>Client validation improves feedback, but production repeats every check on the backend.</p>
            </article>
            <article>
              <h3>Never guess</h3>
              <p>Missing or ambiguous information is called out instead of being invented.</p>
            </article>
            <article>
              <h3>Delete quickly</h3>
              <p>Uploaded documents are temporary, private, and removed immediately after processing.</p>
            </article>
            <article>
              <h3>Render safely</h3>
              <p>The frontend consumes validated data and avoids rendering raw AI text as HTML.</p>
            </article>
          </div>
        </section>

        <section id="roadmap" className="roadmap-section" aria-labelledby="roadmap-title">
          <div className="section-heading">
            <p className="eyebrow">Product evolution</p>
            <h2 id="roadmap-title">Focused growth after the MVP.</h2>
            <p>
              SimpleTerms grows only when a feature helps people understand
              contracts better while preserving clarity, privacy, and trust.
            </p>
          </div>
          <div className="roadmap">
            <span>MVP analysis</span>
            <span>Improved intelligence</span>
            <span>User convenience</span>
            <span>Expanded formats</span>
            <span>Advanced analysis</span>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
