import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { extname } from "path";
import { extractText } from "./extractText.js";
import { analyzeContract } from "./analyzeContract.js";
import { chatWithContract } from "./chatWithContract.js";

const PORT = Number(process.env.PORT ?? 3001);
const MAX_MB = Number(process.env.MAX_UPLOAD_MB ?? 10);
const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx"]);

const upload = multer({
  storage: multer.memoryStorage(),
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

// Secure Express headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    }
  })
);

app.use(cors());

// Configure Rate Limiter: Max 20 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP. Please try again after 15 minutes."
  }
});

// Apply rate limiter to all API endpoints
app.use("/api/", apiLimiter);

app.post("/api/analyze", upload.single("contract"), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No file provided." });
    return;
  }

  try {
    const ext = extname(file.originalname).toLowerCase();
    const text = await extractText(file.buffer, ext);

    if (!text.trim()) {
      res.status(422).json({
        error:
          "Could not extract readable text from this file. It may be a scanned image. Please upload a text-based PDF or DOCX."
      });
      return;
    }

    const report = await analyzeContract(text);
    res.json({ report, contractText: text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Analysis error:", message);
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

// JSON body parser for chat endpoint
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { contractText, history, newMessage } = req.body;
  if (!contractText || typeof newMessage !== "string") {
    res.status(400).json({ error: "Missing contractText or newMessage." });
    return;
  }

  try {
    const reply = await chatWithContract(contractText, history || [], newMessage);
    res.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Chat error:", message);
    res.status(500).json({ error: "Failed to generate reply. Please try again." });
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
