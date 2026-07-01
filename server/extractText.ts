import { createRequire } from "module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse") as (
  buffer: Buffer
) => Promise<{ text: string; numpages: number }>;

/**
 * Extract plain text from a PDF or DOCX buffer.
 * Returns an empty string if the file contains no readable text
 * (e.g. scanned image-only PDFs).
 *
 * Accepts a Buffer so the same function works for both local
 * Express (memory storage) and Vercel serverless deployments.
 */
export async function extractText(
  buffer: Buffer,
  ext: string
): Promise<string> {
  if (ext === ".pdf") {
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Unsupported extension: ${ext}`);
}
