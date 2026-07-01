import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { existsSync, unlinkSync } from "fs";
import { extname } from "path";
import { extractText } from "./extractText.js";
import { analyzeContract } from "./analyzeContract.js";

const PORT = Number(process.env.PORT ?? 3001);
const MAX_MB = Number(process.env.MAX_UPLOAD_MB ?? 10);
const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx"]);

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error("Unsupported file type. Only PDF and DOCX are accepted."));
      return;
    }
    cb(null, true);
  }
});

const app = express();
app.use(cors());

app.post("/api/analyze", upload.single("contract"), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No file provided." });
    return;
  }

  try {
    const ext = extname(file.originalname).toLowerCase();
    const text = await extractText(file.path, ext);

    if (!text.trim()) {
      res.status(422).json({
        error:
          "Could not extract readable text from this file. It may be a scanned image. Please upload a text-based PDF or DOCX."
      });
      return;
    }

    const report = await analyzeContract(text);
    res.json(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Analysis error:", message);
    res.status(500).json({ error: "Analysis failed. Please try again." });
  } finally {
    // Always delete the temporary uploaded file
    try {
      if (existsSync(file.path)) unlinkSync(file.path);
    } catch {
      // Ignore cleanup errors
    }
  }
});

// Multer error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ error: `File must be ${MAX_MB} MB or smaller.` });
        return;
      }
    }
    res.status(400).json({ error: err.message ?? "Upload failed." });
  }
);

app.listen(PORT, "127.0.0.1", () => {
  console.log(`SimpleTerms API listening on http://127.0.0.1:${PORT}`);
});
