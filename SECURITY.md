# Security Policy

SimpleTerms handles sensitive legal documents, so security and privacy are product requirements.

## Current Frontend Protections

- Strict TypeScript is enabled.
- Uploaded files are validated by extension, MIME type, and size before any simulated processing begins.
- File contents are not read, logged, uploaded, or persisted in the current frontend demo.
- The app includes a restrictive Content Security Policy in `index.html`.
- No API keys or backend secrets are present in the frontend.

## Production Requirements

- Repeat all validation server-side.
- Store uploaded files only in temporary, private storage.
- Delete temporary files immediately after processing.
- Never log document text, extracted text, personal information, API keys, or authentication tokens.
- Validate every AI response against a schema before rendering.
- Rate-limit upload and analysis endpoints.
- Keep Gemini and other provider credentials in backend-only environment variables.

## Reporting Issues

Document any suspected security issue with reproduction steps, affected files, and expected impact. Do not include real contract contents in issue reports.
