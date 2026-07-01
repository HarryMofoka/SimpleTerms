import { ChangeEvent, DragEvent, useState } from "react";
import { validateContractFile } from "../../lib/fileValidation";
import type { AnalysisReport } from "../../types/report";

type UploadStage = "idle" | "uploading" | "analyzing" | "ready" | "error";

const stageLabels: Record<UploadStage, string> = {
  idle: "Ready for a PDF or DOCX",
  uploading: "Uploading document",
  analyzing: "Analyzing contract with AI",
  ready: "Analysis complete",
  error: "Something went wrong"
};

const stageProgress: Record<UploadStage, number> = {
  idle: 0,
  uploading: 20,
  analyzing: 60,
  ready: 100,
  error: 0
};

type Props = {
  onAnalysisComplete: (result: {
    report: AnalysisReport;
    contractText: string;
    contractName: string;
  }) => void;
};

export function UploadPanel({ onAnalysisComplete }: Props) {
  const [stage, setStage] = useState<UploadStage>("idle");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState(
    "Upload a PDF or DOCX contract to get a plain-English analysis powered by AI."
  );

  const progress = stageProgress[stage];
  const isProcessing = stage === "uploading" || stage === "analyzing";

  async function processFile(file: File) {
    const validation = validateContractFile(file);

    if (!validation.isValid) {
      setStage("error");
      setFileName(file.name);
      setMessage(validation.message);
      return;
    }

    setFileName(file.name);
    setStage("uploading");
    setMessage("Sending your document to the server for secure processing.");

    try {
      const formData = new FormData();
      formData.append("contract", file);

      // Move to analyzing stage after a brief moment for perceived responsiveness
      const analyzeTimer = window.setTimeout(() => {
        setStage("analyzing");
        setMessage(
          "Extracting text and running AI analysis. This may take a few seconds."
        );
      }, 600);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      window.clearTimeout(analyzeTimer);

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error ?? `Server responded with status ${response.status}`
        );
      }

      const { report, contractText }: { report: AnalysisReport; contractText: string } =
        await response.json();

      setStage("ready");
      setMessage("Your contract analysis is ready. Scroll down to review the report.");
      onAnalysisComplete({ report, contractText, contractName: file.name });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setStage("error");
      setMessage(errorMessage);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset the input so the same file can be re-selected
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }

  function handleReset() {
    setStage("idle");
    setFileName("");
    setMessage(
      "Upload a PDF or DOCX contract to get a plain-English analysis powered by AI."
    );
  }

  return (
    <section id="upload" className="upload-section" aria-labelledby="upload-title">
      <div className="section-heading">
        <p className="eyebrow">Secure upload flow</p>
        <h2 id="upload-title">Start with the contract in front of you.</h2>
        <p>
          Upload a PDF or DOCX agreement. The backend extracts text, sends it
          to Gemini for structured analysis, and returns a plain-English report.
        </p>
      </div>

      <div className="upload-grid">
        <label
          className={`dropzone ${isDragging ? "dragging" : ""} ${isProcessing ? "processing" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          <span className="dropzone-icon" aria-hidden="true">
            {isProcessing ? "⏳" : "+"}
          </span>
          <strong>
            {isProcessing ? "Processing…" : "Choose or drop a contract"}
          </strong>
          <span>PDF or DOCX, up to 10 MB</span>
        </label>

        <div className="upload-status" role="status" aria-live="polite">
          <div className="status-row">
            <span>{stageLabels[stage]}</span>
            <strong>{progress}%</strong>
          </div>
          <div className={`progress-track ${isProcessing ? "animated" : ""}`} aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          {fileName ? <p className="file-name">{fileName}</p> : null}
          <p>{message}</p>
          {stage === "error" || stage === "ready" ? (
            <button className="reset-button" onClick={handleReset} type="button">
              Analyze another contract
            </button>
          ) : null}
          <ul className="security-list">
            <li>Uploaded files are deleted immediately after processing.</li>
            <li>Unsupported formats are rejected before analysis.</li>
            <li>API keys never reach the browser.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
