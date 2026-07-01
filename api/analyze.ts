import type { VercelRequest, VercelResponse } from "@vercel/node";
import multer from "multer";
import { extname } from "path";

// Polyfill Promise.withResolvers for Node runtimes < v22 (e.g. Vercel Node 18/20)
if (typeof (Promise as any).withResolvers === "undefined") {
  (Promise as any).withResolvers = function () {
    let resolve: any;
    let reject: any;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

import { extractText } from "../server/extractText.js";
import { analyzeContract } from "../server/analyzeContract.js";

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

/**
 * Run Express-style middleware as a promise.
 * Needed because Vercel serverless functions don't use
 * the Express middleware chain.
 */
function runMiddleware(
  req: VercelRequest,
  res: VercelResponse,
  fn: Function
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) reject(result);
      else resolve();
    });
  });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    // Parse the multipart form data
    await runMiddleware(req, res, upload.single("contract"));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    if (message.includes("File too large") || message.includes("LIMIT_FILE_SIZE")) {
      return res.status(413).json({ error: `File must be ${MAX_MB} MB or smaller.` });
    }
    return res.status(400).json({ error: message });
  }

  // After multer runs, the file is available on req.file
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ error: "No file provided." });
  }

  try {
    const ext = extname(file.originalname).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return res.status(400).json({
        error: "Unsupported file type. Only PDF and DOCX are accepted."
      });
    }

    const text = await extractText(file.buffer, ext);

    if (!text.trim()) {
      return res.status(422).json({
        error:
          "Could not extract readable text from this file. It may be a scanned image. Please upload a text-based PDF or DOCX."
      });
    }

    const report = await analyzeContract(text);
    return res.status(200).json({ report, contractText: text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Analysis error:", message);
    return res.status(500).json({ error: "Analysis failed. Please try again." });
  }
}

/**
 * Disable Vercel's default body parser so multer can handle
 * the raw multipart stream.
 */
export const config = {
  api: {
    bodyParser: false
  }
};
