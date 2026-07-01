import mammoth from "mammoth";
import { extractText as extractPdfText, getDocumentProxy } from "unpdf";

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
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const result = await extractPdfText(pdf, { mergePages: true });
    return result.text;
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Unsupported extension: ${ext}`);
}
