export type UploadValidationResult =
  | { isValid: true }
  | { isValid: false; message: string };

const MAX_UPLOAD_MB = Number(import.meta.env.VITE_MAX_UPLOAD_MB ?? 10);
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

const SUPPORTED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const SUPPORTED_EXTENSIONS = [".pdf", ".docx"];

export function validateContractFile(file: File): UploadValidationResult {
  const normalizedName = file.name.toLowerCase();
  const hasSupportedExtension = SUPPORTED_EXTENSIONS.some((extension) =>
    normalizedName.endsWith(extension)
  );

  if (!hasSupportedExtension) {
    return {
      isValid: false,
      message: "Please choose a PDF or DOCX contract."
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      message: "This file appears to be empty. Please choose a readable contract."
    };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      isValid: false,
      message: `Files must be ${MAX_UPLOAD_MB} MB or smaller for this demo.`
    };
  }

  // Some browsers provide an empty MIME type for local files, so extension and
  // server validation remain mandatory in production.
  if (file.type && !SUPPORTED_TYPES.has(file.type)) {
    return {
      isValid: false,
      message: "The file type does not match a supported contract format."
    };
  }

  return { isValid: true };
}
