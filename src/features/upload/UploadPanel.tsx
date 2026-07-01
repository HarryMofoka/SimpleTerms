import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { validateContractFile } from "../../lib/fileValidation";

type UploadStage = "idle" | "uploading" | "extracting" | "analyzing" | "ready" | "error";

const stageLabels: Record<UploadStage, string> = {
  idle: "Ready for a PDF or DOCX",
  uploading: "Validating upload",
  extracting: "Extracting readable text",
  analyzing: "Preparing plain-English report",
  ready: "Demo report ready",
  error: "Upload needs attention"
};

const stageProgress: Record<UploadStage, number> = {
  idle: 0,
  uploading: 25,
  extracting: 55,
  analyzing: 82,
  ready: 100,
  error: 0
};

export function UploadPanel() {
  const [stage, setStage] = useState<UploadStage>("idle");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState(
    "Files are validated locally in this demo and are not uploaded or stored."
  );

  const timeoutsRef = useRef<number[]>([]);
  const progress = stageProgress[stage];

  const clearPendingTimeouts = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearPendingTimeouts();
    };
  }, []);

  function processFile(file: File) {
    clearPendingTimeouts();

    const validation = validateContractFile(file);

    if (!validation.isValid) {
      setStage("error");
      setFileName(file.name);
      setMessage(validation.message);
      return;
    }

    setFileName(file.name);
    setStage("uploading");
    setMessage("Checking file type, size, and readability signals.");

    const t1 = window.setTimeout(() => {
      setStage("extracting");
      setMessage("In production, the backend would extract text in a private temporary workspace.");
    }, 650);

    const t2 = window.setTimeout(() => {
      setStage("analyzing");
      setMessage("The AI layer would return validated JSON, never raw conversational text.");
    }, 1350);

    const t3 = window.setTimeout(() => {
      setStage("ready");
      setMessage("Review the sample report below to see how results are presented.");
    }, 2200);

    timeoutsRef.current = [t1, t2, t3];
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
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

  return (
    <section id="upload" className="upload-section" aria-labelledby="upload-title">
      <div className="section-heading">
        <p className="eyebrow">Secure upload flow</p>
        <h2 id="upload-title">Start with the contract in front of you.</h2>
        <p>
          The MVP flow accepts PDF and DOCX agreements, validates them early,
          extracts text server-side, and returns a structured explanation.
        </p>
      </div>

      <div className="upload-grid">
        <label
          className={`dropzone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
          />
          <span className="dropzone-icon" aria-hidden="true">
            +
          </span>
          <strong>Choose or drop a contract</strong>
          <span>PDF or DOCX, up to 10 MB</span>
        </label>

        <div className="upload-status" role="status" aria-live="polite">
          <div className="status-row">
            <span>{stageLabels[stage]}</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          {fileName ? <p className="file-name">{fileName}</p> : null}
          <p>{message}</p>
          <ul className="security-list">
            <li>No document contents are logged.</li>
            <li>Unsupported formats stop before analysis.</li>
            <li>Backend secrets never reach the browser.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
