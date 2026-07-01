declare module "pdf-parse" {
  interface PDFInfo {
    PDFFormatVersion?: string;
    IsAcroFormPresent?: boolean;
    IsXFAPresent?: boolean;
    Title?: string;
    Author?: string;
    [key: string]: unknown;
  }

  interface PDFResult {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: unknown;
    version: string;
    text: string;
  }

  function pdfParse(
    dataBuffer: Buffer,
    options?: Record<string, unknown>
  ): Promise<PDFResult>;

  export default pdfParse;
}
