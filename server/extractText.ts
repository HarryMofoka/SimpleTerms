import { readFileSync } from "fs";
import { createRequire } from "module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse") as (
  buffer: Buffer
) => Promise<{ text: string; numpages: number }>;

/**
 * Extract plain text from a PDF or DOCX file.
 * Returns an empty string if the file contains no readable text
 * (e.g. scanned image-only PDFs).
 */
export async function extractText(
  filePath: string,
  ext: string
): Promise<string> {
  if (ext === ".pdf") {
    const buffer = readFileSync(filePath);
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error(`Unsupported extension: ${ext}`);
}
